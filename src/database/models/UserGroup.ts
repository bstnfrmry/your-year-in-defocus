import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class UserGroup {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string", length: 255 })
  userId!: string;

  @Property({ type: "string", length: 255 })
  groupId!: string;
}
