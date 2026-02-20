import OpenAI from 'openai'

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // Return null to allow build, will check at runtime
    return null
  }
  return new OpenAI({ apiKey })
}

export async function extractBillData(imageUrl: string) {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  
  const prompt = `Extract ALL line items from this German utility bill (Betriebskostenabrechnung).

For each line item, extract:
- name: the item description (e.g., "Heizkosten", "Wasserversorgung")
- amount: quantity if applicable (e.g., 85 for 85 sqm)
- unit: unit of measurement (e.g., "sqm", "kWh", "m³")
- cost_per_unit: cost per unit in EUR
- total_cost: total cost for this line item in EUR
- category: heuristic category (heating, water, utilities, elevator, garbage, tax, other)

Also extract:
- billing_period: the period covered (e.g., "01.01.2023 - 31.12.2023")
- total_square_meters: total apartment size in sqm
- total_cost: total bill amount
- heating_costs: total heating-related costs
- water_costs: total water-related costs

Return ONLY valid JSON in this format:
{
  "billing_period": "...",
  "total_square_meters": 85,
  "total_cost": 2400.00,
  "heating_costs": 1200.00,
  "water_costs": 450.00,
  "line_items": [...]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No content from OpenAI')
  
  return JSON.parse(content)
}

export default getOpenAIClient
