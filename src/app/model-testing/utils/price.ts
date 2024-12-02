export const getPriceCategory = (price?: number): {
  label: string
  color: string
} => {
  if (!price) return { label: '?', color: 'text-gray-400' }
  if (price <= 0.30) return { label: '$', color: 'text-emerald-500' }
  if (price <= 0.80) return { label: '$$', color: 'text-amber-500' }
  return { label: '$$$', color: 'text-red-500' }
} 