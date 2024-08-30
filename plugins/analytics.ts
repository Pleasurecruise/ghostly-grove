export default defineNuxtPlugin((nuxtApp) => {
    if (process.env.NODE_ENV !== 'development') {
        const GA_ID = process.env.GA_ID || '' // TODO 确保在 .env 文件中设置了 GA_ID
        if (GA_ID) {
            const analytics = document.createElement('script')
            analytics.async = true
            analytics.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`

            const analyticsScript = document.createElement('script')
            analyticsScript.appendChild(
                document.createTextNode(`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${GA_ID}');
        console.log('Analytics Ready')
      `)
            )

            document.head.appendChild(document.createComment('Google tag (gtag.js)'))
            document.head.appendChild(analytics)
            document.head.appendChild(analyticsScript)
        }
    }
})
