import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Group {
  @PrimaryKey({ type: "string", length: 255 })
  id!: string;

  @Property({ type: "string", length: 255 })
  teamId!: string;

  @Index({ name: "group_handle_index" })
  @Property({ type: "string", length: 255 })
  handle!: string;

  @Property({ type: "string", length: 255 })
  name!: string;

  @Property({ type: Date })
  createdAt!: Date;

  @Property({ type: "jsonb" })
  raw!: object;
}
