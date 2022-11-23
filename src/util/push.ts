import {WXQiYe} from "do-utils"
import {cfEnv} from "../index"
import {WXToken} from "../entity/wxpush"

// 微信推送实例
let wxPush: WXQiYe | undefined = undefined
// 消息频道 ID
let agentid: number

/**
 * 初始化微信推送实例
 */
const initWXPush = async (): Promise<boolean> => {
  if (!wxPush) {
    if (cfEnv.QYWX_TOKEN === "") {
      console.log("微信推送的 token 为空，无法推送消息")
      return false
    }

    let data: WXToken = JSON.parse(cfEnv.QYWX_TOKEN)
    wxPush = new WXQiYe(data.appid, data.secret)
    agentid = data.agentid
  }

  return true
}

// 推送微信卡片消息
export const pushCardMsg = async (title: string, description: string, url: string, btnTxt: string) => {
  if (!(await initWXPush()) || !wxPush) {
    return
  }

  let error = await wxPush.pushCard(agentid, title, description, "", url, btnTxt)
  if (error) {
    console.log("推送微信卡片消息失败", error)
    return
  }

  console.log("推送微信卡片消息成功：", title)
}

// 推送微信文本消息
export const pushTextMsg = async (title: string, content: string) => {
  if (!(await initWXPush()) || !wxPush) {
    return
  }

  let error = await wxPush.pushText(agentid, `${title}\n\n${content}`)
  if (error) {
    console.log("推送微信文本消息失败", error)
    return
  }

  console.log("推送微信文本消息成功：", title)
}

// 推送微信 Markdown 消息（暂只支持企业微信接收）
export const pushMarkdownMsg = async (content: string) => {
  if (!(await initWXPush()) || !wxPush) {
    return
  }

  let error = await wxPush.pushMarkdown(agentid, content)
  if (error) {
    console.log("推送微信 Markdown 消息失败", error)
    return
  }

  console.log("推送微信 Markdown 消息成功")
}