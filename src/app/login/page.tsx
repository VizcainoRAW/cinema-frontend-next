import React from 'react'
import styles from './page.module.css'

const LoginPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CINE</h1>
      <h2 className={styles.subtitle}>Login</h2>
      <div className={styles.form}>
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
        <button className={styles.button}>
          Submit
        </button>
      </div>
    </div>
  )
}

export default LoginPage
