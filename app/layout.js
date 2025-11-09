import './globals.css'

export const metadata = {
  title: 'AlwaysHerFault Translator',
  description: 'Translate text into manipulative blame-shifting communication',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
