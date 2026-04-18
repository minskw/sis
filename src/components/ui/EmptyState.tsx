import { LucideIcon } from 'lucide-react'
export default function EmptyState({icon:Icon,title,desc}:{icon:LucideIcon;title:string;desc?:string}) {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Icon size={24} className="text-gray-400"/></div>
      <p className="font-semibold text-gray-600">{title}</p>
      {desc&&<p className="text-sm text-gray-400 mt-1">{desc}</p>}
    </div>
  )
}
