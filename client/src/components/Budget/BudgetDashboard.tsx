import { useTripStore } from '../../store/tripStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useTranslation } from '../../i18n'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useBudgetDashboard } from './useBudgetDashboard'
import DashboardBudgetVsActual from './DashboardBudgetVsActual'
import DashboardCategoryChart from './DashboardCategoryChart'
import DashboardDailyTrend from './DashboardDailyTrend'
import DashboardSettlement from './DashboardSettlement'

interface BudgetDashboardProps {
  tripId: number
}

export default function BudgetDashboard({ tripId }: BudgetDashboardProps) {
  const { trip, budgetItems } = useTripStore()
  const displayCurrency = useSettingsStore(s => s.settings.default_currency)
  const { t, locale } = useTranslation()
  const isMobile = useIsMobile()

  const base = (displayCurrency || trip?.currency || 'EUR').toUpperCase()
  const tripCurrency = (trip?.currency || base).toUpperCase()

  const data = useBudgetDashboard(tripId, budgetItems, base, tripCurrency)

  if (!data.loading && !data.hasData) {
    return (
      <div className="bg-surface-card rounded-xl border border-edge-faint p-8" style={{ textAlign: 'center' }}>
        <h2 className="text-content font-semibold" style={{ fontSize: 'calc(17px * var(--fs-scale-title, 1))', marginBottom: 8 }}>
          {t('budget.dashboard.title')}
        </h2>
        <p className="text-content-muted" style={{ fontSize: 'calc(13px * var(--fs-scale-body, 1))' }}>
          {t('budget.dashboard.noData')}
        </p>
      </div>
    )
  }

  const gridStyle: React.CSSProperties = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: 16 }
    : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 className="text-content font-semibold" style={{ fontSize: 'calc(17px * var(--fs-scale-title, 1))' }}>
          {t('budget.dashboard.title')}
        </h2>

      </div>

      <div style={gridStyle}>
        <DashboardBudgetVsActual
          categories={data.categories}
          totalPlanned={data.totalPlanned}
          totalActual={data.totalActual}
          totalRemaining={data.totalRemaining}
          currency={data.settlementCurrency || base}
          locale={locale}
        />
        <DashboardCategoryChart
          categories={data.categories}
          currency={data.settlementCurrency || base}
          locale={locale}
        />
        <DashboardDailyTrend
          daily={data.daily}
          currency={data.settlementCurrency || base}
          locale={locale}
        />
        <DashboardSettlement
          flows={data.flows}
          balances={data.balances}
          currency={data.settlementCurrency || base}
          locale={locale}
          loading={data.loading}
        />
      </div>
    </div>
  )
}