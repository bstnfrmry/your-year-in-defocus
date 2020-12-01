import { NextApiHandler } from "next";

import { config } from "~/config";

const Redirect: NextApiHandler = async (req, res) => {
  const params = new URLSearchParams();

  const scopes = [
    "channels:read",
    "users:read",
    "usergroups:read",
    "channels:history",
    "groups:history",
    "mpim:history",
    "im:history",
    "team:read",
    "reactions:read",
    "emoji:read",
  ];

  params.append("client_id", config.slack.clientId);
  params.append("redirect_uri", `${config.app.url}/api/auth/callback`);
  params.append("team", req.query.teamId as string);
  params.append("scope", scopes.join(","));

  const url = `https://slack.com/oauth/authorize?${params.toString()}`;

  res.redirect(url);
};

export default Redirect;
