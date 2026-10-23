import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfigStatus {
  isConfigured: boolean
  urlConfigured: boolean
  keyConfigured: boolean
  urlValue?: string
  statusMessage: string
}

export interface ConnectionTestResult {
  ok: boolean
  message: string
  latencyMs?: number
  details?: string
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

/**
 * Checks whether the current environment has valid, non-placeholder Supabase credentials.
 */
export function checkSupabaseConfig(): SupabaseConfigStatus {
  const isPlaceholderUrl =
    !rawUrl ||
    rawUrl.includes('your-project-id') ||
    rawUrl.includes('placeholder') ||
    !rawUrl.startsWith('http')

  const isPlaceholderKey =
    !rawKey ||
    rawKey.includes('your-anon-key') ||
    rawKey.includes('your-public-client-key') ||
    rawKey.length < 20

  const urlConfigured = !isPlaceholderUrl
  const keyConfigured = !isPlaceholderKey
  const isConfigured = urlConfigured && keyConfigured

  let statusMessage = 'Connected to Supabase project'
  if (!urlConfigured && !keyConfigured) {
    statusMessage = 'Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  } else if (!urlConfigured) {
    statusMessage = 'Invalid or missing VITE_SUPABASE_URL'
  } else if (!keyConfigured) {
    statusMessage = 'Invalid or missing VITE_SUPABASE_ANON_KEY'
  }

  return {
    isConfigured,
    urlConfigured,
    keyConfigured,
    urlValue: urlConfigured ? rawUrl : undefined,
    statusMessage,
  }
}

export const configStatus = checkSupabaseConfig()

// Fallback dummy credentials to prevent createClient from throwing at module load time
const activeUrl = configStatus.isConfigured ? rawUrl : 'https://placeholder-brightpath.supabase.co'
const activeKey = configStatus.isConfigured ? rawKey : 'placeholder-anon-key-brightpath-crm-demo-token-1234567890'

/**
 * Single-instance Supabase client for all client-side queries and auth.
 */
export const supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Live round-trip diagnostic probe to test network reachability and key validity.
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const currentStatus = checkSupabaseConfig()
  if (!currentStatus.isConfigured) {
    return {
      ok: false,
      message: 'Configuration pending',
      details: currentStatus.statusMessage,
    }
  }

  const startTime = performance.now()
  try {
    // Probe authentication API which does not depend on database tables being seeded yet
    const { error } = await supabase.auth.getSession()
    const latencyMs = Math.round(performance.now() - startTime)

    if (error) {
      return {
        ok: false,
        message: 'Supabase responded with an error',
        latencyMs,
        details: error.message,
      }
    }

    return {
      ok: true,
      message: 'Connection successful',
      latencyMs,
      details: `Successfully reached Supabase at ${rawUrl}`,
    }
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime)
    const errMessage = err instanceof Error ? err.message : 'Network failure'
    return {
      ok: false,
      message: 'Failed to reach Supabase project',
      latencyMs,
      details: errMessage,
    }
  }
}
