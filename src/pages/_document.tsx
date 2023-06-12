import Document, { Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <body>
          {/* Yandex.Metrika counter */}
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://mc.yandex.ru/watch/91208801"
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
              />
            </div>
          </noscript>
          {/* /Yandex.Metrika counter */}

          {/* <!-- Google Tag Manager (noscript) --> */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-58HCJGW"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>
          {/* <!-- End Google Tag Manager (noscript) --> */}

          {/* <!-- Meta Pixel Code --> */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=828991778317631&ev=PageView&noscript=1"
            />
          </noscript>
          {/* <!-- Meta Pixel Code --> */}

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
