import { Installation as SlackInstallation, InstallProvider } from "@slack/oauth";
import { WebClient } from "@slack/web-api";

import { config } from "~/config";
import { getOrm } from "~/database";
import { Installation } from "~/database/models/Installation";

export const installer = new InstallProvider({
  clientId: config.slack.clientId,
  clientSecret: config.slack.clientSecret,
  stateSecret: "hello",
  installationStore: {
    storeInstallation: async (payload) => {
      const orm = await getOrm();

      const installation = new Installation();
      installation.teamId = payload.team.id;
      installation.token = payload.bot?.token as string;
      installation.raw = payload;

      await orm.em.persistAndFlush(installation);

      const slack = new WebClient(installation.token);

      const authUrl = `${config.app.url}/api/auth/redirect?teamId=${installation.teamId}`;

      slack.chat.postMessage({
        channel: payload.user.id,
        text: "Welcome to *Your Year in Slack*. :tada:",
        attachments: [
          {
            text:
              "Whenever you're ready, start generating your yearly report.\n\nWe'll ask you to authenticate with Slack before starting.",
            color: "good",
            actions: [
              {
                type: "button",
                text: "Generate report",
                url: authUrl,
                style: "primary",
              },
            ],
          },
        ],
      });
    },

    fetchInstallation: async (installQuery) => {
      const orm = await getOrm();

      const installation = await orm.em.getRepository(Installation).findOneOrFail({
        teamId: installQuery.teamId,
      });

      return installation.raw as SlackInstallation;
    },
  },
});
