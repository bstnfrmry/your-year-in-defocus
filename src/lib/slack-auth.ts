import { Installation, InstallProvider } from "@slack/oauth";
import { WebClient } from "@slack/web-api";
import Promise from "bluebird";
import uniqid from "uniqid";

import { config } from "~/config";
import { Channel, Op, Team, testDatabaseConnection } from "~/lib/database";
import { importChannels, importGroups, importMessages, importUsers } from "~/lib/slack-import";

const store: { [key: string]: Installation } = {};

export const installer = new InstallProvider({
  clientId: config.slack.clientId,
  clientSecret: config.slack.clientSecret,
  stateSecret: "hello",
  installationStore: {
    storeInstallation: async (installation) => {
      store[installation.team.id] = installation;

      importTeam(installation);
    },

    fetchInstallation: async (installQuery) => {
      return store[installQuery.teamId];
    },
  },
});

const importTeam = async (installation: Installation) => {
  const publicId = uniqid();
  const slack = new WebClient(installation.bot?.token);

  slack.chat.postMessage({
    channel: installation.user.id,
    text:
      ":tada: Welcome and thanks for purchasing *Your year in defocus*\n:robot_face: Our bot is currently processing your data. It should take a few minutes. I'll send you a message when it's done :wink:",
  });

  await testDatabaseConnection();

  await Team.create({
    id: installation.team.id,
    name: installation.team.name,
    publicId,
  });

  await importUsers(slack, installation.team.id);
  await importGroups(slack, installation.team.id);
  await importChannels(slack, installation.team.id);

  const channels = await Channel.findAll({
    where: {
      teamId: installation.team.id,
      importedAt: { [Op.eq]: null },
    },
    order: [["createdAt", "asc"]],
  });
  await Promise.mapSeries(channels, async (channel) => {
    await slack.conversations.join({
      channel: channel.id,
    });

    await importMessages(slack, channel);

    await slack.conversations.leave({
      channel: channel.id,
    });
  });

  slack.chat.postMessage({
    channel: installation.user.id,
    text: `:white_check_mark: Your data has been imported and is available at ${config.app.url}/${publicId}`,
  });
};
