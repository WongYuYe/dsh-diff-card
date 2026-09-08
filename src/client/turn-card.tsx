/**
 * The per-turn file-change summary card (R2): a Codex-style card at each
 * completed turn's tail — "已编辑 N 个文件" with 查看更改 / 撤销 / 审核,
 * a 3-file preview, then per-file relative paths and +n −m. Clicking a row
 * expands that file's review diff. 审核 expands every file; 查看更改 shows
 * the full list. System open / Finder / VS Code stay on the row's hover menu.
 * Files and hunks come from the turn accumulator (turn-changes.ts), never the
 * closing prose; run_code's edit/write dispatch sub-calls carry no turn
 * coordinate on the wire, so the card joins them from the stock chat tool
 * tree (turn-merge.ts) and renders the union.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconChevronDownOutline14, IconChevronRightOutline14,
  IconCopyOutline16, IconFolderOpen16, Menu, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { UseChat } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnLocation } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { diffStats } from './diff-contract.ts'
import { type ChangedFile } from './turn-changes.ts'
import { mergeChangedFiles } from './turn-merge.ts'
import { extractDispatchFiles, type TurnJoinCache } from './turn-join.ts'
import { prepareDiffWindow, type PreparedWindow } from './context-boost.ts'
import { NS } from './locales.ts'
import { hostAvailable, hostCall } from './api.ts'
import { DiffWindow } from './diff-window.tsx'
import { ArrowUpRightIcon, ExternalLinkIcon, PlusMinusIcon, UndoIcon, VSCodeIcon } from './icons.tsx'
import css from './turn-card.module.css'

/** Codex-style preview: three files, then "show N more". */
const PREVIEW_COUNT = 3

/** Workspace-relative path with forward slashes, matching Codex's file rows. */
function displayPath(path: string, cwd: string | undefined): string {
  const root = (cwd ?? '').replace(/[/\\]+$/, '')
  const rel = root !== '' && (path.startsWith(root + '/') || path.startsWith(root + '\\'))
    ? path.slice(root.length + 1)
    : path
  return rel.replace(/\\/g, '/')
}

/** Stable empty match so the join selector returns one reference while idle. */
const EMPTY_FILES: readonly ChangedFile[] = []

/** Full card props: the slot's match plus the owner currency and injected cwd reader. */
export type TurnCardProps = {
  matched: readonly ChangedFile[]
  /** The engine-owned closing Turn; its chat tool tree joins the PTC sub-calls. */
  turn?: TurnLocation | undefined
  /** The owning session; resolves the workspace root for relative-path copy. */
  sessionId?: string | undefined
  /** Read the session workspace root, for relative-path copy. Absent → copy falls back to the absolute path. */
  getCwd?: ((sessionId: string | undefined) => string | undefined) | undefined
  /** Chat-target snapshot reader (slot standard prop); joins the dispatch sub-calls. */
  useChat?: UseChat | undefined
} & Pick<TurnTailOwnerProps, 'openFile'> & PropsLocale<typeof NS>

/**
 * The turn-tail summary card.
 * @param props - matched files from the slot select, plus the opener and cwd reader.
 */
export function TurnCard(props: TurnCardProps) {
  const { matched, turn, sessionId, openFile, getCwd, t, useChat } = props
  const [showAll, setShowAll] = useState(false)
  const [openFilePath, setOpenFilePath] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set())
  const [hostReady, setHostReady] = useState(false)
  const [undoState, setUndoState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  // Expanding a file for review runs ONE host read that both rebuilds
  // arg-derived (PTC) fragments with real file context and resolves every
  // hunk's gutter numbering basis; applied wire hunks already carry the host's
  // ±3. Each entry pins the hunk list it was built from, so stale entries
  // self-invalidate; a null window (host read failed) renders the raw hunks
  // with window-relative numbers.
  const [prepared, setPrepared] = useState<ReadonlyMap<string, { input: readonly DiffHunk[]; window: PreparedWindow | null }>>(() => new Map())

  // The PTC half: join this Turn's edit/write dispatch sub-calls from the
  // stock chat tool tree (the accumulator cannot route them — dispatch
  // records carry no turn coordinate). The selector returns the snapshot
  // itself — the only identity-stable choice under uSES's Object.is equality
  // (a fresh array per call would re-render this card forever) — and the
  // extraction (with its cross-snapshot node-identity fingerprint cache)
  // lives in the pure turn-join module (check-turn-join.mjs pins the cache
  // contract), so later turns streaming in the same session cannot re-parse
  // this tree on every chunk.
  const snapshot = useChat === undefined ? undefined : useChat((s) => s)
  const joinCache = useRef<TurnJoinCache | null>(null)
  const dispatchFiles = useMemo(() => {
    if (snapshot === undefined || turn === undefined) return EMPTY_FILES
    // The Chat target snapshot already IS the chat slice: `locations` and
    // `nodes` own the tool tree this Turn's run_code sub-calls live in.
    const joined = extractDispatchFiles(snapshot.locations, snapshot.nodes, turn.turn, joinCache.current)
    joinCache.current = joined.next
    return joined.files
  }, [snapshot, turn])
  const allFiles = useMemo(() => mergeChangedFiles(matched, dispatchFiles), [matched, dispatchFiles])
  // Per-file stats off the per-render path: the file list is stable per
  // allFiles, so one DP pass each, memoized (identity-mirrors mutation-row).
  const statsByPath = useMemo(() => {
    const map = new Map<string, { added: number; removed: number }>()
    for (const file of allFiles) map.set(file.path, diffStats(file.diffs))
    return map
  }, [allFiles])
  const total = useMemo(() => {
    let added = 0
    let removed = 0
    for (const stats of statsByPath.values()) {
      added += stats.added
      removed += stats.removed
    }
    return { added, removed }
  }, [statsByPath])
  const cwd = useMemo(() => getCwd?.(sessionId), [getCwd, sessionId])
  const visibleFiles = showAll || allFiles.length <= PREVIEW_COUNT
    ? allFiles
    : allFiles.slice(0, PREVIEW_COUNT)
  const hiddenCount = allFiles.length - visibleFiles.length

  // Boost newly reviewed files whose hunks are bare arg fragments; the host
  // read is LRU-cached and best-effort, and unlocatable fragments (since
  // re-edited, truncated reads) simply keep their bare rendering. The list is
  // read through a ref, while the effect keys on the revealed set, the cwd
  // and the allFiles identity: a genuine re-settlement (fresh turn data for
  // the same path) re-prepares the stale entries in place, so an expanded
  // review heals after real edits instead of snapping shut until re-toggle.
  // Each entry records the exact hunk list it was built from; the ref check
  // keeps already-boosted files from re-running, and a null window (host read
  // failed — e.g. the file is being rewritten by the live turn) stays
  // retryable on the next run instead of being pinned as done.
  const allFilesRef = useRef(allFiles)
  allFilesRef.current = allFiles
  const preparedRef = useRef(prepared)
  preparedRef.current = prepared
  useEffect(() => {
    if (revealed.size === 0) return
    let alive = true
    void (async () => {
      for (const path of revealed) {
        const file = allFilesRef.current.find(candidate => candidate.path === path)
        if (file === undefined) continue
        const entry = preparedRef.current.get(path)
        if (entry !== undefined && entry.input === file.diffs && entry.window !== null) continue
        const next = await prepareDiffWindow(file.diffs, path, cwd)
        if (!alive) return
        setPrepared(prev => {
          const map = new Map(prev)
          map.set(path, { input: file.diffs, window: next })
          return map
        })
      }
    })()
    return () => { alive = false }
  }, [revealed, cwd, allFiles])

  // Host half probe: undo / Finder / VS Code stay hidden while the server
  // route is absent.
  useEffect(() => {
    let alive = true
    void hostAvailable().then(available => { if (alive) setHostReady(available) })
    return () => { alive = false }
  }, [])

  /** Undo the whole turn: replay every recorded hunk chain in reverse on the host. */
  const undoTurn = useCallback(() => {
    if (undoState === 'busy') return
    setUndoState('busy')
    void (async () => {
      const result = await hostCall<{ ok: boolean }>('undo', {
        cwd,
        // The turn coordinate lets the host check its turn-start snapshot
        // before deleting a create-shaped file (an overwrite carries the same
        // null oldText but must never be deleted).
        turn: turn?.turn,
        session: sessionId,
        files: allFiles.map(file => ({
          path: file.path,
          diffs: file.diffs.map(hunk => ({ oldText: hunk.oldText, newText: hunk.newText })),
        })),
      })
      setUndoState(result !== null && result.ok ? 'done' : 'error')
    })()
  }, [undoState, cwd, allFiles])

  const toggleRevealed = useCallback((path: string) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const revealAll = useCallback(() => {
    setShowAll(true)
    setRevealed(new Set(allFiles.map(file => file.path)))
  }, [allFiles])

  const viewChanges = useCallback(() => {
    setShowAll(true)
    setRevealed(prev => {
      if (allFiles.length > 0 && prev.size === allFiles.length) return new Set()
      return new Set(allFiles.map(file => file.path))
    })
  }, [allFiles])

  const copyPath = useCallback((path: string) => {
    const cwd = getCwd?.(sessionId) ?? ''
    const root = cwd.replace(/[/\\]+$/, '')
    const rel = root !== '' && (path.startsWith(root + '/') || path.startsWith(root + '\\'))
      ? path.slice(root.length + 1)
      : path
    void writeClipboard(rel)
  }, [getCwd, sessionId])

  const menuItems = useMemo(() => [
    { id: 'open', label: t('card.openSystem'), icon: <ExternalLinkIcon /> },
    ...(hostReady ? [
      { id: 'explorer', label: t('card.showInExplorer'), icon: <IconFolderOpen16 size={13} /> },
      { id: 'vscode', label: t('card.openInVscode'), icon: <VSCodeIcon /> },
    ] : []),
    { type: 'separator' as const, id: 'sep-copy' },
    { id: 'copy-abs', label: t('card.copyAbs'), icon: <IconCopyOutline16 size={13} /> },
    { id: 'copy-rel', label: t('card.copyRel'), icon: <IconCopyOutline16 size={13} /> },
  ], [hostReady, t])

  const onMenuSelect = useCallback((id: string, path: string) => {
    if (id === 'open') openFile(path)
    else if (id === 'explorer') void hostCall('open-with', { cwd, path, target: 'explorer' })
    else if (id === 'vscode') void hostCall('open-with', { cwd, path, target: 'vscode' })
    else if (id === 'copy-abs') void writeClipboard(path)
    else if (id === 'copy-rel') copyPath(path)
  }, [openFile, copyPath, cwd])

  if (allFiles.length === 0) return null

  const reviewing = revealed.size === allFiles.length && allFiles.length > 0

  return (
    <div className={css.card} data-diff-card-card="">
      <div className={css.header}>
        <button
          type="button"
          className={css.glyph}
          aria-label={t('card.toggleList')}
          aria-expanded={showAll || allFiles.length <= PREVIEW_COUNT}
          onClick={() => { setShowAll(v => !v) }}
        >
          <PlusMinusIcon />
        </button>
        <div className={css.titles}>
          <div className={css.summary}>{t('card.filesChanged', { count: allFiles.length })}</div>
          <button
            type="button"
            className={css.viewChanges}
            title={t('card.viewChangesTitle')}
            onClick={viewChanges}
          >
            <span className={css.headerBadge} data-diffstat="">
              <span className={css.add}>+{total.added}</span>
              <span className={css.del}>−{total.removed}</span>
            </span>
            {t('card.viewChanges')}
            <ArrowUpRightIcon />
          </button>
        </div>
        <div className={css.headerActions}>
          {hostReady && (
            <button
              type="button"
              className={css.undo + (undoState === 'done' ? ' ' + css.undoDone : '')}
              disabled={undoState === 'busy' || undoState === 'done'}
              title={undoState === 'error' ? t('card.undoFailedTitle') : t('card.undoTitle')}
              onClick={undoTurn}
            >
              {undoState === 'busy' ? t('card.undoing') : undoState === 'done' ? t('card.undone') : undoState === 'error' ? t('card.undoFailed') : t('card.undo')}
              {undoState === 'idle' && <UndoIcon />}
            </button>
          )}
          <button
            type="button"
            className={css.review + (reviewing ? ' ' + css.reviewActive : '')}
            title={t('card.reviewTitle')}
            onClick={revealAll}
          >
            {t('card.review')}
          </button>
        </div>
      </div>
      <div className={css.list}>
        {visibleFiles.map(file => {
          const stats = statsByPath.get(file.path) ?? { added: 0, removed: 0 }
          const revealedFile = revealed.has(file.path)
          const preparedEntry = prepared.get(file.path)
          // Render the prepared window only while it was built from this
          // file's exact hunk list; a stale entry, an in-flight prepare or
          // a failed host read all fall back to the raw hunks (window-
          // relative gutter numbers) so an expanded review never snaps
          // shut on streaming identity churn.
          const preparedWindow = preparedEntry !== undefined
            && preparedEntry.input === file.diffs
            && preparedEntry.window !== null
            ? preparedEntry.window
            : null
          const rel = displayPath(file.path, cwd)
          return (
            <div key={file.path} data-diff-card-file={file.path}>
              <div
                className={css.fileRow + (revealedFile ? ' ' + css.fileRowActive : '')}
                role="button"
                tabIndex={0}
                aria-expanded={revealedFile}
                title={file.path}
                onClick={() => { toggleRevealed(file.path) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleRevealed(file.path)
                  }
                }}
              >
                <span className={css.fileName}>{rel}</span>
                <span className={css.rowBadge} data-diffstat="">
                  <span className={css.add}>+{stats.added}</span>
                  <span className={css.del}>−{stats.removed}</span>
                </span>
                <span className={css.actions} onClick={event => { event.stopPropagation() }}>
                  <Menu
                    open={openFilePath === file.path}
                    anchor={(
                      <button
                        type="button"
                        className={css.action + ' ' + css.openMore + (openFilePath === file.path ? ' ' + css.actionActive : '')}
                        aria-label={t('card.openMore')}
                        aria-haspopup="menu"
                        aria-expanded={openFilePath === file.path}
                        onClick={() => { setOpenFilePath(current => (current === file.path ? null : file.path)) }}
                      >
                        <IconChevronDownOutline14 size={11} />
                      </button>
                    )}
                    items={menuItems}
                    onSelect={id => { onMenuSelect(id, file.path); setOpenFilePath(null) }}
                    onClose={() => { setOpenFilePath(null) }}
                    align="end"
                    compact
                    portal
                  />
                </span>
              </div>
              {revealedFile && (
                <div className={css.diffWrap}>
                  <DiffWindow
                    diffs={preparedWindow !== null ? preparedWindow.diffs : file.diffs}
                    bases={preparedWindow !== null ? preparedWindow.bases : undefined}
                    maxHeight={320}
                  />
                </div>
              )}

            </div>
          )
        })}
        {hiddenCount > 0 && (
          <button type="button" className={css.showMore} onClick={() => { setShowAll(true) }}>
            {t('card.showMore', { count: hiddenCount })}
            <span className={css.showMoreChevron} aria-hidden>
              <IconChevronRightOutline14 size={12} />
            </span>
          </button>
        )}
        {showAll && allFiles.length > PREVIEW_COUNT && (
          <button type="button" className={css.showMore} onClick={() => { setShowAll(false) }}>
            {t('card.showLess')}
          </button>
        )}
      </div>
    </div>
  )
}