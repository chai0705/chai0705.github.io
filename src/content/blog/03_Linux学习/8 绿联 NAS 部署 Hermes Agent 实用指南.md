---
title: 绿联 NAS 部署 Hermes Agent 实用指南
date: 2026-06-11 20:07:00
categories:
  - Linux学习
link: 03_Linux学习/8 绿联 NAS 部署 Hermes Agent 实用指南
---



# 绿联 NAS 部署 Hermes Agent 实用指南

> 从安装成功到长期个人 AI 助理  
> 核验日期：2026-06-11  
> 主线设备：UGREEN NASync DH4300 Plus / UGOS Pro / Docker Compose  
> 兼容思路：其他绿联 NAS 也可参考，路径、CPU 架构和 Docker UI 名称按实际系统调整。

本文融合并修订了本目录下两份旧稿：

- `绿联NAS安装Hermes_Agent完整教程.md`
- `ugreen-nas4300plus-hermes-agent-guide.md`

最终采用新版 Hermes Agent 官方 Docker 路径：`nousresearch/hermes-agent:latest`、`gateway run`、`/opt/data` 持久化、`8642` gateway/API 端口、`9119` Dashboard 端口。旧稿里出现的 `nousresearch/hermes:latest`、`8080`、手写 `/opt/data/cron.d`、默认 root SSH、API key 留空等写法不要继续沿用。

## 1. 先确认范围

### 1.1 本教程适合谁

适合你已经有一台绿联 NAS，希望把 Hermes Agent 部署成长期运行的个人 AI 助理：

- 生活：家庭待办、账单、保修、NAS 巡检、智能家居状态提醒。
- 学习：课程资料整理、复习计划、错题/概念清单、阶段复盘。
- 工作：会议纪要、项目材料索引、日报周报草稿、工作文件收件箱。
- 读书：书摘整理、读书笔记、主题索引、复习卡片。

Hermes Agent 不是 NAS 管理系统，也不是 Home Assistant 的替代品。更准确地说，它是一个能长期运行的 AI agent：可以通过 CLI、Telegram、Dashboard、Email、Home Assistant、cron、profiles、skills 和工具调用来处理任务。

### 1.2 型号和架构

不要把 `DH4300 Plus` 写成 Intel N100 设备。按绿联官方产品线：

| 设备 | 常见架构 | 说明 |
|---|---|---|
| DH4300 Plus | ARM64 级别 NAS | 适合跑 Hermes Agent 容器，模型推理建议用云 API |
| DXP4800 Plus | x86_64 / Intel Pentium Gold 8505 | 性能更强，安装流程基本相同 |

进入 NAS 后可用下面命令确认：

```bash
uname -m
docker version
docker compose version
```

`aarch64` 或 `arm64` 说明是 ARM64；`x86_64` 说明是 x86。Hermes 官方镜像支持 Docker 部署，但如果你使用第三方镜像，遇到 `exec format error` 时优先换回官方镜像。

### 1.3 云 API 和本地模型边界

建议第一阶段使用云端模型 API 跑通，例如 Nous Portal、OpenRouter、OpenAI 兼容服务、Anthropic、Gemini、Kimi、GLM 等。

注意：数据、配置、记忆和会话会持久化在 NAS 的 `/volume1/docker/hermes/data`，但你发给模型分析的内容会发送给模型服务商。合同、证件、公司机密、财务明细等内容应先做脱敏，或使用你能接受的数据处理方案。

DH4300 Plus 这类 8GB ARM NAS 不适合承担大模型本地推理。本地 Ollama 可以作为附录尝试，不应作为新手主线。

## 2. 为什么用 Docker Compose

绿联 NAS 上有几种安装路径：

| 方式 | 推荐度 | 说明 |
|---|---:|---|
| Docker Compose | 高 | 最适合 NAS 常驻服务；配置、数据、升级、回滚都清楚 |
| UGOS Pro Docker 图形界面 | 中高 | 适合不想 SSH 的用户；可导入 Compose 项目 |
| 一键安装脚本 | 中 | 普通 Linux 主机可用，NAS 上和系统环境耦合更高 |
| pip 安装 | 中低 | 需要自己维护 Python、Node、Playwright 等依赖 |
| 桌面版 | 不推荐 | NAS 没有桌面交互环境，不适合这个场景 |

本教程以 Docker Compose 为主线。图形界面用户也可以把 Compose 内容粘贴到 UGOS Pro Docker 的“项目/Compose”功能里。

## 3. 安装前准备

### 3.1 开启 Docker 和 SSH

在 UGOS Pro：

1. 打开应用中心，安装或启用 Docker。
2. 如果愿意用命令行，打开控制面板里的 SSH 服务。
3. 用普通管理员账号 SSH 登录，不要默认使用 root。

示例：

```bash
ssh 用户名@NAS_IP
```

登录后检查：

```bash
uname -m
docker version
docker compose version
```

如果你的 UGOS 只支持旧命令 `docker-compose`，后面的 `docker compose` 可以对应改成 `docker-compose`。

### 3.2 准备模型 API

任选一种：

| 方案 | 适合人群 | 准备内容 |
|---|---|---|
| Nous Portal | 想按官方整合少折腾 | Nous Portal 账号 |
| OpenRouter | 想统一调用多家模型 | `OPENROUTER_API_KEY` |
| OpenAI 或兼容网关 | 已有 OpenAI/中转/自建网关 | `OPENAI_API_KEY`，可选 `OPENAI_BASE_URL` |
| Anthropic/Gemini/Kimi/GLM | 已有对应平台账号 | 对应 API key |

建议先只配置一个 provider，等系统稳定后再考虑 fallback 或多模型。

### 3.3 创建目录

先只挂载 Hermes 需要处理的目录，不要挂载整个 `/volume1`。

```bash
mkdir -p /volume1/docker/hermes/data
mkdir -p /volume1/docker/hermes/workspace/reports
mkdir -p /volume1/docker/hermes/inbox/life
mkdir -p /volume1/docker/hermes/inbox/study
mkdir -p /volume1/docker/hermes/inbox/work
mkdir -p /volume1/docker/hermes/inbox/reading
mkdir -p /volume1/docker/hermes/knowledge/life
mkdir -p /volume1/docker/hermes/knowledge/study
mkdir -p /volume1/docker/hermes/knowledge/work
mkdir -p /volume1/docker/hermes/knowledge/reading
mkdir -p /volume1/docker/hermes/archive
mkdir -p /volume1/docker/hermes/scripts
```

路径对应关系：

| NAS 路径 | 容器内路径 | 用途 |
|---|---|---|
| `/volume1/docker/hermes/data` | `/opt/data` | Hermes 配置、密钥、会话、记忆、profiles、skills、cron、日志 |
| `/volume1/docker/hermes/workspace` | `/workspace` | 工作区和报告输出 |
| `/volume1/docker/hermes/inbox` | `/nas/inbox` | 生活、学习、工作、读书入口文件 |
| `/volume1/docker/hermes/knowledge` | `/nas/knowledge` | 长期 Markdown 索引和知识库 |
| `/volume1/docker/hermes/archive` | `/nas/archive` | 确认后的归档输出 |
| `/volume1/docker/hermes/scripts` | `/opt/data/scripts` | no-agent cron 脚本 |

如果你的存储池不是 `/volume1`，按实际路径替换。

### 3.4 获取 UID/GID

```bash
id -u
id -g
```

记下输出。Compose 里用它们运行容器，减少 `Permission denied`。

必要时只修 Hermes 专用目录权限：

```bash
chown -R 你的_UID:你的_GID /volume1/docker/hermes
```

不要对整个 `/volume1` 递归 `chown`。

### 3.5 生成 Dashboard 和 API 密钥

Dashboard 会暴露会话、配置和模型信息，必须有认证。

```bash
openssl rand -hex 32
openssl rand -hex 32
```

第一个可作为 `HERMES_DASHBOARD_BASIC_AUTH_SECRET`，第二个可作为将来启用 API server 时的 `API_SERVER_KEY`。

## 4. Docker Compose 安装

### 4.1 创建 Compose 文件

```bash
cd /volume1/docker/hermes
nano docker-compose.yml
```

写入下面内容，把 UID/GID、密码和 secret 换成你自己的值：

```yaml
services:
  hermes:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-agent
    restart: unless-stopped
    command: gateway run
    shm_size: "1gb"
    ports:
      - "8642:8642"
      - "9119:9119"
    environment:
      TZ: "Asia/Shanghai"
      HERMES_UID: "1000"
      HERMES_GID: "1000"

      HERMES_DASHBOARD: "1"
      HERMES_DASHBOARD_BASIC_AUTH_USERNAME: "hermes"
      HERMES_DASHBOARD_BASIC_AUTH_PASSWORD: "CHANGE_ME_TO_A_STRONG_PASSWORD"
      HERMES_DASHBOARD_BASIC_AUTH_SECRET: "CHANGE_ME_TO_RANDOM_HEX_32_BYTES"

      # 默认不要打开 API server。需要接第三方 UI 或自动化系统时再启用。
      # API_SERVER_ENABLED: "true"
      # API_SERVER_HOST: "0.0.0.0"
      # API_SERVER_KEY: "CHANGE_ME_TO_RANDOM_HEX_32_BYTES"
      # API_SERVER_CORS_ORIGINS: "http://NAS_IP:3000"
    volumes:
      - /volume1/docker/hermes/data:/opt/data
      - /volume1/docker/hermes/workspace:/workspace
      - /volume1/docker/hermes/inbox:/nas/inbox
      - /volume1/docker/hermes/knowledge:/nas/knowledge
      - /volume1/docker/hermes/archive:/nas/archive
      - /volume1/docker/hermes/scripts:/opt/data/scripts
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"
```

说明：

- `/opt/data` 是官方 Docker 镜像的持久化目录，不能省。
- `command: gateway run` 让 gateway 常驻，并由容器内 supervisor 管理。
- `8642` 是 gateway/API/health 相关端口。只用 Telegram 也可以不开到公网。
- `9119` 是 Dashboard 端口。只建议内网、Tailscale/WireGuard/VPN、或带认证的 HTTPS 反向代理访问。
- `shm_size: "1gb"` 能减少浏览器/Playwright 工具异常。
- `HERMES_UID/HERMES_GID` 使用你在 3.4 查到的 UID/GID。部分 NAS 文档写 `PUID/PGID`，不要同时写成不同值。

如果你不需要 Dashboard，删除 `9119:9119`，并把 `HERMES_DASHBOARD` 改成 `"0"` 或删掉 Dashboard 相关环境变量。

### 4.2 初始化 Hermes

先跑一次交互式配置：

```bash
cd /volume1/docker/hermes
docker compose run --rm hermes setup
```

如果你要走 Nous Portal：

```bash
docker compose run --rm hermes setup --portal
```

也可以直接编辑 `.env`：

```bash
nano /volume1/docker/hermes/data/.env
```

示例：

```bash
OPENROUTER_API_KEY=sk-or-xxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

限制权限：

```bash
chmod 600 /volume1/docker/hermes/data/.env
```

`.env` 里有 API key、bot token、HA token，不要放进 Git、公开笔记、共享网盘或全家可写目录。

选择模型：

```bash
cd /volume1/docker/hermes
docker compose run --rm hermes model
```

`hermes model` 是完整 provider/model 配置向导。聊天里的 `/model` 更适合切换已配置模型。

### 4.3 启动容器

```bash
cd /volume1/docker/hermes
docker compose up -d
```

查看日志：

```bash
docker logs -f hermes-agent
```

进入 CLI：

```bash
docker exec -it hermes-agent hermes
```

诊断和版本：

```bash
docker exec -it hermes-agent hermes doctor
docker exec -it hermes-agent hermes version
```

Dashboard：

```text
http://NAS_IP:9119
```

用 Compose 里配置的用户名和密码登录。

## 5. 首次验收清单

不要只看容器 `running`。按下面检查：

```bash
docker ps | grep hermes-agent
docker logs --tail 120 hermes-agent
docker exec -it hermes-agent hermes version
docker exec -it hermes-agent hermes doctor
```

进入 CLI 后测试只读任务：

```text
请列出 /nas/inbox 下的一级目录，只输出目录名。不要移动、删除或改写任何文件。
```

预期：

- 能正常调用模型。
- 能看到 `/nas/inbox/life`、`/nas/inbox/study`、`/nas/inbox/work`、`/nas/inbox/reading`。
- 没有 `Permission denied`。
- Dashboard 可以在内网登录。

如果启用了 API server，必须配置：

```yaml
API_SERVER_ENABLED: "true"
API_SERVER_HOST: "0.0.0.0"
API_SERVER_KEY: "随机长密钥"
```

第三方客户端地址应是：

```text
http://NAS_IP:8642/v1
```

不要使用旧稿里的 `8080`，也不要把 API key 留空或填任意值。

## 6. Telegram 手机入口

Telegram 是家庭场景里最实用的入口。手机上发一句话，NAS 后台 agent 可以整理文件、生成报告、提醒你确认下一步。

### 6.1 创建 Bot

1. 在 Telegram 搜索 `@BotFather`。
2. 发送 `/newbot`。
3. 按提示创建 bot。
4. 复制 bot token。

获取你的 Telegram user id：

- 搜索 `@userinfobot`。
- 或使用 Hermes pairing 机制后在 CLI 里批准。

保守做法是直接配置 allowlist。

编辑：

```bash
nano /volume1/docker/hermes/data/.env
```

加入：

```bash
TELEGRAM_BOT_TOKEN=你的_bot_token
TELEGRAM_ALLOWED_USERS=你的_Telegram_user_id
TELEGRAM_HOME_CHANNEL=你的_Telegram_user_id
```

重启：

```bash
cd /volume1/docker/hermes
docker compose restart hermes
```

给 bot 发：

```text
/status
```

再测试：

```text
帮我列出 /nas/inbox/reading 里有哪些文件，只输出文件名和大小，不要读取正文。
```

安全规则：

- 不要设置 `GATEWAY_ALLOW_ALL_USERS=true`。
- 不要把 bot 拉进陌生群。
- 家人共用前先明确他们能让 Hermes 做什么。
- 不要多个 profile 共用同一个 Telegram bot token。

## 7. 基础使用

### 7.1 CLI

```bash
docker exec -it hermes-agent hermes
```

常用命令：

```text
/new
/model
/skills
/usage
/status
/help
```

示例：

```text
请检查 /nas/inbox/life 目录，把 PDF、图片、Word 文档按类型列出来。先不要移动文件，只生成整理建议。
```

一次性调用建议用 `-q`：

```bash
docker exec -it hermes-agent hermes chat -q "列出 /nas/inbox 下的一级目录，只输出目录名。"
```

### 7.2 Dashboard

访问：

```text
http://NAS_IP:9119
```

Dashboard 适合看状态、会话、配置、profiles 和运行情况。不要把 `9119` 直接端口转发到公网。

### 7.3 从只读到自动执行

按这个授权阶梯推进：

1. 只读列清单：不移动、不改名、不删除。
2. 生成建议：输出 Markdown 归档计划。
3. 写索引：允许写 `/nas/knowledge` 或 `/workspace/reports`。
4. 人工确认后移动：每次批量移动前先给你确认清单。
5. 自动执行：只给低风险、高重复、可恢复的任务。

涉及删除、覆盖、付款、门锁、安防、证件上传、对外发邮件，必须人工确认，甚至不要交给 Hermes。

## 8. 配成长期个人助理

### 8.1 Profiles 和子 agent 怎么分

Hermes 的长期分工主要靠 profiles：每个 profile 有自己的配置、记忆、会话、skills、cron 和 gateway 状态。

子 agent 更适合一次性拆任务：例如让一个子 agent 收集文件名，另一个总结，另一个做隐私检查。它们不是长期身份，也不替代 profiles。

重要边界：profile 不是安全沙箱。多个 profile 在同一个容器里默认能看到同样的挂载目录。真正隔离要靠不同容器、不同挂载目录、不同 token、不同 NAS 用户权限。

推荐起步：

| Profile | 职责 |
|---|---|
| `default` | 总入口和调度员。负责 Telegram/CLI 对话、任务分流、全局偏好和待办汇总 |
| `life` | 生活助理：家庭待办、账单、保修、家电说明书、Home Assistant 查询 |
| `study` | 学习助理：课程资料、复习计划、错题、概念清单、阶段复盘 |
| `work` | 工作助理：会议纪要、项目资料、日报周报草稿、工作文件收件箱 |
| `reading` | 读书助理：书摘、读书笔记、主题索引、复习卡片 |
| `notify` | 通知助理：cron、no-agent 脚本、日报周报、NAS 基础状态提醒 |

### 8.2 创建 profiles

```bash
docker exec -it hermes-agent hermes profile create life \
  --description "生活助理：家庭待办、账单、保修、家电说明书和低风险智能家居查询。执行写入或控制前必须确认。"

docker exec -it hermes-agent hermes profile create study \
  --description "学习助理：整理课程资料、生成复习计划、提炼概念和阶段复盘。"

docker exec -it hermes-agent hermes profile create work \
  --description "工作助理：整理会议纪要、项目资料、工作收件箱和周报草稿。禁止自动发送外部消息。"

docker exec -it hermes-agent hermes profile create reading \
  --description "读书助理：整理书摘、读书笔记、主题索引和复习卡片。保留出处，不编造原文。"

docker exec -it hermes-agent hermes profile create notify \
  --description "通知助理：负责定时任务、no-agent 巡检、日报周报和异常提醒。"
```

给某个 profile 单独配置：

```bash
docker exec -it hermes-agent hermes -p life setup
docker exec -it hermes-agent hermes -p study setup
docker exec -it hermes-agent hermes -p work setup
docker exec -it hermes-agent hermes -p reading setup
docker exec -it hermes-agent hermes -p notify setup
```

查看：

```bash
docker exec -it hermes-agent hermes profile list
docker exec -it hermes-agent hermes profile show reading
```

和指定 profile 聊天：

```bash
docker exec -it hermes-agent hermes -p reading
```

### 8.3 每个 profile 的目录、cron 和提示词

| Profile | 输入目录 | 输出目录 | 定时任务 | 示例提示词 |
|---|---|---|---|---|
| `life` | `/nas/inbox/life` | `/nas/knowledge/life`、`/workspace/reports/life` | 每天生活提醒；每周家庭周报；可选睡前安全检查 | `检查本周家庭待办、账单、保修和采购事项，只生成清单，不执行控制。` |
| `study` | `/nas/inbox/study` | `/nas/knowledge/study`、`/workspace/reports/study` | 工作日学习复盘；周日下周计划 | `根据本周学习材料生成复习清单，标出我需要补的概念和下一步练习。` |
| `work` | `/nas/inbox/work` | `/nas/knowledge/work`、`/workspace/reports/work` | 工作日今日计划；工作收件箱摘要；周报草稿 | `整理 /nas/inbox/work 的新增文件，生成项目、截止日期、待确认事项，不发送外部邮件。` |
| `reading` | `/nas/inbox/reading` | `/nas/knowledge/reading/books`、`/workspace/reports/reading` | 每晚处理新增摘录；周日读书周报 | `读取新增读书摘录，按主题归类，保留页码/位置，不要编造原文。` |
| `notify` | `/opt/data/scripts`、各 profile 报告 | `/workspace/reports/notify` | NAS 巡检；备份提醒；异常通知 | `汇总今天各 profile 的报告，只推送需要我处理的 5 条以内事项。` |

### 8.4 记忆策略

全局记忆只放稳定偏好：

- 你的称呼、语言偏好、输出格式偏好。
- 常用通知时间。
- 安全规则：删除、移动、付款、门锁、安防、对外发送前必须确认。

各 profile 只记本领域长期规则：

- `life` 记家庭维护周期、账单类别、家电保修信息。
- `study` 记课程目标、考试时间、薄弱知识点。
- `work` 记项目缩写、周报格式、会议纪要格式。
- `reading` 记读书主题、笔记格式、引用规则。

事实材料保存在 `/nas/knowledge` 的 Markdown 索引里，不要把整本书、合同、账单原文塞进 memory。

### 8.5 Goal 模式用法

复杂任务不要只发“帮我整理一下”。要把任务写成可验收目标，让 Hermes 以目标收束。

如果你的客户端支持 reasoning effort 或类似选项，`xhigh` 只建议用于研究、融合教程、复杂审查、跨文件整理这类高价值任务；日常提醒、NAS 巡检、简单摘要用默认配置即可，避免成本和延迟失控。

模板：

```text
请用 goal 模式完成这个任务：
目标：把 /nas/inbox/reading 中新增读书摘录整理成可复习的读书笔记。
完成标准：
1. 生成 /nas/knowledge/reading/books/书名/summary.md
2. 生成 highlights.md，保留页码或位置
3. 生成 questions.md，列出我需要回想的问题
4. 生成 review-cards.md
5. 不移动、不删除原文件
6. 完成前检查文件是否存在，并报告仍不确定的内容
```

工作任务示例：

```text
请用 goal 模式完成：
目标：把 /nas/inbox/work 本周新增资料整理成周报草稿。
完成标准：
1. 只读取文件名和可读文本，不上传无关私人目录
2. 输出 /workspace/reports/work/weekly-draft.md
3. 包含完成事项、风险、下周计划、需要我确认的问题
4. 不自动发送邮件或消息
5. 完成前自查是否有遗漏文件
```

生活任务示例：

```text
请用 goal 模式完成：
目标：生成本周家庭待办和账单提醒。
完成标准：
1. 检查 /nas/inbox/life 的新增文件
2. 输出 /workspace/reports/life/family-weekly.md
3. 标出需要付款、需要维修、需要采购、需要确认的事项
4. 不执行付款、不控制设备、不移动文件
```

## 9. 定时任务和自动化

Hermes cron 由 gateway 执行，所以容器必须常驻。

查看：

```bash
docker exec -it hermes-agent hermes cron status
docker exec -it hermes-agent hermes cron list
```

### 9.1 文档收件箱日报

```bash
docker exec -it hermes-agent hermes cron create "every day at 21:30" \
  "检查 /nas/inbox。输出：1. 新文件列表；2. 疑似文件类型；3. 建议归档路径；4. 需要我确认的动作。不要移动或删除任何文件。" \
  --deliver telegram \
  --name "inbox-daily-report"
```

### 9.2 读书摘录处理

```bash
docker exec -it hermes-agent hermes -p reading cron create "every day at 22:00" \
  "检查 /nas/inbox/reading 是否有新增摘录。若有，生成 /workspace/reports/reading/daily-reading.md，按书名、主题、页码/位置整理，不编造原文，不移动文件。" \
  --deliver telegram \
  --name "reading-daily-notes"
```

### 9.3 学习复盘

```bash
docker exec -it hermes-agent hermes -p study cron create "every weekday at 21:00" \
  "根据 /nas/inbox/study 和 /nas/knowledge/study 的新增内容，生成今日学习复盘：学了什么、卡在哪里、明天练什么。输出到 /workspace/reports/study/daily-review.md。" \
  --deliver telegram \
  --name "study-daily-review"
```

### 9.4 工作收件箱摘要

```bash
docker exec -it hermes-agent hermes -p work cron create "every weekday at 18:30" \
  "整理 /nas/inbox/work 的新增文件，生成项目、截止日期、待确认事项和周报素材。不要发送外部消息，不要改动原文件。" \
  --deliver telegram \
  --name "work-inbox-summary"
```

### 9.5 no-agent NAS 巡检

no-agent 脚本不消耗 LLM，适合低成本状态检查。

```bash
nano /volume1/docker/hermes/scripts/nas-basic-status.sh
```

写入：

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "== Disk =="
df -h /nas/inbox /nas/archive /workspace
echo
echo "== Memory =="
free -m || true
echo
echo "== Time =="
date
```

授权：

```bash
chmod +x /volume1/docker/hermes/scripts/nas-basic-status.sh
```

创建 cron：

```bash
docker exec -it hermes-agent hermes -p notify cron create "every day at 08:30" \
  --no-agent \
  --script nas-basic-status.sh \
  --deliver telegram \
  --name "nas-basic-status"
```

管理：

```bash
docker exec -it hermes-agent hermes cron run inbox-daily-report
docker exec -it hermes-agent hermes cron pause inbox-daily-report
docker exec -it hermes-agent hermes cron resume inbox-daily-report
docker exec -it hermes-agent hermes cron remove inbox-daily-report
```

不要把 `/var/run/docker.sock` 挂给 Hermes。那等于给 agent 很高的宿主机控制能力。容器状态监控优先用 UGOS Docker 自带通知，或单独部署只读监控工具。

## 10. 生活、学习、工作、读书落地方案

### 10.1 生活

适合任务：

- 家庭文档、合同、发票、保修单、说明书生成索引。
- 每周家庭待办、账单、采购、维修提醒。
- Home Assistant 状态查询和低风险提醒。

提示词：

```text
检查 /nas/inbox/life，找出疑似发票、保修单、说明书和合同。生成 /nas/knowledge/life/inbox-index.md，字段包括文件名、疑似类型、日期、需要我确认的问题。不要移动文件。
```

```text
生成本周家庭周报：待办、账单、保修、维护、采购、需要我确认的问题。只输出 10 条以内。
```

### 10.2 学习

适合任务：

- 把课程资料整理成主题索引。
- 生成每日复盘和下周计划。
- 从错题或笔记里提炼薄弱概念。

提示词：

```text
阅读 /nas/inbox/study 里的新增学习材料，生成 /nas/knowledge/study/topic-index.md。按主题、关键概念、练习建议分类。不要删除或移动原文件。
```

```text
根据 /nas/knowledge/study/topic-index.md，给我生成 7 天复习计划。每天只安排 2 个重点，包含检查题。
```

### 10.3 工作

适合任务：

- 会议纪要整理。
- 项目资料索引。
- 日报、周报、风险清单草稿。

提示词：

```text
整理 /nas/inbox/work 的新增文件，生成 /workspace/reports/work/project-brief.md。包含项目名、关键日期、负责人、待确认事项、风险。不要发送外部消息。
```

```text
根据本周工作资料生成周报草稿。语气克制，分为完成事项、推进中、风险、下周计划、需要协助。
```

### 10.4 读书

读书流程建议：

1. 书、PDF、摘录放入 `/nas/inbox/reading`。
2. `reading` profile 先生成书籍元数据和目录。
3. 再输出 `summary.md`、`highlights.md`、`questions.md`、`review-cards.md`。
4. 每周把新笔记合并到主题索引。
5. 需要跨到学习/工作资料前先让你确认。

提示词：

```text
请处理 /nas/inbox/reading 中的新摘录。按书名建立目录，输出 summary.md、highlights.md、questions.md、review-cards.md。保留页码/位置，不编造原文，不移动原文件。
```

```text
把本周读书笔记合并到 /nas/knowledge/reading/theme-index.md。按主题归类，标出来源书名和页码/位置。
```

## 11. Home Assistant 可选集成

如果家里已有 Home Assistant，Hermes 可以做对话入口和状态摘要。

### 11.1 创建 HA token

在 Home Assistant：

1. 打开用户 Profile。
2. 找到 Security。
3. 创建 Long-Lived Access Token。
4. 复制 token。

编辑：

```bash
nano /volume1/docker/hermes/data/profiles/life/.env
```

加入：

```bash
HASS_URL=http://192.168.1.100:8123
HASS_TOKEN=你的_HA_Long_Lived_Access_Token
```

重启：

```bash
cd /volume1/docker/hermes
docker compose restart hermes
```

验证。这里显式加载 `life` profile 的 `.env`，避免裸 `bash` 环境里没有 `HASS_URL` 和 `HASS_TOKEN`：

```bash
docker exec -it hermes-agent bash -lc 'set -a; . /opt/data/profiles/life/.env; set +a; curl -H "Authorization: Bearer $HASS_TOKEN" "$HASS_URL/api/"'
```

正常会返回类似：

```json
{"message":"API running."}
```

### 11.2 控制边界

可以让 Hermes 做：

```text
检查家里门窗传感器状态，告诉我有没有没关的门窗。
```

```text
如果客厅温度超过 28 度，提醒我是否打开空调，不要自动执行。
```

不要直接让它做：

```text
打开门锁。
关闭安防。
自动付款。
自动联系外部人员。
```

门锁、安防、燃气、付款类动作必须人工确认，最好不要暴露给 Hermes。

## 12. 更新、备份、回滚、卸载

### 12.1 更新前

1. 暂停高风险 cron。
2. 备份 `/volume1/docker/hermes/data`。
3. 单独加密备份 `.env`。
4. 记录当前版本：

```bash
docker exec -it hermes-agent hermes version
docker image ls | grep hermes-agent
```

### 12.2 更新

```bash
cd /volume1/docker/hermes
docker compose pull
docker compose up -d
```

确认：

```bash
docker logs --tail 120 hermes-agent
docker exec -it hermes-agent hermes version
docker exec -it hermes-agent hermes doctor
```

### 12.3 备份

最重要的是：

```text
/volume1/docker/hermes/data
```

它包含：

- `config.yaml`
- `.env`
- `SOUL.md`
- `memories/`
- `skills/`
- `cron/`
- `sessions/`
- `logs/`
- `profiles/`

建议每周备份一次，`.env` 加密保存。RAID 不是备份。

简单打包：

```bash
cd /volume1/docker/hermes
tar -czf "/volume1/docker/hermes-backup-$(date +%Y%m%d-%H%M%S).tar.gz" data
```

### 12.4 回滚

如果升级后异常：

1. 停止容器：

```bash
cd /volume1/docker/hermes
docker compose down
```

2. 如果你记录了旧镜像 tag，把 Compose 里的 `image` 改回旧 tag。
3. 必要时恢复备份的 `data` 目录。
4. 启动并诊断：

```bash
docker compose up -d
docker logs --tail 120 hermes-agent
docker exec -it hermes-agent hermes doctor
```

### 12.5 卸载

停止容器：

```bash
cd /volume1/docker/hermes
docker compose down
```

保留数据但停用：

```bash
mv /volume1/docker/hermes "/volume1/docker/hermes.disabled-$(date +%Y%m%d-%H%M%S)"
```

确认备份无误后再删除。不要在没备份 `.env`、`profiles`、`cron`、`skills` 前直接删。

## 13. 故障排查

### 13.1 拉取镜像失败

```bash
docker pull nousresearch/hermes-agent:latest
```

如果国内网络拉取慢，使用 NAS 支持的镜像加速或在其他机器拉取后导入。

### 13.2 `exec format error`

说明镜像架构和机器架构不匹配。优先换回官方镜像：

```yaml
image: nousresearch/hermes-agent:latest
```

### 13.3 `Permission denied`

检查 UID/GID：

```bash
id -u
id -g
ls -la /volume1/docker/hermes
```

把结果写入 Compose 的 `HERMES_UID` / `HERMES_GID`，必要时：

```bash
chown -R 你的_UID:你的_GID /volume1/docker/hermes
cd /volume1/docker/hermes
docker compose up -d
```

### 13.4 Telegram bot 没反应

```bash
docker logs --tail 120 hermes-agent
```

检查：

- `TELEGRAM_BOT_TOKEN` 正确。
- `TELEGRAM_ALLOWED_USERS` 是你的数字 user id。
- 没有多个 profile 使用同一个 bot token。
- NAS 能访问 Telegram。

### 13.5 Dashboard 打不开

```bash
docker ps
docker logs --tail 120 hermes-agent
```

检查：

- Compose 映射了 `9119:9119`。
- `HERMES_DASHBOARD=1`。
- 配置了认证。
- UGOS 防火墙或路由器没有拦截内网访问。

### 13.6 浏览器工具失败

确认 Compose 里有：

```yaml
shm_size: "1gb"
```

然后：

```bash
cd /volume1/docker/hermes
docker compose up -d
```

### 13.7 容器资源占用高

DH4300 Plus 不适合同时跑大量浏览器、OCR、大批量网页抓取和本地模型。

处理：

- 减少 cron 频率。
- 多用 no-agent 脚本。
- 少用浏览器工具。
- 限制资源：

```yaml
deploy:
  resources:
    limits:
      memory: 4G
      cpus: "2.0"
```

### 13.8 LLM API 连接失败

```bash
docker exec -it hermes-agent bash -lc 'curl -I https://api.openai.com || true'
docker exec -it hermes-agent bash -lc 'curl -I https://openrouter.ai || true'
```

重新配置：

```bash
docker exec -it hermes-agent hermes setup
docker exec -it hermes-agent hermes model
```

## 14. 安全基线

1. 不要把 NAS 管理后台、Hermes Dashboard、Hermes API 直接暴露公网。
2. 远程访问优先用 Tailscale、WireGuard、UGREENlink 或带认证的 HTTPS 反向代理。
3. Telegram 必须配置 allowlist，不要允许所有用户。
4. 不要挂载整个 `/volume1` 给 Hermes。
5. 不要把 `/var/run/docker.sock` 挂给 Hermes。
6. 涉及删除、覆盖、批量移动、付款、门锁、安防、证件上传、对外发送的动作必须人工确认。
7. Profiles 不是安全沙箱。真正隔离要用不同容器、不同挂载、不同 token。
8. `.env` 必须限制权限并单独备份。
9. 先让 Hermes 生成计划和报告，再允许它执行写入动作。
10. Cron 提示词要自包含，写清楚允许做什么、禁止做什么、输出到哪里。

## 15. 推荐落地顺序

第一天：

1. 部署 Docker Compose。
2. 配好模型 API。
3. 跑通 `hermes doctor` 和 `hermes version`。
4. 只读检查 `/nas/inbox/*`。

第二天：

1. 配 Telegram。
2. 建立 `inbox-daily-report`。
3. 建立 no-agent NAS 基础巡检。

第一周：

1. 创建 `life`、`study`、`work`、`reading`、`notify` profiles。
2. 固定目录规则和记忆规则。
3. 先处理一本书、一组学习资料、一组生活文档。
4. 每天检查 cron 结果，把不稳定任务暂停。
5. 备份 `/volume1/docker/hermes/data`。

第二周：

1. 建立工作周报草稿和学习复盘。
2. 可选接入 Home Assistant，只开放查询和低风险提醒。
3. 把高敏感资料继续留在人工确认流程。

稳定后：

1. 对重复任务写 skill 或脚本。
2. 高敏感任务拆到单独容器。
3. 建立备份恢复演练。
4. 再考虑 Syncthing、Email、n8n、MCP、本地模型等扩展。

## 16. 附录：Ollama 和本地模型

DH4300 Plus 不建议把本地模型作为主线。如果你只是测试小模型，可以单独部署 Ollama：

```bash
mkdir -p /volume1/docker/ollama
cd /volume1/docker/ollama
nano docker-compose.yml
```

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ./models:/root/.ollama
```

启动：

```bash
docker compose up -d
docker exec ollama ollama pull llama3.2:3b
```

在 Hermes 里按 OpenAI-compatible/custom provider 思路配置：

```text
base_url: http://ollama:11434/v1
api_key: none
```

如果 Hermes 和 Ollama 不在同一个 Compose 网络，改用 NAS IP：

```text
http://NAS_IP:11434/v1
```

本地模型慢、效果不稳定或内存占用高时，切回云 API。

## 17. 参考来源

- Hermes Agent GitHub: https://github.com/NousResearch/hermes-agent
- Hermes Agent 官方文档: https://hermes-agent.nousresearch.com/docs
- Hermes Docker 文档: https://hermes-agent.nousresearch.com/docs/user-guide/docker
- Hermes Profiles 文档: https://hermes-agent.nousresearch.com/docs/user-guide/profiles
- Hermes Cron 文档: https://hermes-agent.nousresearch.com/docs/user-guide/features/cron
- Hermes Security 文档: https://hermes-agent.nousresearch.com/docs/user-guide/security
- Hermes Home Assistant 文档: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/homeassistant
- Hermes Docker Hub: https://hub.docker.com/r/nousresearch/hermes-agent/tags
- UGREEN NASync DH4300 Plus 产品页: https://nas.ugreen.com/products/ugreen-nasync-dh4300-plus-nas-storage
- UGREEN UGOS Pro 页面: https://nas.ugreen.com/pages/operating-system
- UGREEN Docker Compose 文档: https://www.ugnas.com/play-detail/id-68.html
