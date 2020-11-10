import ReactGA from "react-ga";

import { config } from "~/config";

export const initAnalytics = (): void => {
  if (config.app.debug) return;

  if (config.googleAnalytics.trackingCode) {
    ReactGA.initialize(config.googleAnalytics.trackingCode);
  }
};

export const logPageView = (): void => {
  if (config.app.debug) return;

  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};
