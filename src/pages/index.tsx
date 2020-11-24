import { NextPage } from "next";
import React from "react";
import { Trans } from "react-i18next";
import useSWR from "swr";

import { Layout } from "~/components/ui/Layout";
import { HelloResponse } from "~/pages/api/hello";
import { SlackButton } from "~/components/SlackButton";

const Homepage: NextPage = () => {
  const { data } = useSWR<HelloResponse>("/api/hello");

  return (
    <Layout className="items-center justify-center">
      {data && (
        <h1>
          <SlackButton />
        </h1>
      )}
    </Layout>
  );
};

export default Homepage;
