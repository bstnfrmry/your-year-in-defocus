import { WebClient } from "@slack/web-api";
import Promise from "bluebird";
import { flatMap, last } from "lodash";

import {
  Channel,
  ChannelModel,
  Emoji,
  Group,
  GroupMention,
  insert,
  Message,
  MessageModel,
  Reaction,
  User,
  UserGroup,
  UserMention,
} from "~/lib/database";

export const importEmojis = async (slack: WebClient, teamId: string): Promise<void> => {
  const res = await slack.emoji.list({ limit: 1000 });

  const emojis = Object.entries(res.emoji).map(([name, url]) => {
    return {
      name,
      url,
      teamId,
    };
  });

  await insert(emojis, Emoji);
  if (emojis.length) {
    console.log(`Imported ${emojis.length} emojis...`);
  }
};

export const importUsers = async (slack: WebClient, teamId: string, cursor?: string): Promise<void> => {
  const res = await slack.users.list({ cursor, limit: 1000 });

  const users = res.members.map((user) => ({
    id: user.id,
    teamId,
    name: user.name,
    realName: user.profile.real_name,
    isBot: user.is_bot,
    raw: user,
  }));

  await insert(users, User);
  if (users.length) {
    console.log(`Imported ${users.length} users...`);
  }

  if (res.response_metadata.next_cursor) {
    return importUsers(slack, teamId, res.response_metadata.next_cursor);
  }
};

export const importGroups = async (slack: WebClient, teamId: string, cursor?: string): Promise<void> => {
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

  await insert(groups, Group);
  await insert(userGroup, UserGroup);
  if (groups.length) {
    console.log(`Imported ${groups.length} user groups...`);
  }
};

export const importChannels = async (slack: WebClient, teamId: string, cursor?: string): Promise<void> => {
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

  await insert(channels, Channel);
  if (channels.length) {
    console.log(`Imported ${channels.length} channels...`);
  }

  if (res.response_metadata?.next_cursor) {
    return importChannels(slack, teamId, res.response_metadata.next_cursor);
  }
};

export const importMessages = async (slack: WebClient, channel, latest?: string) => {
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

  const messages = res.messages
    .filter((message) => message.type === "message")
    .map((message) => ({
      ts: message.ts,
      channelId: channel.id,
      userId: message.user,
      threadTs: message.thread_ts,
      type: message.subtype || message.type,
      text: message.text,
      createdAt: new Date(message.ts.split(".")[0] * 1000),
      raw: message,
    }));

  await insert(messages, Message);
  await importReactions(res.messages);
  await importMentions(res.messages);
  if (messages.length) {
    console.log(`Imported ${messages.length} messages from #${channel.name}...`);
  }

  await Promise.map(
    messages,
    async (message) => {
      if (message.threadTs) {
        await importReplies(slack, channel, message);
      }
    },
    { concurrency: 20 }
  );

  if (res.has_more) {
    return importMessages(slack, channel, last(res.messages).ts);
  }

  await channel.update({ importedAt: new Date() });
};

const importReplies = async (slack: WebClient, channel: ChannelModel, message: MessageModel, latest?: string) => {
  const res = await slack.conversations.replies({
    channel: channel.id,
    ts: message.threadTs,
    count: 1000,
    ...(latest && {
      latest,
      inclusive: true,
    }),
    ...(channel.importedAt && {
      oldest: +new Date(channel.importedAt) / 1000,
    }),
  });

  const replies = res.messages
    .filter((reply) => reply.type === "message")
    .map((reply) => ({
      ts: reply.ts,
      channelId: channel.id,
      userId: reply.user,
      threadTs: reply.thread_ts,
      type: reply.subtype || reply.type,
      text: reply.text,
      createdAt: new Date(reply.ts.split(".")[0] * 1000),
      raw: reply,
    }));

  await insert(replies, Message);
  await importReactions(res.messages);
  await importMentions(res.messages);
  if (replies.length) {
    console.log(`Imported ${replies.length} replies from #${channel.name}:${message.ts}...`);
  }

  if (res.has_more) {
    return importReplies(slack, channel, message, last(res.messages).ts);
  }
};

const importReactions = async (messages) => {
  const reactions = flatMap(messages, (message) =>
    flatMap(message.reactions, (reaction) =>
      reaction.users.map((userId) => ({
        name: reaction.name,
        messageTs: message.ts,
        userId,
      }))
    )
  );

  await insert(reactions, Reaction);
};

const importMentions = async (messages) => {
  const userMentions = await flatMap(messages, (message) => {
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

  await insert(userMentions, UserMention);

  const groupMentions = await flatMap(messages, (message) => {
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

  await insert(groupMentions, GroupMention);
};
