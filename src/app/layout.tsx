import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700","800"] })

export const metadata: Metadata = {
  title: "SIS MIN Singkawang",
  description: "Sistem Informasi Sekolah MIN Singkawang",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={font.className}>{children}</body>
    </html>
  )
}
