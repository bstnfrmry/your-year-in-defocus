import React from "react";

import { config } from "~/config";
import Homepage from "~/pages/index";
import { render, rest, server, waitFor } from "~/tests/utils";

test("Homepage", async () => {
  server.use(
    rest.get(`${config.app.url}/api/hello`, (req, res, ctx) => {
      return res(ctx.json({ name: "John" }));
    })
  );

  const page = render(<Homepage />);

  await waitFor(() => page.getByText("Hello John"));
});
