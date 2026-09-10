import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const links = [
  ['/', 'Dashboard'],
  ['/products','Productos'],
  ['/categories','Categorías'],
  ['/suppliers','Proveedores'],
  ['/stock','Stock'],
  ['/sales','Ventas'],
  ['/purchases','Compras'],
  ['/movements','Movimientos'],
  ['/customers','Clientes'],
  ['/employees','Empleados']
]

export default function NavBar(){
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">FI</div>
        <div>
          <div className="brand">Ferretería</div>
          <div className="brand-sub">Inventario operativo</div>
        </div>
      </div>
      <div className="user-chip">
        <div className="avatar">{user?.email?.[0]?.toUpperCase() || 'G'}</div>
        <div>
          <div className="user-name">{user?.email || 'Invitado'}</div>
          <div className="user-role">{user?.role || 'guest'}</div>
        </div>
      </div>
      <nav className="nav-list">
        {links.map(([to, label])=> (
          <NavLink key={to} to={to} className={({isActive})=> `nav-item ${isActive ? 'active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user ? (
          <button className="btn-ghost" onClick={()=>{ logout(); window.location.href='/login' }}>Salir</button>
        ) : (
          <NavLink className="btn-ghost btn-link" to="/login">Entrar</NavLink>
        )}
        <span className="sidebar-path">{location.pathname}</span>
      </div>
    </aside>
  )
}
