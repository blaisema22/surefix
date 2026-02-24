import { useState } from 'react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import FindCentres from './pages/FindCentres'
import BookAppointment from './pages/BookAppointment'
import Login from './pages/Login'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [attemptedPage, setAttemptedPage] = useState(null)

  const handleNavigate = (page) => {
    // Check if user needs to login before accessing book-repair
    if (page === 'book-repair' && !isLoggedIn) {
      setAttemptedPage(page)
      setCurrentPage('login')
      window.scrollTo(0, 0)
      return
    }
    setCurrentPage(page)
    setAttemptedPage(null)
    window.scrollTo(0, 0)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    // If user tried to access book-repair, redirect there after login
    if (attemptedPage === 'book-repair') {
      setCurrentPage('book-repair')
    } else {
      setCurrentPage('home')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} onNavigate={handleNavigate} />
      case 'find-shop':
        return <FindCentres />
      case 'book-repair':
        return isLoggedIn ? <BookAppointment /> : <Login onLogin={handleLogin} onNavigate={handleNavigate} />
      default:
        return <Landing />
    }
  }

  return (
    <>
      <Navbar onNavigate={handleNavigate} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      {renderPage()}
    </>
  )
}

export default App
