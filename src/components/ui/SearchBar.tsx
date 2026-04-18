'use client'
import { Search } from 'lucide-react'
export default function SearchBar({value,onChange,placeholder='Cari...'}:{value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
      <input className="form-input pl-9 w-full" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  )
}
