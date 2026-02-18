import benchmarks from '@/config/benchmarks.json'

const ILLEGAL_KEYWORDS = [
  'bankgebühren',
  'bankgebuehren',
  'reparatur',
  'instandhaltung',
  'rechtsschutzversicherung',
  'maklergebühren',
  'maklergebuehren',
  'renovierung',
  'modernisierung',
  'kleinreparaturen',
  'bankkosten',
  'verwaltungskosten',
  'bewirtschaftungskosten',
  'kontoführungsgebühren',
  'kontofuehrungsgebuehren'
]

export interface LineItem {
  id?: string
  name: string
  amount?: number
  unit?: string
  cost_per_unit?: number
  total_cost: number
  category: string
  score?: 'green' | 'yellow' | 'red'
  error_type?: 'formal_error' | 'outlier' | 'none'
  error_details?: string
  benchmark_low?: number
  benchmark_high?: number
}

export interface AnalysisResult {
  lineItems: LineItem[]
  totalErrors: number
  formalErrors: number
  outliers: number
  estimatedRefund: number
}

export function analyzeLineItem(item: LineItem, sqm: number): LineItem {
  const analyzedItem = { ...item }
  const errors: string[] = []
  
  // Check for formal errors (illegal charges)
  const itemNameLower = item.name.toLowerCase()
  for (const keyword of ILLEGAL_KEYWORDS) {
    if (itemNameLower.includes(keyword)) {
      errors.push(`Illegal charge detected: "${keyword}" - This charge may not be passed to tenants`)
      analyzedItem.error_type = 'formal_error'
      analyzedItem.score = 'red'
      break
    }
  }
  
  // Check statistical outliers
  const benchmark = benchmarks[item.category as keyof typeof benchmarks]
  if (benchmark && sqm > 0 && item.total_cost > 0) {
    const monthlyCost = item.total_cost / 12
    const costPerSqm = monthlyCost / sqm
    
    analyzedItem.benchmark_low = benchmark.normal_low
    analyzedItem.benchmark_high = benchmark.normal_high
    
    if (costPerSqm > benchmark.red_threshold) {
      const refundEstimate = (costPerSqm - benchmark.normal_high) * sqm * 12
      errors.push(`Cost of €${costPerSqm.toFixed(2)}/sqm/month significantly exceeds normal range (€${benchmark.normal_low}-${benchmark.normal_high})`)
      if (!analyzedItem.error_type) {
        analyzedItem.error_type = 'outlier'
        analyzedItem.score = 'red'
      }
    } else if (costPerSqm > benchmark.yellow_threshold) {
      errors.push(`Cost of €${costPerSqm.toFixed(2)}/sqm/month is above average (normal: €${benchmark.normal_low}-${benchmark.normal_high})`)
      if (!analyzedItem.error_type) {
        analyzedItem.error_type = 'outlier'
        analyzedItem.score = 'yellow'
      }
    } else {
      analyzedItem.score = analyzedItem.score || 'green'
      analyzedItem.error_type = analyzedItem.error_type || 'none'
    }
  } else {
    analyzedItem.score = analyzedItem.score || 'green'
    analyzedItem.error_type = analyzedItem.error_type || 'none'
  }
  
  analyzedItem.error_details = errors.join('; ') || undefined
  return analyzedItem
}

export function analyzeBill(lineItems: LineItem[], sqm: number): AnalysisResult {
  const analyzedItems = lineItems.map(item => analyzeLineItem(item, sqm))
  
  const formalErrors = analyzedItems.filter(i => i.error_type === 'formal_error').length
  const outliers = analyzedItems.filter(i => i.error_type === 'outlier').length
  const totalErrors = formalErrors + outliers
  
  // Estimate refund (rough calculation)
  let estimatedRefund = 0
  for (const item of analyzedItems) {
    if (item.error_type === 'formal_error') {
      estimatedRefund += item.total_cost * 0.8 // Assume 80% refund for illegal charges
    } else if (item.error_type === 'outlier' && item.score === 'red') {
      const monthlyCost = item.total_cost / 12
      const costPerSqm = monthlyCost / sqm
      const benchmark = benchmarks[item.category as keyof typeof benchmarks]
      if (benchmark && costPerSqm > benchmark.normal_high) {
        const monthlyOvercharge = (costPerSqm - benchmark.normal_high) * sqm
        estimatedRefund += monthlyOvercharge * 12
      }
    }
  }
  
  return {
    lineItems: analyzedItems,
    totalErrors,
    formalErrors,
    outliers,
    estimatedRefund: Math.round(estimatedRefund * 100) / 100
  }
}

export function getScoreColor(score: string): string {
  switch (score) {
    case 'red': return 'text-red-600 bg-red-50 border-red-200'
    case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'green': return 'text-green-600 bg-green-50 border-green-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getScoreBadgeColor(score: string): string {
  switch (score) {
    case 'red': return 'bg-red-100 text-red-800'
    case 'yellow': return 'bg-yellow-100 text-yellow-800'
    case 'green': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
