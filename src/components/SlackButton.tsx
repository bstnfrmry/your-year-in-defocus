import Image from "next/image";
import React from "react";

export const SlackButton: React.FC = () => {
  return (
    <a href="/api/auth/redirect">
      <Image
        alt="Sign in with Slack"
        height={40}
        src="https://platform.slack-edge.com/img/sign_in_with_slack@2x.png"
        width={172}
      />
    </a>
  );
};
