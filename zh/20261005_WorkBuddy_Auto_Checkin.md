# 真・免开机WorkBuddy自动签到
发布时间: *2026-10-05 10:10:00*

分类: __AI__

简介: 本文分享免开机签到方案：从桌面端提取 refresh_token，在 Linux 虚机部署 Python 脚本搭配 Cron 定时任务，依靠令牌自续期机制实现长期自动签到。脚本仅用标准库，令牌做权限隔离保障安全，适合有 Linux 与 Python 基础的技术读者。

---------

> 适合有 Python 基础、会管理一台 Linux 虚机的读者；如果你不熟悉，也可以把本文丢给任意 AI 助手，让它按你的环境改改就能跑。

## 一、背景：为什么要把签到自动化

WorkBuddy 的「Buddy 加油站」每天签到能领平台积分，积分有 30 天有效期，连续签到还有额外奖励。但问题在于——**它要你每天都记得打开客户端点一下**。

人类的记性是靠不住的：出差、熬夜、手机没电，任何一次漏签都会打断连签。而这类运营活动往往没有「补签」机制。

所以目标很明确：**在一台 7×24 常开的虚机上，每天定时自动完成「刷新登录令牌 → 签到」，且尽量做到一次配置、长期免维护。**

## 二、总体设计

整个方案只需要两块：

1. **一个一次性引导步骤**：从你本机登录着的 WorkBuddy 桌面端里，把 `refresh_token` 取出来。这一步只在第一次做（或令牌失效时重做）。
2. **一个常驻脚本 + cron**：虚机上跑 `daily_checkin.py`，每天 09:00 / 21:00（北京时间）触发，自动刷新令牌、签到、并把**新令牌写回**——靠这个「自续期」机制实现长期免维护。

设计上的几个关键取舍：

- **脚本零三方依赖**：`daily_checkin.py` 只用 Python 标准库（`urllib` / `json` / `os` / `datetime`），虚机上不用装 `pip` 包。
- **令牌不进仓库**：`refresh_token` 等同账号钥匙，存在虚机 `~/.ssh/` 下、权限 `600`，并用 `.gitignore` 屏蔽，绝不提交。
- **幂等**：接口本身支持「今日已签」状态，重复触发安全，所以一天设两个兜底时间点也无妨。

## 三、技术原理拆解

### 3.1 令牌从哪来：信封加密 + 内存种子

WorkBuddy 桌面端把登录态存在 `workbuddy-desktop.info` 里，`auth.refreshToken` 字段是 **AES-256-GCM 信封加密**的。难点不在算法，而在**解密种子（key）只存在于「已登录、正在运行」的 WorkBuddy 进程内存里**——文件本身拿不到钥匙。

引导脚本的做法是：

1. 扫描 WorkBuddy 进程内存，收集一批候选密钥种子；
2. 逐个尝试对信封解密（keyId 不符或 GCM tag 校验失败的自动跳过）；
3. 用解出的 `refresh_token` 真实调一次「刷新 + 签到」来验证是否可用；
4. 只把验证通过的 `refresh_token` 打印出来。

> 这一步必须在**装了 WorkBuddy 且已登录**的机器上跑一次。之后虚机侧完全不需要 WorkBuddy 客户端。

### 3.2 核心脚本做了什么

`daily_checkin.py` 的骨架非常直白，下面是最简示意（非完整源码）：

```python
import os, json, urllib.request as ureq
from datetime import datetime, timezone, timedelta

API = "https://copilot.tencent.com"
# 默认回退路径；生产环境一般用环境变量覆盖
TOKEN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "refresh_token.txt")

def _ts():
    # 统一输出北京时间，排查日志不再被时区搞晕
    return datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S") + " +08:00"

def load_token():
    # 优先级：环境变量 > 指定文件 > 脚本同目录文件
    if os.environ.get("WORKBUDDY_REFRESH_TOKEN"):
        return os.environ["WORKBUDDY_REFRESH_TOKEN"].strip()
    f = os.environ.get("WORKBUDDY_REFRESH_TOKEN_FILE")
    if f and os.path.isfile(f):
        return open(f).read().strip()
    if os.path.isfile(TOKEN_FILE):
        return open(TOKEN_FILE).read().strip()
    return None

def save_token(tok):
    # 自续期写回：优先写环境变量指定的文件
    target = os.environ.get("WORKBUDDY_REFRESH_TOKEN_FILE") or TOKEN_FILE
    open(target, "w").write(tok)

def refresh(rt):
    # POST /v2/plugin/auth/token/refresh
    # 头带 X-Refresh-Token / X-Auth-Refresh-Source: plugin / X-Domain: copilot.tencent.com
    # 返回 (new_refresh_token, raw_resp)
    ...

def checkin(access_token):
    # POST /v2/billing/meter/daily-checkin，Bearer 认证
    # code=0 成功；code=10001 今日已签（幂等）
    ...

def main():
    rt = load_token()
    new_rt, resp = refresh(rt)
    at = resp["data"]["accessToken"]
    if new_rt and new_rt != rt:
        save_token(new_rt)          # ← 这就是「自续期」
        log("refresh_token 已自续期并写回文件")
    checkin(at)
```

你可以看到，所谓「自动化」的核心就两件事：**用旧 refresh_token 换新的**（刷新接口天然支持轮换），以及**把新的写回去**。

### 3.3 自续期：为什么能一直跑下去

这是整个方案「长期免维护」的关键。每次运行：

1. 拿着当前 `refresh_token` 去刷新接口；
2. 服务端返回**一个新的** `refresh_token`；
3. 脚本把它写回 `WORKBUDDY_REFRESH_TOKEN_FILE`；
4. 下一轮 cron 读到的已经是新令牌。

因为每次都轮换出新的 refresh_token，只要服务端持续签发，这条链就不会断——脚本里**没有任何「签到第 N 天就停」的逻辑**。所以在「账号会话不被作废、活动不被下线」的前提下，可以一直自动续期。

会打断它、需要你出手的情形只有：

- 你在 WorkBuddy 客户端**退出账号 / 改密码 / 被风控踢下线** → 刷新令牌失效，脚本以退出码 `1` 结束。这时重跑一次引导脚本取新 token 覆盖即可。
- 官方**下架签到活动或改接口** → 签到报错（续期可能仍正常，直到登录态失效）。

### 3.4 安全存放令牌：别把钥匙推进仓库

`refresh_token` 等于你的账号钥匙，能代替你登录调接口。部署时务必：

```bash
# 放在仓库之外的路径，锁好权限
printf '%s' "<你的 refresh_token>" > ~/.ssh/refresh_token.txt
chmod 600 ~/.ssh/refresh_token.txt
```

并在仓库根 `.gitignore` 里忽略掉：

```gitignore
/AI/WorkBuddy/*.txt
/AI/WorkBuddy/*.log
```

cron 用环境变量把令牌「喂」给脚本，脚本目录里**不保留**任何明文 token 文件：

```cron
# 虚机系统时区是 UTC，且并非所有 cron 都认 CRON_TZ（如 Ubuntu 的 Vixie cron 3.0pl1 就会忽略它），
# 故直接按 UTC 写时刻：北京时间 09:00 = UTC 01:00，21:00 = UTC 13:00
0 1,13 * * * cd /path/to/workbuddy && \
  WORKBUDDY_REFRESH_TOKEN="$(cat ~/.ssh/refresh_token.txt)" \
  WORKBUDDY_REFRESH_TOKEN_FILE=~/.ssh/refresh_token.txt \
  python3 daily_checkin.py >> checkin.log 2>&1
```

- 时区说明：并非所有 cron 都支持 `CRON_TZ`（如有些 Ubuntu 的 Vixie cron 3.0pl1 就不认，会把它当普通环境变量忽略、仍按系统 UTC 解释时刻）。稳妥做法是**按虚机实际时区写时刻**——本机时区为 UTC，北京时间 09:00/21:00 对应 UTC 01:00/13:00，即 `0 1,13 * * *`。若你的虚机系统时区已是 `Asia/Shanghai`，则可直接写 `0 9,21`。
- `WORKBUDDY_REFRESH_TOKEN` 让脚本直接拿到 token（不读脚本目录文件）；
- `WORKBUDDY_REFRESH_TOKEN_FILE` 指定**自续期写回目标**为 `~/.ssh`。

## 四、接口一览

以下是逆向自 WorkBuddy 桌面端、已实测可用的接口：

| 用途 | 方法 / 路径 | 认证 | 说明 |
|------|-------------|------|------|
| 刷新令牌 | `POST /v2/plugin/auth/token/refresh` | 头 `X-Refresh-Token` / `X-Auth-Refresh-Source: plugin` / `X-Domain: copilot.tencent.com` | 返回 `accessToken` + `refreshToken`（自续期） |
| 每日签到 | `POST /v2/billing/meter/daily-checkin` | `Authorization: Bearer <accessToken>` | `code=0` 成功；`code=10001` 今日已签（幂等） |
| 连签状态 | `POST /v2/billing/meter/checkin-activity-status` | `Authorization: Bearer <accessToken>` | 返回 `streak_days` / `total_credits` |
| 域名 | `https://copilot.tencent.com` | — | 统一前缀 |

## 五、结语

整套方案落地后，你的本机不需要开机、不需要开 WorkBuddy，积分照常每天到账；令牌靠刷新轮换自动续期，平时基本不用管。真正要操心的，只是「别在客户端退出账号」以及「活动别被官方下架」这两件事。

如果这篇对你有用，欢迎**关注我的公众号「技术温暖生活」**，后台私信「**WorkBuddy签到**」获取完整可运行源码（含令牌提取脚本 `extract_refresh_token.py`、部署说明与排错清单）。拿到源码后，配合任意 AI 助手按你的虚机环境改改路径就能跑起来。
