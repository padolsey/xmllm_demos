import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scenarios'
}

export default function ScenariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 