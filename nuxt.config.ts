// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            title: '罗浮杂俎',
            htmlAttrs: {
                lang: 'en'
            },
            meta: [
                {charset: 'UTF-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1.0'}
            ],
            // 为了解决 Google Fonts 无法加载的问题，需要添加以下代码
            // link: [
            //   { rel: 'icon', href: '/favicon.ico' },
            //   { rel: 'reconnect', href: 'https://fonts.googleapis.com' },
            //   { rel: 'reconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
            //   { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap' }
            // ]
        },
    },
    plugins: [
        '~/plugins/setup',
        '~/plugins/images',
        `~/plugins/text`,
        { src: '~/plugins/indexedDB', mode: 'client' },
        // { src: '~/plugins/analytics', mode: 'client' }
    ],
    css: [
        '~/assets/main.styl'
    ],
    ssr: true,
    components: true,
    compatibilityDate: '2024-04-03',
    devtools: {enabled: true}
})
