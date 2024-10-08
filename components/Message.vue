<template>
  <Transition name="fade">
    <div class="message" v-if="setting.messageID" @click="setting.messageID = undefined">
      <div class="message-box" @click.stop>
        <div class="left">
          <div class="like">
            <div
              class="icon"
              @click="message.list[messageIndex].is_like = !message.list[messageIndex].is_like"
            >
              <Icon :name="message.list[messageIndex].is_like ? 'heart-fill' : 'heart'" />
            </div>
            <div class="like-text">
              <Transition name="text-slide-top">
                <input
                  v-if="message.list[messageIndex].is_like"
                  type="text"
                  class="like-input"
                  :value="(message.list[messageIndex].like + 1).toLocaleString('US')"
                  @change="onLikeChange"
                />
              </Transition>
              <Transition name="text-slide-bottom">
                <input
                  v-if="!message.list[messageIndex].is_like"
                  type="text"
                  class="like-input"
                  :value="message.list[messageIndex].like.toLocaleString('US')"
                  @change="onLikeChange"
                />
              </Transition>
            </div>
          </div>
          <img
            v-if="message.list[messageIndex].image"
            :src="message.list[messageIndex].image"
            alt=""
          />
          <img
            v-else
            src="../assets/images/empty.webp"
            alt=""
          />
          <div class="btn set-image-btn" @click="setImage">更换图片</div>
        </div>
        <div class="right">
          <!-- 评论菜单 -->
          <Transition name="slide-top">
            <div v-if="select" class="comment-menu">
              <div class="menu-info">
                <div class="menu-info-text">{{ selectName }}</div>
                <div class="menu-info-icon" @click="select = undefined">
                  <Icon name="down" width="26" height="26" color="#fff"/>
                </div>
              </div>
              <div class="menu-btn-list">
                <div class="menu-btn" @click="showInput(select, false)" v-if="select?.length === 1">回复</div>
                <div class="menu-btn" @click="showInput(select)">编辑</div>
                <div class="menu-btn" @click="onDeleteClick">删除</div>
              </div>
            </div>
          </Transition>
          <div class="header">
            <div class="character">
              <img :src="getCharacter(message.list[messageIndex].user).avatar" alt="" class="avatar"/>
              <div class="name">{{ getCharacter(message.list[messageIndex].user).name }}</div>
              <img
                v-if="getCharacter(message.list[messageIndex].user).id === setting.userID"
                src="../assets/images/badge.webp"
                alt=""
                class="badge"
              />
            </div>
            <Close class="close" @click.stop="setting.messageID = undefined"/>
          </div>
          <div class="content">
            <div class="title">{{ message.list[messageIndex].title }}</div>
            <div class="text"
              :style="{ '-webkit-line-clamp': isExpand ? 'unset' : '' }"
              v-html="textReplace(message.list[messageIndex].text, true)"
              ref="textDom"
            ></div>
            <!-- 按钮 -->
            <div class="menu">
              <div class="btn edit" @click="showInput()">编辑</div>
              <div v-if="expandShow" class="btn" @click="isExpand = !isExpand">
                <span> 阅读全文 </span>
                <Icon name="down" :style="{ transform: isExpand ? 'rotate(180deg)' : '' }"/>
              </div>
            </div>
            <div class="line"></div>
            <!-- 评论 -->
            <div class="comment-bar">
              <div class="comment-num">共{{ commentNum }}条评论</div>
              <div class="btn comment-btn" @click="showInput(undefined, false)">评论</div>
            </div>
            <div class="comment-list">
              <div
                v-for="(comment, index_1) in message.list[messageIndex].comments"
                :key="`comment-${index_1}`"
                class="comment"
              >
                <div
                  class="comment-item"
                  :class="{ highlight: select?.length === 1 && select?.[0] === index_1 }"
                  @click="onCommentClick($event, [index_1])"
                >
                  <div class="character">
                    <img :src="getCharacter(comment.user).avatar" alt="" class="avatar"/>
                    <div class="name">{{ getCharacter(comment.user).name }}</div>
                    <img
                      v-if="getCharacter(comment.user).id === setting.userID"
                      src="../assets/images/badge.webp"
                      alt=""
                      class="badge"
                    />
                  </div>
                  <div
                    class="comment-text"
                    v-html="textReplace(comment.text)"
                  ></div>
                </div>
                <div class="reply-list">
                  <div
                    v-for="(reply, index_2) in comment.comments"
                    :key="`reply-${index_2}`"
                    class="reply"
                    :class="{
                      highlight:
                        select?.length === 2 && select?.[0] === index_1 && select?.[1] === index_2
                    }"
                    @click="onCommentClick($event, [index_1, index_2])"
                  >
                    <div class="character">
                      <img :src="getCharacter(reply.user).avatar" alt="" class="avatar"/>
                      <div class="name">{{ getCharacter(reply.user).name }}</div>
                      <img
                        v-if="getCharacter(reply.user).id === setting.userID"
                        src="../assets/images/badge.webp"
                        alt=""
                        class="badge"
                      />
                    </div>
                    <div
                      class="comment-text"
                      v-html="textReplace(reply.text)"
                    ></div>
                  </div>
                </div>
                <div class="comment-line"></div>
              </div>
            </div>
          </div>
          <div class="placeholder" v-if="select"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import Close from '~/components/Common/Close.vue'
import Icon from '~/components/Common/Icon.vue'
import { imageCompress } from '~/plugins/images'
import { textReplace } from '~/plugins/text'
import { messageIndex, setting } from '~/store/setting'
import { message } from '~/store/message'
import { inputData } from '~/store/input'
import { getCharacter, user } from '~/store/character'
// 评论选择
const expandShow = ref(true)
const isExpand = ref(false)
const textDom = ref<HTMLElement | null>(null)
// 评论选择
const select = ref<undefined | [number] | [number, number]>()
const selectName = computed(() => {
  if (select.value) {
    if (select.value.length === 1) {
      return `@${
        getCharacter(message.list[messageIndex.value].comments[select.value[0]].user).name
      }`
    } else if (select.value.length === 2) {
      return `@${
        getCharacter(
          message.list[messageIndex.value].comments[select.value[0]].comments[select.value[1]].user
        ).name
      }`
    }
  }
  return ''
})
// 监听评论选择
const updateExpandType = async () => {
  await nextTick()
  if (textDom.value) {
    expandShow.value = textDom.value.scrollHeight > 60
  }
}
// 监听消息内容变化
watch(
  () => message.list?.[messageIndex.value]?.text,
  () => {
    if (setting.messageID) {
      updateExpandType()
    }
  }
)

watch(
  () => setting.messageID,
  async () => {
    if (setting.messageID) {
      updateExpandType()
    } else {
      select.value = undefined
    }
  }
)

const commentNum = computed(() => {
  let num = 0
  message.list[messageIndex.value].comments.forEach((comment) => {
    ++num
    comment.comments.forEach(() => ++num)
  })
  return num
})

// 点赞数处理
const onLikeChange = (e: Event) => {
  const el = e.target as HTMLInputElement
  const newNum = Number(el.value.replace(/\D/g, '')) || 0
  el.value = newNum.toLocaleString('US')
  message.list[messageIndex.value].like = newNum
}

// 更换图片
const setImage = () => {
  setTimeout(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      if (input.files?.[0]) {
        const image = await imageCompress(input.files[0])
        message.list[messageIndex.value].image = image
      }
    }
    input.click()
  }, 0)
}
// 评论选择
const onCommentClick = (_e: Event, key: [number] | [number, number]) => {
  select.value = key
}
// 删除评论
const onDeleteClick = () => {
  const flag = confirm('是否删除该评论？')
  if (flag) {
    if (select.value?.length === 1) {
      message.list[messageIndex.value].comments.splice(select.value[0], 1)
    } else if (select.value?.length === 2) {
      message.list[messageIndex.value].comments[select.value[0]].comments.splice(select.value[1], 1)
    }
    message.list[messageIndex.value].time = Date.now()
    select.value = undefined
  }
}
// 显示输入框
const showInput = (id?: [number] | [number, number], edit = true) => {
  if (id) {
    if (edit) {
      setting.input.edit = true
      if (id.length === 1) {
        inputData.text = message.list[messageIndex.value].comments[id[0]].text
        inputData.user = getCharacter(message.list[messageIndex.value].comments[id[0]].user)
      } else if (id.length === 2) {
        inputData.text = message.list[messageIndex.value].comments[id[0]].comments[id[1]].text
        inputData.user = getCharacter(
          message.list[messageIndex.value].comments[id[0]].comments[id[1]].user
        )
      }
    } else {
      inputData.user = user.value
    }
    setting.input.index = [messageIndex.value, ...id]
  } else {
    if (edit) {
      setting.input.edit = true
      inputData.title = message.list[messageIndex.value].title
      inputData.text = message.list[messageIndex.value].text
      inputData.user = getCharacter(message.list[messageIndex.value].user)
    } else {
      inputData.user = user.value
    }
    setting.input.index = [messageIndex.value]
  }
}
</script>

<style lang="stylus" scoped>
@import '../assets/style.styl'

.character
  flex 1
  display flex
  align-items center
  user-select none

  .avatar
    width 40px
    height 40px
    border-radius 50%
    background #666
    margin-right 10px

  .name
    name()

  .badge
    margin-left 8px
    width 26px
    height 26px

.btn
  display flex
  align-items center
  color #42a8b9
  font-size 20px
  cursor pointer

  svg
    margin 5px 0 0 5px

.message
  position absolute
  z-index: 1000; /* 确保弹出框在最顶层 */
  top 0
  right 0
  bottom 0
  left 0
  display flex
  justify-content center
  align-items center
  backdrop-filter blur(10px)
  -webkit-backdrop-filter blur(10px)
  background rgba(0, 0, 0, 0.2)

  .message-box
    position relative
    display flex
    width 1300px
    height 770px
    background rgba(11, 11, 11, 0.9)
    border-left 5px solid #42a8b9

    &:before
      content ''
      position absolute
      width 100%
      height 100%
      background-image url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='69.283' height='40' patternTransform='scale(2) rotate(30)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M46.189-20L57.736 0M46.189 20l11.547 20m-46.189 0l11.547 20M11.547 0l11.547 20m40.415 30H40.415M28.868 30H5.774m23.094-40H5.774m57.735 20H40.415m0 20L28.868 50m11.547-60L28.868 10m46.188 0L63.509 30M5.774 10L-5.773 30m75.056 10H46.189L34.64 20 46.19 0h23.094C73.13 6.667 76.98 13.333 80.83 20zM57.736 60H34.64L23.094 40l11.547-20h23.095c3.848 6.667 7.698 13.333 11.547 20L57.736 60zm0-40H34.64L23.094 0l11.547-20h23.095L69.283 0c-3.87 6.7-8.118 14.06-11.547 20zM34.64 60H11.547L0 40l11.547-20h23.094L46.19 40 34.64 60zm0-40H11.547L0 0l11.547-20h23.094L46.19 0 34.64 20zM23.094 40H0l-5.773-10-5.774-10L0 0h23.094l11.547 20-11.547 20z'  stroke-width='1' stroke='hsla(197, 40%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")

    .left
      position relative
      z-index 5
      width 770px
      height 770px
      overflow hidden

      &:hover
        .set-image-btn
          opacity 1

      img
        width 100%
        height 100%
        object-fit cover

      .like
        display flex
        align-items center
        justify-content center
        position absolute
        top 35px
        left 45px

        .icon
          display flex
          align-items center
          justify-content center
          border-radius 50%
          background-color #3c4149
          color var(--highlight-color)
          width 60px
          height 60px
          cursor pointer

          svg
            margin-top 5px

        .like-text
          position relative
          margin 0 0 5px 10px
          width 600px
          height 35px

          .like-input
            position absolute
            font-size 24px
            color #cecfd1
            background transparent
            outline none
            border none

      .set-image-btn
        position absolute
        bottom 10px
        left 50%
        padding 5px 10px
        border-radius 2px
        transform translateX(-50%)
        background-color #3c4149
        opacity 0
        user-select none

        &:hover
          opacity 1

    .right
      overflow hidden
      display flex
      flex-direction column
      z-index 5
      position relative
      flex 1
      padding 30px 10px 20px 35px
      margin-right 15px

      &:before
        z-index -2
        content ''
        position absolute
        top 50%
        left 50%
        width 930px
        height 930px
        background radial-gradient(rgba(35, 37, 46, 0.9) 10%, rgba(35, 37, 46, 0.9) 50%, rgba(38, 58, 69, 0.7)), radial-gradient(rgba(35, 37, 46, 0.9), rgba(38, 58, 69, 0))
        background-size 130% 130%, 80%, 80%
        background-position -50% -50%, 50% 50%
        animation 10s rotate linear infinite

      &:after
        z-index -1
        content ''
        position absolute
        top 0
        left 0
        width 100%
        height 100%
        background url('assets/images/icon.webp')
        background-repeat no-repeat
        background-position center
        background-size 320px
        opacity 0.05

    .comment-menu
      position absolute
      bottom 0
      left 0
      width 100%
      height 230px

      .menu-info
        position relative
        display flex
        align-items center
        justify-content center
        width 100%
        height 30px
        background-color #42a8b9

        .menu-info-text
          font-size 20px
          line-height 30px

        .menu-info-icon
          position absolute
          right 20px
          display flex
          align-items center
          justify-content center
          width 40px
          height 40px
          background-color #333
          border-radius 50%
          border 2px solid #42a8b9
          cursor pointer

          svg
            margin-top 3px

      .menu-btn-list
        display flex
        flex-direction column
        align-items center
        justify-content center
        width 100%
        padding 10px 0

        .menu-btn
          display flex
          align-items center
          justify-content center
          width 90%
          height 45px
          margin 5px 0
          border-radius 25px
          border 2px solid #666
          font-size 24px
          color #ddd
          cursor pointer

    .header
      display flex
      align-items center
      user-select none

      .close
        z-index 10
        width 40px
        height 40px
        margin 0 20px 0 auto

    .content
      flex 1
      overflow-y auto
      overflow-y overlay
      overflow-x hidden
      scrollbar-gutter stable
      margin-top 25px
      padding-right 20px

      .name
        name()

      .title
        title()

      .text
        margin-top 20px
        text()
        // 兼容存在问题
        display -webkit-box
        -webkit-box-orient vertical
        -webkit-line-clamp 2
        word-break break-all
        overflow hidden

        &:hover
          &+.menu
            .edit
              opacity 1

      .menu
        display flex
        justify-content space-between

        &:hover
          .edit
            opacity 1

        .edit
          opacity 0

      .line
        width 100%
        height 2px
        background #3e454d
        margin-top 20px

      .comment-bar
        padding 0 5px
        display flex
        justify-content space-between

        &:hover
          .comment-btn
            opacity 1

        .comment-num
          text()
          margin 20px 0

        .comment-btn
          opacity 0

          &:hover
            opacity 1

      .comment-list
        padding 5px

        .comment
          .comment-item
            position relative
            cursor pointer

            .name
              color #59666e

            .comment-text
              text()
              margin-left 50px
              margin-top 0

          .reply-list
            margin 15px 0 0 50px

            .reply
              position relative
              cursor pointer

              .name
                color #59666e

              .comment-text
                text()
                margin-left 50px
                margin-top 0

          .comment-line
            width calc(100% - 50px)
            height 2px
            background #3e454d
            margin 15px 0 15px 50px

    .placeholder
      height 230px

.highlight
  &:before
    z-index -1
    content ''
    position absolute
    top -5px
    right -5px
    bottom -5px
    left -5px
    border 2px solid #42a8b9

.text-slide-top-enter-active
  transition-delay 0.5s
  transition all 0.5s

.text-slide-top-leave-active
  transition all 0.5s

.text-slide-top-enter-from
  opacity 0
  transform translateY(50%)

.text-slide-top-leave-to
  opacity 0
  transform translateY(50%)

.text-slide-bottom-enter-active
  transition-delay 0.5s
  transition all 0.5s

.text-slide-bottom-leave-active
  transition all 0.5s

.text-slide-bottom-enter-from
  opacity 0
  transform translateY(-50%)

.text-slide-bottom-leave-to
  opacity 0
  transform translateY(-50%)

@keyframes rotate
  from
    transform translate(-50%, -50%) rotate(0deg)

  to
    transform translate(-50%, -50%) rotate(360deg)
</style>
