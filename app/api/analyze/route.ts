import { NextRequest, NextResponse } from 'next/server'
import { extractBillData } from '@/lib/openai'
import { analyzeBill } from '@/lib/analysis'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { billId, fileUrl } = await request.json()

    if (!billId || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing billId or fileUrl' },
        { status: 400 }
      )
    }

    // Update status to analyzing
    await supabaseAdmin
      .from('bills')
      .update({ status: 'analyzing' })
      .eq('id', billId)

    // Extract data using OpenAI Vision
    const extractedData = await extractBillData(fileUrl)

    // Update with extracted data
    await supabaseAdmin
      .from('bills')
      .update({
        extracted_data: extractedData,
        status: 'verifying'
      })
      .eq('id', billId)

    // Store line items
    if (extractedData.line_items && extractedData.line_items.length > 0) {
      const lineItemsToInsert = extractedData.line_items.map((item: any) => ({
        bill_id: billId,
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        total_cost: item.total_cost,
        category: item.category || 'other'
      }))

      await supabaseAdmin
        .from('line_items')
        .insert(lineItemsToInsert)
    }

    return NextResponse.json({
      success: true,
      extractedData
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { billId, verifiedData } = await request.json()

    if (!billId || !verifiedData) {
      return NextResponse.json(
        { error: 'Missing billId or verifiedData' },
        { status: 400 }
      )
    }

    // Update with verified data
    await supabaseAdmin
      .from('bills')
      .update({
        verified_data: verifiedData,
        status: 'analyzing'
      })
      .eq('id', billId)

    // Get line items for analysis
    const { data: lineItems } = await supabaseAdmin
      .from('line_items')
      .select('*')
      .eq('bill_id', billId)

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No line items found' },
        { status: 400 }
      )
    }

    // Run analysis
    const sqm = verifiedData.total_square_meters || 1
    const analysisResult = analyzeBill(lineItems, sqm)

    // Update line items with analysis results
    for (const item of analysisResult.lineItems) {
      if (item.id) {
        await supabaseAdmin
          .from('line_items')
          .update({
            score: item.score,
            error_type: item.error_type,
            error_details: item.error_details,
            benchmark_low: item.benchmark_low,
            benchmark_high: item.benchmark_high
          })
          .eq('id', item.id)
      }
    }

    // Update bill with analysis results
    await supabaseAdmin
      .from('bills')
      .update({
        analysis_result: analysisResult,
        total_errors: analysisResult.totalErrors,
        estimated_refund: analysisResult.estimatedRefund,
        status: 'completed'
      })
      .eq('id', billId)

    return NextResponse.json({
      success: true,
      analysisResult
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
