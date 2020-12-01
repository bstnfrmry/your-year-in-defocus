import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
@Index({ name: "emoji_team_id_name_index", properties: ["teamId", "name"] })
export class Emoji {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string", length: 255 })
  teamId!: string;

  @Property({ type: "string", length: 255 })
  name!: string;

  @Property({ type: "string", length: 255 })
  url!: string;
}
