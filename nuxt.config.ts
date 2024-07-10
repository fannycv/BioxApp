// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxtjs/supabase", "nuxt-quasar-ui", "nuxt-icons", "@unocss/nuxt"],
  quasar: {
    config: {
      dark: true,
      brand: {
        primary: "#B388FF",
        secondary: "#034068",
        accent: "#ffd96c",
        negative: "#FF8A80",
        positive: "#69F0AE",
        warning: "#FFE57F",
        bg: "#fafbfb",
      },
      ripple: true,
    },
    sassVariables: "assets/quasar.variables.scss",
    extras: {
      fontIcons: ["material-icons"],
      font: "roboto-font-latin-ext",
    },
    plugins: ["Notify"],
  },

  app: {
    head: {
      titleTemplate: "%s Ventas",
      title: "Grupo Biox",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
};
