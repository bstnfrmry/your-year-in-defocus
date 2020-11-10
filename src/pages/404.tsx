import { NextPage } from "next";
import React from "react";
import { Trans } from "react-i18next";

import { Layout } from "~/components/ui/Layout";

const FourOhFour: NextPage = () => {
  return (
    <Layout className="items-center justify-center">
      <h1>
        <Trans i18nKey="404.title" />
      </h1>
    </Layout>
  );
};

export default FourOhFour;
