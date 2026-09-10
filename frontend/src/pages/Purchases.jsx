import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Purchases(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ supplierId:'', productId:'', qty:1, cost:0 })
  const [editing, setEditing] = useState(null)

  useEffect(()=>{
    axios.get('http://localhost:8001/api/suppliers').then(r=>setSuppliers(r.data.items || [])).catch(()=>{})
    axios.get('http://localhost:8001/api/products').then(r=>setProducts(r.data.items || [])).catch(()=>{})
    axios.get('http://localhost:8001/api/purchase-orders').then(r=>setOrders(r.data || [])).catch(()=>{})
  }, [])

  async function create(e){
    e.preventDefault()
    try{
      const payload = { supplierId: parseInt(form.supplierId), items: [{ productId: parseInt(form.productId), qty: parseInt(form.qty), cost: parseFloat(form.cost) }] }
      if(editing){ await axios.put(`http://localhost:8001/api/purchase-orders/${editing.id}`, payload) } else { await axios.post('http://localhost:8001/api/purchase-orders', payload) }
      const r = await axios.get('http://localhost:8001/api/purchase-orders')
      setOrders(r.data || [])
      setEditing(null)
      alert(editing ? 'Orden actualizada' : 'Orden creada')
    }catch(err){ alert(err?.response?.data?.detail || err.message) }
  }

  async function remove(id){ if(!confirm('Eliminar orden?')) return; await axios.delete(`http://localhost:8001/api/purchase-orders/${id}`); const r = await axios.get('http://localhost:8001/api/purchase-orders'); setOrders(r.data || []) }

  return (
    <div>
      <h2>Compras</h2>
      {isAdmin && <form onSubmit={create} className="product-form">
        <div className="row">
          <label>Proveedor
            <select value={form.supplierId} onChange={e=>setForm({...form, supplierId:e.target.value})}>
              <option value="">-- elegir --</option>
              {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>Producto
            <select value={form.productId} onChange={e=>setForm({...form, productId:e.target.value})}>
              <option value="">-- elegir --</option>
              {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Cantidad<input type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} /></label>
          <label>Costo<input value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} /></label>
        </div>
        <div style={{marginTop:8}}><button className="btn-primary" type="submit">Crear orden</button></div>
      </form>}

      <h3 style={{marginTop:20}}>Órdenes</h3>
      <div className="table-responsive"><table className="data-table"><thead><tr><th>ID</th><th>Proveedor</th><th>Items</th><th>Fecha</th><th>Acciones</th></tr></thead>
      <tbody>{orders.map(o=> <tr key={o.id}><td>{o.id}</td><td>{o.supplier?.name || o.supplierId}</td><td>{(o.items||[]).length}</td><td>{new Date(o.createdAt).toLocaleString()}</td><td>{isAdmin && (<><button onClick={()=>{ setEditing(o); setForm({ supplierId:o.supplierId, productId:o.items?.[0]?.productId || '', qty:o.items?.[0]?.qty || 1, cost:o.items?.[0]?.cost || 0 }) }}>Editar</button><button onClick={()=>remove(o.id)}>Eliminar</button></>)}</td></tr>)}</tbody></table></div>
    </div>
  )
}
