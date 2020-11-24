import { NextApiHandler } from "next";

import { config } from "~/config";
import { installer } from "~/lib/slack-auth";

const Redirect: NextApiHandler = async (req, res) => {
  const url = await installer.generateInstallUrl({
    redirectUri: `${config.app.url}/api/auth/callback`,
    scopes: [
      "channels:read",
      "chat:write",
      "users:read",
      "usergroups:read",
      "channels:history",
      "groups:history",
      "mpim:history",
      "im:history",
      "channels:join",
      "channels:manage",
    ],
  });

  res.redirect(url);
};

export default Redirect;
