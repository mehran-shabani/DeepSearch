import { Fragment, useMemo, useState } from 'react'

import type { SearchResult } from '../types/search'

interface ResultProps {
  result: SearchResult
  query: string
  index: number
}

const escapeRegExp = (input: string) =>
  input.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

const highlightMatches = (content: string, query: string) => {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return content
  }

  const tokens = normalizedQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)

  if (tokens.length === 0) {
    return content
  }

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')
  const parts = content.split(pattern)

  return parts.map((part, idx) => (
    <Fragment key={`${part}-${idx}`}>
      {idx % 2 === 1 ? (
        <mark className="rounded bg-blue-500/20 px-1 font-medium text-blue-100">
          {part}
        </mark>
      ) : (
        part
      )}
    </Fragment>
  ))
}

export default function Result({ result, query, index }: ResultProps) {
  const [showMetadata, setShowMetadata] = useState(false)

  const hasMetadata = useMemo(
    () => Object.keys(result.metadata ?? {}).length > 0,
    [result.metadata],
  )

  const highlightedContent = useMemo(
    () => highlightMatches(result.content, query),
    [result.content, query],
  )

  const scorePercentage = useMemo(() => {
    const rawScore = Number.isFinite(result.score) ? result.score : 0
    const normalized = Math.max(0, Math.min(1, rawScore))
    return Math.round(normalized * 100)
  }, [result.score])

  const formattedScore = useMemo(() => {
    if (!Number.isFinite(result.score)) {
      return null
    }

    return result.score.toFixed(3)
  }, [result.score])

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-slate-200 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-blue-500/20 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="pointer-events-none absolute -right-24 top-1/3 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

      <header className="relative flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-200 ring-1 ring-inset ring-blue-500/40">
            سند شماره {result.id}
          </span>
          <h3 className="mt-3 text-xl font-semibold text-white">
            انطباق هوشمند
          </h3>
        </div>

        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-center text-xs font-semibold text-slate-900 shadow-glow">
          <div className="absolute inset-[3px] rounded-full bg-slate-900/80" />
          <div className="relative flex flex-col items-center justify-center gap-0.5">
            <span className="text-lg font-bold leading-none">
              {scorePercentage}
            </span>
            <span className="text-[10px] uppercase tracking-wide opacity-80">
              امتیاز
            </span>
          </div>
        </div>
      </header>

      <p className="relative text-base leading-relaxed text-slate-200">
        {highlightedContent}
      </p>

      <footer className="relative mt-6 flex flex-col gap-4">
        {hasMetadata && (
          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <button
              type="button"
              onClick={() => setShowMetadata((prev) => !prev)}
              className="flex items-center justify-between text-left text-sm font-medium text-slate-200 transition-colors hover:text-white"
              aria-expanded={showMetadata}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-200">
                  i
                </span>
                اطلاعات تکمیلی
              </span>
              <span className={`transition-transform duration-300 ${showMetadata ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            <div
              className={`grid origin-top overflow-hidden text-sm text-slate-300 transition-all duration-300 ease-out ${
                showMetadata
                  ? 'grid-cols-1 gap-3 opacity-100 sm:grid-cols-2'
                  : 'grid-rows-[0fr] gap-0 opacity-0'
              }`}
            >
              {showMetadata &&
                Object.entries(result.metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {key}
                    </span>
                    <span className="text-sm font-medium text-slate-200">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 uppercase tracking-wide text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            تطابق معنایی
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 uppercase tracking-wide text-slate-200">
            اعتماد {scorePercentage}%
            {formattedScore ? (
              <span className="font-medium text-slate-100">· {formattedScore}</span>
            ) : null}
          </span>
        </div>
      </footer>
    </article>
  )
}
