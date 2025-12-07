"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/store"

interface UseProductsRealtimeReturn {
  products: Product[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook untuk subscribe ke perubahan products secara real-time
 * Menggunakan Supabase Realtime untuk update otomatis tanpa reload
 */
export function useProductsRealtime(): UseProductsRealtimeReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // Fetch initial products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setProducts(data || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch products")
      setError(error)
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Fetch initial data
    fetchProducts()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "products",
        },
        (payload) => {
          console.log("Products change received:", payload.eventType, payload)

          // Handle different event types
          if (payload.eventType === "INSERT") {
            setProducts((prev) => {
              // Check if product already exists (avoid duplicates)
              const exists = prev.some((p) => p.id === payload.new.id)
              if (exists) return prev
              // Add new product at the beginning (newest first)
              return [payload.new as Product, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev.map((product) => (product.id === payload.new.id ? (payload.new as Product) : product))
            )
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) => prev.filter((product) => product.id !== payload.old.id))
          }

          // Refetch to ensure data consistency (optional, but safer)
          // fetchProducts()
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to products changes")
        } else if (status === "CHANNEL_ERROR") {
          console.error("Channel error, attempting to reconnect...")
          setError(new Error("Connection error. Please refresh the page."))
        } else if (status === "TIMED_OUT") {
          console.error("Connection timed out, attempting to reconnect...")
          setError(new Error("Connection timed out. Please refresh the page."))
        } else if (status === "CLOSED") {
          console.warn("Channel closed")
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up products subscription")
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchProducts])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  }
}
