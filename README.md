# dsh-diff-card

中文 | [English](README.en.md)

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-zh-dark.svg">
    <img src="docs/banner-zh.svg" alt="dsh-diff-card" width="720">
  </picture>
</p>

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![npm](https://img.shields.io/npm/v/dsh-diff-card?style=flat-square)](https://www.npmjs.com/package/dsh-diff-card)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

给 [DSH Desktop](https://github.com/anywhere-labs/dsh-desktop) 用的 Codex 风格改动卡：编辑/写入行显示 **+N −M**，每轮结束列出改过的文件，点开就能审 diff。macOS 和 Windows 都能用系统应用、文件夹或 VS Code 打开文件。不依赖 git。

<p align="center">
  <img src="docs/demo-zh.svg" alt="demo" width="720">
</p>

## 做什么

- 编辑、写入工具行带上 **+N −M**
- 轮末卡片：已编辑 N 个文件，默认预览 3 条，标题里有合计 `+xx −xx`
- **查看更改**：展开全部文件并打开 diff；再点一次收起
- **审核**：展开本轮全部 diff
- **撤销**：把本轮文件恢复到改之前（文件若已被别处改过会拒绝）
- 点某一行：展开/收起这一份 diff
- 行上的 **▾**：系统打开、在文件夹中显示、VS Code、复制绝对/相对路径
- 覆盖原生 `edit` / `write`、`str_replace_editor`，以及 Code Dispatch 子调用
- 文案跟随界面语言（中 / 英）

## 截图

| 轮末卡片 | 行内徽标与 diff |
| --- | --- |
| ![轮末卡片](docs/images/glass-card-peek.png) | ![对齐 diff](docs/images/glass-diff-edit.png) |

## 安装

```sh
dsh plugin --profile desktop add dsh-diff-card
```

装完刷新 Web GUI，或重启 DSH Desktop。

从源码：

```sh
git clone https://github.com/WongYuYe/dsh-diff-card.git
cd dsh-diff-card
pnpm install
dsh plugin --profile desktop add .
```

需要 DeepSeek Harness `>= 0.1.2-rc.1`。

## 开发

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm check:align
pnpm check:join
```

发布：把 `package.json` 改成 `X.Y.Z`，推 `vX.Y.Z` tag。GitHub Actions 会打 Release 并用 Trusted Publisher 发到 npm。

基于 [HaoyueQin/dsh-diff-stat](https://github.com/HaoyueQin/dsh-diff-stat)，补了跨平台打开。

## License

MIT
