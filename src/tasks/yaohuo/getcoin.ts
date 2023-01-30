// 自动回复回帖领取金币的帖子
import * as cheerio from 'cheerio'
import {cfEnv} from "../../index"
import {pushTextMsg} from "../../util/push"

// 要回复的帖子的信息
type Topic = {
  // 帖子ID
  tid: string
  // 栏目ID
  classid: string
}

const TAG = "[YH]"
// 目标网站的域名
const Host = "https://yaohuo.me"
// 可选的回复内容
const Replies = ["吃", "吃吃", "吃吃吃"]

// 存储已回复的帖子列表的键，其值为列表，用于存放帖子ID
const KV_Key_Repied = "yh_repied"
// 存储此次回复内容的索引，避免重复回复内容。索引来自常量 Replies
const KV_Key_Reply_Cur = "yh_reply_cur"

// 妖火的 Cookie
let yhCookie = ""

/**
 * 执行
 */
const doReply = async () => {
  console.log(TAG, "开始执行回帖任务")

  if (!init()) {
    return
  }

  await reply(await getLastestTopics())
  console.log(TAG, "已完成执行回帖任务")
}

/**
 * 初始化。调用本脚本时，必须先运行此函数，并根据结果判断是否继续其它操作
 * @return 是否正确初始化
 */
const init = (): boolean => {
  if (!cfEnv.ENV_YH_TOKEN) {
    console.log("环境变量中还没有设置妖火的 Cookie")
    pushTextMsg(`${TAG} 任务失败`, "环境变量中还没有设置妖火的 Cookie")
    return false
  }

  yhCookie = cfEnv.ENV_YH_TOKEN
  return true
}

/**
 * 获取最新的帖子列表
 */
const getLastestTopics = async (): Promise<Topic[]> => {
  // 发肉帖的链接。注意链接为相对链接"/bbs-1234.html"，访问时需要先追加域名`host`
  const topics: Topic[] = []

  // 读取网页内容、提取发肉贴的链接
  const headers = {"Cookie": yhCookie}
  const resp = await fetch(Host + "/bbs/book_list.aspx?action=new", {headers: headers})
  const htmlStr = await resp.text()

  const $ = cheerio.load(htmlStr)
  const topicElems = $("div.listdata")
  topicElems.each((i, elem) => {
    const item = $(elem)
    const coinIcons = item.children("img")
    if (coinIcons.length >= 1 && coinIcons.first().attr("src")?.indexOf("li.gif") !== -1) {
      // 添加
      const url = item.children("a").last().attr("href") || ""
      const [classid, tid] = pickId(url)
      if (!classid || !tid) {
        console.log(TAG, `无法提取到提取帖子的信息：${url}`)
        pushTextMsg(`${TAG} 任务失败`, `无法提取到提取帖子的信息：${url}`)
        return false
      }

      topics.push({classid, tid})
    }
  })

  return topics
}

/**
 * 回复帖子
 * @param topics 帖子的信息
 */
const reply = async (topics: Topic[]) => {
  const headers = {
    "Cookie": yhCookie,
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;",
    "Origin": Host,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/109.0.0.0 Safari/537.36"
  }

  // 已回复帖子ID的列表
  const repiedIds: string[] = await cfEnv.KV_TASK.get(KV_Key_Repied, {type: "json"}) || []
  // 此次回复内容的索引
  let cur = Number(await cfEnv.KV_TASK.get(KV_Key_Reply_Cur) || "0")

  for (let t of topics) {
    // 已回复过，跳过
    if (repiedIds.includes(t.tid)) {
      console.log(TAG, `之前已回复过该帖"${t.tid}"，跳过回复`)
      continue
    }

    console.log(TAG, `开始回复帖子"${t.tid}"`)
    // const date = new Date().toLocaleTimeString("zh-CN", {timeZone: "Asia/Shanghai"})
    const content = encodeURIComponent(Replies[cur % Replies.length])
    const data = `sendmsg=0&content=${content}&action=add&id=${t.tid}&classid=${t.classid}`

    const resp = await fetch(Host + "/bbs/book_re.aspx", {headers: headers, method: "POST", body: data})
    const text = await resp.text()
    if (text.indexOf("回复成功") === -1) {
      console.log(TAG, `回复帖子"${t.tid}"失败`)
      await pushTextMsg(`${TAG} 任务出错`, `回复帖子"${t.tid}"失败：${text}`)
      break
    }

    // 回复成功，需要保存ID到存储
    console.log(TAG, `回复帖子"${t.tid}"成功`)
    repiedIds.push(t.tid)
    cur++
  }

  // 存储
  await cfEnv.KV_TASK.put(KV_Key_Repied, JSON.stringify(repiedIds))
  await cfEnv.KV_TASK.put(KV_Key_Reply_Cur, cur.toString())
}

/**
 * 从路径中提取帖子的 ID
 * @param path 路径。如"/bbs-12345.html"
 * @return 提取到则返回 ID，如 "12345"；没有则返回空字符串 ""
 */
const pickId = (path: string): string[] => {
  const m = path.match(/classid=(\d+)&id=(\d+)/)
  return m?.slice(1) || []
}

export default doReply