import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { config } from "~/config";

export { Op } from "sequelize";

const sequelize = new Sequelize(config.database.uri, {
  logging: false,
  define: {
    underscored: true,
    timestamps: false,
  },
});

type UserModel = Model<{
  id: string;
  teamId: string;
  name: string;
  realName: string;
  isBot: boolean;
  raw: any;
}>;

export const User = sequelize.define<UserModel>(
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

type GroupModel = Model<{
  id: string;
  teamId: string;
  handle: string;
  name: string;
  createdAt: string;
  raw: any;
}>;

export const Group = sequelize.define<GroupModel>(
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

type UserGroupModel = Model<{
  userId: string;
  groupId: string;
}>;

export const UserGroup = sequelize.define<UserGroupModel>(
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

type ChannelModel = Model<{
  id: string;
  teamId: string;
  name: string;
  createdAt: string;
  raw: any;
  importedAt: string;
}>;

export const Channel = sequelize.define<ChannelModel>(
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

type MessageModel = Model<{
  ts: string;
  userId: string;
  channelId: string;
  threadTs: string;
  type: string;
  text: string;
  createdAt: string;
  raw: any;
}>;

export const Message = sequelize.define<MessageModel>(
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

type UserMentionModel = Model<{
  messageTs: string;
  userId: string;
}>;

export const UserMention = sequelize.define<UserMentionModel>(
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

type GroupMentionModel = Model<{
  messageTs: string;
  groupId: string;
}>;

export const GroupMention = sequelize.define<GroupMentionModel>(
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

type ReactionModel = Model<{
  messageTs: string;
  userId: string;
  name: string;
}>;

export const Reaction = sequelize.define<ReactionModel>(
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
