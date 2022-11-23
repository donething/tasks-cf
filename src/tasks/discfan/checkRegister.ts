/**
 * 港知堂 检测开放注册
 * 检测PT分享站“港知堂”是否开放开放注册
 */
import {pushTextMsg} from "../../util/push"

const TAG = "[PT站H知堂]"

const check = async () => {
  console.log(TAG, "检测是否开放注册")

  let resp = await fetch("https://discfan.net/signup.php")
  let text = await resp.text()

  if (text.indexOf("自由註冊當前關閉") >= 0) {
    console.log(TAG, "还未开放注册")
    await pushTextMsg(`[青龙] ${TAG}`, "还未开放注册")
    return
  } else if (text.indexOf("password") >= 0) {
    console.log(TAG, "已开放注册，将发送通知提醒")
    await pushTextMsg(`[青龙] ${TAG}`, "已开放注册，可以去注册了：https://discfan.net/signup.php")
    return
  }

  console.log(TAG, "解析网页内容出错：", text)
  await pushTextMsg(`[青龙] ${TAG}`, "解析网页内容出错")
}

export default check