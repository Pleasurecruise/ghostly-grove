export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide('BUILD_TIME', Date.now())
    nuxtApp.provide('BUILD_VERSION', '0.0.1')
    nuxtApp.provide('BUILD_AUTHOR', '自由的世界人')
    nuxtApp.provide('BUILD_EMAIL', '3196812536@qq.com')
    nuxtApp.provide('BUILD_LICENSE', 'MIT')
})
