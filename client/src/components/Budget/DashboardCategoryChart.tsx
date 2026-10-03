import { useTranslation } from '../../i18n'
import { formatMoney } from '../../utils/formatters'
import PieChart from './BudgetPanelPieChart'
import type { CategoryAgg } from './useBudgetDashboard'

interface Props {
  categories: CategoryAgg[]
  currency: string
  locale: string
}

const cardCls = 'bg-surface-card rounded-xl border border-edge-faint p-5'
const titleCls = 'text-content font-semibold'
const labelCls = 'text-content-muted'

export default function DashboardCategoryChart({ categories, currency, locale }: Props) {
  const { t } = useTranslation()

  if (categories.length === 0) {
    return (
      <div className={cardCls}>
        <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))' }}>{t('budget.dashboard.categoryBreakdown')}</h3>
        <p className={labelCls} style={{ marginTop: 8, fontSize: 'calc(13px * var(--fs-scale-body, 1))' }}>{t('budget.dashboard.noData')}</p>
      </div>
    )
  }

  const segments = categories
    .filter(c => c.planned > 0)
    .map(c => ({ label: t(c.labelKey), value: c.planned, color: c.color }))

  const total = segments.reduce((s, x) => s + x.value, 0)

  return (
    <div className={cardCls}>
      <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))', marginBottom: 16 }}>{t('budget.dashboard.categoryBreakdown')}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <PieChart segments={segments} size={180} totalLabel={formatMoney(total, currency, locale)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 120 }}>
          {segments.map(seg => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
            return (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
                <span className="text-content" style={{ fontSize: 'calc(12px * var(--fs-scale-body, 1))', flex: 1 }}>{seg.label}</span>
                <span className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))' }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}