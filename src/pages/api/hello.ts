import { NextApiHandler } from "next";

export type HelloResponse = {
  name: string;
};

const Hello: NextApiHandler<HelloResponse> = (req, res) => {
  res.statusCode = 200;
  res.json({ name: req.query.name as string });
};

export default Hello;
