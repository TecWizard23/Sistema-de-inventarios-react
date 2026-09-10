import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout({ children }){
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-main">
        {children || <Outlet />}
      </main>
    </div>
  )
}
