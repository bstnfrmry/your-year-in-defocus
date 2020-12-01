import Head from "next/head";
import Image from "next/image";
import React from "react";

import { config } from "~/config";

export const SlackButton: React.FC = () => {
  return (
    <a href="/api/install/redirect">
      <Head>
        <meta content={config.slack.appId} name="slack-app-id" />
      </Head>
      <Image
        alt="Sign in with Slack"
        height={40}
        src="https://platform.slack-edge.com/img/sign_in_with_slack@2x.png"
        width={172}
      />
    </a>
  );
};
