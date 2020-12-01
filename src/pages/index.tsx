import { NextPage } from "next";
import Image from "next/image";
import React from "react";

import { SlackButton } from "~/components/SlackButton";
import { Layout } from "~/components/ui/Layout";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";

const Homepage: NextPage = () => {
  const { height } = useScreenDimensions();

  return (
    <>
      <Layout className="relative text-gray-900 space-y-10 text-xl transition duration-1000 bg-gradient-to-br from-red-300 to-orange-300">
        <div className="flex flex-col h-full justify-center items-center max-w-2xl ">
          <header className="text-center  mt-10">
            <h2 className="text-5xl font-semibold font-raleway">Your Year In Slack</h2>
            <h3 className="mt-4 font-raleway">a 2020 Slack Rewind</h3>
            <p className="mt-10 text-base">
              <span className="font-semibold">Your Year in Slack</span> is a Slack application that generates a
              tailor-made yearly report for your Slack workspace. Share your report with colleagues and guess who's the
              most active user, which emoji is used the most, or who made the funniest joke this year.
              <a
                className="ml-1 text-base underline text-blue-600"
                href="/2m0qki67qfb5"
                rel="noreferrer"
                target="_blank"
              >
                See a live example.
              </a>
            </p>
          </header>
          <div className="mt-20">
            <SlackButton />
          </div>
          <div className="mt-20 flex space-x-4">
            <a
              className="text-base underline text-blue-600 cursor-pointer"
              onClick={() => {
                window.scrollTo({
                  top: height + 80,
                  behavior: "smooth",
                });
              }}
            >
              Installation guide
            </a>
          </div>
        </div>
      </Layout>
      <div className="h-20 bg-gradient-to-bl from-orange-300 to-red-300" />
      <Layout
        className="pt-10 relative text-gray-900 space-y-10 text-xl transition duration-1000 bg-gradient-to-br from-red-300 to-orange-300"
        id="how"
      >
        <div className="flex flex-col space-y-10 text-base">
          <h1 className="text-xl font-semibold">Installation guide</h1>

          <div className="flex flex-col space-y-2">
            <p>1. Install the Slack application using the provided link.</p>
            <SlackButton />
          </div>

          <div className="flex flex-col space-y-2">
            <p>2. You'll receive a greeting message on your Slack workspace.</p>
            <div>
              <Image className="rounded shadow" height={144} src="/slack-greeting.png" width={469} />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p>
              3. Upon clicking on "Generate report", our bot will start crawling your public Slack activity for 2020 and
              generate a report
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <p>
              4. When it's done, you'll receive a Slack message with the report URL that you can share with your team.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Homepage;
