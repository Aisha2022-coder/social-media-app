"use client"

import { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await axios.post("/auth/signup", form)
      showToast("Signup successful! Please login.", "success")
      router.push("/login")
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Signup failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold">Create an Account</h2>

        <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
        <Input
          id="username"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <label htmlFor="email" className="block text-sm font-medium mb-1 mt-2">Email</label>
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

        <Button onClick={handleSubmit} disabled={loading} className="w-full" aria-label="Sign Up">
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  )
}
