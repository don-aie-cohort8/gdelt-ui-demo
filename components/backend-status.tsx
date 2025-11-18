/**
 * Backend Status Indicator Component
 *
 * Displays real-time connection status to the LangGraph Server backend.
 * Shows online/offline status with automatic polling every 30 seconds.
 */

"use client"

import { Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useBackendHealth, getStatusMessage, getStatusVariant } from "@/hooks/use-backend-health"
import { config } from "@/lib/api-client"

interface BackendStatusProps {
  /** Polling interval in milliseconds (default: 30000) */
  pollInterval?: number
  /** Show detailed hover card (default: true) */
  showDetails?: boolean
  /** Compact mode (icon only, default: false) */
  compact?: boolean
}

export function BackendStatus({
  pollInterval = 30000,
  showDetails = true,
  compact = false,
}: BackendStatusProps) {
  const status = useBackendHealth({ pollInterval })

  // Select icon based on status
  const StatusIcon = status.checking && !status.lastCheck
    ? Loader2
    : status.isOnline
    ? CheckCircle2
    : AlertCircle

  const iconClassName = status.checking && !status.lastCheck ? "animate-spin" : ""

  const content = (
    <Badge
      variant={getStatusVariant(status)}
      className="flex items-center gap-1.5 transition-colors"
    >
      <Activity className="h-3 w-3" />
      {!compact && (
        <>
          <StatusIcon className={`h-3 w-3 ${iconClassName}`} />
          <span className="text-xs font-medium">
            {status.isOnline ? "Backend Online" : "Backend Offline"}
          </span>
        </>
      )}
      {compact && <StatusIcon className={`h-3 w-3 ${iconClassName}`} />}
    </Badge>
  )

  if (!showDetails) {
    return content
  }

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className="cursor-help">{content}</div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="end">
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-start gap-2">
            <StatusIcon className={`h-5 w-5 mt-0.5 ${iconClassName} ${
              status.isOnline ? "text-green-500" : "text-destructive"
            }`} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">
                {status.isOnline ? "Backend Connected" : "Backend Disconnected"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getStatusMessage(status)}
              </p>
            </div>
          </div>

          {/* Connection Details */}
          <div className="space-y-2 border-t border-border pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Backend URL:</span>
              <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">
                {config.baseUrl}
              </code>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Assistant ID:</span>
              <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">
                {config.assistantId}
              </code>
            </div>
            {status.lastCheck && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last checked:</span>
                <span className="font-medium text-foreground">
                  {status.lastCheck.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {/* Error Details */}
          {!status.isOnline && status.error && (
            <div className="border-t border-border pt-2">
              <p className="text-xs text-destructive">
                <strong>Error:</strong> {status.error}
              </p>
            </div>
          )}

          {/* Troubleshooting Tips */}
          {!status.isOnline && (
            <div className="border-t border-border pt-2 space-y-1">
              <p className="text-xs font-semibold text-foreground">Troubleshooting:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Ensure the LangGraph server is running</li>
                <li>Check: <code className="text-[10px] bg-muted px-1 py-0.5 rounded">langgraph dev</code></li>
                <li>Verify backend URL in <code className="text-[10px] bg-muted px-1 py-0.5 rounded">.env.local</code></li>
                <li>Test: <code className="text-[10px] bg-muted px-1 py-0.5 rounded">curl {config.baseUrl}/ok</code></li>
              </ul>
            </div>
          )}

          {/* Polling Info */}
          <div className="border-t border-border pt-2">
            <p className="text-[10px] text-muted-foreground">
              Status updates every {pollInterval / 1000} seconds
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
