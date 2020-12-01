require("dotenv").config({
  path: `${__dirname}/../../.env.local`,
});

import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { config } from "../config";
import { Channel } from "../database/models/Channel";
import { Emoji } from "../database/models/Emoji";
import { Group } from "../database/models/Group";
import { GroupMention } from "../database/models/GroupMention";
import { Installation } from "../database/models/Installation";
import { Message } from "../database/models/Message";
import { Reaction } from "../database/models/Reaction";
import { Team } from "../database/models/Team";
import { User } from "../database/models/User";
import { UserGroup } from "../database/models/UserGroup";
import { UserMention } from "../database/models/UserMention";

const mikroConfig: Options<PostgreSqlDriver> = {
  type: "postgresql",
  clientUrl: config.database.url,
  entities: [Channel, Emoji, Group, GroupMention, Installation, Message, Reaction, Team, User, UserGroup, UserMention],
};

export default mikroConfig;
