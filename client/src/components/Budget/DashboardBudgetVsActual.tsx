import { useTranslation } from '../../i18n'
import { formatMoney } from '../../utils/formatters'
import type { CategoryAgg } from './useBudgetDashboard'

interface Props {
  categories: CategoryAgg[]
  totalPlanned: number
  totalActual: number
  totalRemaining: number
  currency: string
  locale: string
}

const cardCls = 'bg-surface-card rounded-xl border border-edge-faint p-5'
const titleCls = 'text-content font-semibold'
const labelCls = 'text-content-muted'

export default function DashboardBudgetVsActual({ categories, totalPlanned, totalActual, totalRemaining, currency, locale }: Props) {
  const { t } = useTranslation()

  if (categories.length === 0) {
    return (
      <div className={cardCls}>
        <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))' }}>{t('budget.dashboard.budgetVsActual')}</h3>
        <p className={labelCls} style={{ marginTop: 8, fontSize: 'calc(13px * var(--fs-scale-body, 1))' }}>{t('budget.dashboard.noData')}</p>
      </div>
    )
  }

  return (
    <div className={cardCls}>
      <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))', marginBottom: 16 }}>{t('budget.dashboard.budgetVsActual')}</h3>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('budget.dashboard.totalPlanned')}</div>
          <div className="text-content" style={{ fontSize: 'calc(20px * var(--fs-scale-title, 1))', fontWeight: 700, marginTop: 2 }}>{formatMoney(totalPlanned, currency, locale)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('budget.dashboard.totalActual')}</div>
          <div className="text-content" style={{ fontSize: 'calc(20px * var(--fs-scale-title, 1))', fontWeight: 700, marginTop: 2 }}>{formatMoney(totalActual, currency, locale)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('budget.dashboard.totalRemaining')}</div>
          <div className={totalRemaining >= 0 ? 'text-content' : 'text-[#ef4444]'} style={{ fontSize: 'calc(20px * var(--fs-scale-title, 1))', fontWeight: 700, marginTop: 2 }}>
            {totalRemaining >= 0 ? formatMoney(totalRemaining, currency, locale) : t('budget.dashboard.overspent') + ' ' + formatMoney(Math.abs(totalRemaining), currency, locale)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.map(cat => {
          const ratio = cat.planned > 0 ? Math.min(cat.actual / cat.planned, 1) : 0
          const pct = Math.round(ratio * 100)
          return (
            <div key={cat.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="text-content" style={{ fontSize: 'calc(12px * var(--fs-scale-body, 1))', fontWeight: 500 }}>{t(cat.labelKey)}</span>
                <span className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))' }}>
                  {formatMoney(cat.actual, currency, locale)} / {formatMoney(cat.planned, currency, locale)}
                </span>
              </div>
              <div className="bg-surface-secondary" style={{ height: 6, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: cat.color, transition: 'width 300ms ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}