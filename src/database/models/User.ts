import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "users" })
export class User {
  @PrimaryKey({ type: "string", length: 255 })
  id!: string;

  @Property({ type: "string", length: 255 })
  teamId!: string;

  @Index({ name: "user_name_index" })
  @Property({ type: "string", length: 255 })
  name!: string;

  @Property({ type: "string", length: 255 })
  realName!: string;

  @Property({ type: "boolean" })
  isBot!: boolean;

  @Property({ type: "jsonb" })
  raw!: object;
}
