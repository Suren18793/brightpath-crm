import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserPlus,
  RefreshCw,
  Database,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { leadsService } from '../../services/leadsService'
import type { Lead, LeadFilterState, LeadStats } from '../../types/leads'
import { INITIAL_LEAD_FILTERS } from '../../types/leads'
import { LeadFilterBar } from './LeadFilterBar'
import { LeadTable } from './LeadTable'
import { LeadCardMobile } from './LeadCardMobile'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export interface LeadListViewProps {
  onQuickNewLead?: () => void
  onSelectLead?: (lead: Lead) => void
}

export function LeadListView({ onQuickNewLead, onSelectLead }: LeadListViewProps) {
  const { role, user, isWorkshopMode } = useAuth()

  const [leads, setLeads] = useState<Lead[]>([])
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0)
  const [counsellors, setCounsellors] = useState<{ id: string; full_name: string }[]>([])
  const [filters, setFilters] = useState<LeadFilterState>(INITIAL_LEAD_FILTERS)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false)
  const [schemaMissingNotice, setSchemaMissingNotice] = useState<boolean>(false)
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    convertedCount: 0,
    lostCount: 0,
  })

  // Load counsellor list on mount
  useEffect(() => {
    leadsService.getCounsellors().then(setCounsellors)
  }, [])

  // Fetch leads based on active filters & role
  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await leadsService.getLeads(filters, role, user?.id)
      setLeads(res.leads)
      setIsDemoFallback(res.isDemoFallback)
      setSchemaMissingNotice(Boolean(res.schemaMissingNotice))

      // Also get unfiltered total for counter
      const allRes = await leadsService.getLeads(
        { ...INITIAL_LEAD_FILTERS, searchQuery: '' },
        role,
        user?.id
      )
      setTotalLeadsCount(allRes.leads.length)
      setStats(leadsService.getLeadStats(allRes.leads))
    } catch (err) {
      console.error('[LeadListView] Error loading leads:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters, role, user?.id])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleResetFilters = () => {
    setFilters(INITIAL_LEAD_FILTERS)
  }

  const handleStatusQuickFilter = (status: 'all' | 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost') => {
    setFilters((prev) => ({
      ...prev,
      status,
    }))
  }

  return (
    <div className="lead-list-view-container">
      {/* Missing Schema Diagnostic Ribbon */}
      {schemaMissingNotice && (
        <div className="schema-notice-banner">
          <div className="notice-icon-box">
            <Database size={16} className="text-amber-600" />
          </div>
          <div className="notice-content">
            <strong>Supabase Connected — Database Migration Required</strong>
            <p>
              Your Supabase credentials are valid! To enable live database queries, run the SQL migrations from{' '}
              <code>supabase/migrations/</code> in your Supabase SQL Editor. The CRM is currently displaying sample demo data.
            </p>
          </div>
        </div>
      )}

      {/* Main View Header */}
      <div className="lead-view-header">
        <div className="lead-view-title-box">
          <div className="title-row">
            <h2 className="lead-view-title">Student Enquiries & Leads</h2>
            {isDemoFallback && (
              <span className="demo-data-pill">
                <Sparkles size={11} /> Demo Data Active
              </span>
            )}
          </div>
          <p className="lead-view-subtitle">
            {role === 'counsellor'
              ? 'Viewing your assigned student admissions pipeline and follow-ups.'
              : 'Complete academy enquiry pipeline across all counsellors and courses.'}
          </p>
        </div>

        <div className="lead-view-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLeads}
            disabled={isLoading}
            className="refresh-btn"
            title="Refresh Leads"
          >
            <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </Button>

          {onQuickNewLead && (
            <Button
              variant="primary"
              size="sm"
              onClick={onQuickNewLead}
              className="new-lead-main-btn"
            >
              <UserPlus size={15} />
              <span>+ New Lead</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Status Filter Tabs Bar */}
      <div className="status-metric-chips-bar">
        <button
          type="button"
          className={`status-metric-chip ${filters.status === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusQuickFilter('all')}
        >
          <span className="chip-label">Total Leads</span>
          <span className="chip-count">{stats.total}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-new ${filters.status === 'New' ? 'active' : ''}`}
          onClick={() => handleStatusQuickFilter('New')}
        >
          <span className="chip-label">New</span>
          <span className="chip-count">{stats.newCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-contacted ${filters.status === 'Contacted' ? 'active' : ''}`}
          onClick={() => handleStatusQuickFilter('Contacted')}
        >
          <span className="chip-label">Contacted</span>
          <span className="chip-count">{stats.contactedCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-qualified ${filters.status === 'Qualified' ? 'active' : ''}`}
          onClick={() => handleStatusQuickFilter('Qualified')}
        >
          <span className="chip-label">Qualified</span>
          <span className="chip-count">{stats.qualifiedCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-converted ${filters.status === 'Converted' ? 'active' : ''}`}
          onClick={() => handleStatusQuickFilter('Converted')}
        >
          <span className="chip-label">Converted</span>
          <span className="chip-count">{stats.convertedCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-lost ${filters.status === 'Lost' ? 'active' : ''}`}
          onClick={() => handleStatusQuickFilter('Lost')}
        >
          <span className="chip-label">Lost</span>
          <span className="chip-count">{stats.lostCount}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <LeadFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        counsellors={counsellors}
        userRole={role}
        totalCount={totalLeadsCount}
        filteredCount={leads.length}
      />

      {/* Desktop Responsive Table */}
      <div className="desktop-table-wrapper">
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          onSelectLead={onSelectLead}
        />
      </div>

      {/* Mobile Card Layout (<768px) */}
      <div className="mobile-cards-wrapper">
        <LeadCardMobile
          leads={leads}
          isLoading={isLoading}
          onResetFilters={handleResetFilters}
          onSelectLead={onSelectLead}
        />
      </div>
    </div>
  )
}
