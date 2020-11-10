import { NextPage } from "next";
import React from "react";
import { Trans } from "react-i18next";
import useSWR from "swr";

import { Layout } from "~/components/ui/Layout";
import { HelloResponse } from "~/pages/api/hello";

const Homepage: NextPage = () => {
  const { data } = useSWR<HelloResponse>("/api/hello");

  return (
    <Layout className="items-center justify-center">
      {data && (
        <h1>
          <Trans i18nKey="index.title" values={{ name: data.name }} />
        </h1>
      )}
    </Layout>
  );
};

export default Homepage;
