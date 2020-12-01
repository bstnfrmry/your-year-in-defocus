import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Team {
  @PrimaryKey({ type: "string", length: 255 })
  id!: string;

  @Index({ name: "team_public_id_index" })
  @Property({ type: "string", length: 255 })
  publicId!: string;

  @Property({ type: "string", length: 255 })
  name!: string;

  @Property({ type: "jsonb" })
  raw!: object;
}
