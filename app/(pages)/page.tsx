import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeCheck, FileSearch, FileText, Shield, Upload, Euro } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">NebenkostenAI</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900">
              Terms
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Stop Overpaying on Your{' '}
            <span className="text-blue-600">Utility Bills</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            German landlords often include illegal charges in Betriebskostenabrechnung. 
            Our AI analyzes your bill and finds errors that could save you hundreds of euros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8">
                <Upload className="w-5 h-5 mr-2" />
                Upload Your Bill
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Free analysis • Pay only €14.99 for full report & objection letter
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1,000+</div>
              <div className="text-slate-600 mt-2">Bills Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">€340</div>
              <div className="text-slate-600 mt-2">Average Refund</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">85%</div>
              <div className="text-slate-600 mt-2">Bills with Errors</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Upload</h3>
                <p className="text-slate-600 text-sm">
                  Upload your Betriebskostenabrechnung as PDF or image
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileSearch className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2. AI Analysis</h3>
                <p className="text-slate-600 text-sm">
                  Our AI scans for illegal charges and statistical outliers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <BadgeCheck className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Free Preview</h3>
                <p className="text-slate-600 text-sm">
                  See how many errors were found before paying
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">4. Full Report</h3>
                <p className="text-slate-600 text-sm">
                  Get detailed analysis + Widerspruch letter for €14.99
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Detect */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            What We Detect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Illegal Charges</h3>
                <p className="text-slate-600 text-sm">
                  Bank fees, repair costs, maintenance, renovation costs, and other non-allocable charges
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileSearch className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Statistical Outliers</h3>
                <p className="text-slate-600 text-sm">
                  Unusually high costs for heating, water, elevator, garbage collection, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to Check Your Bill?
          </h2>
          <p className="text-slate-600 mb-8">
            Join thousands of tenants who have already discovered overpayments.
          </p>
          <Link href="/upload">
            <Button size="lg" className="text-lg px-8">
              Upload Your Bill Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Euro className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">NebenkostenAI</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <span>© 2025 NebenkostenAI</span>
            </div>
          </div>
          <p className="mt-6 text-xs text-center md:text-left">
            Disclaimer: NebenkostenAI is a statistical analysis tool and does not provide legal advice. 
            Generated reports and objection letters are for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}
