import "~/styles/index.css";

import NextApp from "next/app";
import Router from "next/router";
import React from "react";
import { I18nextProvider } from "react-i18next";

import { i18n } from "~/i18n/config";
import { initAnalytics, logPageView } from "~/lib/analytics";

Router.events.on("routeChangeComplete", () => {
  logPageView();
});

class App extends NextApp {
  componentDidMount(): void {
    initAnalytics();
  }

  render(): JSX.Element {
    const { Component, pageProps, router } = this.props;

    if (router.locale) {
      i18n.changeLanguage(router.locale);
    }

    return (
      <I18nextProvider i18n={i18n}>
        <Component {...pageProps} />
      </I18nextProvider>
    );
  }
}

export default App;
