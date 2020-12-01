export type SlackMessage = {
  ts: string;
  text: string;
  type: string;
  subtype: string;
  user: string;
  thread_ts: string;
  reactions: {
    name: string;
    users: string[];
  }[];
};
