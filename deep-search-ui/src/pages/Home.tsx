import { useEffect, useMemo, useState, type FormEvent } from 'react'

import Result from '../components/Result'
import type { SearchResponse, SearchResult } from '../types/search'

const API_BASE_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/v1'

const PLACEHOLDER_QUERIES = [
  'Summaries about climate risk in 2024 reports',
  'Customer feedback mentioning onboarding issues',
  'Research insights on generative AI breakthroughs',
  'Key takeaways from quarterly financial filings',
]

const SEARCH_TIPS = [
  {
    icon: '✨',
    title: 'طبیعی بنویسید',
    description: 'با زبان محاوره‌ای سؤال کنید؛ موتور جست‌وجو نیت و ظرافت سؤال شما را درک می‌کند.',
  },
  {
    icon: '🎯',
    title: 'جزئیات اضافه کنید',
    description: 'بازه زمانی، حوزه یا فرمتی که مدنظر دارید را ذکر کنید تا نتایج دقیق‌تر شوند.',
  },
  {
    icon: '🧠',
    title: 'ایده‌ها را ترکیب کنید',
    description: 'چند مفهوم را کنار هم قرار دهید تا ارتباط‌های پنهان میان آن‌ها آشکار شود.',
  },
  {
    icon: '⚡️',
    title: 'سریع‌تر اصلاح کنید',
    description: 'جست‌وجوهای پی‌درپی انجام دهید؛ رابط برای آزمون و خطای سریع بهینه شده است.',
  },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [totalResults, setTotalResults] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    if (PLACEHOLDER_QUERIES.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setPlaceholderIndex((prev) =>
        prev + 1 >= PLACEHOLDER_QUERIES.length ? 0 : prev + 1,
      )
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  const placeholder = PLACEHOLDER_QUERIES[placeholderIndex]

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('لطفاً عبارت جست‌وجو را وارد کنید.')
      return
    }

    setLoading(true)
    setError(null)
    setSearchPerformed(true)

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          top_k: 10,
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data: SearchResponse = await response.json()

      setResults(data.results)
      setTotalResults(
        typeof data.total === 'number' ? data.total : data.results.length,
      )
      setLastUpdated(new Date())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'در حین دریافت نتایج خطایی رخ داد.',
      )
      setResults([])
      setTotalResults(null)
      setLastUpdated(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSearch()
  }

  const handleReset = () => {
    setQuery('')
    setResults([])
    setError(null)
    setSearchPerformed(false)
    setTotalResults(null)
    setLastUpdated(null)
  }

  const canReset =
    query.trim().length > 0 ||
    results.length > 0 ||
    Boolean(error) ||
    searchPerformed

  const formattedTimestamp = useMemo(() => {
    if (!lastUpdated) {
      return null
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(lastUpdated)
  }, [lastUpdated])

  const summaryText = useMemo(() => {
    if (!searchPerformed) {
      return 'برای شروع، عبارت مورد نظر خود را جست‌وجو کنید.'
    }

    if (loading) {
      return 'در حال جست‌وجوی دقیق در میان مستندات...'
    }

    if (error) {
      return 'امکان دریافت نتایج وجود نداشت.'
    }

    const total = totalResults ?? results.length

    if (total === 0) {
      return 'هیچ مدرکی مطابق جست‌وجوی شما یافت نشد.'
    }

    const suffix = total === 1 ? 'نتیجه' : 'نتایج'
    return `نمایش ${results.length} از ${total} ${suffix} مرتبط`
  }, [searchPerformed, loading, error, totalResults, results.length])

  const showEmptyState =
    searchPerformed && !loading && results.length === 0 && !error

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-radial-grid opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 -top-48 h-96 w-full bg-gradient-to-b from-blue-500/30 via-transparent to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28rem] w-full bg-gradient-to-t from-purple-600/20 via-slate-950/80 to-transparent blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200 ring-1 ring-inset ring-white/10">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            کشف معنایی با هوش مصنوعی
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            جست‌وجوی عمیق، دقیق و هوشمند برای تیم‌های مدرن
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            نتایج مرتبط را با رابط کاربری سریع و واکنش‌گرا کشف کنید؛ تجربه‌ای روان برای دسکتاپ و موبایل با تمرکز بر خوانایی و تعامل.
          </p>
        </header>

        <section
          className="mx-auto mt-12 w-full max-w-3xl animate-fade-in-up"
          style={{ animationDelay: '120ms' }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-[1px] shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-8 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />

            <form
              onSubmit={handleSubmit}
              className="relative z-10 flex flex-col gap-6 p-8 sm:p-10"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <label className="sr-only" htmlFor="search-query">
                  عبارت جست‌وجو
                </label>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 text-lg text-slate-400 sm:inline">
                      🔍
                    </span>
                    <input
                      id="search-query"
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={placeholder}
                      autoComplete="off"
                      aria-label="عبارت جست‌وجو"
                      aria-busy={loading}
                      className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/80 px-5 py-4 text-base text-slate-100 placeholder-slate-500 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 focus:outline-none sm:pl-14"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    نتیجه سریع می‌خواهید؟ نوع داده، زبان یا محدوده زمانی را هم ذکر کنید.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-[56px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-8 py-4 text-base font-semibold text-slate-900 shadow-glow transition hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-transparent" />
                      در حال جست‌وجو...
                    </span>
                  ) : (
                    'شروع جست‌وجو'
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                  جست‌وجوی معنایی در هزاران سند در چند لحظه
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-700/60 px-4 py-1.5 font-medium text-slate-300 transition hover:border-blue-400 hover:text-white disabled:opacity-40"
                  disabled={!canReset || loading}
                >
                  بازنشانی
                </button>
              </div>

              {error && (
                <div className="animate-fade-in-up rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-100">
                  {error}
                </div>
              )}

              <div
                className="rounded-2xl border border-white/5 bg-slate-900/70 px-5 py-4 text-left text-sm text-slate-300"
                role="status"
                aria-live="polite"
              >
                {summaryText}
              </div>
            </form>
          </div>
        </section>

        {!searchPerformed && !loading && (
          <section
            className="mt-14 grid gap-4 sm:grid-cols-2"
            aria-label="راهنماهای جست‌وجو"
          >
            {SEARCH_TIPS.map((tip, index) => (
              <div
                key={tip.title}
                className="animate-fade-in-up rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-left text-slate-200 transition hover:border-blue-400/40 hover:bg-white/[0.04]"
                style={{ animationDelay: `${160 + index * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                    {tip.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{tip.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-300">{tip.description}</p>
              </div>
            ))}
          </section>
        )}

        <section className="mt-16 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">نتایج جست‌وجو</h2>
              <p className="text-sm text-slate-400">
                {formattedTimestamp ? `${summaryText} • بروزرسانی در ${formattedTimestamp}` : summaryText}
              </p>
            </div>

            {results.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                نمایش برترین تطابق‌ها
              </span>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-fade-in-up rounded-3xl border border-white/5 bg-slate-900/70 p-6"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="h-4 w-32 rounded-full bg-white/10" />
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full rounded-full bg-white/10" />
                      <div className="h-3 w-5/6 rounded-full bg-white/10" />
                      <div className="h-3 w-2/3 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`space-y-6 transition-opacity duration-300 ${
                loading ? 'pointer-events-none opacity-60' : 'opacity-100'
              }`}
            >
              {results.map((result, index) => (
                <Result
                  key={result.id}
                  result={result}
                  query={query}
                  index={index}
                />
              ))}
            </div>

            {showEmptyState && (
              <div className="animate-fade-in-up rounded-3xl border border-dashed border-white/20 bg-slate-900/70 px-8 py-12 text-center text-slate-300">
                <h3 className="text-lg font-semibold text-white">
                  نتیجه‌ای یافت نشد
                </h3>
                <p className="mt-3 text-sm">
                  با افزودن جزئیات یا استفاده از عبارت‌های مترادف شانس خود را افزایش دهید.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
