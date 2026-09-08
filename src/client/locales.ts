/** `diff-card` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'diff-card'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'card.filesChanged': '已编辑 {count} 个文件',
  'card.viewChanges': '查看更改',
  'card.viewChangesTitle': '展开全部文件并查看 diff；再次点击收起',
  'card.showMore': '再显示 {count} 个文件',
  'card.showLess': '显示更少',
  'card.toggleList': '展开或收起文件列表',
  'card.undo': '撤销',
  'card.undoing': '撤销中…',
  'card.undone': '已撤销',
  'card.undoFailed': '撤销失败',
  'card.undoFailedTitle': '撤销失败：文件可能已在此轮之外被改动',
  'card.undoTitle': '把这一轮改动的文件恢复到轮前状态',
  'card.review': '审核',
  'card.reviewTitle': '审核本轮全部文件改动',
  'card.open': '打开',
  'card.openMore': '更多打开方式',
  'card.openSystem': '系统打开',
  'card.showInExplorer': '在文件夹中显示',
  'card.openInVscode': '在 VS Code 中打开',
  'card.copyAbs': '复制绝对路径',
  'card.copyRel': '复制相对路径',
  'peek.loading': '读取中…',
  'peek.hostUnavailable': 'host API 不可用',
  'peek.readFailed': '读取失败',
  'peek.binary': '二进制文件（{size} 字节），无法预览',
  'peek.bytes': '{size} 字节',
  'peek.truncated': '已截断（读取上限内的前段）',
  'peek.close': '关闭',
}

/** English dictionary (same key set). */
export const en: Record<DiffStatKey, string> = {
  'card.filesChanged': 'Edited {count} files',
  'card.viewChanges': 'View changes',
  'card.viewChangesTitle': 'Show every file and its diff; click again to collapse',
  'card.showMore': 'Show {count} more files',
  'card.showLess': 'Show less',
  'card.toggleList': 'Expand or collapse the file list',
  'card.undo': 'Undo',
  'card.undoing': 'Undoing…',
  'card.undone': 'Undone',
  'card.undoFailed': 'Undo failed',
  'card.undoFailedTitle': "Undo failed: files may have changed outside this turn",
  'card.undoTitle': "Revert this turn's file changes to their pre-turn state",
  'card.review': 'Review',
  'card.reviewTitle': 'Review every file changed in this turn',
  'card.open': 'Open',
  'card.openMore': 'More ways to open',
  'card.openSystem': 'Open with system',
  'card.showInExplorer': 'Show in folder',
  'card.openInVscode': 'Open in VS Code',
  'card.copyAbs': 'Copy absolute path',
  'card.copyRel': 'Copy relative path',
  'peek.loading': 'Loading…',
  'peek.hostUnavailable': 'host API unavailable',
  'peek.readFailed': 'Read failed',
  'peek.binary': 'Binary file ({size} bytes); no preview',
  'peek.bytes': '{size} bytes',
  'peek.truncated': 'truncated (head of the read cap)',
  'peek.close': 'Close',
}

/** Union of this namespace's dictionary keys. */
export type DiffStatKey = keyof typeof zh