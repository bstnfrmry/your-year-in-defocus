import { NextApiHandler } from "next";

import { config } from "~/config";
import { installer } from "~/lib/slack-auth";

const Redirect: NextApiHandler = async (req, res) => {
  const url = await installer.generateInstallUrl({
    redirectUri: `${config.app.url}/api/install/callback`,
    scopes: ["chat:write"],
  });

  res.redirect(url);
};

export default Redirect;
