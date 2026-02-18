'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ExtractedData {
  billing_period?: string
  total_square_meters?: number
  total_cost?: number
  heating_costs?: number
  water_costs?: number
  line_items?: Array<{
    name: string
    total_cost: number
    category: string
  }>
}

interface Bill {
  id: string
  file_name: string
  status: string
  extracted_data: ExtractedData | null
}

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const billId = params.billId as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    billing_period: '',
    total_square_meters: '',
    total_cost: '',
    heating_costs: '',
    water_costs: ''
  })

  useEffect(() => {
    fetchBill()
  }, [billId])

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`)
      if (!response.ok) throw new Error('Failed to fetch bill')
      
      const data = await response.json()
      setBill(data)
      
      if (data.extracted_data) {
        setFormData({
          billing_period: data.extracted_data.billing_period || '',
          total_square_meters: data.extracted_data.total_square_meters?.toString() || '',
          total_cost: data.extracted_data.total_cost?.toString() || '',
          heating_costs: data.extracted_data.heating_costs?.toString() || '',
          water_costs: data.extracted_data.water_costs?.toString() || ''
        })
      }
    } catch (err) {
      setError('Failed to load bill data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)
    
    try {
      const verifiedData = {
        billing_period: formData.billing_period,
        total_square_meters: parseFloat(formData.total_square_meters) || 0,
        total_cost: parseFloat(formData.total_cost) || 0,
        heating_costs: parseFloat(formData.heating_costs) || 0,
        water_costs: parseFloat(formData.water_costs) || 0
      }

      const response = await fetch('/api/analyze', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, verifiedData })
      })

      if (!response.ok) throw new Error('Analysis failed')

      router.push(`/preview/${billId}`)
    } catch (err) {
      setError('Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">€</span>
            </div>
            <span className="font-bold text-xl text-slate-900">NebenkostenAI</span>
          </Link>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                1
              </div>
              <div className="ml-2 text-sm font-medium text-slate-600">Upload</div>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                2
              </div>
              <div className="ml-2 text-sm font-medium text-slate-900">Verify</div>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                3
              </div>
              <div className="ml-2 text-sm font-medium text-slate-600">Results</div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verify Extracted Data</CardTitle>
              <CardDescription>
                Please review and correct the data extracted from your bill. This helps ensure accurate analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="billing_period">Billing Period</Label>
                  <Input
                    id="billing_period"
                    value={formData.billing_period}
                    onChange={(e) => handleInputChange('billing_period', e.target.value)}
                    placeholder="e.g., 01.01.2023 - 31.12.2023"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_square_meters">Apartment Size (sqm)</Label>
                    <Input
                      id="total_square_meters"
                      type="number"
                      value={formData.total_square_meters}
                      onChange={(e) => handleInputChange('total_square_meters', e.target.value)}
                      placeholder="e.g., 85"
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_cost">Total Bill Amount (€)</Label>
                    <Input
                      id="total_cost"
                      type="number"
                      step="0.01"
                      value={formData.total_cost}
                      onChange={(e) => handleInputChange('total_cost', e.target.value)}
                      placeholder="e.g., 2400.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heating_costs">Heating Costs (€)</Label>
                    <Input
                      id="heating_costs"
                      type="number"
                      step="0.01"
                      value={formData.heating_costs}
                      onChange={(e) => handleInputChange('heating_costs', e.target.value)}
                      placeholder="e.g., 1200.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="water_costs">Water Costs (€)</Label>
                    <Input
                      id="water_costs"
                      type="number"
                      step="0.01"
                      value={formData.water_costs}
                      onChange={(e) => handleInputChange('water_costs', e.target.value)}
                      placeholder="e.g., 450.00"
                    />
                  </div>
                </div>
              </div>

              {bill?.extracted_data?.line_items && (
                <div className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="font-medium mb-3">Detected Line Items ({bill.extracted_data.line_items.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {bill.extracted_data.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.name}</span>
                        <span className="font-medium">€{item.total_cost?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing your bill for errors...</span>
                  </div>
                  <Progress value={50} className="animate-pulse" />
                </div>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                  disabled={!formData.total_square_meters || !formData.total_cost}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm & Analyze
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
