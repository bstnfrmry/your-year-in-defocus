import { NextPage } from "next";
import React from "react";

import { SlackButton } from "~/components/SlackButton";
import { Layout } from "~/components/ui/Layout";

const Homepage: NextPage = () => {
  return (
    <Layout className="items-center justify-center">
      <div className="flex flex-col h-full justify-center items-center space-y-4">
        <header className="text-center font-raleway">
          <h2 className="text-2xl font-semibold">Your Year In Defocus</h2>
        </header>
        <SlackButton />
      </div>
    </Layout>
  );
};

export default Homepage;
