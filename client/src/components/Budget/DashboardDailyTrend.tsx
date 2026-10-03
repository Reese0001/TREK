import { useTranslation } from '../../i18n'
import { formatMoney } from '../../utils/formatters'
import type { DailyAgg } from './useBudgetDashboard'

interface Props {
  daily: DailyAgg[]
  currency: string
  locale: string
}

const cardCls = 'bg-surface-card rounded-xl border border-edge-faint p-5'
const titleCls = 'text-content font-semibold'
const labelCls = 'text-content-muted'

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  if (isNaN(d.getTime())) return dateStr
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function DashboardDailyTrend({ daily, currency, locale }: Props) {
  const { t } = useTranslation()

  if (daily.length === 0) {
    return (
      <div className={cardCls}>
        <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))' }}>{t('budget.dashboard.dailyTrend')}</h3>
        <p className={labelCls} style={{ marginTop: 8, fontSize: 'calc(13px * var(--fs-scale-body, 1))' }}>{t('budget.dashboard.noData')}</p>
      </div>
    )
  }

  const max = Math.max(...daily.map(d => d.amount), 0)
  const total = daily.reduce((s, d) => s + d.amount, 0)
  const avg = daily.length > 0 ? total / daily.length : 0
  const barWidth = daily.length > 12 ? 100 / daily.length : 24

  return (
    <div className={cardCls}>
      <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))', marginBottom: 4 }}>{t('budget.dashboard.dailyTrend')}</h3>
      <div className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))', marginBottom: 16 }}>
        {t('budget.dashboard.perDay')}: {formatMoney(avg, currency, locale)}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, padding: '0 2px' }}>
        {daily.map(d => {
          const h = max > 0 ? Math.max((d.amount / max) * 100, 2) : 0
          return (
            <div key={d.date} style={{ flex: 1, minWidth: barWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                className="bg-accent"
                style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0', minHeight: 2, transition: 'height 300ms ease', opacity: 0.85 }}
                title={`${shortDate(d.date)}: ${formatMoney(d.amount, currency, locale)}`}
              />
              <span className={labelCls} style={{ fontSize: 'calc(9px * var(--fs-scale-caption, 1))', whiteSpace: 'nowrap' }}>
                {shortDate(d.date)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}