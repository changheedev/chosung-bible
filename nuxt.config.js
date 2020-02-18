const env = require("dotenv").config();

module.exports = {
  env: env.parsed,
  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      lang: "ko-KR"
    },
    title: "초성성경 - 초성과 숫자로 간편한 성경검색",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "초성과 숫자로 간편하게 성경을 검색해보세요."
      },
      { name: "og:type", content: "website" },
      { name: "og:title", content: "초성성경" },
      {
        name: "og:description",
        content: "초성과 숫자로 간편하게 성경을 검색해보세요."
      },
      { name: "og:image", content: "/ogImage.png" },
      { name: "og:url", content: "http://chosungbible.com" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  css: ["~/assets/style.css"],
  /*
   * pwa manifest
   */
  manifest: {
    name: "초성성경", //앱 로딩 화면에서 보여줄 이름
    short_name: "초성성경", //아이콘 밑에 표시할 이름
    start_url: "/", // '/' = pages/index.vue
    display: "minimal-ui",
    background_color: "#000"
  },
  /**
   * offline 지원을 위한 모듈
   * 현재 앱에서는 offline 모드를 지원하지는 않지만 홈화면에 추가기능을 위해 설정추가
   */
  workbox: {
    offline: false,
    runtimeCaching: [
      {
        urlPattern: "/*",
        handler: "networkFirst",
        method: "GET"
      }
    ]
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
  buildModules: [
    [
      "@nuxtjs/google-analytics",
      {
        id: process.env.GOOGLE_ANALYTICS_ID,
        debug: {
          sendHitTask: process.env.NODE_ENV === "production" //production 모드일때만 사용
        }
      }
    ]
  ],
  cache: true,
  modules: ["bootstrap-vue/nuxt", "@nuxtjs/axios", "@nuxtjs/pwa"],
  plugins: ["~/plugins/autocomplete.js", "~/plugins/axios.js"],
  serverMiddleware: [{ path: "/api", handler: "~/api/server.js" }],
  axios: {
    proxy: true
  },
  proxy: {
    "/api/": process.env.BASE_URL
  }
};
