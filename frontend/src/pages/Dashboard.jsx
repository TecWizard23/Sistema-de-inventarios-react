import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard(){
  const [stats, setStats] = useState({ products: 0, lowStock: 0, suppliers: 0, customers: 0 })
  const [latestStock, setLatestStock] = useState([])

  useEffect(()=>{
    Promise.all([
      axios.get('http://localhost:8000/api/products', { params: { page: 1, limit: 1 } }),
      axios.get('http://localhost:8000/api/stock-levels'),
      axios.get('http://localhost:8000/api/suppliers', { params: { page: 1, limit: 1 } }),
      axios.get('http://localhost:8000/api/customers', { params: { page: 1, limit: 1 } })
    ]).then(([prod, stock, suppliersRes, customersRes])=>{
      setStats({
        products: prod.data.total || 0,
        lowStock: (stock.data || []).filter(s => s.product?.minStock && s.qty <= s.product.minStock).length,
        suppliers: suppliersRes.data.total || 0,
        customers: customersRes.data.total || 0,
      })
      setLatestStock((stock.data || []).slice(0, 5))
    }).catch(()=>{})
  }, [])

  return (
    <div className="dashboard">
      <section className="hero-panel">
        <div>
          <div className="eyebrow">Centro de control</div>
          <h2>Tu inventario, ventas y compras en una sola vista</h2>
          <p>Supervisa stock crítico, movimientos recientes y estado operativo sin perder tiempo entre pantallas.</p>
        </div>
        <div className="hero-actions">
          <div className="mini-stat"><span>Productos</span><strong>{stats.products}</strong></div>
          <div className="mini-stat"><span>Alertas stock</span><strong>{stats.lowStock}</strong></div>
        </div>
      </section>
      <section className="metric-grid">
        <div className="metric-card"><span>Productos</span><strong>{stats.products}</strong></div>
        <div className="metric-card"><span>Proveedores</span><strong>{stats.suppliers}</strong></div>
        <div className="metric-card"><span>Clientes</span><strong>{stats.customers}</strong></div>
        <div className="metric-card danger"><span>Stock crítico</span><strong>{stats.lowStock}</strong></div>
      </section>
      <section className="quick-grid">
        <article className="quick-card">
          <span className="eyebrow">Flujo</span>
          <h3>Operación lista para campo</h3>
          <p>Registro de compras, ventas y movimientos con permisos según rol.</p>
        </article>
        <article className="quick-card accent">
          <span className="eyebrow">Calidad</span>
          <h3>Tablas normalizadas</h3>
          <p>Entidades separadas, relaciones claras y restricciones de unicidad en catálogos clave.</p>
        </article>
      </section>
      <section className="surface-section">
        <div className="section-head"><h3>Stock reciente</h3><span>Últimos niveles sincronizados</span></div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead>
            <tbody>
              {latestStock.map(row => (
                <tr key={row.id}>
                  <td>{row.product?.name}</td>
                  <td>{row.qty}</td>
                  <td>{row.product?.minStock}</td>
                  <td><span className={`status-pill ${row.qty <= (row.product?.minStock || 0) ? 'warn' : 'ok'}`}>{row.qty <= (row.product?.minStock || 0) ? 'Revisar' : 'OK'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
