<template>
  <div id="main">
    <div
        id="home"
        :style="{
          transform: `scale(${scale})`,
          width: `${width}px`,
          height: `${height}px`,
        }"
    >
      <Component v-for="(item, index) in components" :key="index" :is="item"/>
      <div class="link">
        <a href="https://github.com/Pleasurecruise/ghostly-grove" target="_blank">Github</a>
        <span>·</span>
        <a href="https://space.bilibili.com/699862747" target="_blank">BiliBili</a>
      </div>
    </div>
  </div>
  <Tip :show="shouldHorizontal" />
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, markRaw, defineComponent } from 'vue'
import Tip from '~/components/Tip.vue'
import '~/assets/main.styl'

// 动态加载所有组件
const components = ref<Component[]>([])
const modules = import.meta.glob<{ default: Component }>(
    [
      '~/components/*.vue',
      '!~/components/Tip.vue',
      '~/components/Popup/*.vue',
    ],
    {
      eager: true,
      import: 'default'
    }
)
for (const i in modules) {
  components.value.push(markRaw(defineComponent(modules[i])))
}

// 计算窗口尺寸
const width = 1920
const height = 1080
const scale = ref(1)
const shouldHorizontal = ref(false)

const setSize = () => {
  shouldHorizontal.value = window.innerWidth <= 550 && window.innerWidth < window.innerHeight
  scale.value = Math.min(window.innerWidth / width, window.innerHeight / height)
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    setSize()
    window.addEventListener('resize', setSize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', setSize)
  }
})
</script>

<style lang="stylus" scoped>
#main
  overflow hidden
  width 100vw
  height 100vh
  display flex
  justify-content center
  align-items center
  background #000

  #home
    position relative
    transform-origin center
    display flex
    justify-content center
    align-items center
    background-size cover  /* 保证背景图像始终覆盖整个容器 */

    &:after
      content ''
      z-index -1
      position absolute
      width 100%
      height 100%
      background url('@/assets/images/bg.webp')
      background-size cover  /* 避免背景图像过小或过大 */
      background-position center  /* 确保背景图像居中 */
      background-repeat no-repeat
      box-shadow 0 0 20px 20px rgba(0, 0, 0, 0.7) inset  /* 添加阴影效果 */

</style>
