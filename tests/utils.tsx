import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { setupServer } from "msw/node";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createMocks, MockRequest, MockResponse, RequestOptions } from "node-mocks-http";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { SWRConfig } from "swr";

import { i18n } from "~/i18n/config";
import { fetcher } from "~/lib/fetcher";

const Wrapper: React.ComponentType = ({ children }) => {
  return (
    <SWRConfig value={{ dedupingInterval: 0, fetcher }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </SWRConfig>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "queries">): RenderResult => {
  return render(ui, { wrapper: Wrapper, ...options });
};

export * from "@testing-library/react";

export { customRender as render };

export { rest } from "msw";

export const server = setupServer();

export type ApiResponse<T> = {
  statusCode: number;
  json: T;
};

export const callApi = async <T extends unknown>(
  handler: NextApiHandler<T>,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  const { req, res } = createMocks(options);

  await handler(req, res);

  return {
    statusCode: res._getStatusCode(),
    json: res._getJSONData(),
  };
};

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
