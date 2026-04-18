'use client'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
export default function Modal({ open, onClose, title, children, size='md' }: {
  open:boolean; onClose:()=>void; title:string; children:ReactNode; size?:'sm'|'md'|'lg'|'xl'
}) {
  if(!open) return null
  const w={sm:'max-w-sm',md:'max-w-lg',lg:'max-w-2xl',xl:'max-w-4xl'}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${w[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800 text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"><X size={18}/></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
