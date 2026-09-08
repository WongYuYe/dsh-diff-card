# dsh-diff-card

中文 | [English](README.en.md)

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-zh-dark.svg">
    <img src="docs/banner-zh.svg" alt="dsh-diff-card" width="720">
  </picture>
</p>

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![npm](https://img.shields.io/npm/v/dsh-diff-card?style=flat-square)](https://www.npmjs.com/package/dsh-diff-card)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

给 [DSH Desktop](https://github.com/anywhere-labs/dsh-desktop) 用的改动卡。智能体改完文件后，工具行显示 **+N −M**，轮末列出本轮改过的文件，点开就能审 diff。macOS 和 Windows 都能用系统应用、文件夹或 VS Code 打开文件。

<p align="center">
  <img src="docs/demo-zh.svg" alt="demo" width="720">
</p>

## 功能

- 编辑 / 写入行显示 **+N −M**
- 轮末卡片「已编辑 N 个文件」，默认预览 3 条，标题带合计 `+xx −xx`
- 点某一行：展开或收起这份 diff
- **查看更改**：展开全部文件并打开 diff，再点一次收起
- **审核**：展开本轮全部 diff
- **撤销**：把本轮文件恢复到改之前（文件若已被别处改过会拒绝）
- 行上的 **▾**：系统打开、在文件夹中显示、VS Code、复制绝对 / 相对路径
- 覆盖 `edit`、`write`、`str_replace_editor` 和 Code Dispatch 子调用
- 文案跟随界面语言（中 / 英）

## 截图

| 轮末卡片 | 行内徽标与 diff |
| --- | --- |
| ![轮末卡片](docs/images/glass-card-peek.png) | ![对齐 diff](docs/images/glass-diff-edit.png) |

## 安装

```sh
dsh plugin --profile desktop add dsh-diff-card
```

装完刷新 Web GUI，或重启 DSH Desktop。需要 DeepSeek Harness `>= 0.1.2-rc.1`。

从源码：

```sh
git clone https://github.com/WongYuYe/dsh-diff-card.git
cd dsh-diff-card
pnpm install
dsh plugin --profile desktop add .
```

## 开发

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm check:align
pnpm check:join
```

发布：把 `package.json` 改成 `X.Y.Z`，推 `vX.Y.Z` tag。GitHub Actions 会打 Release，并在已绑定 Trusted Publisher 时发到 npm。

## License

MIT
