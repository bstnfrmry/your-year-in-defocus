import { MikroORM } from "@mikro-orm/core";
import { Class } from "type-fest";

export const insert = async <T>(orm: MikroORM, data: T[], model: Class<T>): Promise<void> => {
  data.forEach((attributes) => {
    const instance = new model();
    Object.entries(attributes).forEach(([key, value]) => {
      instance[key] = value;
    });
    orm.em.persist(instance);
  });
};
