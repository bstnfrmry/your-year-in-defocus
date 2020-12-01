import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Installation {
  @PrimaryKey({ type: "string", length: 255 })
  teamId!: string;

  @Property({ type: "string", length: 255 })
  token!: string;

  @Property({ type: "jsonb" })
  raw!: object;
}
