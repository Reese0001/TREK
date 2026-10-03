import { render, screen, waitFor } from '../../../tests/helpers/render'
import { http, HttpResponse } from 'msw'
import { server } from '../../../tests/helpers/msw/server'
import { useTripStore } from '../../store/tripStore'
import { useSettingsStore } from '../../store/settingsStore'
import { resetAllStores, seedStore } from '../../../tests/helpers/store'
import { buildTrip, buildBudgetItem, buildSettings } from '../../../tests/helpers/factories'
import BudgetDashboard from './BudgetDashboard'

beforeEach(() => {
  resetAllStores()
  server.use(
    http.get('/api/trips/:id/budget/settlement', () =>
      HttpResponse.json({ balances: [], flows: [], settlements: [], finalBudgets: [] })
    ),
  )
  seedStore(useSettingsStore, { settings: buildSettings({ default_currency: 'EUR' }) })
})

describe('BudgetDashboard', () => {
  it('renders empty state when no budget items', async () => {
    seedStore(useTripStore, { trip: buildTrip({ id: 1, currency: 'EUR' }), budgetItems: [] })
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('No expense data yet.')).toBeInTheDocument()
  })

  it('renders dashboard title and budget vs actual section', async () => {
    seedStore(useTripStore, {
      trip: buildTrip({ id: 1, currency: 'EUR' }),
      budgetItems: [
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Lunch', total_price: 50, expense_date: '2025-03-01' }),
      ],
    })
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('Budget Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Budget vs Actual')).toBeInTheDocument()
  })

  it('renders category breakdown section', async () => {
    seedStore(useTripStore, {
      trip: buildTrip({ id: 1, currency: 'EUR' }),
      budgetItems: [
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Dinner', total_price: 80, expense_date: '2025-03-02' }),
        buildBudgetItem({ trip_id: 1, category: 'Transport', name: 'Taxi', total_price: 30, expense_date: '2025-03-02' }),
      ],
    })
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('Category Breakdown')).toBeInTheDocument()
  })

  it('renders daily spending section', async () => {
    seedStore(useTripStore, {
      trip: buildTrip({ id: 1, currency: 'EUR' }),
      budgetItems: [
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Day 1', total_price: 40, expense_date: '2025-03-01' }),
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Day 2', total_price: 60, expense_date: '2025-03-02' }),
      ],
    })
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('Daily Spending')).toBeInTheDocument()
  })

  it('renders settlement advice section', async () => {
    seedStore(useTripStore, {
      trip: buildTrip({ id: 1, currency: 'EUR' }),
      budgetItems: [
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Meal', total_price: 100, expense_date: '2025-03-01' }),
      ],
    })
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('Settlement Advice')).toBeInTheDocument()
  })

  it('shows settlement flows when provided by API', async () => {
    seedStore(useTripStore, {
      trip: buildTrip({ id: 1, currency: 'EUR' }),
      budgetItems: [
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Meal', total_price: 100, expense_date: '2025-03-01' }),
      ],
    })
    server.use(
      http.get('/api/trips/1/budget/settlement', () =>
        HttpResponse.json({
          balances: [
            { user_id: 1, username: 'Alice', avatar_url: null, balance: 50 },
            { user_id: 2, username: 'Bob', avatar_url: null, balance: -50 },
          ],
          flows: [{ from: { user_id: 2, username: 'Bob' }, to: { user_id: 1, username: 'Alice' }, amount: 50 }],
          settlements: [],
          finalBudgets: [],
        })
      ),
    )
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('Settlement Advice')).toBeInTheDocument()
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(2)
  })

  it('shows no settlement message when API returns empty', async () => {
    seedStore(useTripStore, {
      trip: buildTrip({ id: 1, currency: 'EUR' }),
      budgetItems: [
        buildBudgetItem({ trip_id: 1, category: 'Food', name: 'Meal', total_price: 50, expense_date: '2025-03-01' }),
      ],
    })
    render(<BudgetDashboard tripId={1} />)
    expect(await screen.findByText('Settlement Advice')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('No settlement data.')).toBeInTheDocument()
    })
  })
})