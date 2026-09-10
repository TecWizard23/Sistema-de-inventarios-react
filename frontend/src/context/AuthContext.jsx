import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

function getInitialUser(){
  try{
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if(token && user){
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return JSON.parse(user)
    }
  }catch(e){}
  return null
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(getInitialUser)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(token){ axios.defaults.headers.common['Authorization'] = `Bearer ${token}` }
  }, [])

  function login(token, user){
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
  }

  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
