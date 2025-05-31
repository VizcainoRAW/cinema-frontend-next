'use client'
import React, { useState, useEffect } from 'react'
import styles from './page.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Fix hydration issues by only rendering after client-side mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      const loginData: LoginRequest = {
        email,
        password
      }

      const response = await fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password')
        } else if (response.status === 404) {
          throw new Error('User not found')
        } else {
          throw new Error('Login failed. Please try again.')
        }
      }

      const userData: LoginResponse = await response.json()
      
      // Store user data in session storage instead of localStorage to avoid hydration issues
      sessionStorage.setItem('user', JSON.stringify(userData))
      sessionStorage.setItem('isLoggedIn', 'true')
      
      // Redirect to movies page
      router.push('/movies')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Prevent hydration mismatch by showing loading until mounted
  if (!isMounted) {
    return (
      <div className={styles.container}>
        <h2 className={styles.subtitle}>Login</h2>
        <div className={styles.form}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Login</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="email"
          suppressHydrationWarning={true}
        />
        
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="current-password"
          suppressHydrationWarning={true}
        />
        
        <button 
          type="submit" 
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className={styles.demoNote}>
          <p>Demo Login:</p>
          <p><strong>Email:</strong> miguel@mail.com</p>
          <p><strong>Password:</strong> StrongPassword123</p>
        </div>
        
        <div className={styles.registerLink}>
          Don't have an account? <Link href="/register">Register here</Link>
        </div>
      </form>
    </div>
  )
}

export default LoginPage