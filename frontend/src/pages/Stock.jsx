import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Stock(){
  const [rows, setRows] = useState([])

  useEffect(()=>{
    axios.get('http://localhost:8000/api/stock-levels').then(r=>setRows(r.data || [])).catch(()=>setRows([]))
  }, [])

  return (
    <div>
      <div className="page-head"><h2>Stock</h2><span className="muted">Niveles actuales por producto</span></div>
      <section className="surface-section">
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Ubicación</th><th>Cantidad</th><th>Estado</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td>{row.product?.name}</td>
                  <td>{row.location?.name || 'Principal'}</td>
                  <td>{row.qty}</td>
                  <td><span className={`status-pill ${row.qty <= (row.product?.minStock || 0) ? 'warn' : 'ok'}`}>{row.qty <= (row.product?.minStock || 0) ? 'Bajo' : 'Sano'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
