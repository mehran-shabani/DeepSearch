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
        <mark className="rounded bg-sky-500/20 px-1 font-medium text-sky-100">
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
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-right text-slate-200 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.9)] transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

      <header className="relative flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            سند شماره {result.id}
          </span>
          <h3 className="text-lg font-semibold text-white">برترین تطابق معنایی</h3>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100">
          <span className="text-2xl font-bold text-white">{scorePercentage}%</span>
          <div className="flex flex-col text-xs text-slate-200">
            <span>امتیاز شباهت</span>
            {formattedScore ? <span className="font-medium text-white/80">{formattedScore}</span> : null}
          </div>
        </div>
      </header>

      <p className="relative mt-5 text-base leading-relaxed text-slate-200">
        {highlightedContent}
      </p>

      <footer className="mt-6 space-y-4">
        {hasMetadata && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80">
            <button
              type="button"
              onClick={() => setShowMetadata((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-right text-sm font-medium text-slate-200 transition hover:text-white"
              aria-expanded={showMetadata}
              aria-controls={`metadata-${result.id}`}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/15 text-xs font-semibold text-sky-200">
                  i
                </span>
                اطلاعات تکمیلی سند
              </span>
              <span className={`transition-transform duration-300 ${showMetadata ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            <div
              id={`metadata-${result.id}`}
              className={`grid origin-top overflow-hidden border-t border-white/5 text-sm text-slate-300 transition-all duration-300 ease-out ${
                showMetadata ? 'grid-cols-1 gap-4 px-4 py-4 opacity-100 sm:grid-cols-2' : 'grid-rows-[0fr] gap-0 px-4 opacity-0'
              }`}
            >
              {showMetadata &&
                Object.entries(result.metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3"
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

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            تطابق معنایی فعال
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            اطمینان {scorePercentage}%
            {formattedScore ? (
              <span className="font-medium text-white/80">· {formattedScore}</span>
            ) : null}
          </span>
        </div>
      </footer>
    </article>
  )
}
