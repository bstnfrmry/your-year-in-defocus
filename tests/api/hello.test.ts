import hello from "~/pages/api/hello";
import { callApi } from "~/tests/utils";

test("/api/hello", async () => {
  const res = await callApi(hello, { query: { name: "John Doe" } });

  expect(res.statusCode).toBe(200);
  expect(res.json.name).toBe("John Doe");
});
