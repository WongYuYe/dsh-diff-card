# dsh-diff-card

[中文](README.md) | English

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
    <img src="docs/banner.svg" alt="dsh-diff-card" width="720">
  </picture>
</p>

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![npm](https://img.shields.io/npm/v/dsh-diff-card?style=flat-square)](https://www.npmjs.com/package/dsh-diff-card)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Codex-style file-change card for [DSH Desktop](https://github.com/anywhere-labs/dsh-desktop): **+N −M** on edit/write rows, a per-turn file list, and aligned diffs on click. Open files with the system app, Finder/Explorer, or VS Code on macOS and Windows. No git required.

<p align="center">
  <img src="docs/demo.svg" alt="demo" width="720">
</p>

## What it does

- **+N −M** on edit and write tool rows
- Per-turn card: “Edited N files”, 3-file preview, header total `+xx −xx`
- **View changes**: expand every file and its diff; click again to collapse
- **Review**: expand every diff in the turn
- **Undo**: restore this turn’s files (refuses if they changed elsewhere)
- Click a row to expand/collapse that file’s diff
- Row **▾**: open with system, show in folder, VS Code, copy absolute/relative path
- Covers native `edit` / `write`, `str_replace_editor`, and Code Dispatch sub-calls
- Copy follows the UI language (zh / en)

## Screenshots

| Turn card | Row badge and diff |
| --- | --- |
| ![turn card](docs/images/glass-card-peek.png) | ![aligned diff](docs/images/glass-diff-edit.png) |

## Install

```sh
dsh plugin --profile desktop add dsh-diff-card
```

Refresh the web GUI or restart DSH Desktop.

From source:

```sh
git clone https://github.com/WongYuYe/dsh-diff-card.git
cd dsh-diff-card
pnpm install
dsh plugin --profile desktop add .
```

Requires DeepSeek Harness `>= 0.1.2-rc.1`.

## Development

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm check:align
pnpm check:join
```

Release: bump `package.json` to `X.Y.Z` and push a `vX.Y.Z` tag. GitHub Actions opens the Release and publishes to npm with Trusted Publisher.

Forked from [HaoyueQin/dsh-diff-stat](https://github.com/HaoyueQin/dsh-diff-stat) with a Mac/Windows opener.

## License

MIT
