import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { config } from "~/config";

export const Meta: React.FC = () => {
  const { t } = useTranslation();

  const title = t("app.name");
  const description = t("app.tagline");
  const url = config.app.url;
  const ogImageUrl = `${url}/images/og-image.jpg`;

  return (
    <Head>
      <title key="title">{title}</title>

      <meta content={description} name="Description" />

      <link href="/images/icon-512.png" rel="shortcut icon" type="image/png" />
      <link href="/images/icon-512.png" rel="apple-touch-icon" />

      <meta key="description" content={description} name="description" />
      <meta key="ogTitle" content={title} property="og:title" />
      <meta key="ogDescription" content={description} property="og:description" />
      <meta key="ogImage" content={ogImageUrl} property="og:image" />
      <meta key="ogUrl" content={url} property="og:url" />
      <meta key="twitterTitle" content={title} name="twitter:title" />
      <meta key="twitterDescription" content={description} name="twitter:description" />
      <meta key="twitterImage" content={ogImageUrl} name="twitter:image" />
      <meta key="twitterCard" content="summary_large_image" name="twitter:card"></meta>

      <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet" />
    </Head>
  );
};
