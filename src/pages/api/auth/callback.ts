import { WebClient } from "@slack/web-api";
import Promise from "bluebird";
import { NextApiHandler } from "next";
import uniqid from "uniqid";

import { config } from "~/config";
import { getOrm } from "~/database";
import { Channel } from "~/database/models/Channel";
import { Team } from "~/database/models/Team";
import { installer } from "~/lib/slack-auth";
import { importChannels, importEmojis, importGroups, importMessages, importUsers } from "~/lib/slack-import";

const Callback: NextApiHandler = async (req, res) => {
  const body = new URLSearchParams();
  body.append("client_id", config.slack.clientId);
  body.append("client_secret", config.slack.clientSecret);
  body.append("code", req.query.code as string);
  body.append("redirect_uri", `${config.app.url}/api/auth/callback`);

  const slackAuth = await fetch("https://slack.com/api/oauth.access", { method: "POST", body }).then((res) =>
    res.json()
  );

  const { botToken } = await installer.authorize({
    teamId: slackAuth.team_id,
    userId: slackAuth.user_id,
  });

  const slack = new WebClient(botToken);

  slack.chat.postMessage({
    channel: slackAuth.user_id,
    text: "Sweet! I'm now generating the report. This might take a few minutes. I'll let you know when it's done.",
  });

  const url = `https://slack.com/app_redirect?app=${config.slack.appId}&team=${slackAuth.team_id}`;

  res.redirect(url);

  importData(slackAuth.access_token).then(({ status, team }) => {
    if (status === "already_imported") {
      slack.chat.postMessage({
        channel: slackAuth.user_id,
        text: `:bulb: Your data has already been imported and is available at ${config.app.url}/${team.publicId}`,
      });
    }

    if (status === "imported") {
      slack.chat.postMessage({
        channel: slackAuth.user_id,
        text: `:white_check_mark: Your data has been imported and is available at ${config.app.url}/${team.publicId}`,
      });
    }
  });
};

type ImportResult = {
  team: Team;
  status: "already_imported" | "imported";
};

const importData = async (accessToken: string): Promise<ImportResult> => {
  const orm = await getOrm();

  const publicId = uniqid();
  const slack = new WebClient(accessToken);

  const teamData = await slack.team.info();

  const existingTeam = await orm.em.getRepository(Team).findOne({
    id: teamData.team.id,
  });
  if (existingTeam) {
    return { team: existingTeam, status: "already_imported" };
  }

  const team = new Team();
  team.id = teamData.team.id;
  team.name = teamData.team.name;
  team.publicId = publicId;
  team.raw = teamData.team as object;
  orm.em.persist(team);

  await importEmojis(orm, slack, team.id);
  await importUsers(orm, slack, team.id);
  await importGroups(orm, slack, team.id);
  await importChannels(orm, slack, team.id);

  await orm.em.flush();

  const channels = await orm.em.getRepository(Channel).findAll({
    teamId: team.id,
  });
  await Promise.mapSeries(channels, async (channel) => {
    await importMessages(orm, slack, channel);
    await orm.em.flush();
  });

  return {
    team,
    status: "imported",
  };
};

export default Callback;
