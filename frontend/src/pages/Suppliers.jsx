import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Suppliers(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name:'', contactEmail:'', contactPhone:'', address:'' })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(8)
  const [editing, setEditing] = useState(null)

  async function fetch(nextPage = page){
    const res = await axios.get('http://localhost:8000/api/suppliers', { params: { q, page: nextPage, limit } })
    setItems(res.data.items || [])
    setTotal(res.data.total || 0)
    setPage(res.data.page || nextPage)
  }

  useEffect(()=>{ fetch(1).catch(()=>{}) }, [q])

  async function handleCreate(e){
    e.preventDefault()
    try{ await axios.post('http://localhost:8000/api/suppliers', form); setForm({name:'',contactEmail:'',contactPhone:'',address:''}); fetch(1) }catch(err){ alert(err?.response?.data?.detail || err.message) }
  }

  async function handleDelete(id){ if(!confirm('Eliminar proveedor?')) return; await axios.delete(`http://localhost:8000/api/suppliers/${id}`); fetch(page) }
  async function handleSave(e){ e.preventDefault(); await axios.put(`http://localhost:8000/api/suppliers/${editing.id}`, editing); setEditing(null); fetch(page) }

  return (
    <div>
      <div className="page-head"><h2>Proveedores</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar proveedor" /></div>
      {isAdmin && <form onSubmit={handleCreate} className="product-form">
        <div className="row">
          <label>Nombre<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
          <label>Email<input value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} /></label>
          <label>Teléfono<input value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} /></label>
        </div>
        <div className="row" style={{marginTop:8}}>
          <label style={{flex:1}}>Dirección<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></label>
          <button className="btn-primary" type="submit">Crear</button>
        </div>
      </form>}

      <div className="table-responsive" style={{marginTop:12}}>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Tel</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map(s=> (
              <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.contactEmail}</td><td>{s.contactPhone}</td><td>{isAdmin && (<><button onClick={()=>setEditing(s)}>Editar</button><button onClick={()=>handleDelete(s.id)}>Eliminar</button></>)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager"><button disabled={page<=1} onClick={()=>fetch(page-1)}>Anterior</button><span>{page} / {Math.max(Math.ceil(total/limit),1)}</span><button disabled={page>=Math.max(Math.ceil(total/limit),1)} onClick={()=>fetch(page+1)}>Siguiente</button></div>
      {editing && <form onSubmit={handleSave} className="product-form"><h3>Editar proveedor</h3><div className="row"><label>Nombre<input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></label><label>Email<input value={editing.contactEmail || ''} onChange={e=>setEditing({...editing,contactEmail:e.target.value})} /></label><label>Teléfono<input value={editing.contactPhone || ''} onChange={e=>setEditing({...editing,contactPhone:e.target.value})} /></label></div><div className="row" style={{marginTop:8}}><label style={{flex:1}}>Dirección<input value={editing.address || ''} onChange={e=>setEditing({...editing,address:e.target.value})} /></label><button className="btn-primary" type="submit">Guardar</button><button type="button" onClick={()=>setEditing(null)}>Cancelar</button></div></form>}
    </div>
  )
}
