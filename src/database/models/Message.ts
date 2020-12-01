import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Message {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string", length: 255 })
  ts!: string;

  @Index({ name: "message_channel_id_index" })
  @Property({ type: "string", length: 255 })
  channelId!: string;

  @Index({ name: "message_user_id_index" })
  @Property({ type: "string", length: 255, nullable: true })
  userId!: string;

  @Index({ name: "message_thread_ts_index" })
  @Property({ type: "string", length: 255, nullable: true })
  threadTs!: string;

  @Index({ name: "message_type_index" })
  @Property({ type: "string", length: 255 })
  type!: string;

  @Property({ type: "string", columnType: "text" })
  text!: string;

  @Property({ type: "Date" })
  createdAt!: Date;

  @Property({ type: "jsonb" })
  raw!: object;
}
