import { useEffect, useMemo, useState, useCallback } from 'react'
import type { BudgetItem } from '../../types'
import { budgetApi } from '../../api/client'
import { useExchangeRates, convertBooked } from '../../hooks/useExchangeRates'
import { catMeta } from './costsCategories'
import type { CostCategory } from '@trek/shared'

export interface CategoryAgg {
  category: CostCategory
  planned: number
  actual: number
  color: string
  labelKey: string
}

export interface DailyAgg {
  date: string
  amount: number
}

export interface SettlementFlow {
  fromUserId: number
  fromName: string
  toUserId: number
  toName: string
  amount: number
}

export interface SettlementBalance {
  userId: number
  username: string
  avatarUrl: string | null
  balance: number
}

export interface BudgetDashboardData {
  categories: CategoryAgg[]
  daily: DailyAgg[]
  totalPlanned: number
  totalActual: number
  totalRemaining: number
  flows: SettlementFlow[]
  balances: SettlementBalance[]
  settlementCurrency: string | null
  hasData: boolean
  loading: boolean
}

interface SettlementResponse {
  balances?: { user_id: number; username: string; avatar_url: string | null; balance: number }[]
  flows?: { from: { user_id: number; username: string }; to: { user_id: number; username: string }; amount: number }[]
  currency?: string
}

function isItemPaid(item: BudgetItem): boolean {
  if (item.payers && item.payers.length > 0) return true
  if (item.members && item.members.length > 0) return item.members.every(m => m.paid === 1)
  return item.paid_by_user_id != null
}

export function useBudgetDashboard(
  tripId: number,
  budgetItems: BudgetItem[],
  displayCurrency: string,
  tripCurrency: string,
): BudgetDashboardData {
  const base = (displayCurrency || 'EUR').toUpperCase()
  const trip = (tripCurrency || base).toUpperCase()
  const { convert, displayPerTrip } = useExchangeRates(base, trip)

  const baseTotal = useCallback(
    (item: BudgetItem): number => convertBooked(item.total_price, item.currency, item.exchange_rate, trip, convert),
    [convert, trip],
  )

  const [settlement, setSettlement] = useState<SettlementResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    budgetApi
      .settlement(tripId, base, base !== trip ? displayPerTrip : null)
      .then((data: SettlementResponse) => {
        if (!cancelled) setSettlement(data)
      })
      .catch(() => {
        if (!cancelled) setSettlement(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tripId, base, trip, displayPerTrip])

  const { categories, daily, totalPlanned, totalActual } = useMemo(() => {
    const catMap = new Map<CostCategory, { planned: number; actual: number }>()
    const dayMap = new Map<string, number>()

    for (const item of budgetItems) {
      const meta = catMeta(item.category)
      const amount = baseTotal(item)
      const existing = catMap.get(meta.key) ?? { planned: 0, actual: 0 }
      existing.planned += amount
      if (isItemPaid(item)) existing.actual += amount
      catMap.set(meta.key, existing)

      if (item.expense_date) {
        dayMap.set(item.expense_date, (dayMap.get(item.expense_date) ?? 0) + amount)
      }
    }

    const cats: CategoryAgg[] = Array.from(catMap.entries())
      .map(([key, val]) => {
        const meta = catMeta(key)
        return {
          category: key,
          planned: val.planned,
          actual: val.actual,
          color: meta.color,
          labelKey: meta.labelKey,
        }
      })
      .filter(c => c.planned !== 0 || c.actual !== 0)
      .sort((a, b) => b.planned - a.planned)

    const days: DailyAgg[] = Array.from(dayMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const planned = cats.reduce((s, c) => s + c.planned, 0)
    const actual = cats.reduce((s, c) => s + c.actual, 0)

    return { categories: cats, daily: days, totalPlanned: planned, totalActual: actual }
  }, [budgetItems, baseTotal])

  const flows = useMemo<SettlementFlow[]>(
    () =>
      (settlement?.flows ?? []).map(f => ({
        fromUserId: f.from.user_id,
        fromName: f.from.username,
        toUserId: f.to.user_id,
        toName: f.to.username,
        amount: f.amount,
      })),
    [settlement],
  )

  const balances = useMemo<SettlementBalance[]>(
    () =>
      (settlement?.balances ?? []).map(b => ({
        userId: b.user_id,
        username: b.username,
        avatarUrl: b.avatar_url,
        balance: b.balance,
      })),
    [settlement],
  )

  return {
    categories,
    daily,
    totalPlanned,
    totalActual,
    totalRemaining: totalPlanned - totalActual,
    flows,
    balances,
    settlementCurrency: settlement?.currency ?? null,
    hasData: budgetItems.length > 0,
    loading,
  }
}