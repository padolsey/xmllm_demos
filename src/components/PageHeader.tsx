interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && (
        <p className="mt-2 text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  )
} 