import React from 'react'
import {
  Search,
  X,
  Filter,
  RotateCcw,
  ArrowUpDown,
  UserCheck,
  Tag,
  Radio,
} from 'lucide-react'
import type { LeadFilterState, LeadStatus, LeadSource } from '../../types/leads'
import type { UserRole } from '../../types/auth'
import { Button } from '../../components/ui/Button'

export interface LeadFilterBarProps {
  filters: LeadFilterState
  onFilterChange: (filters: LeadFilterState) => void
  onResetFilters: () => void
  counsellors: { id: string; full_name: string }[]
  userRole: UserRole
  totalCount: number
  filteredCount: number
}

const STATUS_OPTIONS: { label: string; value: LeadStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Qualified', value: 'Qualified' },
  { label: 'Converted', value: 'Converted' },
  { label: 'Lost', value: 'Lost' },
]

const SOURCE_OPTIONS: { label: string; value: LeadSource | 'all' }[] = [
  { label: 'All Sources', value: 'all' },
  { label: 'Website', value: 'Website' },
  { label: 'Phone Call', value: 'Phone Call' },
  { label: 'WhatsApp', value: 'WhatsApp' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Walk-in', value: 'Walk-in' },
  { label: 'Other', value: 'Other' },
]

export function LeadFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  counsellors,
  userRole,
  totalCount,
  filteredCount,
}: LeadFilterBarProps) {
  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.source !== 'all' ? 1 : 0) +
    (filters.assignedTo !== 'all' ? 1 : 0)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    })
  }

  const handleClearSearch = () => {
    onFilterChange({
      ...filters,
      searchQuery: '',
    })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value as LeadStatus | 'all',
    })
  }

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      source: e.target.value as LeadSource | 'all',
    })
  }

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      assignedTo: e.target.value,
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    let sortBy: 'created_at' | 'full_name' | 'status' = 'created_at'
    let sortOrder: 'asc' | 'desc' = 'desc'

    if (val === 'date_desc') {
      sortBy = 'created_at'
      sortOrder = 'desc'
    } else if (val === 'date_asc') {
      sortBy = 'created_at'
      sortOrder = 'asc'
    } else if (val === 'name_asc') {
      sortBy = 'full_name'
      sortOrder = 'asc'
    } else if (val === 'name_desc') {
      sortBy = 'full_name'
      sortOrder = 'desc'
    } else if (val === 'status') {
      sortBy = 'status'
      sortOrder = 'asc'
    }

    onFilterChange({
      ...filters,
      sortBy,
      sortOrder,
    })
  }

  const currentSortVal =
    filters.sortBy === 'created_at'
      ? filters.sortOrder === 'desc'
        ? 'date_desc'
        : 'date_asc'
      : filters.sortBy === 'full_name'
      ? filters.sortOrder === 'asc'
        ? 'name_asc'
        : 'name_desc'
      : 'status'

  return (
    <div className="lead-filter-bar-card">
      <div className="filter-bar-top-row">
        {/* Real-Time Live Search Input */}
        <div className="lead-search-wrapper">
          <Search size={16} className="lead-search-icon" />
          <input
            type="text"
            className="lead-search-input"
            placeholder="Search by student name, phone, email, course..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            aria-label="Search leads"
          />
          {filters.searchQuery && (
            <button
              type="button"
              className="lead-search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Lead Count Pill */}
        <div className="lead-counter-badge">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> leads
        </div>
      </div>

      {/* Multi-Attribute Dropdowns Row */}
      <div className="filter-bar-dropdowns-row">
        {/* Status Dropdown */}
        <div className="filter-select-group">
          <Tag size={13} className="select-icon" />
          <select
            className={`filter-select ${filters.status !== 'all' ? 'active-filter' : ''}`}
            value={filters.status}
            onChange={handleStatusChange}
            aria-label="Filter by Lead Status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Dropdown */}
        <div className="filter-select-group">
          <Radio size={13} className="select-icon" />
          <select
            className={`filter-select ${filters.source !== 'all' ? 'active-filter' : ''}`}
            value={filters.source}
            onChange={handleSourceChange}
            aria-label="Filter by Lead Source"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter (Only for Manager / Admin) */}
        {userRole !== 'counsellor' ? (
          <div className="filter-select-group">
            <UserCheck size={13} className="select-icon" />
            <select
              className={`filter-select ${filters.assignedTo !== 'all' ? 'active-filter' : ''}`}
              value={filters.assignedTo}
              onChange={handleAssigneeChange}
              aria-label="Filter by Counsellor"
            >
              <option value="all">All Counsellors</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="counsellor-scope-indicator" title="Counsellor role is scoped to your assigned leads">
            <UserCheck size={13} />
            <span>Scoped to My Leads</span>
          </div>
        )}

        {/* Sort Selector */}
        <div className="filter-select-group sort-group">
          <ArrowUpDown size={13} className="select-icon" />
          <select
            className="filter-select"
            value={currentSortVal}
            onChange={handleSortChange}
            aria-label="Sort leads by"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name (A → Z)</option>
            <option value="name_desc">Name (Z → A)</option>
            <option value="status">Lead Status</option>
          </select>
        </div>

        {/* Reset Filters Action Button */}
        {activeFiltersCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="reset-filters-btn"
          >
            <RotateCcw size={13} />
            <span>Reset ({activeFiltersCount})</span>
          </Button>
        )}
      </div>
    </div>
  )
}
