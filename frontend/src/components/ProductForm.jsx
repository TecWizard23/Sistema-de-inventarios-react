import React, { useState, useEffect } from 'react'

export default function ProductForm({ onCreated }){
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(()=>{ fetch('http://localhost:8000/api/categories').then(r=>r.json()).then(setCategories).catch(()=>{}) }, [])

  function validate(){
    const e = {}
    if(!sku) e.sku = 'SKU requerido'
    if(!name) e.name = 'Nombre requerido'
    const p = parseFloat(price)
    if(isNaN(p) || p < 0) e.price = 'Precio válido requerido >= 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e){
    e.preventDefault()
    if(!validate()) return
    const payload = { sku, name, price: parseFloat(price), category_id: categoryId ? parseInt(categoryId) : null }
    const res = await fetch('http://localhost:8000/api/products', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    })
    if(res.ok){
      setSku(''); setName(''); setPrice(''); setCategoryId('')
      onCreated && onCreated()
    } else {
      const err = await res.json()
      alert(err.detail || 'Error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="row">
        <label>SKU<input value={sku} onChange={e=>setSku(e.target.value)} placeholder="H-001"/></label>
        <label>Nombre<input value={name} onChange={e=>setName(e.target.value)} placeholder="Martillo"/></label>
        <label>Precio<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00"/></label>
      </div>
      <div className="row">
        <label>Categoria
          <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
            <option value="">-- Ninguna --</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div style={{flex:1}} />
        <button className="btn-primary" type="submit">Crear producto</button>
      </div>
      <div className="errors">
        {Object.values(errors).map((v,i)=> <div key={i} className="err">{v}</div>)}
      </div>
    </form>
  )
}
