import './globals.css'

export const metadata = {
  title: 'Lista Spesa Esselunga',
  description: 'App per gestire la lista della spesa di Esselunga',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
