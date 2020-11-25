import classNames from "classnames";
import { startOfYear } from "date-fns";
import { EmojiConvertor } from "emoji-js";
import { groupBy } from "lodash";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import React, { createContext, useContext, useEffect, useState } from "react";

import { LeftArrowIcon, RightArrowIcon, TwitterIcon } from "~/components/ui/Icon";
import { Layout } from "~/components/ui/Layout";
import { Emoji, sequelize, Team } from "~/lib/database";

type Props = {
  emojis: {
    name: string;
    url: string;
  }[];
  year: number;
  messagesCount: number;
  uniqueUsersCount: number;
  uniqueChannelsCount: number;
  botsMessagesCount: number;
  uniqueBotsCount: number;
  team: {
    name: string;
    picture: string;
    domain: string;
  };
  topUsers: {
    count: number;
    name: string;
    picture: string;
  }[];
  topChannels: {
    count: number;
    name: string;
  }[];
  topEmojis: {
    count: number;
    name: string;
  }[];
  longestThreads: {
    count: number;
    text: string;
    channel: string;
    channelId: string;
    message: any;
    replyUsers: string[];
    // reactions: string[];
    date: string;
    from: {
      name: string;
      picture: string;
    };
  }[];
  mostMentionedUsers: {
    count: number;
    name: string;
    picture: string;
  }[];
  mostPopularMessages: {
    text: string;
    channel: string;
    channelId: string;
    message: any;
    user: any;
    reactions: string[];
    // replyUsers: string[];
  }[];
  funniestMessages: {
    text: string;
    channel: string;
    channelId: string;
    message: any;
    user: any;
    reactions: string[];
    // replyUsers: string[];
  }[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  const teams = await Team.findAll();

  return {
    fallback: false,
    paths: teams.map((team) => {
      return { params: { id: team.publicId } };
    }),
  };
};

export const getStaticProps: GetStaticProps<Props | Record<string, unknown>> = async (ctx) => {
  const team = await Team.findOne({
    where: { publicId: ctx.params?.id as string },
  });

  const start = startOfYear(new Date());

  const emojis = await Emoji.findAll();

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

  const [botsMessagesRes] = await sequelize.query(
    `select
      count(*) as "messagesCount",
      count(distinct user_id) as "uniqueUsersCount"
    from messages
    join channels on channels.id = messages.channel_id and channels.team_id = :teamId
    join users on users.id = messages.user_id and users.is_bot = true
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
    limit 8`,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  const longestThreads = await sequelize.query(
    `select count(thread_messages.ts), messages.text, users.raw as user, messages.raw as message, channels.name as channel, channels.id as "channelId", messages.created_at as "createdAt", array_agg(distinct reply_users.raw->'profile'->>'image_192') as "replyUsers"
    from messages
    join messages thread_messages on messages.ts = thread_messages.thread_ts
    join channels on channels.id = messages.channel_id and channels.team_id = :teamId
    join users on users.id = messages.user_id and users.is_bot = false
    join users reply_users on thread_messages.user_id = reply_users.id
    where messages.created_at > :start
    group by messages.ts, users.id, channels.id
    order by 1 desc
    limit 5
    `,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  const mostMentionedUsers = await sequelize.query(
    `select
        count(*),
        users.*
      from user_mentions
      join messages on messages.ts = user_mentions.message_ts
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

  const mostPopularMessages = await sequelize.query(
    `select count(reactions.id), messages.text, users.raw as user, messages.raw as message, channels.name as channel, channels.id as "channelId", messages.created_at as "createdAt", array_agg(reactions.name) as "reactions"
      from messages
      join channels on channels.id = messages.channel_id and channels.team_id = :teamId
      join users on users.id = messages.user_id and users.is_bot = false
      join reactions on reactions.message_ts = messages.ts
      where messages.created_at > :start
      group by messages.ts, users.id, channels.id
      order by 1 desc
      limit 5
  `,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  const funniestMessages = await sequelize.query(
    `select count(reactions.id), messages.text, users.raw as user, messages.raw as message, channels.name as channel, channels.id as "channelId", messages.created_at as "createdAt", array_agg(reactions.name) as "reactions"
      from messages
      join channels on channels.id = messages.channel_id and channels.team_id = :teamId
      join users on users.id = messages.user_id and users.is_bot = false
      join reactions on reactions.message_ts = messages.ts and reactions.name in ('joy', 'smile', 'grinning', 'sweat_smile', 'rolling_on_the_floor_laughing')
      where messages.created_at > :start
      group by messages.ts, users.id, channels.id
      order by 1 desc
      limit 5
  `,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  const topEmojis = await sequelize.query(
    `select count(*), reactions.name
    from reactions
    join messages on messages.ts = reactions.message_ts
    join channels on channels.id = messages.channel_id and channels.team_id = :teamId
    group by reactions.name
    order by 1 desc
    limit 100`,
    {
      type: "SELECT",
      replacements: { teamId: team.id, start },
    }
  );

  return {
    props: {
      year: new Date().getFullYear(),
      emojis: emojis.map((emoji) => emoji.toJSON()),
      team: {
        name: team.name,
        picture: team.raw.icon.image_132,
        domain: team.raw.domain,
      },
      messagesCount: messagesRes.messagesCount,
      uniqueUsersCount: messagesRes.uniqueUsersCount,
      uniqueChannelsCount: messagesRes.uniqueChannelsCount,
      botsMessagesCount: botsMessagesRes.messagesCount,
      uniqueBotsCount: botsMessagesRes.uniqueUsersCount,
      topEmojis: topEmojis.map((emoji) => {
        return {
          count: emoji.count,
          name: emoji.name,
        };
      }),
      topUsers: topUsers.map((user) => {
        return {
          count: user.count,
          name: user.real_name,
          picture: user.raw.profile.image_192,
        };
      }),
      mostMentionedUsers: mostMentionedUsers.map((user) => {
        return {
          count: user.count,
          name: user.raw.profile.display_name_normalized,
          picture: user.raw.profile.image_192,
        };
      }),
      topChannels: topChannels.map((channel) => {
        return {
          count: channel.count,
          name: channel.name,
        };
      }),
      longestThreads: longestThreads.map((thread) => {
        return {
          count: thread.count,
          text: thread.text,
          channel: thread.channel,
          channelId: thread.channelId,
          message: thread.message,
          user: thread.user,
          date: thread.createdAt.toString(),
          replyUsers: thread.replyUsers,
          // reactions: thread.reactions,

          from: {
            name: thread.user.real_name,
            picture: thread.user.profile.image_192,
          },
        };
      }),
      mostPopularMessages: mostPopularMessages.map((message) => {
        return {
          text: message.text,
          channel: message.channel,
          channelId: message.channelId,
          message: message.message,
          user: message.user,
          reactions: message.reactions,
          // replyUsers: message.replyUsers,
        };
      }),
      funniestMessages: funniestMessages.map((message) => {
        return {
          text: message.text,
          channel: message.channel,
          channelId: message.channelId,
          message: message.message,
          user: message.user,
          reactions: message.reactions,
          // replyUsers: message.replyUsers,
        };
      }),
    },
  };
};

const EmojiContext = createContext<{ name: string; url: string }[]>([]);

const DataViz: NextPage<Props> = (props) => {
  const sections = [
    { component: Home, colors: ["green", "blue"] },
    { component: Summary, colors: ["blue", "purple"] },
    { component: TopUsers, colors: ["purple", "pink"] },
    { component: TopChannels, colors: ["pink", "red"] },
    { component: LongestThreads, colors: ["red", "orange"] },
    { component: MostMentionedUsers, colors: ["orange", "yellow"] },
    { component: MostPopularMessages, colors: ["yellow", "orange"] },
    { component: FunniestMessages, colors: ["orange", "red"] },
    { component: TopEmojis, colors: ["red", "pink"] },
    { component: Thanks, colors: ["pink", "purple"] },
  ];
  const [index, setIndex] = useState(0);
  const section = sections[index];
  const [color1, color2] = section.colors;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.keyCode === 39 && index < sections.length - 1) {
        setIndex(index + 1);
      }
      if (event.keyCode === 37 && index) {
        setIndex(index - 1);
      }
    };

    window.addEventListener("keyup", onKey);

    return () => {
      window.removeEventListener("keyup", onKey);
    };
  }, [index]);

  return (
    <EmojiContext.Provider value={props.emojis}>
      <Layout
        className={`relative text-gray-900 space-y-10 text-xl transition duration-1000 bg-gradient-to-br from-${color1}-300 to-${color2}-300`}
      >
        {index !== 0 && (
          <button
            className={`text-center font-raleway mb-10 mt-8 bg-gradient-to-br from-${color2}-400 to-${color2}-500 hover:from-${color2}-500 hover:to-${color2}-600 rounded-xl py-2 px-4 text-gray-100 border-2 shadow border-white focus:ring ring-${color2}-600 focus:outline-none`}
            onClick={() => {
              setIndex(0);
            }}
          >
            <h2 className="text-xl font-light">Your Year in Defocus</h2>
          </button>
        )}
        <section.component
          color={color2}
          {...props}
          onNext={() => {
            setIndex(index + 1);
          }}
        />
        {index !== 0 && (
          <div className="pointer-events-none absolute container mx-auto md:top-0 bottom-0 left-0 right-0 mb-4 px-4 flex items-center justify-between">
            <button
              className={`pointer-events-auto flex items-center justify-center h-16 w-16 border-2 shadow border-transparent text-base font-medium rounded-full text-white bg-gradient-to-br from-${color2}-400 to-${color2}-500 hover:from-${color2}-500 hover:to-${color2}-600 focus:ring ring-${color2}-600 focus:outline-none`}
              onClick={() => {
                setIndex(index - 1);
              }}
            >
              <LeftArrowIcon className="w-6 h-6" />
            </button>
            {index < sections.length - 1 && (
              <button
                className={`pointer-events-auto flex items-center justify-center h-16 w-16 border-2 shadow border-transparent text-base font-medium rounded-full text-white bg-gradient-to-br from-${color2}-400 to-${color2}-500 hover:from-${color2}-500 hover:to-${color2}-600 focus:ring ring-${color2}-600 focus:outline-none`}
                onClick={() => {
                  setIndex(index + 1);
                }}
              >
                <RightArrowIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {index !== 0 && (
          <div className="fixed bottom-0 left-0 right-0 h-2 bg-white border-t-2 border-b border-white">
            <div
              className={`h-full bg-gradient-to-br from-${color1}-400 to-${color2}-500 transition-all ease-in-out`}
              style={{ width: `${(index / (sections.length - 1)) * 100}%` }}
            />
          </div>
        )}
      </Layout>
    </EmojiContext.Provider>
  );
};

type SectionProps = Props & { onNext: () => void; color: string };

const Home: React.FC<SectionProps> = ({ color, team, year, onNext }) => {
  return (
    <div className="h-full flex flex-col justify-center">
      <header className="text-center font-raleway">
        <div className={`border-2 border-${color}-500 inline-flex rounded shadow`}>
          <Image className="rounded " height={66} src={team.picture} width={66} />
        </div>
        <h1 className="text-6xl font-bold mt-6 mb-12">{team.name}</h1>
        <h2 className="text-xl font-semibold">Your Year in Defocus</h2>
        <span className="text-base">A rewind of everything that happened in Slack in {year}</span>
      </header>

      <div className="flex justify-center mt-20">
        <button
          className="flex items-center justify-center px-8 py-3 border-2 shadow border-transparent text-base font-medium rounded-md text-white bg-gradient-to-br from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 focus:ring ring-${color2}-600 focus:outline-none"
          onClick={() => {
            onNext();
          }}
        >
          Start exploring {year}
        </button>
      </div>
    </div>
  );
};

const Summary: React.FC<SectionProps> = ({
  color,
  year,
  messagesCount,
  uniqueUsersCount,
  uniqueChannelsCount,
  uniqueBotsCount,
  botsMessagesCount,
}) => {
  return (
    <>
      <div className="mb-10 font-raleway font-bold">In {year}...</div>
      <div className="flex flex-col space-y-10">
        <div className="flex space-x-2 items-baseline">
          <Highlight color={color}>{messagesCount}</Highlight>
          <span>messages have been posted</span>
        </div>

        <div className="flex space-x-2 items-baseline">
          <span>by</span>
          <Highlight color={color}>{uniqueUsersCount}</Highlight>
          <span>different people</span>
        </div>

        <div className="flex space-x-2 items-baseline">
          <span>to</span>
          <Highlight color={color}>{uniqueChannelsCount}</Highlight>
          <span>channels</span>
        </div>

        <div className="flex space-x-2 items-baseline">
          <span className="mt-10 text-sm">
            (Oh, and your {uniqueBotsCount} bots posted {botsMessagesCount} messages by themselves! 🤖)
          </span>
        </div>
      </div>
    </>
  );
};

const TopUsers: React.FC<SectionProps> = ({ topUsers }) => {
  const topUserCount = topUsers[0].count;

  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">Most active users</div>

      <div className="flex flex-col space-y-5">
        {topUsers.map((user, index) => {
          const size = index === 0 ? 92 : 64;

          return (
            <div key={user.name} className="flex flex-col space-y-2 bg-white rounded p-2 shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-300 p-px rounded inline-flex shadow">
                  <Image className="rounded" height={size} src={user.picture} width={size} />
                </div>
                <div className="flex flex-1 items-baseline">
                  <span className="text-2xl flex-1">{user.name}</span>
                  <span className="text-gray-500 text-sm font-light ml-10">{user.count} messages</span>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded shadow">
                <div className="h-1 bg-purple-600 rounded" style={{ width: `${(user.count / topUserCount) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const TopChannels: React.FC<SectionProps> = ({ topChannels }) => {
  const topChannelCount = topChannels[0].count;

  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">Most active channels</div>

      <div className="flex flex-col space-y-3">
        {topChannels.map((channel) => {
          return (
            <div key={channel.name} className="flex flex-col space-y-2 bg-white rounded shadow p-2">
              <div className="flex items-center">
                <div className="flex justify-between items-baseline w-full">
                  <span className="text-2xl flex-1">
                    <span className="text-gray-300 mr-px">#</span>
                    {channel.name}
                  </span>
                  <span className="text-gray-500 text-sm font-light ml-10">{channel.count} messages</span>
                </div>
              </div>
              <div className="w-full bg-pink-200 rounded shadow">
                <div
                  className="h-1 bg-pink-600 rounded"
                  style={{ width: `${(channel.count / topChannelCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const LongestThreads: React.FC<SectionProps> = ({ team, color, longestThreads }) => {
  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">Longest threads</div>
      <div className="flex flex-col space-y-10">
        {longestThreads.map((thread, index) => {
          return (
            <SlackMessage
              key={index}
              channel={thread.channel}
              channelId={thread.channelId}
              color={color}
              domain={team.domain}
              message={thread.message}
              reactions={[]}
              replyUsers={thread.replyUsers}
              user={thread.user}
            />
          );
        })}
      </div>
    </>
  );
};

type SlackMessageProps = {
  color?: string;
  domain: string;
  message: any;
  user: any;
  channel: string;
  channelId: string;
  replyUsers: string[];
  reactions: string[];
};

const SlackMessage: React.FC<SlackMessageProps> = ({
  domain,
  color,
  message,
  user,
  channel,
  channelId,
  replyUsers,
  reactions,
}) => {
  // return <pre>{JSON.stringify(message, null, 2)}</pre>;
  const groupedReactions = groupBy(reactions, (reaction) => reaction);

  return (
    <a
      className="flex space-x-2 transform transition hover:scale-105 bg-white rounded p-1 pr-2 shadow"
      href={`https://${domain}.slack.com/archives/${channelId}/p${message.ts.replace(".", "")}`}
      rel="noreferrer"
      target="_blank"
    >
      <div className="w-12">
        <div className="inline-flex shadow rounded">
          <Image className="rounded" height={48} src={user.profile.image_192} width={48} />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-baseline w-full">
          <span className="flex-1 text-base font-medium">{user.real_name}</span>
          <span className="text-gray-500 text-sm ml-10">in #{channel}</span>
        </div>
        <div className="flex flex-col text-base">
          {message.blocks?.map((block, i) => {
            if (block.type === "rich_text") {
              return (
                <div key={i}>
                  {block.elements.map((section) => {
                    if (section.type === "rich_text_section" || section.type === "rich_text_quote") {
                      return (
                        <div
                          className={classNames({
                            "flex space-x-1": true,
                            "border-l-4 pl-2": section.type === "rich_text_quote",
                          })}
                        >
                          {section.elements.map((element) => {
                            if (element.type === "link") {
                              return (
                                <a
                                  className="text-blue-600 hover:underline"
                                  href={element.url}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {element.url}
                                </a>
                              );
                            }
                            if (element.type === "text") {
                              return <span>{element.text}</span>;
                            }
                          })}
                        </div>
                      );
                    }
                  })}
                </div>
              );
            }

            if (block.type === "image") {
              return (
                <div>
                  <span className="text-sm text-gray-700">{block.alt_text}</span>
                  <img
                    src={block.image_url}
                    style={{ width: `${block.image_width}px`, height: `${block.image_height}px` }}
                  />
                </div>
              );
            }
          })}
        </div>

        {reactions.length > 0 && (
          <div className="flex mt-1 space-x-1">
            {Object.entries(groupedReactions).map(([reaction, array]) => {
              return (
                <div
                  key={reaction}
                  className={`rounded-full border text-base border-${color}-100 flex items-center space-x-2 px-2 py-px`}
                >
                  <EmojiView name={reaction} size={16} />
                  <span className="text-sm">{array.length}</span>
                </div>
              );
            })}
          </div>
        )}

        {message.reply_count > 0 && replyUsers.length > 0 && (
          <div className="mt-2 flex space-x-1 items-center">
            {replyUsers.map((user, i) => {
              return (
                <div key={i} className="inline-flex shadow">
                  <Image key={i} className="rounded" height={24} src={user} width={24} />
                </div>
              );
            })}
            <div className="font-semibold text-blue-600 text-sm pl-2">{message.reply_count} replies</div>
          </div>
        )}
      </div>
    </a>
  );
};

const MostMentionedUsers: React.FC<SectionProps> = ({ color, mostMentionedUsers }) => {
  const topUserCount = mostMentionedUsers[0].count;

  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">
        Most <span className="line-through font-normal text-gray-500">popular</span> solicited users
      </div>

      <div className="flex flex-col space-y-5">
        {mostMentionedUsers.map((user, index) => {
          const size = index === 0 ? 92 : 64;

          return (
            <div key={user.name} className="flex flex-col space-y-2 bg-white rounded p-2 shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-300 p-px rounded inline-flex shadow">
                  <Image className="rounded" height={size} src={user.picture} width={size} />
                </div>
                <div className="flex flex-1 items-baseline">
                  <span className="text-2xl flex-1 text-blue-600">@{user.name}</span>
                  <span className="text-gray-500 text-sm font-light ml-10">{user.count} mentions</span>
                </div>
              </div>
              <div className={`w-full bg-${color}-200 rounded shadow`}>
                <div
                  className={`h-1 bg-${color}-600 rounded`}
                  style={{ width: `${(user.count / topUserCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const MostPopularMessages: React.FC<SectionProps> = ({ team, color, mostPopularMessages }) => {
  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">Most popular messages</div>
      <div className="flex flex-col space-y-10">
        {mostPopularMessages.map((message, index) => {
          return (
            <SlackMessage
              key={index}
              channel={message.channel}
              channelId={message.channelId}
              color={color}
              domain={team.domain}
              message={message.message}
              reactions={message.reactions}
              replyUsers={[]}
              user={message.user}
            />
          );
        })}
      </div>
    </>
  );
};

const FunniestMessages: React.FC<SectionProps> = ({ team, color, funniestMessages }) => {
  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">Funniest messages</div>
      <div className="flex flex-col space-y-10">
        {funniestMessages.map((message, index) => {
          return (
            <SlackMessage
              key={index}
              channel={message.channel}
              channelId={message.channelId}
              color={color}
              domain={team.domain}
              message={message.message}
              reactions={message.reactions}
              replyUsers={[]}
              user={message.user}
            />
          );
        })}
      </div>
    </>
  );
};

const TopEmojis: React.FC<SectionProps> = ({ topEmojis }) => {
  const topEmojiCount = topEmojis[0].count;

  return (
    <>
      <div className="mb-10 uppercase font-raleway font-bold">Most popular emojis</div>

      <div className="flex flex-wrap justify-center gap-3 items-end max-w-xl">
        {topEmojis.map((emoji) => {
          const ratio = 20 + (emoji.count / topEmojiCount) * 40;

          return (
            <div
              key={emoji.name}
              className="bg-white rounded-xl shadow flex leading-normal px-2 py-1 space-x-1 items-baseline transition transform hover:scale-125"
              style={{ fontSize: ratio }}
            >
              <EmojiView name={emoji.name} size={ratio} />
              <span className="text-xs text-gray-700">x{emoji.count}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

const EmojiView: React.FC<{ name: string; size: number }> = ({ name, size }) => {
  const emojis = new EmojiConvertor();
  const customEmojis = useContext(EmojiContext);

  const customEmoji = customEmojis.find((emoji) => emoji.name === name);
  if (customEmoji) {
    return <img height={size} src={customEmoji.url} width={size} />;
  }

  return <span>{emojis.replace_colons(`:${name}:`)}</span>;
};

const Thanks: React.FC<SectionProps> = ({ team, color }) => {
  return (
    <>
      <div className={`mt-20 border-2 border-${color}-500 inline-flex rounded shadow`}>
        <Image className="rounded " height={66} src={team.picture} width={66} />
      </div>
      <div className="my-10 text-3xl uppercase font-raleway font-bold">Thanks ❤️</div>

      <div className="text-base">I hoped you enjoyed the show!</div>
      <div className="text-base">
        Feel free to{" "}
        <a className={`underline text-${color}-600`} href="mailto:bastien.formery@gmail.com">
          email me
        </a>{" "}
        for any feedback.
      </div>

      <a
        className="mt-20"
        href="https://twitter.com/intent/tweet?text=Rewind+your+2020+Slack+with+Your+year+in+Defocus!+https://your-year-in-defocus.com"
        rel="noreferrer"
        target="_blank"
      >
        <button className="space-x-2 flex items-center justify-center px-4 py-2 border-2 shadow border-transparent text-base font-medium rounded-md text-white bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:ring ring-${color2}-600 focus:outline-none">
          <TwitterIcon className="w-8 h-8" />
          <span>Share on Twitter</span>
        </button>
      </a>
    </>
  );
};

const Highlight: React.FC<{ color: string }> = ({ children, color }) => {
  return (
    <div className="relative">
      <span className={`absolute bg-${color}-500 -mb-1 left-0 bottom-0 right-0 h-1 transform -rotate-1 scale-105`} />
      <span className="text-6xl relative">{children}</span>
    </div>
  );
};

export default DataViz;