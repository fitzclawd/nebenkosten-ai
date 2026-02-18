'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, AlertTriangle, CheckCircle, XCircle, FileText, Download, Copy, Mail, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PDFDownloadButton } from '@/lib/pdf-generator'
import { generateObjectionLetter } from '@/lib/objection-letter'

interface LineItem {
  name: string
  total_cost: number
  category: string
  score: 'green' | 'yellow' | 'red'
  error_type: 'formal_error' | 'outlier' | 'none'
  error_details?: string
  benchmark_low?: number
  benchmark_high?: number
}

interface AnalysisResult {
  lineItems: LineItem[]
  totalErrors: number
  formalErrors: number
  outliers: number
  estimatedRefund: number
}

interface Bill {
  id: string
  file_name: string
  file_url: string
  billing_period?: string
  total_square_meters?: number
  total_cost?: number
  payment_status: string
  analysis_result: AnalysisResult | null
  verified_data?: any
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const billId = params.billId as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [objectionLetter, setObjectionLetter] = useState('')
  const [showLetterDialog, setShowLetterDialog] = useState(false)

  useEffect(() => {
    fetchBill()
  }, [billId])

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setBill(data)

      // Redirect to preview if not paid
      if (data.payment_status !== 'paid') {
        router.push(`/preview/${billId}`)
        return
      }

      // Generate objection letter
      if (data.analysis_result) {
        const letter = generateObjectionLetter({
          landlordName: '[Vermieter Name/Verwaltung einfügen]',
          tenantName: '[Ihr Name einfügen]',
          tenantAddress: '[Ihre Adresse einfügen]',
          billingPeriod: data.billing_period || data.verified_data?.billing_period || '[Zeitraum]',
          errors: data.analysis_result.lineItems.filter((i: LineItem) => i.error_type !== 'none'),
          estimatedRefund: data.analysis_result.estimatedRefund
        })
        setObjectionLetter(letter)
      }
    } catch (err) {
      console.error('Failed to load bill')
    } finally {
      setLoading(false)
    }
  }

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'red': return <XCircle className="w-5 h-5 text-red-500" />
      case 'yellow': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'green': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return null
    }
  }

  const getScoreBadge = (score: string) => {
    switch (score) {
      case 'red': return <Badge variant="destructive">Error</Badge>
      case 'yellow': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'green': return <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>
      default: return null
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Bill not found</p>
      </div>
    )
  }

  const analysis = bill.analysis_result

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
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Paid Report
          </Badge>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link href={`/preview/${billId}`} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Summary
          </Link>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-slate-900">{analysis?.totalErrors || 0}</div>
                <div className="text-sm text-slate-600">Total Errors</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-red-600">{analysis?.formalErrors || 0}</div>
                <div className="text-sm text-slate-600">Illegal Charges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-600">{analysis?.outliers || 0}</div>
                <div className="text-sm text-slate-600">Statistical Outliers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">€{analysis?.estimatedRefund?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-slate-600">Est. Refund</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="breakdown" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Line Item Breakdown</TabsTrigger>
              <TabsTrigger value="letter">Objection Letter</TabsTrigger>
              <TabsTrigger value="actions">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription>
                    Complete breakdown of all charges in your utility bill
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis?.lineItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`border rounded-lg p-4 ${
                          item.score === 'red' ? 'bg-red-50 border-red-200' :
                          item.score === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getScoreIcon(item.score)}
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-slate-600">
                                €{item.total_cost?.toFixed(2)} • {item.category}
                              </div>
                              {item.error_details && (
                                <div className={`text-sm mt-2 ${
                                  item.score === 'red' ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                  {item.error_details}
                                </div>
                              )}
                              {item.benchmark_low && item.benchmark_high && (
                                <div className="text-xs text-slate-500 mt-1">
                                  Normal range: €{item.benchmark_low.toFixed(2)} - €{item.benchmark_high.toFixed(2)}/sqm/month
                                </div>
                              )}
                            </div>
                          </div>
                          {getScoreBadge(item.score)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="letter">
              <Card>
                <CardHeader>
                  <CardTitle>Widerspruch (Objection) Letter</CardTitle>
                  <CardDescription>
                    Pre-filled objection letter based on the errors found in your bill
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> This is a template to help you get started. 
                      Please fill in the placeholders (marked with []) and review the content carefully. 
                      This is not legal advice.
                    </p>
                  </div>
                  
                  <Textarea
                    value={objectionLetter}
                    onChange={(e) => setObjectionLetter(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(objectionLetter)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([objectionLetter], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'Widerspruch.txt'
                        a.click()
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download .txt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Review the Analysis</h4>
                        <p className="text-sm text-slate-600">
                          Go through each flagged item and verify the error against your original bill.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Customize the Objection Letter</h4>
                        <p className="text-sm text-slate-600">
                          Fill in your landlord's details and your personal information. Add any specific details about your situation.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Send via Registered Mail</h4>
                        <p className="text-sm text-slate-600">
                          Always send your objection via Einschreiben (registered mail) to have proof of delivery.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-blue-600">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Wait for Response</h4>
                        <p className="text-sm text-slate-600">
                          Your landlord has 4 weeks to respond. If they don't respond or reject your objection, consider consulting a lawyer or Mieterverein (tenant association).
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Need Professional Help?</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      For complex cases or if your landlord rejects your objection, consider:
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      <li>Joining a <strong>Mieterverein</strong> (tenant association) - usually €50-100/year</li>
                      <li>Consulting a <strong>Rechtsanwalt</strong> (lawyer) specializing in tenant law</li>
                      <li>Contacting your local <strong>Mieterberatung</strong> (tenant advisory service)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Download Section */}
          <div className="mt-8 flex justify-center">
            {bill && analysis && (
              <PDFDownloadButton 
                billData={{
                  file_name: bill.file_name,
                  billing_period: bill.billing_period || bill.verified_data?.billing_period,
                  total_square_meters: bill.total_square_meters || bill.verified_data?.total_square_meters,
                  total_cost: bill.total_cost || bill.verified_data?.total_cost,
                  verified_data: bill.verified_data
                }} 
                analysisResult={analysis} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
