'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

interface SelectedMovie {
  id: number
  name: string
}

interface User {
  id: number
  firstName: string
  lastName: string
}

interface Seat {
  id: string
  row: string
  number: number
  isOccupied: boolean
  isSelected: boolean
  price: number
}

interface TicketRequest {
  seatName: string
  userId: number
  userFullName: string
  movieName: string
  movieId: number
}

const SeatsPage: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<SelectedMovie | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const params = useParams()

  // Cinema configuration
  const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const SEATS_PER_ROW = 12
  const SEAT_PRICE = 12.50

  useEffect(() => {
    // Check authentication and movie selection
    const userData = sessionStorage.getItem('user')
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    const movieData = sessionStorage.getItem('selectedMovie')
    
    if (!userData || !isLoggedIn) {
      router.push('/login')
      return
    }

    if (!movieData) {
      router.push('/movies')
      return
    }

    const parsedUser = JSON.parse(userData)
    const parsedMovie = JSON.parse(movieData)
    
    setUser(parsedUser)
    setSelectedMovie(parsedMovie)
    
    // Initialize seats
    initializeSeats()
    
    // Load existing tickets to mark occupied seats
    loadOccupiedSeats(parsedMovie.id)
  }, [router])

  const initializeSeats = () => {
    const seatArray: Seat[] = []
    
    ROWS.forEach(row => {
      for (let i = 1; i <= SEATS_PER_ROW; i++) {
        seatArray.push({
          id: `${row}${i}`,
          row,
          number: i,
          isOccupied: false,
          isSelected: false,
          price: SEAT_PRICE
        })
      }
    })
    
    setSeats(seatArray)
  }

  const loadOccupiedSeats = async (movieId: number) => {
    try {
      const response = await fetch('http://localhost:8080/api/ticket')
      if (response.ok) {
        const tickets = await response.json()
        const occupiedSeatNames = tickets
          .filter((ticket: any) => ticket.movieId === movieId)
          .map((ticket: any) => ticket.seatName)
        
        setSeats(prevSeats => 
          prevSeats.map(seat => ({
            ...seat,
            isOccupied: occupiedSeatNames.includes(seat.id)
          }))
        )
      }
    } catch (err) {
      console.log('Could not load occupied seats, using mock data')
      // Mock some occupied seats for demonstration
      const mockOccupiedSeats = ['A3', 'A4', 'B7', 'C5', 'C6', 'D10', 'E2', 'F8', 'F9']
      setSeats(prevSeats => 
        prevSeats.map(seat => ({
          ...seat,
          isOccupied: mockOccupiedSeats.includes(seat.id)
        }))
      )
    }
  }

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId)
    if (!seat || seat.isOccupied) return

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === seatId
          ? { ...seat, isSelected: !seat.isSelected }
          : seat
      )
    )
  }

  const handleBookTickets = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat')
      return
    }

    if (!user || !selectedMovie) {
      setError('Missing user or movie information')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const ticketPromises = selectedSeats.map(async (seatName) => {
        const ticketData: TicketRequest = {
          seatName,
          userId: user.id,
          userFullName: `${user.firstName} ${user.lastName}`,
          movieName: selectedMovie.name,
          movieId: selectedMovie.id
        }

        const response = await fetch('http://localhost:8080/api/ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketData)
        })

        if (!response.ok) {
          throw new Error(`Failed to book seat ${seatName}`)
        }

        return response.json()
      })

      await Promise.all(ticketPromises)
      
      setSuccess(`Successfully booked ${selectedSeats.length} ticket(s)!`)
      
      // Mark selected seats as occupied
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          selectedSeats.includes(seat.id)
            ? { ...seat, isOccupied: true, isSelected: false }
            : seat
        )
      )
      
      setSelectedSeats([])
      
      // Redirect to movies after 3 seconds
      setTimeout(() => {
        router.push('/movies')
      }, 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book tickets')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalPrice = () => {
    return (selectedSeats.length * SEAT_PRICE).toFixed(2)
  }

  if (!selectedMovie || !user) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/movies" className={styles.backLink}>
          ← Back to Movies
        </Link>
        <h1 className={styles.title}>Select Your Seats</h1>
        <div></div>
      </header>

      <div className={styles.movieInfo}>
        <h2 className={styles.movieTitle}>{selectedMovie.name}</h2>
        <p className={styles.userWelcome}>
          Welcome <b>{user.firstName}!</b> Choose your preferred seats.
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          {success}
        </div>
      )}

      <div className={styles.cinemaContainer}>
        {/* Screen */}
        <div className={styles.screen}>
          <div className={styles.screenText}>SCREEN</div>
        </div>

        {/* Seats Grid */}
        <div className={styles.seatsContainer}>
          {ROWS.map(row => (
            <div key={row} className={styles.seatRow}>
              <div className={styles.rowLabel}>{row}</div>
              <div className={styles.seatsInRow}>
                {seats
                  .filter(seat => seat.row === row)
                  .map(seat => (
                    <button
                      key={seat.id}
                      className={`${styles.seat} ${
                        seat.isOccupied ? styles.occupied : 
                        seat.isSelected ? styles.selected : styles.available
                      }`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.isOccupied || isLoading}
                      title={`Seat ${seat.id} - $${seat.price}`}
                    >
                      {seat.number}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.available}`}></div>
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.selected}`}></div>
            <span>Selected</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.occupied}`}></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      {selectedSeats.length > 0 && (
        <div className={styles.bookingSummary}>
          <div className={styles.summaryContent}>
            <div className={styles.summaryInfo}>
              <h3>Booking Summary</h3>
              <p><strong>Movie:</strong> {selectedMovie.name}</p>
              <p><strong>Seats:</strong> {selectedSeats.join(', ')}</p>
              <p><strong>Quantity:</strong> {selectedSeats.length} ticket(s)</p>
              <p className={styles.totalPrice}>
                <strong>Total: ${getTotalPrice()}</strong>
              </p>
            </div>
            <button 
              className={styles.bookButton}
              onClick={handleBookTickets}
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : `Book ${selectedSeats.length} Ticket(s)`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatsPage