import { Installation, InstallProvider } from "@slack/oauth";
import { WebClient } from "@slack/web-api";
import Promise from "bluebird";

import { config } from "~/config";
import { Channel, Op, testDatabaseConnection } from "~/lib/database";
import { importChannels, importGroups, importMessages, importUsers } from "~/lib/slack-import";

const store: { [key: string]: Installation } = {};

export const installer = new InstallProvider({
  clientId: config.slack.clientId,
  clientSecret: config.slack.clientSecret,
  stateSecret: "hello",
  installationStore: {
    storeInstallation: async (installation) => {
      store[installation.team.id] = installation;

      const slackBot = new WebClient(installation.bot?.token);
      slackBot.chat.postMessage({
        channel: installation.user.id,
        text:
          ":tada: Welcome and thanks for purchasing *Your year in defocus*\n:robot_face: Our bot is currently processing your data. It should take a few minutes. I'll send you a message when it's done :wink:",
      });

      await testDatabaseConnection();
      await importUsers(slackBot, installation.team.id);
      await importGroups(slackBot, installation.team.id);
      await importChannels(slackBot, installation.team.id);

      const channels = await Channel.findAll({
        where: {
          teamId: installation.team.id,
          importedAt: { [Op.eq]: null },
        },
        order: [["createdAt", "asc"]],
      });
      await Promise.mapSeries(channels, async (channel) => {
        await slackBot.conversations.join({
          channel: channel.id,
        });

        await importMessages(slackBot, channel);

        await slackBot.conversations.leave({
          channel: channel.id,
        });
      });
    },

    fetchInstallation: async (installQuery) => {
      return store[installQuery.teamId];
    },
  },
});
