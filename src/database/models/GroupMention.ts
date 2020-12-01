import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class GroupMention {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string", length: 255 })
  messageTs!: string;

  @Property({ type: "string", length: 255, nullable: true })
  groupId!: string;
}
