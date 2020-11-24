export const config = {
  app: {
    env: process.env["NODE_ENV"],
    debug: process.env["NODE_ENV"] === "development",
    url: process.env["NEXT_PUBLIC_URL"] ?? "http://localhost:3000",
  },

  googleAnalytics: {
    trackingCode: process.env["NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"],
  },

  slack: {
    clientId: process.env["SLACK_CLIENT_ID"] as string,
    clientSecret: process.env["SLACK_CLIENT_SECRET"] as string,
  },

  database: {
    uri: process.env["DATABASE_URI"] as string,
  },
};
