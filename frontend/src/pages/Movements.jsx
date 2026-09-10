import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Movements(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [products, setProducts] = useState([])
  const [list, setList] = useState([])
  const [form, setForm] = useState({ productId:'', qty:1, type:'IN', locationId: '' })

  useEffect(()=>{ axios.get('http://localhost:8000/api/products').then(r=>setProducts(r.data)).catch(()=>{}); axios.get('http://localhost:8000/api/movements').then(r=>setList(r.data)).catch(()=>{}) }, [])

  async function submit(e){ e.preventDefault(); try{ await axios.post('http://localhost:8000/api/movements', form); const r=await axios.get('http://localhost:8000/api/movements'); setList(r.data); alert('Movimiento registrado') }catch(err){ alert(err?.response?.data?.detail || err.message) } }

  return (
    <div>
      <h2>Movimientos</h2>
      {isAdmin && <form onSubmit={submit} className="product-form">
        <div className="row">
          <label>Producto
            <select value={form.productId} onChange={e=>setForm({...form,productId:parseInt(e.target.value)})}>
              <option value="">-- elegir --</option>
              {products.map(p=> <option value={p.id} key={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </label>
          <label>Cantidad<input type="number" value={form.qty} onChange={e=>setForm({...form,qty:parseInt(e.target.value)})} /></label>
          <label>Tipo
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUST">ADJUST</option>
            </select>
          </label>
        </div>
        <div style={{marginTop:8}}><button className="btn-primary" type="submit">Registrar movimiento</button></div>
      </form>}

      <h3 style={{marginTop:20}}>Últimos movimientos</h3>
      <div className="table-responsive">
        <table className="data-table"><thead><tr><th>ID</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th></tr></thead>
        <tbody>{list.map(m=> <tr key={m.id}><td>{m.id}</td><td>{m.productId}</td><td>{m.type}</td><td>{m.qty}</td><td>{new Date(m.createdAt).toLocaleString()}</td></tr>)}</tbody></table>
      </div>
    </div>
  )
}
