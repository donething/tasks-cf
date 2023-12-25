import {Env} from "./entity/ctx"

const TAG = "[Tasks]"

// 保存环境变量，以供全局使用
export var cfEnv: Env

export default {
  async scheduled(ctr: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    cfEnv = env

    // Write code for updating your API
    switch (ctr.cron) {
      // 每分钟执行一次
      case "* * * * *":
        console.log(TAG, "执行每分钟的任务")
        // await doReply()
        break

      // 每小时执行一次
      case "1 * * * *":
        console.log(TAG, "执行每小时的任务")
        // ctx.waitUntil(checkHZT())
        break
    }

    console.log(TAG, "已执行所有定时任务")
  },

  async fetch(event: FetchEvent, env: Env) {
    cfEnv = env

    return new Response("Hello, " + new Date().toLocaleString())
  }
}
