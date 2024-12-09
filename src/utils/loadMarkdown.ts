export async function loadMarkdown(path: string) {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/padolsey/xmllm/main/${path}`,
      {
        next: {
          revalidate: 3600 // Revalidate every hour
        }
      }
    )
    if (!response.ok) throw new Error('Failed to fetch markdown')
    return await response.text()
  } catch (error) {
    console.error('Error loading markdown:', error)
    return null
  }
} 