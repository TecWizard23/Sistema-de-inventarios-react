import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import Stock from './pages/Stock'
import Sales from './pages/Sales'
import Purchases from './pages/Purchases'
import Movements from './pages/Movements'
import Customers from './pages/Customers'
import Employees from './pages/Employees'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/products" element={<Products/>} />
            <Route path="/categories" element={<Categories/>} />
            <Route path="/suppliers" element={<Suppliers/>} />
            <Route path="/stock" element={<Stock/>} />
            <Route path="/sales" element={<Sales/>} />
            <Route path="/purchases" element={<Purchases/>} />
            <Route path="/movements" element={<Movements/>} />
            <Route path="/customers" element={<Customers/>} />
            <Route path="/employees" element={<Employees/>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
