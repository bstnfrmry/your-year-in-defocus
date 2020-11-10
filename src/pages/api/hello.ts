import { NextApiHandler } from "next";

export type HelloResponse = {
  name: string;
};

const Hello: NextApiHandler = (req, res) => {
  res.statusCode = 200;
  res.json({ name: "John Doe" });
};

export default Hello;
