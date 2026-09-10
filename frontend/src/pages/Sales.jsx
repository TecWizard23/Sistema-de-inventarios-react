import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Sales(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ customerId:'', productId:'', qty:1, price:0 })
  const [editing, setEditing] = useState(null)

  useEffect(()=>{
    axios.get('http://localhost:8001/api/customers').then(r=>setCustomers(r.data.items || [])).catch(()=>{})
    axios.get('http://localhost:8001/api/products').then(r=>setProducts(r.data.items || [])).catch(()=>{})
    axios.get('http://localhost:8001/api/sale-orders').then(r=>setOrders(r.data || [])).catch(()=>{})
  }, [])

  async function create(e){
    e.preventDefault()
    try{
      const payload = { customerId: form.customerId?parseInt(form.customerId):null, items: [{ productId: parseInt(form.productId), qty: parseInt(form.qty), price: parseFloat(form.price) }] }
      if(editing){ await axios.put(`http://localhost:8001/api/sale-orders/${editing.id}`, payload) } else { await axios.post('http://localhost:8001/api/sale-orders', payload) }
      const r = await axios.get('http://localhost:8001/api/sale-orders')
      setOrders(r.data || [])
      setEditing(null)
      alert(editing ? 'Venta actualizada' : 'Venta registrada')
    }catch(err){ alert(err?.response?.data?.detail || err.message) }
  }

  async function remove(id){ if(!confirm('Eliminar venta?')) return; await axios.delete(`http://localhost:8001/api/sale-orders/${id}`); const r = await axios.get('http://localhost:8001/api/sale-orders'); setOrders(r.data || []) }

  return (
    <div>
      <h2>Ventas</h2>
      {isAdmin && <form onSubmit={create} className="product-form">
        <div className="row">
          <label>Cliente
            <select value={form.customerId} onChange={e=>setForm({...form, customerId:e.target.value})}>
              <option value="">-- elegir --</option>
              {customers.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>Producto
            <select value={form.productId} onChange={e=>setForm({...form, productId:e.target.value})}>
              <option value="">-- elegir --</option>
              {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Cantidad<input type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} /></label>
          <label>Precio<input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></label>
        </div>
        <div style={{marginTop:8}}><button className="btn-primary" type="submit">Registrar venta</button></div>
      </form>}

      <h3 style={{marginTop:20}}>Ventas</h3>
      <div className="table-responsive"><table className="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Items</th><th>Fecha</th><th>Acciones</th></tr></thead>
      <tbody>{orders.map(o=> <tr key={o.id}><td>{o.id}</td><td>{o.customer?.name || o.customerId}</td><td>{(o.items||[]).length}</td><td>{new Date(o.createdAt).toLocaleString()}</td><td>{isAdmin && (<><button onClick={()=>{ setEditing(o); setForm({ customerId:o.customerId || '', productId:o.items?.[0]?.productId || '', qty:o.items?.[0]?.qty || 1, price:o.items?.[0]?.price || 0 }) }}>Editar</button><button onClick={()=>remove(o.id)}>Eliminar</button></>)}</td></tr>)}</tbody></table></div>
    </div>
  )
}
