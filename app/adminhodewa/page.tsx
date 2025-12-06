"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { verifyAdminPassword, setAdminLoggedIn, isAdminLoggedIn } from "@/lib/store"
import { AdminDashboard } from "@/components/admin/dashboard"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoggedIn(isAdminLoggedIn())
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyAdminPassword(password)) {
      setAdminLoggedIn(true)
      setIsLoggedIn(true)
      setError("")
    } else {
      setError("Password salah!")
    }
  }

  const handleLogout = () => {
    setAdminLoggedIn(false)
    setIsLoggedIn(false)
    setPassword("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isLoggedIn) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Admin Panel</h1>
          <p className="text-white/60 text-center mb-8">Masukkan password untuk melanjutkan</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  )
}
