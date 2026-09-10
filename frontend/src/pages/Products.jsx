import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import ProductForm from '../components/ProductForm'
import { AuthContext } from '../context/AuthContext'

export default function Products(){
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(8)
  const [editing, setEditing] = useState(null)

  async function fetchProducts(nextPage = page){
    setLoading(true)
    const res = await axios.get('http://localhost:8000/api/products', { params: { q, page: nextPage, limit } })
    setItems(res.data.items || [])
    setTotal(res.data.total || 0)
    setPage(res.data.page || nextPage)
    setLoading(false)
  }

  useEffect(()=>{ fetchProducts(1).catch(()=>setLoading(false)) }, [q])

  async function deleteProduct(id){
    if(!confirm('Eliminar producto?')) return
    await axios.delete(`http://localhost:8000/api/products/${id}`)
    fetchProducts(page)
  }

  async function saveEdit(e){
    e.preventDefault()
    await axios.put(`http://localhost:8000/api/products/${editing.id}`, editing)
    setEditing(null)
    fetchProducts(page)
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return (
    <div>
      <div className="page-head">
        <h2>Productos</h2>
        <div className="search-bar">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar SKU o nombre" />
        </div>
      </div>
      {isAdmin && <ProductForm onCreated={()=>fetchProducts(1)} />}
      {loading ? <p>Cargando...</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>SKU</th><th>Nombre</th><th>Precio</th><th>Min Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.sku}</td><td>{p.name}</td><td>{p.price}</td><td>{p.minStock}</td>
                  <td>
                    {isAdmin && <button onClick={()=>setEditing({ ...p, min_stock: p.minStock })}>Editar</button>} {isAdmin && <button onClick={()=>deleteProduct(p.id)}>Eliminar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pager">
        <button disabled={page <= 1} onClick={()=>fetchProducts(page - 1)}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={()=>fetchProducts(page + 1)}>Siguiente</button>
      </div>

      {editing && (
        <form onSubmit={saveEdit} className="product-form" style={{marginTop:16}}>
          <h3>Editar producto</h3>
          <div className="row">
            <label>SKU<input value={editing.sku} onChange={e=>setEditing({...editing, sku:e.target.value})} /></label>
            <label>Nombre<input value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} /></label>
            <label>Precio<input value={editing.price} onChange={e=>setEditing({...editing, price:e.target.value})} /></label>
            <label>Min stock<input value={editing.min_stock ?? editing.minStock} onChange={e=>setEditing({...editing, min_stock:e.target.value})} /></label>
          </div>
          <div style={{marginTop:8}}><button className="btn-primary" type="submit">Guardar</button> <button type="button" onClick={()=>setEditing(null)}>Cancelar</button></div>
        </form>
      )}
    </div>
  )
}
