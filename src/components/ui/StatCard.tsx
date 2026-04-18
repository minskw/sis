import { LucideIcon } from 'lucide-react'
export default function StatCard({label,value,icon:Icon,color,sub}:{label:string;value:string|number;icon:LucideIcon;color:string;sub?:string}) {
  return (
    <div className="stat-card card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className={`stat-icon ${color}`}><Icon size={20}/></div>
        {sub&&<span className="text-xs text-gray-400">{sub}</span>}
      </div>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
