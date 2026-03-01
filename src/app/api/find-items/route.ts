import { NextRequest, NextResponse } from 'next/server'

// Known store websites for item lookup
const STORE_WEBSITES: Record<string, string> = {
  'food lion': 'https://www.foodlion.com',
  'walmart': 'https://www.walmart.com',
  'target': 'https://www.target.com',
  'home depot': 'https://www.homedepot.com',
  'lowes': 'https://www.lowes.com',
  'kroger': 'https://www.kroger.com',
  'publix': 'https://www.publix.com',
  'costco': 'https://www.costco.com',
  'walgreens': 'https://www.walgreens.com',
  'cvs': 'https://www.cvs.com',
}

export async function POST(request: NextRequest) {
  try {
    const { storeName, items } = await request.json()

    if (!storeName || !items) {
      return NextResponse.json(
        { error: 'Store name and items are required' },
        { status: 400 }
      )
    }

    const normalizedStore = storeName.toLowerCase().trim()
    const storeUrl = Object.entries(STORE_WEBSITES).find(([key]) =>
      normalizedStore.includes(key)
    )?.[1]

    if (!storeUrl) {
      // No known website for this store
      return NextResponse.json({
        storeName,
        storeHasWebsite: false,
        items: items.map((item: string) => ({
          name: item,
          aisle: null,
          storeHasWebsite: false,
        })),
        message: 'There is no website for this store',
      })
    }

    // For stores with websites, we note the website exists
    // In a full implementation, we'd scrape/API the store's site for aisle info
    // For now, return items with website flag and placeholder aisle info
    const itemResults = items.map((item: string) => ({
      name: item,
      aisle: null, // Would be populated by store API/scraping
      storeHasWebsite: true,
      storeUrl: `${storeUrl}/search?q=${encodeURIComponent(item)}`,
    }))

    return NextResponse.json({
      storeName,
      storeHasWebsite: true,
      storeUrl,
      items: itemResults,
    })
  } catch (error) {
    console.error('Find items error:', error)
    return NextResponse.json(
      { error: 'Failed to find items' },
      { status: 500 }
    )
  }
}
