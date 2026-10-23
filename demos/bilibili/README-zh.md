# B站全站热门榜采集

Tobub 原生 Skill：读取 Bilibili 全站热门榜视频，并保存到 Tobub 内容库和观测记录。

## 运行流程

1. 选择 Tobub 的 `bili` 账号和与其关联的有效 Profile。Skill 使用 Profile 持久登录态（`run_mode: profile`、`auth_mode: inherit`），不读取或保存 Cookie、密码。
2. 打开全站热门榜，等待榜单加载。浏览器保持可见；若出现安全验证，最多等待 90 秒供用户手动完成，不自动绕过。验证未完成或页面未加载时返回 `blocked`，不会写入空数据。
3. 使用 `tobub.atoms.extractList` 结构化读取排名、BVID、标题、链接、封面、UP 主、播放量和弹幕量；按 BVID 去重。
4. 使用 `tobub.db.saveContent` 保存视频及榜单观测，并按 BVID 逐条回读核对标题。

## 参数和账号配置

- 榜单：<https://www.bilibili.com/v/popular/rank/all>
- `maxItems` 默认 100，范围 1–100。
- 包要求账号和 Profile。当前 Tobub Runtime 中默认 `execution.account_id` 为 10（账号键 `bili`）；账号 ID 是本机数据库标识，导入到其他 Runtime 时需改为当地 `bili` 账号 ID。
- Tobub 不允许导入包固化 `profile_id`。运行时需选择 `bili` 账号关联的有效 Profile；本机验证使用的是认证状态为 `valid` 的 Profile。
- 如果账号键不是 `bili` 或账号已停用，Skill 会停止且不访问页面、不写库。

## 实际验证

2026-10-23，在 Tobub Runtime 1.8.2 中通过可见浏览器、账号 `bili` 及其有效 Profile 运行 100 条：页面标题“哔哩哔哩排行榜”，榜单 100，提取 100，数据库写入 100，BVID 回读确认 100；无效记录、重复、提取失败和写库失败均为 0，未遇到验证码。Skill 编译检查和包安装检查均通过。

