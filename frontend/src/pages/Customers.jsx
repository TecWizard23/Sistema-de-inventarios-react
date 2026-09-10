import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Customers(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name:'', contactPhone:'', contactEmail:'' })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(8)
  const [editing, setEditing] = useState(null)
  useEffect(()=>{ axios.get('http://localhost:8000/api/customers',{ params:{ q, page:1, limit } }).then(r=>{setItems(r.data.items || []); setTotal(r.data.total || 0); setPage(1)}).catch(()=>{}) }, [q])
  async function load(nextPage = page){ const r=await axios.get('http://localhost:8000/api/customers',{ params:{ q, page:nextPage, limit } }); setItems(r.data.items || []); setTotal(r.data.total || 0); setPage(r.data.page || nextPage) }
  async function create(e){ e.preventDefault(); try{ await axios.post('http://localhost:8000/api/customers', form); setForm({name:'',contactPhone:'',contactEmail:''}); load(1) }catch(err){ alert(err?.response?.data?.detail || err.message) } }
  async function remove(id){ if(!confirm('Eliminar cliente?')) return; await axios.delete(`http://localhost:8000/api/customers/${id}`); load(page) }
  async function saveEdit(e){ e.preventDefault(); await axios.put(`http://localhost:8000/api/customers/${editing.id}`, editing); setEditing(null); load(page) }
  return (
    <div>
      <div className="page-head"><h2>Clientes</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar cliente" /></div>
      {isAdmin && <form onSubmit={create} className="product-form">
        <div className="row">
          <label>Nombre<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
          <label>Teléfono<input value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} /></label>
          <label>Email<input value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} /></label>
        </div>
        <div style={{marginTop:8}}><button className="btn-primary" type="submit">Crear cliente</button></div>
      </form>}
      <div className="table-responsive" style={{marginTop:12}}>
        <table className="data-table"><thead><tr><th>ID</th><th>Nombre</th><th>Tel</th><th>Email</th><th>Acc</th></tr></thead>
        <tbody>{items.map(c=> <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.contactPhone}</td><td>{c.contactEmail}</td><td>{isAdmin && (<><button onClick={()=>setEditing(c)}>Editar</button><button onClick={()=>remove(c.id)}>Eliminar</button></>)}</td></tr>)}</tbody></table>
      </div>
      <div className="pager"><button disabled={page<=1} onClick={()=>load(page-1)}>Anterior</button><span>{page} / {Math.max(Math.ceil(total/limit),1)}</span><button disabled={page>=Math.max(Math.ceil(total/limit),1)} onClick={()=>load(page+1)}>Siguiente</button></div>
      {editing && <form onSubmit={saveEdit} className="product-form"><h3>Editar cliente</h3><div className="row"><label>Nombre<input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></label><label>Teléfono<input value={editing.contactPhone || ''} onChange={e=>setEditing({...editing,contactPhone:e.target.value})} /></label><label>Email<input value={editing.contactEmail || ''} onChange={e=>setEditing({...editing,contactEmail:e.target.value})} /></label></div><div style={{marginTop:8}}><button className="btn-primary" type="submit">Guardar</button><button type="button" onClick={()=>setEditing(null)}>Cancelar</button></div></form>}
    </div>
  )
}
