import { NextPage } from "next";
import React from "react";
import { Trans } from "react-i18next";

import { Layout } from "~/components/ui/Layout";

interface Props {
  statusCode?: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
  return (
    <Layout className="items-center justify-center">
      <h1>
        <Trans i18nKey="error.title" values={{ code: statusCode }} />
      </h1>
    </Layout>
  );
};

Error.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  return { statusCode };
};

export default Error;
