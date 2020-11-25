import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { config } from "~/config";

export { Op } from "sequelize";

export const sequelize = new Sequelize(config.database.uri, {
  logging: false,
  define: {
    underscored: true,
    timestamps: false,
  },
});

export type TeamModel = {
  id: string;
  publicId: string;
  name: string;
  raw: string;
};

export const Team = sequelize.define<Model<TeamModel>>(
  "team",
  {
    id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    publicId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    indexes: [{ fields: ["public_id"] }],
  }
);

export type UserModel = {
  id: string;
  teamId: string;
  name: string;
  realName: string;
  isBot: boolean;
  raw: any;
};

export const User = sequelize.define<Model<UserModel>>(
  "user",
  {
    id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    teamId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    realName: { type: DataTypes.STRING, allowNull: false },
    isBot: { type: DataTypes.BOOLEAN, allowNull: false },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    indexes: [{ fields: ["name"] }],
  }
);

export type GroupModel = {
  id: string;
  teamId: string;
  handle: string;
  name: string;
  createdAt: string;
  raw: any;
};

export const Group = sequelize.define<Model<GroupModel>>(
  "group",
  {
    id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    teamId: { type: DataTypes.STRING, allowNull: false },
    handle: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    indexes: [{ fields: ["handle"] }],
  }
);

export type UserGroupModel = {
  userId: string;
  groupId: string;
};

export const UserGroup = sequelize.define<Model<UserGroupModel>>(
  "user_group",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Group, key: "id" },
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        type: "UNIQUE",
        fields: ["user_id", "group_id"],
      },
    ],
  }
);

export type ChannelModel = {
  id: string;
  teamId: string;
  name: string;
  createdAt: string;
  raw: any;
  importedAt: string;
};

export const Channel = sequelize.define<Model<ChannelModel>>(
  "channel",
  {
    id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    teamId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    raw: { type: DataTypes.JSONB, allowNull: false },
    importedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    indexes: [{ fields: ["name"] }],
  }
);

export type MessageModel = {
  ts: string;
  userId: string;
  channelId: string;
  threadTs: string;
  type: string;
  text: string;
  createdAt: string;
  raw: any;
};

export const Message = sequelize.define<Model<MessageModel>>(
  "message",
  {
    ts: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Channel, key: "id" },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      // references: { model: User, key: "id" }
    },
    threadTs: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    indexes: [{ fields: ["type"] }, { fields: ["channel_id"] }, { fields: ["user_id"] }, { fields: ["thread_ts"] }],
  }
);

export type UserMentionModel = {
  messageTs: string;
  userId: string;
};

export const UserMention = sequelize.define<Model<UserMentionModel>>(
  "user_mention",
  {
    messageTs: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Message, key: "ts" },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      // references: { model: User, key: "id" }
    },
  },
  {
    indexes: [{ fields: ["message_ts"] }, { fields: ["user_id"] }],
  }
);

export type GroupMentionModel = {
  messageTs: string;
  groupId: string;
};

export const GroupMention = sequelize.define<Model<GroupMentionModel>>(
  "group_mention",
  {
    messageTs: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Message, key: "ts" },
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: { model: Group, key: "id" },
    },
  },
  {
    indexes: [{ fields: ["message_ts"] }, { fields: ["group_id"] }],
  }
);

export type EmojiModel = {
  id: string;
  name: string;
  url: string;
  teamId: string;
};

export const Emoji = sequelize.define<Model<EmojiModel>>(
  "emoji",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Team, key: "id" },
    },
  },
  {
    indexes: [
      {
        type: "UNIQUE",
        fields: ["team_id", "name"],
      },
    ],
  }
);

export type ReactionModel = {
  messageTs: string;
  userId: string;
  name: string;
};

export const Reaction = sequelize.define<Model<ReactionModel>>(
  "reaction",
  {
    messageTs: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Message, key: "ts" },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      // references: { model: User, key: "id" },
    },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    indexes: [
      { fields: ["name"] },
      { fields: ["message_ts"] },
      { fields: ["user_id"] },
      {
        type: "UNIQUE",
        fields: ["message_ts", "user_id"],
      },
    ],
  }
);

export const insert = async <T extends Model>(data: T[], model: ModelCtor<T>): Promise<void> => {
  try {
    await model.bulkCreate(data, {
      ignoreDuplicates: true,
    });
  } catch (err) {
    console.log(data);
    throw err;
  }
};

export const testDatabaseConnection = async (): Promise<void> => {
  try {
    console.log("Testing Database connection...");
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (err) {
    console.error("Database connection failed: ", err);
    throw err;
  }
};
