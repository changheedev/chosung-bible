const env = require("dotenv").config();

module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: "초성바이블 - 초성과 숫자로 간편하게 성경검색",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "초성과 숫자로 간편하게 성경을 검색해보세요."
      },
      { name: "og:type", content: "website" },
      { name: "og:title", content: "초성바이블" },
      {
        name: "og:description",
        content: "초성과 숫자로 간편하게 성경을 검색해보세요."
      },
      { name: "og:image", content: "/ogImage.png" },
      { name: "og:url", content: "http://chosungbible.com" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: "#3B8070" },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** Run ESLint on save
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/
        });
      }
    }
  },
  modules: ["bootstrap-vue/nuxt", "@nuxtjs/axios"],
  plugins: ["~/plugins/autocomplete.js"],
  serverMiddleware: [{ path: "/api", handler: "~/api/server.js" }],
  env: env.parsed
};
