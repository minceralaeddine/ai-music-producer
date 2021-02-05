import colors from 'vuetify/es5/util/colors'

export default {
    // Target (https://go.nuxtjs.dev/config-target)
    target: 'static',
    ssr: false,

    // Global page headers (https://go.nuxtjs.dev/config-head)
    head: {
        // titleTemplate: '%s - AI Music Composer',
        title: 'Martin - AI Music Composer',
        script: [{
                src: "https://cdnjs.cloudflare.com/ajax/libs/tone/13.8.21/Tone.js",
            },
            {
                src: "https://cdnjs.cloudflare.com/ajax/libs/tensorflow/1.2.8/tf.min.js",
            },
            {
                src: "https://cdn.jsdelivr.net/npm/@magenta/music@^1.0.0/es6/music_vae.js",
            },
            {
                src: "https://cdn.jsdelivr.net/npm/@magenta/music@^1.0.0/es6/core.js",
            },

        ],
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' },
        ],
        link: [
            { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
            { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&display=swap'
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@100;200;300;400;500;600;700&display=swap'
            },
        ],

    },

    // Global CSS (https://go.nuxtjs.dev/config-css)
    css: [],

    // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
    plugins: [
        { src: '~/plugins/magenta', ssr: false },
    ],

    // Auto import components (https://go.nuxtjs.dev/config-components)
    components: true,

    // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
    buildModules: [
        // https://go.nuxtjs.dev/vuetify
        '@nuxtjs/vuetify',
    ],

    // Modules (https://go.nuxtjs.dev/config-modules)
    modules: [
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        "@nuxtjs/svg",
    ],

    // Axios module configuration (https://go.nuxtjs.dev/config-axios)
    axios: {},

    // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
    vuetify: {
        treeShake: true,
        defaultAssets: {
            font: {
                family: 'Open Sans'
            },
        },
        customVariables: ['~/assets/variables.scss'],
        theme: {
            dark: false,
            themes: {
                light: {
                    primary: "#10293e",
                    accent: colors.grey.darken3,
                    secondary: colors.amber.darken3,
                    info: colors.teal.lighten1,
                    warning: colors.amber.base,
                    error: colors.deepOrange.accent4,
                    success: colors.green.accent3,
                },
            },
        },
    },

    // Build Configuration (https://go.nuxtjs.dev/config-build)
    build: {
        publicPath: '.nuxt/dist/client/'
    },
}