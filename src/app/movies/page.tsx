'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

interface Movie {
  id: number
  name: string
  imagePath: string
  genre?: string
  rating?: string
  duration?: string
  description?: string
}

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
}

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Mock data for demonstration (replace with API call)
  const mockMovies: Movie[] = [
    {
      id: 1,
      name: "John Wick 4",
      imagePath: "/images/john-wick-4.jpg",
      genre: "Action",
      rating: "R",
      duration: "169 min",
      description: "John Wick uncovers a path to defeating The High Table."
    },
    {
      id: 2,
      name: "Dune: Part Two",
      imagePath: "/images/dune-2.jpg",
      genre: "Sci-Fi",
      rating: "PG-13",
      duration: "166 min",
      description: "Paul Atreides unites with Chani and the Fremen."
    },
    {
      id: 3,
      name: "Inside Out 2",
      imagePath: "/images/inside-out-2.jpg",
      genre: "Animation",
      rating: "PG",
      duration: "96 min",
      description: "Riley enters puberty and new emotions take control."
    },
    {
      id: 4,
      name: "Bad Boys: Ride or Die",
      imagePath: "/images/bad-boys-4.jpg",
      genre: "Action",
      rating: "R",
      duration: "115 min",
      description: "Miami's finest are now Miami's most wanted."
    },
    {
      id: 5,
      name: "Wicked",
      imagePath: "/images/wicked.jpg",
      genre: "Musical",
      rating: "PG",
      duration: "160 min",
      description: "The untold story of the witches of Oz."
    },
    {
      id: 6,
      name: "Gladiator II",
      imagePath: "/images/gladiator-2.jpg",
      genre: "Action",
      rating: "R",
      duration: "148 min",
      description: "Lucius follows in his father's footsteps."
    }
  ]

  useEffect(() => {
    // Check if user is logged in
    const userData = sessionStorage.getItem('user')
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    
    if (!userData || !isLoggedIn) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    loadMovies()
  }, [router])

  const loadMovies = async () => {
    try {
      // Try to fetch from your Spring Boot API
      const response = await fetch('http://localhost:8080/api/movie')
      
      if (response.ok) {
        const apiMovies = await response.json()
        setMovies(apiMovies)
      } else {
        // Fallback to mock data if API is not available
        console.log('API not available, using mock data')
        setMovies(mockMovies)
      }
    } catch (err) {
      console.log('API not available, using mock data')
      setMovies(mockMovies)
    } finally {
      setLoading(false)
    }
  }

  const handleTakeASeat = (movieId: number, movieName: string) => {
    // Store selected movie data for the seat selection page
    sessionStorage.setItem('selectedMovie', JSON.stringify({
      id: movieId,
      name: movieName
    }))
    
    // Navigate to seat selection page
    router.push(`/seats/${movieId}`)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('isLoggedIn')
    sessionStorage.removeItem('selectedMovie')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading movies...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Movies</h1>
        <div className={styles.userInfo}>
          <span className={styles.welcome}>
            Welcome, <b>{user?.firstName} {user?.lastName}</b>
          </span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.subtitle}>Now Showing</h2>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.moviesGrid}>
          {movies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.movieImageContainer}>
                <img 
                  src={movie.imagePath} 
                  alt={movie.name}
                  className={styles.movieImage}
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.currentTarget.src = 'https://via.placeholder.com/300x450/27AE60/FFFFFF?text=' + encodeURIComponent(movie.name)
                  }}
                />
                <div className={styles.overlay}>
                  <button 
                    className={styles.takeASeatBtn}
                    onClick={() => handleTakeASeat(movie.id, movie.name)}
                  >
                    Take a Seat
                  </button>
                </div>
              </div>
              
              <div className={styles.movieInfo}>
                <h3 className={styles.movieTitle}>{movie.name}</h3>
                {movie.genre && (
                  <div className={styles.movieDetails}>
                    <span className={styles.genre}>{movie.genre}</span>
                    {movie.rating && <span className={styles.rating}>{movie.rating}</span>}
                    {movie.duration && <span className={styles.duration}>{movie.duration}</span>}
                  </div>
                )}
                {movie.description && (
                  <p className={styles.movieDescription}>{movie.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {movies.length === 0 && !loading && (
          <div className={styles.noMovies}>
            <p>No movies available at the moment.</p>
            <button onClick={loadMovies} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default MoviesPage