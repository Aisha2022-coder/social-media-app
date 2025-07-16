"use client"

import { useState } from "react"
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, form)
      const { accessToken } = res.data
      localStorage.setItem("token", accessToken) 
      showToast("Login successful!", "success");
      router.push("/timeline")
    } catch (error) {
      showToast((error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold">Login to your account</h2>

        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <label htmlFor="password" className="block text-sm font-medium mb-1 mt-2">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <Button onClick={handleSubmit} disabled={loading} className="w-full" aria-label="Login">
          {loading ? "Logging in..." : "Login"}
        </Button>
        <div className="text-center mt-4 text-sm text-gray-600">
          New here? <Link href="/signup" className="text-blue-600 hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  )
}
