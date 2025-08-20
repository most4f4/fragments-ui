/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dnh6qh3zeqkj3.cloudfront.net https://*.amazoncognito.com https://*.auth.us-east-1.amazoncognito.com https://cognito-idp.us-east-1.amazonaws.com blob: 'nonce-*'",
              "script-src-elem 'self' 'unsafe-inline' https://dnh6qh3zeqkj3.cloudfront.net https://*.amazoncognito.com blob:",
              "connect-src 'self' https://*.amazoncognito.com https://*.auth.us-east-1.amazoncognito.com https://cognito-idp.us-east-1.amazonaws.com https://fragments-lb-394296716.us-east-1.elb.amazonaws.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "frame-src 'self' https://*.amazoncognito.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
