import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({})
export class Channel {
  @PrimaryKey({ type: "string", length: 255 })
  id!: string;

  @Property({ type: "string", length: 255 })
  teamId!: string;

  @Index({ name: "channel_name_index" })
  @Property({ type: "string", length: 255 })
  name!: string;

  @Property({ type: Date })
  createdAt!: Date;

  @Property({ type: Date, nullable: true })
  importedAt?: Date;

  @Property({ type: "jsonb" })
  raw!: object;
}
