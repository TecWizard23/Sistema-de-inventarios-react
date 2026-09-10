import React, { useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const { login } = useContext(AuthContext)

  async function handle(e){
    e.preventDefault()
    setBusy(true)
    try{
      const url = mode === 'login' ? 'http://localhost:8000/api/auth/login' : 'http://localhost:8000/api/auth/register'
      const payload = mode === 'login'
        ? { email, password }
        : { email, password, role: 'employee', name }
      const res = await axios.post(url, payload)
      const response = mode === 'login'
        ? res
        : await axios.post('http://localhost:8000/api/auth/login', { email, password })
      login(response.data.token, response.data.user)
      window.location.href = '/'
    }catch(err){ alert(err?.response?.data?.detail || err.message) }
    finally{ setBusy(false) }
  }

  return (
    <div className="auth-shell">
      <div className="auth-art">
        <div className="auth-art-card">
          <div className="eyebrow">Sistema de inventario</div>
        </div>
      </div>
      <div className="auth-card glass">
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={()=>setMode('login')} type="button">Ingresar</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={()=>setMode('register')} type="button">Crear cuenta</button>
        </div>
        <h2>{mode === 'login' ? 'Bienvenido de vuelta' : 'Crear usuario'}</h2>
        <p className="muted">{mode === 'login' ? 'Accede con tu cuenta para operar el inventario.' : 'Registra un nuevo usuario operativo (rol employee).'}</p>
        <form onSubmit={handle} className="auth-form">
          {mode === 'register' && <label>Nombre completo<input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" /></label>}
          <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@local" /></label>
          <label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></label>
          <button className="btn-primary btn-wide" type="submit" disabled={busy}>{busy ? 'Procesando...' : mode === 'login' ? 'Entrar al sistema' : 'Crear usuario'}</button>
        </form>
        <div className="auth-footer">
          <span>Usuario demo: admin@local / admin123</span>
        </div>
      </div>
    </div>
  )
}
