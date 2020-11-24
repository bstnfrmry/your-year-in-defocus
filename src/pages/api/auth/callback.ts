import { NextApiHandler } from "next";

import { installer } from "~/lib/slack-auth";

const Callback: NextApiHandler = async (req, res) => {
  await installer.handleCallback(req, res);
};

export default Callback;
