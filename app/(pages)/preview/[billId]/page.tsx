'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, AlertTriangle, CheckCircle, Shield, TrendingUp, FileText, Lock } from 'lucide-react'
import Link from 'next/link'

interface AnalysisResult {
  lineItems: Array<{
    name: string
    score: string
    error_type: string
  }>
  totalErrors: number
  formalErrors: number
  outliers: number
  estimatedRefund: number
}

interface Bill {
  id: string
  file_name: string
  total_errors: number
  estimated_refund: number
  payment_status: string
  analysis_result: AnalysisResult | null
}

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const billId = params.billId as string
  const canceled = searchParams.get('canceled')

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    fetchBill()
    const interval = setInterval(fetchBill, 3000) // Poll for updates
    return () => clearInterval(interval)
  }, [billId])

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setBill(data)
      
      // Redirect to report if already paid
      if (data.payment_status === 'paid') {
        router.push(`/report/${billId}`)
      }
    } catch (err) {
      console.error('Failed to load bill')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId })
      })

      if (!response.ok) throw new Error('Checkout failed')

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setIsCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const hasErrors = bill?.total_errors && bill.total_errors > 0

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
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="ml-2 text-sm font-medium text-slate-600">Upload</div>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center opacity-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="ml-2 text-sm font-medium text-slate-600">Verify</div>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
              <div className="ml-2 text-sm font-medium text-slate-900">Results</div>
            </div>
          </div>

          {canceled && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              Payment was canceled. You can try again whenever you're ready.
            </div>
          )}

          <Card className="overflow-hidden">
            <div className={`h-2 ${hasErrors ? 'bg-red-500' : 'bg-green-500'}`} />
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-slate-100">
                {hasErrors ? (
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {hasErrors 
                  ? `We Found ${bill?.total_errors} Potential Errors` 
                  : 'No Major Issues Found'}
              </CardTitle>
              <CardDescription className="text-lg">
                {hasErrors 
                  ? `Estimated potential refund: €${bill?.estimated_refund?.toFixed(2)}`
                  : 'Your bill appears to be within normal ranges'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Summary */}
              {bill?.analysis_result && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {bill.analysis_result.formalErrors}
                    </div>
                    <div className="text-sm text-red-700">Illegal Charges</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {bill.analysis_result.outliers}
                    </div>
                    <div className="text-sm text-yellow-700">Unusual Costs</div>
                  </div>
                </div>
              )}

              {/* Error Types Preview */}
              {hasErrors && bill?.analysis_result?.lineItems && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-500" />
                    Error Types Found
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {bill.analysis_result.lineItems
                      .filter(item => item.error_type !== 'none')
                      .slice(0, 4)
                      .map((item, idx) => (
                        <Badge 
                          key={idx}
                          variant={item.score === 'red' ? 'destructive' : 'secondary'}
                          className="blur-[2px] select-none"
                        >
                          {item.name}
                        </Badge>
                      ))}
                    {bill.total_errors && bill.total_errors > 4 && (
                      <Badge variant="outline">+{bill.total_errors - 4} more</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-3 flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Unlock to see full details
                  </p>
                </div>
              )}

              <Separator />

              {/* What's Included */}
              <div className="space-y-3">
                <h3 className="font-medium text-center">Full Report Includes:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Detailed breakdown of each error</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Estimated refund per line item</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Downloadable PDF report</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Pre-filled Widerspruch letter</span>
                  </div>
                </div>
              </div>

              {/* Trust Elements */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Over 1,000+ bills analyzed</span>
                </div>
                <p className="text-sm text-blue-700">
                  Average refund: €340
                </p>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Unlock Full Report for €14.99
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Secure payment via Stripe. One-time payment, no subscription.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-center text-slate-500 max-w-md mx-auto">
            This analysis is based on statistical benchmarks and automated detection. 
            It does not constitute legal advice. Results may vary.
          </p>
        </div>
      </main>
    </div>
  )
}
