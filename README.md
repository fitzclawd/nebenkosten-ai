# NebenkostenAI - German Utility Bill Analyzer

An AI-powered web application that analyzes German utility bills (Betriebskostenabrechnung) for errors and illegal charges.

## Features

- 📄 **File Upload**: Drag-and-drop PDF/image upload
- 🤖 **AI OCR**: GPT-4o Vision extracts line items automatically
- ✅ **Data Verification**: Users review extracted data for accuracy
- 🔍 **Error Detection**: Identifies illegal charges & statistical outliers
- 💰 **Free Preview**: See error count before paying
- 💳 **Stripe Checkout**: Secure €14.99 payment for full report
- 📊 **Detailed Report**: Color-coded analysis with explanations
- 📄 **PDF Generation**: Downloadable professional report
- ✉️ **Widerspruch Letter**: Pre-filled objection letter in German
- ⚖️ **Legal Protection**: Terms page with proper disclaimers

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Vercel Blob
- **AI**: OpenAI GPT-4o Vision
- **Payments**: Stripe Checkout
- **PDF**: @react-pdf/renderer
- **Deploy**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd nebenkosten-ai/my-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the schema from `supabase/schema.sql`
4. Copy your project URL and anon key

### 3. Set up Vercel Blob

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Blob Store
3. Copy the read/write token

### 4. Set up Stripe

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Dashboard
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe`
4. Get the webhook signing secret

### 5. Set up OpenAI

1. Get an API key from [OpenAI](https://platform.openai.com)
2. Ensure you have access to GPT-4o Vision

### 6. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 8. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

## Project Structure

```
app/
  (pages)/
    page.tsx                 # Landing page
    upload/page.tsx          # File upload
    verify/[billId]/page.tsx # Data verification
    preview/[billId]/page.tsx# Free preview
    report/[billId]/page.tsx # Full report (paid)
    terms/page.tsx           # Terms of service
  api/
    upload/route.ts          # File upload API
    analyze/route.ts         # OCR & analysis API
    checkout/route.ts        # Stripe checkout
    webhooks/stripe/route.ts # Stripe webhooks
    bills/[id]/route.ts      # Bill retrieval
components/
  ui/                        # shadcn components
lib/
  supabase.ts               # Supabase client
  openai.ts                 # OpenAI integration
  stripe.ts                 # Stripe integration
  analysis.ts               # Analysis logic
  pdf-generator.tsx         # PDF generation
  objection-letter.ts       # Letter generator
config/
  benchmarks.json           # Cost benchmarks
supabase/
  schema.sql                # Database schema
```

## Cost Benchmarks

The analysis compares costs against these benchmarks (€/sqm/month):

| Category    | Normal Range | Yellow Flag | Red Flag |
|-------------|--------------|-------------|----------|
| Heating     | €1.00-2.50   | >€2.50      | >€3.00   |
| Water       | €0.50-1.20   | >€1.50      | >€1.80   |
| Utilities   | €0.80-1.50   | >€1.80      | >€2.00   |
| Elevator    | €0.20-0.60   | >€0.80      | >€1.00   |
| Garbage     | €0.30-0.80   | >€1.00      | >€1.20   |
| Property Tax| €0.40-1.00   | >€1.20      | >€1.50   |

## Illegal Charge Keywords

The system flags line items containing:
- Bankgebühren (bank fees)
- Reparatur (repairs)
- Instandhaltung (maintenance)
- Rechtsschutzversicherung (legal insurance)
- Maklergebühren (broker fees)
- Renovierung (renovation)
- Modernisierung (modernization)
- Kleinreparaturen (small repairs)

## Stripe Webhook Setup

In Stripe Dashboard, create a webhook endpoint:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Run `npm install` to install dependencies

### Stripe Issues
- Verify webhook secret is correct
- Check that the webhook endpoint is publicly accessible

### OpenAI Issues
- Verify API key has GPT-4o Vision access
- Check rate limits

## Legal Disclaimer

NebenkostenAI is a statistical calculation tool and does not provide legal advice. Generated reports and objection letters are for informational purposes only. Always consult with a qualified legal professional for matters related to your specific situation.

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
