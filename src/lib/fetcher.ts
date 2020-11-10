import fetch from "isomorphic-unfetch";

import { config } from "~/config";

export const fetcher = async <Data>(key: string): Promise<Data> => {
  const res = await fetch(config.app.url + key);

  return res.json();
};
