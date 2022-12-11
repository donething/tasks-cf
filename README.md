# tasks-cf

定时执行任务，适用于 cloudflare workers

测试cron可以参考：
[Multiple Cron Triggers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/examples/multiple-cron-triggers/)

# 发布

## 测试

测试`cron`，执行 ` wrangler dev --test-scheduled`

## 发布

执行 `wrangler publish`