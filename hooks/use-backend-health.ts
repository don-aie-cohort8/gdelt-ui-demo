/**
 * Custom hook for monitoring backend health status
 *
 * Polls the LangGraph Server /ok endpoint at regular intervals
 * to track connection status and provide real-time feedback to users.
 */

import { useEffect, useState } from "react"
import { healthCheck } from "@/lib/api-client"

export interface BackendHealthStatus {
  /** Whether the backend is currently reachable and responding */
  isOnline: boolean
  /** Timestamp of the last successful health check */
  lastCheck: Date | null
  /** Error message if the backend is offline */
  error: string | null
  /** Whether a health check is currently in progress */
  checking: boolean
}

interface UseBackendHealthOptions {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  pollInterval?: number
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean
}

/**
 * Monitor backend health status with automatic polling
 *
 * @example
 * ```tsx
 * function BackendStatus() {
 *   const { isOnline, lastCheck, error } = useBackendHealth({ pollInterval: 30000 })
 *   return <Badge>{isOnline ? 'Online' : 'Offline'}</Badge>
 * }
 * ```
 */
export function useBackendHealth(options: UseBackendHealthOptions = {}) {
  const { pollInterval = 30000, enabled = true } = options

  const [status, setStatus] = useState<BackendHealthStatus>({
    isOnline: false,
    lastCheck: null,
    error: null,
    checking: false,
  })

  useEffect(() => {
    if (!enabled) return

    let mounted = true
    let timeoutId: NodeJS.Timeout

    const checkHealth = async () => {
      if (!mounted) return

      setStatus((prev) => ({ ...prev, checking: true }))

      try {
        await healthCheck()

        if (mounted) {
          setStatus({
            isOnline: true,
            lastCheck: new Date(),
            error: null,
            checking: false,
          })
        }
      } catch (error) {
        if (mounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unable to connect to backend server"

          setStatus({
            isOnline: false,
            lastCheck: new Date(),
            error: errorMessage,
            checking: false,
          })
        }
      }

      // Schedule next check
      if (mounted) {
        timeoutId = setTimeout(checkHealth, pollInterval)
      }
    }

    // Initial check
    checkHealth()

    // Cleanup
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [pollInterval, enabled])

  return status
}

/**
 * Get a human-readable status message
 */
export function getStatusMessage(status: BackendHealthStatus): string {
  if (status.checking && !status.lastCheck) {
    return "Checking backend connection..."
  }

  if (status.isOnline) {
    return "Backend connected"
  }

  if (status.error) {
    return `Backend offline: ${status.error}`
  }

  return "Backend connection unavailable"
}

/**
 * Get a color variant for status display
 */
export function getStatusVariant(
  status: BackendHealthStatus
): "default" | "secondary" | "destructive" | "outline" {
  if (status.checking && !status.lastCheck) {
    return "outline"
  }

  if (status.isOnline) {
    return "default" // Primary color (green in most themes)
  }

  return "destructive" // Red for offline
}
