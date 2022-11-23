import check from "./tasks/discfan/checkRegister"

/**
 * workers的环境变量
 */
export interface Env {
  QYWX_TOKEN: string
}

export var cfEnv: Env
const TAG = "[Tasks]"

export default {
  async scheduled(ctr: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(TAG, "开始执行定时任务")
    cfEnv = env

    // Write code for updating your API
    switch (ctr.cron) {
      // 每小时执行一次
      case '1 * * * *':
        console.log(TAG, "执行每小时的任务")
        ctx.waitUntil(check())
        break
    }

    console.log(TAG, "已执行所有定时任务")
  }
}
