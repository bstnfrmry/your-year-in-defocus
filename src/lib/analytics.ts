import ReactGA from "react-ga";

export const initAnalytics = (): void => {
  if (process.env.NODE_ENV === "development") return;

  if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);
  }
};

export const logPageView = (): void => {
  if (process.env.NODE_ENV === "development") return;

  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};
