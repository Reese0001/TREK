import { useTranslation } from '../../i18n'
import { formatMoney } from '../../utils/formatters'
import type { SettlementFlow, SettlementBalance } from './useBudgetDashboard'

interface Props {
  flows: SettlementFlow[]
  balances: SettlementBalance[]
  currency: string
  locale: string
  loading: boolean
}

const cardCls = 'bg-surface-card rounded-xl border border-edge-faint p-5'
const titleCls = 'text-content font-semibold'
const labelCls = 'text-content-muted'

export default function DashboardSettlement({ flows, balances, currency, locale, loading }: Props) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className={cardCls}>
        <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))' }}>{t('budget.dashboard.settlementAdvice')}</h3>
        <div className="bg-surface-secondary animate-pulse" style={{ height: 60, borderRadius: 8, marginTop: 12 }} />
      </div>
    )
  }

  if (flows.length === 0 && balances.length === 0) {
    return (
      <div className={cardCls}>
        <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))' }}>{t('budget.dashboard.settlementAdvice')}</h3>
        <p className={labelCls} style={{ marginTop: 8, fontSize: 'calc(13px * var(--fs-scale-body, 1))' }}>{t('budget.dashboard.noSettlement')}</p>
      </div>
    )
  }

  return (
    <div className={cardCls}>
      <h3 className={titleCls} style={{ fontSize: 'calc(15px * var(--fs-scale-subtitle, 1))', marginBottom: 16 }}>{t('budget.dashboard.settlementAdvice')}</h3>

      {flows.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{t('costs.settleUp')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {flows.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'calc(12px * var(--fs-scale-body, 1))' }}>
                <span className="text-content" style={{ fontWeight: 500 }}>{f.fromName}</span>
                <span className={labelCls}>→</span>
                <span className="text-content" style={{ fontWeight: 500 }}>{f.toName}</span>
                <span className="text-content" style={{ marginLeft: 'auto', fontWeight: 600 }}>{formatMoney(f.amount, currency, locale)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {balances.length > 0 && (
        <div>
          <div className={labelCls} style={{ fontSize: 'calc(11px * var(--fs-scale-caption, 1))', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{t('budget.dashboard.netBalance')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {balances.map(b => (
              <div key={b.userId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'calc(12px * var(--fs-scale-body, 1))' }}>
                <span className="text-content" style={{ fontWeight: 500 }}>{b.username}</span>
                <span className={b.balance >= 0 ? 'text-content' : 'text-[#ef4444]'} style={{ marginLeft: 'auto', fontWeight: 600 }}>
                  {formatMoney(b.balance, currency, locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}