/**
 * PIMP Config Loader - pow3r.build
 *
 * Purpose:
 * - Fetches XMAP v7 config from config.superbots.link (PIMP)
 * - Used for PIMP integration and metadata
 *
 * Config: https://config.superbots.link/api/xmap/config/build-v7
 */
const API_BASE = 'https://config.superbots.link/api'
const CONFIG_ID = 'build-v7'

export interface PimpConfig {
  metadata?: Record<string, unknown>
  manifest?: Record<string, unknown>
  nodes?: Array<Record<string, unknown>>
  edges?: Array<Record<string, unknown>>
}

export async function loadPimpConfig(): Promise<PimpConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/xmap/config/${CONFIG_ID}`)
    const json = await res.json() as { success?: boolean; data?: PimpConfig }
    if (json.success && json.data) return json.data
  } catch {
    // PIMP unreachable; app continues with local/default config
  }
  return null
}
