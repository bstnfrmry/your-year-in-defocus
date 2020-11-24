import { startOfYear } from "date-fns";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import React from "react";

import { Layout } from "~/components/ui/Layout";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";
import { sequelize, Team, TeamModel } from "~/lib/database";

type Props = {
  year: number;
  messagesCount: number;
  uniqueUsersCount: number;
  uniqueChannelsCount: number;
  team: TeamModel;
  topUsers: {
    count: number;
    name: string;
    picture: string;
  }[];
  topChannels: {
    count: number;
    name: string;
  }[];
};

export const getServerSideProps: GetServerSideProps<Props | Record<string, unknown>> = async (ctx) => {
  const team = await Team.findOne({
    where: { publicId: ctx.query.id },
  });

  if (!team) {
    ctx.res.statusCode = 302;
    ctx.res.setHeader("Location", "/");

    return { props: {} };
  }

  const start = startOfYear(new Date());

  const [messagesRes] = await sequelize.query(
    `select
      count(*) as "messagesCount",
      count(distinct user_id) as "uniqueUsersCount",
      count(distinct channel_id) as "uniqueChannelsCount"
    from messages
    join channels on channels.id = messages.channel_id and channels.team_id = :teamId
    join users on users.id = messages.user_id and users.is_bot = false
    where messages.created_at > :start`,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  const topUsers = await sequelize.query(
    `select
      count(*),
      users.*
    from messages
    join channels on channels.id = messages.channel_id and channels.team_id = :teamId
    join users on users.id = messages.user_id and users.is_bot = false
    where messages.created_at > :start
    group by users.id
    order by 1 desc
    limit 5`,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  const topChannels = await sequelize.query(
    `select
      count(*),
      channels.*
    from messages
    join channels on channels.id = messages.channel_id and channels.team_id = :teamId
    join users on users.id = messages.user_id and users.is_bot = false
    where messages.created_at > :start
    group by channels.id
    order by 1 desc
    limit 10`,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  return {
    props: {
      year: new Date().getFullYear(),
      team: team.toJSON(),
      messagesCount: messagesRes.messagesCount,
      uniqueUsersCount: messagesRes.uniqueUsersCount,
      uniqueChannelsCount: messagesRes.uniqueChannelsCount,
      topUsers: topUsers.map((user) => {
        return {
          count: user.count,
          name: user.real_name,
          picture: user.raw.profile.image_192,
        };
      }),
      topChannels: topChannels.map((channel) => {
        return {
          count: channel.count,
          name: channel.name,
        };
      }),
    },
  };
};

const DataViz: NextPage<Props> = ({
  year,
  messagesCount,
  uniqueUsersCount,
  uniqueChannelsCount,
  team,
  topUsers,
  topChannels,
}) => {
  const { height } = useScreenDimensions();

  return (
    <>
      <Layout className="text-gray-900 space-y-10 text-xl bg-green-100">
        <div className="h-full flex flex-col justify-center">
          <header className="text-center font-raleway">
            <h1 className="text-6xl font-bold">{team.name}</h1>
            <span>·</span>
            <h2 className="text-xl font-semibold">Your Year In Defocus</h2>
          </header>

          <div className="flex justify-center mt-20">
            <button
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
              onClick={() => {
                window.scrollTo({ top: height + 100, behavior: "smooth" });
              }}
            >
              Start exploring {year}
            </button>
          </div>
        </div>
      </Layout>

      <div className="w-full bg-gradient-to-b from-green-100 to-blue-100" style={{ height: 100 }} />

      <Layout className="pt-6 text-gray-900 space-y-10 text-xl bg-blue-100">
        <header className="text-center font-raleway">
          <h2 className="text-xl font-semibold">Your Year In Defocus</h2>
        </header>
        <div className="my-10">In {year}...</div>
        <div className="flex-1 flex flex-col space-y-10">
          <div className="flex space-x-2 items-baseline">
            <span className="text-6xl">{messagesCount}</span>
            <span>messages have been posted</span>
          </div>
          <div className="flex space-x-2 items-baseline">
            <span>by</span>
            <span className="text-6xl">{uniqueUsersCount}</span>
            <span>different people</span>
          </div>
          <div className="flex space-x-2 items-baseline">
            <span>to</span>
            <span className="text-6xl">{uniqueChannelsCount}</span>
            <span>channels</span>
          </div>
        </div>
      </Layout>

      <div className="w-full bg-gradient-to-b from-blue-100 to-purple-100" style={{ height: 100 }} />

      <Layout className="pt-6 text-gray-900 space-y-10 text-xl bg-purple-100">
        <header className="text-center font-raleway">
          <h2 className="text-xl font-semibold">Your Year In Defocus</h2>
        </header>
        <div className="my-10">Most active users</div>

        <div className="flex flex-col space-y-3">
          {topUsers.map((user) => {
            return (
              <div key={user.name} className="flex items-center space-x-4">
                <div className="bg-white p-1 rounded-full inline-flex">
                  <Image className="rounded-full" height={64} src={user.picture} width={64} />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl">{user.name}</span>
                  <span className="text-gray-500 font-light">· {user.count} messages</span>
                </div>
              </div>
            );
          })}
        </div>
      </Layout>

      <div className="w-full bg-gradient-to-b from-purple-100 to-pink-100" style={{ height: 100 }} />

      <Layout className="pt-6 text-gray-900 space-y-10 text-xl bg-pink-100">
        <header className="text-center font-raleway">
          <h2 className="text-xl font-semibold">Your Year In Defocus</h2>
        </header>
        <div className="my-10">Most active channels</div>

        <div className="flex flex-col space-y-3">
          {topChannels.map((channel) => {
            return (
              <div key={channel.name} className="flex items-center space-x-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl">
                    <span className="text-gray-300 mr-px">#</span>
                    {channel.name}
                  </span>
                  <span className="text-gray-500 font-light">· {channel.count} messages</span>
                </div>
              </div>
            );
          })}
        </div>
      </Layout>
    </>
  );
};

export default DataViz;
