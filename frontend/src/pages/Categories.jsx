import React, { useEffect, useState } from 'react'

export default function Categories(){
  const [cats, setCats] = useState([])
  useEffect(()=>{ fetch('http://localhost:8000/api/categories').then(r=>r.json()).then(setCats).catch(()=>{}) }, [])
  return (
    <div>
      <h2>Categorías</h2>
      <ul className="simple-list">
        {cats.map(c=> <li key={c.id}><strong>{c.name}</strong> — {c.description}</li>)}
      </ul>
    </div>
  )
}
