import React, { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/v1/users/current-user", {
                    method: "GET",
                    credentials: 'include'
                })
                if (res.ok) {
                    setUser(res.user)
                }
            } catch (error) {
                setUser(null)
            }
        }
          checkAuth()
    }, [])
    useEffect(() => {
      console.log(user)
    }, [user])
    
    const login = async (email, password) => {
        const res = await fetch("http://localhost:8000/api/v1/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        })
        if (res.ok) {
            const data = await res.json()
            const { success, message, error } = data
            setUser(data.data.user)
            return data
        }
        return false
    }

    return (
        <AuthContext.Provider value={{ user, login }}>
            {children}
        </AuthContext.Provider>
    )


}

export const useAuth = () => useContext(AuthContext)

