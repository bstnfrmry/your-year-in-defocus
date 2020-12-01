import { MikroORM } from "@mikro-orm/core";
import { WebClient } from "@slack/web-api";
import Promise from "bluebird";
import { flatMap, last } from "lodash";

import { Channel } from "~/database/models/Channel";
import { Emoji } from "~/database/models/Emoji";
import { Group } from "~/database/models/Group";
import { GroupMention } from "~/database/models/GroupMention";
import { Message } from "~/database/models/Message";
import { Reaction } from "~/database/models/Reaction";
import { User } from "~/database/models/User";
import { UserGroup } from "~/database/models/UserGroup";
import { UserMention } from "~/database/models/UserMention";
import { insert } from "~/database/utils";
import { SlackMessage } from "~/lib/slack";

export const importEmojis = async (orm: MikroORM, slack: WebClient, teamId: string): Promise<void> => {
  const res = await slack.emoji.list({ limit: 1000 });

  const emojis = Object.entries(res.emoji).map(([name, url]) => {
    return {
      name,
      url,
      teamId,
    };
  });

  await insert(orm, emojis, Emoji);
  if (emojis.length) {
    console.log(`Imported ${emojis.length} emojis...`);
  }
};

export const importUsers = async (orm: MikroORM, slack: WebClient, teamId: string, cursor?: string): Promise<void> => {
  const res = await slack.users.list({ cursor, limit: 1000 });

  const users = res.members.map((user) => ({
    id: user.id,
    teamId,
    name: user.name,
    realName: user.profile.real_name,
    isBot: user.is_bot,
    raw: user,
  }));

  await insert(orm, users, User);
  if (users.length) {
    console.log(`Imported ${users.length} users...`);
  }

  if (res.response_metadata.next_cursor) {
    return importUsers(orm, slack, teamId, res.response_metadata.next_cursor);
  }
};

export const importGroups = async (orm: MikroORM, slack: WebClient, teamId: string, cursor?: string): Promise<void> => {
  const res = await slack.usergroups.list({
    cursor,
    include_users: true,
    include_disabled: true,
    limit: 1000,
  });

  const groups = res.usergroups.map((group) => ({
    id: group.id,
    teamId,
    name: group.name,
    handle: group.handle,
    createdAt: new Date(group.date_create * 1000),
    raw: group,
  }));

  const userGroup = flatMap(res.usergroups, (group) => {
    if (!group.users) {
      return [];
    }

    return group.users.map((userId) => ({
      groupId: group.id,
      userId,
    }));
  });

  await insert(orm, groups, Group);
  await insert(orm, userGroup, UserGroup);
  if (groups.length) {
    console.log(`Imported ${groups.length} user groups...`);
  }
};

export const importChannels = async (
  orm: MikroORM,
  slack: WebClient,
  teamId: string,
  cursor?: string
): Promise<void> => {
  const res = await slack.conversations.list({
    cursor,
    limit: 1000,
    types: "public_channel",
  });

  const channels = res.channels.map((channel) => ({
    id: channel.id,
    teamId,
    name: channel.name,
    createdAt: new Date(channel.created * 1000),
    raw: channel,
  }));

  await insert(orm, channels, Channel);
  if (channels.length) {
    console.log(`Imported ${channels.length} channels...`);
  }

  if (res.response_metadata?.next_cursor) {
    return importChannels(orm, slack, teamId, res.response_metadata.next_cursor);
  }
};

export const importMessages = async (
  orm: MikroORM,
  slack: WebClient,
  channel: Channel,
  latest?: string
): Promise<void> => {
  const res = await slack.conversations.history({
    channel: channel.id,
    count: 1000,
    ...(latest && {
      latest,
      inclusive: true,
    }),
    ...(channel.importedAt && {
      oldest: +new Date(channel.importedAt) / 1000,
    }),
  });

  const messages = (res.messages as SlackMessage[])
    .filter((message) => message.type === "message")
    .map((message) => ({
      ts: message.ts,
      channelId: channel.id,
      userId: message.user,
      threadTs: message.thread_ts,
      type: message.subtype || message.type,
      text: message.text,
      createdAt: new Date(parseInt(message.ts.split(".")[0]) * 1000),
      raw: message,
    }));

  await insert(orm, messages, Message);
  await importReactions(orm, messages);
  await importMentions(orm, messages);
  if (messages.length) {
    console.log(`Imported ${messages.length} messages from #${channel.name}...`);
  }

  // await Promise.map(
  //   messages,
  //   async (message) => {
  //     if (message.threadTs) {
  //       await importReplies(orm, slack, channel, message);
  //     }
  //   },
  //   { concurrency: 5 }
  // );

  if (res.has_more) {
    return importMessages(orm, slack, channel, last(res.messages).ts);
  }

  channel.importedAt = new Date();
  orm.em.persist(channel);
};

const importReplies = async (orm: MikroORM, slack: WebClient, channel: Channel, message: Message, latest?: string) => {
  const res = await slack.conversations.replies({
    channel: channel.id,
    ts: message.threadTs,
    count: 1000,
    ...(latest && {
      latest,
      inclusive: true,
    }),
    ...(channel.importedAt && {
      oldest: +(new Date(channel.importedAt) / 1000),
    }),
  });

  const messages = res.messages as SlackMessage[];

  const replies = messages
    .slice(!latest ? 1 : 0)
    .filter((reply) => reply.type === "message")
    .map((reply) => {
      const message = new Message();
      message.ts = reply.ts;
      message.channelId = channel.id;
      message.userId = reply.user;
      message.threadTs = reply.thread_ts;
      message.type = reply.subtype || reply.type;
      message.text = reply.text;
      message.createdAt = new Date(parseInt(reply.ts.split(".")[0]) * 1000);
      message.raw = reply;

      return message;
    });

  await insert(orm, replies, Message);
  await importReactions(orm, messages);
  await importMentions(orm, messages);
  if (replies.length) {
    console.log(`Imported ${replies.length} replies from #${channel.name}:${message.ts}...`);
  }

  if (res.has_more) {
    await importReplies(orm, slack, channel, message, last(messages)?.ts);
  }
};

const importReactions = async (orm: MikroORM, messages: SlackMessage[]) => {
  const reactions = flatMap(messages, (message) =>
    flatMap(message.reactions, (reaction) =>
      reaction.users.map((userId) => ({
        name: reaction.name,
        messageTs: message.ts,
        userId,
      }))
    )
  );

  await insert(orm, reactions, Reaction);
};

const importMentions = async (orm: MikroORM, messages: SlackMessage[]) => {
  const userMentions = flatMap(messages, (message) => {
    const mentions = message.text.match(/<@(\w+)>/g);
    if (!mentions) {
      return [];
    }

    return mentions.map((tag) => {
      return {
        messageTs: message.ts,
        userId: tag.substring(2, 11),
      };
    });
  });

  await insert(orm, userMentions, UserMention);

  const groupMentions = flatMap(messages, (message) => {
    const mentions = message.text.match(/<!subteam\^(\w+)\|@.+>/g);
    if (!mentions) {
      return [];
    }

    return mentions.map((tag) => {
      return {
        messageTs: message.ts,
        groupId: tag.substring(10, 19),
      };
    });
  });

  await insert(orm, groupMentions, GroupMention);
};
