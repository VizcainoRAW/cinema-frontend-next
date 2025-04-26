import React from 'react'
import styles from './page.module.css'
import Link from 'next/link';

const LoginPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CINE</h1>
      <h2 className={styles.subtitle}>Login</h2>
      <div className={styles.form}>
          <p className={styles.notes}>This is a demo, the login does not work Press <b>continue</b> to see the app</p>
        <input
          type="text"
          placeholder="Username"
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
        />
          <Link href="/movies" className={styles.continueLink}>
            Continue
          </Link>
      </div>
    </div>
  )
}

export default LoginPage
