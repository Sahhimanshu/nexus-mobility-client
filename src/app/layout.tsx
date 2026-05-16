import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Nexus Mobility | International Education Platform',
  description: 'Manage global university partnerships, student mobility programs, and international collaborations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
          />
          </body>
    </html>
  )
}
