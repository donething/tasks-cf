/**
 * 微信推送消息的token
 */
export type WXToken = {
  appid: string,
  secret: string,
  agentid: number,
  toUser: string
}