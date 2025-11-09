import { useEffect, useMemo, useState, type FormEvent } from 'react'

import Result from '../components/Result'
import type { SearchResponse, SearchResult } from '../types/search'

const API_BASE_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/v1'

const PLACEHOLDER_QUERIES = [
  'گزارش‌های تازه از ریسک اقلیمی در سال ۲۰۲۴',
  'بازخورد مشتری درباره ورود به محصول',
  'پیشرفت‌های پژوهشی در حوزه هوش مولد',
  'خلاصه تغییرات گزارش‌های فصلی مالی',
]

const SEARCH_TIPS = [
  {
    icon: '💡',
    title: 'سؤال دقیق بپرسید',
    description: 'عبارت مورد نظر را با تعیین صنعت، سال یا نوع سند مشخص کنید تا پاسخ سریع‌تری بگیرید.',
  },
  {
    icon: '🧭',
    title: 'به راهنماها گوش دهید',
    description: 'برای مقایسه، از واژه‌های کلیدی مرتبط استفاده کنید تا دامنه جست‌وجو محدود شود.',
  },
  {
    icon: '🧩',
    title: 'ترکیب ایده‌ها',
    description: 'چند موضوع مرتبط را با هم بیاورید تا پیوندهای پنهان میان داده‌ها آشکار شوند.',
  },
  {
    icon: '⚡️',
    title: 'جست‌وجوی پی‌درپی',
    description: 'در صورت نیاز به اصلاح، تنها بخش مهم پرسش خود را تغییر دهید و دوباره جست‌وجو کنید.',
  },
]

const EXPERIENCE_METRICS = [
  { label: 'سرعت پاسخ', value: '< ۲ ثانیه', detail: 'بهینه برای تیم‌های پرمشغله' },
  { label: 'پوشش داده', value: '۵K+', detail: 'سند ساختارمند و بدون ساختار' },
  { label: 'اعتمادپذیری', value: '۹۶٪', detail: 'رضایت کاربران در آزمایش‌های داخلی' },
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(165,180,252,0.18),_transparent_70%)]" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-3 text-lg font-semibold text-white"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-base text-sky-300">
              DS
            </span>
            DeepSearch
          </a>

          <div className="hidden items-center gap-3 text-sm text-slate-300 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              نسخه آزمایشی فعال است
            </span>
            <a
              className="rounded-full border border-white/10 px-4 py-1.5 font-medium text-white transition hover:border-sky-400 hover:text-sky-200"
              href="#results"
            >
              مرور نتایج
            </a>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <section id="top" className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold tracking-[0.3em] text-sky-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI ASSISTED SEARCH
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                جست‌وجوی معنایی استاندارد برای تیم‌های داده‌محور
              </h1>
              <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg lg:mx-0">
                با رابط کاربری مدرن و واکنش‌گرا، در کمترین زمان پاسخ دقیق دریافت کنید. تجربه‌ای مناسب برای موبایل و دسکتاپ که تمرکز آن بر خوانایی، دسترسی و سرعت است.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {EXPERIENCE_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right shadow-sm"
                >
                  <p className="text-xs font-medium text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl self-center rounded-[28px] border border-white/10 bg-slate-900/70 p-1 shadow-[0_20px_60px_-20px_rgba(56,189,248,0.45)]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 rounded-[22px] bg-slate-950/90 p-8 shadow-inner"
            >
              <div className="space-y-2 text-right">
                <h2 className="text-xl font-semibold text-white">شروع جست‌وجوی جدید</h2>
                <p className="text-sm text-slate-400">
                  پرسش خود را به زبان طبیعی بنویسید؛ موتور جست‌وجو مفهوم عبارت را تحلیل می‌کند.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <label className="sr-only" htmlFor="search-query">
                  عبارت جست‌وجو
                </label>
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 text-xl text-slate-500 sm:inline">
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
                    className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 px-5 py-4 text-base text-slate-100 placeholder:text-slate-500 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 sm:pl-14"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-[56px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-[0_12px_30px_-12px_rgba(56,189,248,0.65)] transition hover:shadow-[0_18px_40px_-18px_rgba(56,189,248,0.75)] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-transparent" />
                      در حال جست‌وجو...
                    </span>
                  ) : (
                    'جست‌وجو'
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 animate-pulse-soft rounded-full bg-emerald-400" />
                  جست‌وجوی هوشمند روی هزاران سند
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-700/60 px-4 py-1.5 font-medium text-slate-300 transition hover:border-sky-400 hover:text-white disabled:opacity-40"
                  disabled={!canReset || loading}
                >
                  بازنشانی
                </button>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
                  {error}
                </div>
              )}

              <div
                className="rounded-2xl border border-white/5 bg-slate-900/70 px-5 py-4 text-right text-sm text-slate-300"
                role="status"
                aria-live="polite"
              >
                {summaryText}
                {formattedTimestamp ? (
                  <span className="mr-2 inline-flex items-center gap-1 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    بروزرسانی در {formattedTimestamp}
                  </span>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        {!searchPerformed && !loading && (
          <section className="mt-16" aria-label="راهنماهای جست‌وجو">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SEARCH_TIPS.map((tip, index) => (
                <article
                  key={tip.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-right transition hover:border-sky-400/40 hover:bg-white/[0.07]"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl">
                      {tip.icon}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      مرحله {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{tip.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="results" className="mt-20 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-right">
              <h2 className="text-2xl font-semibold text-white">نتایج جست‌وجو</h2>
              <p className="text-sm text-slate-400">{summaryText}</p>
            </div>

            {results.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  بر اساس بالاترین امتیاز شباهت
                </span>
                {formattedTimestamp ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    آخرین به‌روزرسانی {formattedTimestamp}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {loading && (
              <div className="space-y-4" aria-live="polite">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-white/10 bg-slate-900/60 p-6"
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
                <Result key={result.id} result={result} query={query} index={index} />
              ))}
            </div>

            {showEmptyState && (
              <div className="rounded-3xl border border-dashed border-white/20 bg-slate-900/70 px-8 py-12 text-center text-slate-300">
                <h3 className="text-lg font-semibold text-white">نتیجه‌ای یافت نشد</h3>
                <p className="mt-3 text-sm">
                  با افزودن جزئیات یا استفاده از عبارت‌های مترادف شانس خود را افزایش دهید.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} DeepSearch. تمامی حقوق محفوظ است.</p>
          <div className="flex justify-center gap-4">
            <a href="#top" className="transition hover:text-sky-300">
              بازگشت به بالا
            </a>
            <a href="#results" className="transition hover:text-sky-300">
              مشاهده نتایج
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
