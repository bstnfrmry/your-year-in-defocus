import { MikroORM } from "@mikro-orm/core";

import config from "~/database/config";

export const getOrm = () => {
  return MikroORM.init(config);
};
