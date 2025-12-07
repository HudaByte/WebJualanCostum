"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SiteSettings } from "@/lib/store"

const defaultSettings: SiteSettings = {
  siteName: "HudzStore",
  tagline: "Produk Digital Terbaik",
  communityLink: "https://t.me/yourgroup",
  heroTitle: "Produk Digital Premium",
  heroSubtitle: "Temukan berbagai produk digital berkualitas dengan harga terjangkau",
}

interface UseSettingsRealtimeReturn {
  settings: SiteSettings
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook untuk subscribe ke perubahan site_settings secara real-time
 * Menggunakan Supabase Realtime untuk update otomatis tanpa reload
 */
export function useSettingsRealtime(): UseSettingsRealtimeReturn {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // Fetch initial settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase.from("site_settings").select("key, value")

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const newSettings = { ...defaultSettings }
      if (data) {
        data.forEach((row: { key: string; value: string }) => {
          if (row.key in newSettings) {
            ;(newSettings as Record<string, string>)[row.key] = row.value
          }
        })
      }

      setSettings(newSettings)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch settings")
      setError(error)
      console.error("Error fetching settings:", error)
      // Use default settings on error
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Fetch initial data
    fetchSettings()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "site_settings",
        },
        (payload) => {
          console.log("Settings change received:", payload.eventType, payload)

          // Refetch settings when any change occurs
          // This is simpler than manually updating since settings are key-value pairs
          fetchSettings()
        }
      )
      .subscribe((status) => {
        console.log("Settings subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to settings changes")
        } else if (status === "CHANNEL_ERROR") {
          console.error("Settings channel error")
          setError(new Error("Connection error. Settings may not update in real-time."))
        } else if (status === "TIMED_OUT") {
          console.error("Settings connection timed out")
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up settings subscription")
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchSettings])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  }
}
