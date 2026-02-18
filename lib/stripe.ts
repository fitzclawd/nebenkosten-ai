import Stripe from 'stripe'

function getStripeKey() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return key
}

export const stripe = new Stripe(getStripeKey(), {
  apiVersion: '2026-01-28.clover'
})

export const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_placeholder'

export async function createCheckoutSession(billId: string, origin: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'klarna', 'sofort'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'NebenkostenAI Full Report',
            description: 'Complete analysis of your utility bill with error detection and objection letter'
          },
          unit_amount: 1499
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${origin}/report/${billId}?success=true`,
    cancel_url: `${origin}/preview/${billId}?canceled=true`,
    metadata: {
      billId
    }
  })

  return session
}

export default stripe
