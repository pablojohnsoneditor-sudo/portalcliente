import { createContext, useContext, useState } from 'react'

export const USERS = [
  { id: 'charles',   name: 'Charles',     role: 'client'   },
  { id: 'drgiovane', name: 'Dr. Giovane', role: 'client'   },
  { id: 'pablo',     name: 'Pablo',       role: 'provider' },
  { id: 'diogo',     name: 'Diogo',       role: 'provider' },
]

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('portal_identity')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const login = (id) => {
    const u = USERS.find(u => u.id === id)
    if (!u) return
    setUser(u)
    localStorage.setItem('portal_identity', JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('portal_identity')
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
