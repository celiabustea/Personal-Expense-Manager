import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <title>Personal Expense Manager</title>
          <link rel="icon" type="image/png" href="/icon2.jpeg" />
          <meta name="description" content="Personal Expense Management" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
