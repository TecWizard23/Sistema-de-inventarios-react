import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function Employees(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'' })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(8)
  const [editing, setEditing] = useState(null)
  useEffect(()=>{ axios.get('http://localhost:8000/api/employees',{ params:{ q, page:1, limit } }).then(r=>{setItems(r.data.items || []); setTotal(r.data.total || 0); setPage(1)}).catch(()=>{}) }, [q])
  async function load(nextPage = page){ const r=await axios.get('http://localhost:8000/api/employees',{ params:{ q, page:nextPage, limit } }); setItems(r.data.items || []); setTotal(r.data.total || 0); setPage(r.data.page || nextPage) }
  async function create(e){ e.preventDefault(); try{ await axios.post('http://localhost:8000/api/employees', form); setForm({ firstName:'', lastName:'', email:'' }); load(1) }catch(err){ alert(err?.response?.data?.detail || err.message) } }
  async function remove(id){ if(!confirm('Eliminar empleado?')) return; await axios.delete(`http://localhost:8000/api/employees/${id}`); load(page) }
  async function saveEdit(e){ e.preventDefault(); await axios.put(`http://localhost:8000/api/employees/${editing.id}`, editing); setEditing(null); load(page) }
  return (
    <div>
      <div className="page-head"><h2>Empleados</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empleado" /></div>
      {isAdmin && <form onSubmit={create} className="product-form">
        <div className="row">
          <label>Nombre<input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} /></label>
          <label>Apellido<input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} /></label>
          <label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        </div>
        <div style={{marginTop:8}}><button className="btn-primary" type="submit">Crear empleado</button></div>
      </form>}
      <div className="table-responsive" style={{marginTop:12}}>
        <table className="data-table"><thead><tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Acc</th></tr></thead>
        <tbody>{items.map(c=> <tr key={c.id}><td>{c.id}</td><td>{c.firstName}</td><td>{c.lastName}</td><td>{c.email}</td><td>{isAdmin && (<><button onClick={()=>setEditing(c)}>Editar</button><button onClick={()=>remove(c.id)}>Eliminar</button></>)}</td></tr>)}</tbody></table>
      </div>
      <div className="pager"><button disabled={page<=1} onClick={()=>load(page-1)}>Anterior</button><span>{page} / {Math.max(Math.ceil(total/limit),1)}</span><button disabled={page>=Math.max(Math.ceil(total/limit),1)} onClick={()=>load(page+1)}>Siguiente</button></div>
      {editing && <form onSubmit={saveEdit} className="product-form"><h3>Editar empleado</h3><div className="row"><label>Nombre<input value={editing.firstName} onChange={e=>setEditing({...editing,firstName:e.target.value})} /></label><label>Apellido<input value={editing.lastName} onChange={e=>setEditing({...editing,lastName:e.target.value})} /></label><label>Email<input value={editing.email || ''} onChange={e=>setEditing({...editing,email:e.target.value})} /></label></div><div style={{marginTop:8}}><button className="btn-primary" type="submit">Guardar</button><button type="button" onClick={()=>setEditing(null)}>Cancelar</button></div></form>}
    </div>
  )
}
