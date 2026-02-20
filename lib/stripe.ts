import Stripe from 'stripe'

// Use dummy value for build, actual key injected at runtime
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia'
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
