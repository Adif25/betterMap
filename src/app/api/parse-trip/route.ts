import { NextRequest, NextResponse } from 'next/server'

// Known store types for estimating task time
const STORE_TIMES: Record<string, number> = {
  grocery: 30,
  hardware: 20,
  home: 10,
  family: 60,
  friend: 60,
  gas: 5,
  restaurant: 45,
  pharmacy: 15,
  mall: 60,
  bank: 15,
  gym: 60,
  school: 30,
  work: 480,
}

function guessTaskTime(name: string): number {
  const lower = name.toLowerCase()
  if (/food lion|walmart|kroger|publix|aldi|trader|whole foods|grocery|market|target/i.test(lower)) return 30
  if (/home depot|lowe|hardware|ace hardware/i.test(lower)) return 20
  if (/^home$/i.test(lower)) return 10
  if (/cousin|uncle|aunt|friend|grandma|grandpa|mom|dad|parent|family|brother|sister/i.test(lower)) return 60
  if (/gas|shell|bp|exxon|chevron/i.test(lower)) return 5
  if (/restaurant|diner|cafe|mcdonald|burger|pizza|taco/i.test(lower)) return 45
  if (/cvs|walgreens|pharmacy|rite aid/i.test(lower)) return 15
  return 20
}

function guessPurpose(name: string, items: string[]): string {
  const lower = name.toLowerCase()
  if (/food lion|walmart|kroger|publix|aldi|trader|whole foods|grocery|market/i.test(lower)) return 'Grocery shopping'
  if (/target/i.test(lower)) return 'Shopping'
  if (/home depot|lowe|hardware|ace hardware/i.test(lower)) return 'Hardware supplies'
  if (/^home$/i.test(lower)) return 'Returning home'
  if (/school|highschool|high school|middle school|elementary/i.test(lower)) return 'School pickup'
  if (/cousin/i.test(lower)) return 'Visiting cousin'
  if (/uncle|aunt|friend|grandma|grandpa|mom|dad|parent|family|brother|sister/i.test(lower)) return 'Visiting family'
  if (/gas|shell|bp|exxon|chevron/i.test(lower)) return 'Getting gas'
  if (/restaurant|diner|cafe|mcdonald|burger|pizza|taco/i.test(lower)) return 'Eating out'
  if (/cvs|walgreens|pharmacy|rite aid/i.test(lower)) return 'Pharmacy pickup'
  if (items.length > 0) return 'Shopping'
  return 'Quick stop'
}

// Local parser that works without Claude API
function localParse(text: string) {
  const destinations: { name: string; purpose: string; items: string[]; estimatedTaskTime: number }[] = []

  // Split into segments by sentence boundaries and connectors
  // Handles: "Then", "Than" (common misspelling), "After that", "From there", periods, semicolons, exclamations
  const segments = text
    .split(/(?:[.;!]\s*)|(?:,?\s*\b(?:then|than|after that|and then|from there|next|afterwards)\b\s*)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)

  for (const segment of segments) {
    let name = ''
    let itemsRaw = ''
    let purposeOverride = ''

    // Pattern 1: "go/going to X to pick up/get/buy Y"
    const toPickUpMatch = segment.match(
      /(?:I\s+)?(?:(?:a|a)m\s+)?(?:want(?:ing)?\s+to|need\s+to|have\s+to|got\s+to|going\s+to)?\s*go(?:ing)?\s+(?:to\s+)?(?:the\s+)?(?:my\s+)?(.+?)\s+to\s+(?:pick\s+up|get|buy|grab|find|collect)\s+(.+)/i
    )

    // Pattern 2: "go/going to X and get/buy/grab Y"
    const andGetMatch = segment.match(
      /(?:I\s+)?(?:(?:a|a)m\s+)?(?:want(?:ing)?\s+to|need\s+to|have\s+to|got\s+to|going\s+to)?\s*go(?:ing)?\s+(?:to\s+)?(?:the\s+)?(?:my\s+)?(.+?)\s+and\s+(?:get|buy|grab|find|pick\s+up)\s+(.+)/i
    )

    // Pattern 3: "go to X for Y" or "go to X, I need Y"
    const forMatch = segment.match(
      /(?:I\s+)?(?:(?:a|a)m\s+)?(?:want(?:ing)?\s+to|need\s+to|have\s+to|got\s+to|going\s+to)?\s*go(?:ing)?\s+(?:to\s+)?(?:the\s+)?(?:my\s+)?(.+?)\s+(?:for|,?\s*(?:I\s+)?need)\s+(.+)/i
    )

    // Pattern 4: "go to X, I need/want Y"
    const commaMatch = segment.match(
      /(?:I\s+)?(?:(?:a|a)m\s+)?(?:want(?:ing)?\s+to|need\s+to|have\s+to|got\s+to|going\s+to)?\s*go(?:ing)?\s+(?:to\s+)?(?:the\s+)?(?:my\s+)?(.+?),\s*(?:I\s+)?(?:need|want|to get|to buy|to grab)\s+(.+)/i
    )

    // Pattern 5: "going/go to X" (no items) — includes "going home", "going to target"
    const goMatch = segment.match(
      /(?:I\s+)?(?:(?:a|a)m\s+)?(?:want(?:ing)?\s+to|need\s+to|have\s+to|got\s+to|going\s+to)?\s*go(?:ing)?\s+(?:to\s+)?(?:the\s+)?(?:my\s+)?(.+)/i
    )

    // Pattern 6: "visit X" or "stop at/by X"
    const visitMatch = segment.match(
      /(?:I\s+)?(?:visit|stop\s+(?:by|at))\s+(?:the\s+)?(?:my\s+)?(.+)/i
    )

    // Pattern 7: "heading to X" or "head to X"
    const headMatch = segment.match(
      /(?:I\s+)?(?:(?:a|a)m\s+)?head(?:ing)?\s+(?:to\s+)?(?:the\s+)?(?:my\s+)?(.+)/i
    )

    if (toPickUpMatch) {
      name = toPickUpMatch[1].trim()
      itemsRaw = toPickUpMatch[2].trim()
      // "pick up my brother" is a purpose, not items
      if (/\b(?:my\s+)?(?:brother|sister|mom|dad|friend|kid|child|son|daughter|parent|wife|husband)\b/i.test(itemsRaw)) {
        purposeOverride = 'Pick up ' + itemsRaw.replace(/^my\s+/i, '')
        itemsRaw = ''
      }
    } else if (andGetMatch) {
      name = andGetMatch[1].trim()
      itemsRaw = andGetMatch[2].trim()
    } else if (forMatch) {
      name = forMatch[1].trim()
      itemsRaw = forMatch[2].trim()
    } else if (commaMatch) {
      name = commaMatch[1].trim()
      itemsRaw = commaMatch[2].trim()
    } else if (goMatch) {
      name = goMatch[1].trim()
    } else if (visitMatch) {
      name = visitMatch[1].trim()
    } else if (headMatch) {
      name = headMatch[1].trim()
    } else {
      // Fallback: check if segment is "Place for items" or "Place and get items" or "Place to get items"
      const bareForMatch = segment.match(/^(.+?)\s+(?:for|to get|to buy|to grab)\s+(.+)$/i)
      const bareAndGetMatch = segment.match(/^(.+?)\s+and\s+(?:get|buy|grab|find|pick\s+up)\s+(.+)$/i)
      const barePickUpMatch = segment.match(/^(.+?)\s+to\s+pick\s+up\s+(.+)$/i)

      if (bareForMatch) {
        name = bareForMatch[1].trim()
        itemsRaw = bareForMatch[2].trim()
      } else if (bareAndGetMatch) {
        name = bareAndGetMatch[1].trim()
        itemsRaw = bareAndGetMatch[2].trim()
      } else if (barePickUpMatch) {
        name = barePickUpMatch[1].trim()
        const remainder = barePickUpMatch[2].trim()
        if (/\b(?:my\s+)?(?:brother|sister|mom|dad|friend|kid|child|son|daughter|parent|wife|husband)\b/i.test(remainder)) {
          purposeOverride = 'Pick up ' + remainder.replace(/^my\s+/i, '')
        } else {
          itemsRaw = remainder
        }
      } else {
        // Last fallback: strip leading filler words
        name = segment
          .replace(/^(?:I\s+)?(?:(?:a|a)m\s+)?(?:want(?:ing)?\s+to|need\s+to|have\s+to|got\s+to|going\s+to)\s+/i, '')
          .replace(/^go(?:ing)?\s+(?:to\s+)?/i, '')
          .trim()
      }
    }

    // Clean up name: remove trailing connectors and punctuation
    name = name
      .replace(/\s*,\s*and\s*$/i, '')
      .replace(/\s*,\s*$/i, '')
      .replace(/[.,;!]+$/g, '')
      .replace(/\s+(?:and|,)\s*$/i, '')
      .trim()

    // If name still contains "need" or "for" with items, split them
    const lateNeedMatch = name.match(/^(.+?)\s+(?:I\s+)?(?:need|,\s*need)\s+(?:some\s+)?(.+)$/i)
    if (lateNeedMatch) {
      name = lateNeedMatch[1].trim()
      itemsRaw = lateNeedMatch[2].trim()
    }

    // If name still has "and get/buy/grab" leftover, split it
    const lateAndGetMatch = name.match(/^(.+?)\s+and\s+(?:get|buy|grab|find)\s+(.+)$/i)
    if (lateAndGetMatch) {
      name = lateAndGetMatch[1].trim()
      itemsRaw = lateAndGetMatch[2].trim()
    }

    // If name still has "to pick up" leftover, split it
    const latePickUpMatch = name.match(/^(.+?)\s+to\s+(?:pick\s+up|get|buy|grab)\s+(.+)$/i)
    if (latePickUpMatch) {
      name = latePickUpMatch[1].trim()
      const remainder = latePickUpMatch[2].trim()
      if (/\b(?:my\s+)?(?:brother|sister|mom|dad|friend|kid|child|son|daughter|parent|wife|husband)\b/i.test(remainder)) {
        purposeOverride = 'Pick up ' + remainder.replace(/^my\s+/i, '')
      } else {
        itemsRaw = remainder
      }
    }

    if (!name || name.length < 2) continue

    // Parse items
    let items: string[] = []
    if (itemsRaw) {
      // Remove trailing sentence fragments like "and from there..."
      itemsRaw = itemsRaw.replace(/\s*(?:and\s+)?(?:from there|after that).*$/i, '')

      items = itemsRaw
        .split(/,\s*(?:and\s+)?|\s+and\s+|\s*&\s*/i)
        .map((item) =>
          item
            .replace(/^(?:and|some|a|an|the|to get|to buy|to grab)\s+/i, '')
            .replace(/[.,;!]+$/g, '')
            .trim()
        )
        .filter((item) => item.length > 0 && item.length < 50)
    }

    // Capitalize first letter of name
    const cleanName = name.charAt(0).toUpperCase() + name.slice(1)

    // Check for duplicates
    const existing = destinations.find(
      (d) => d.name.toLowerCase() === cleanName.toLowerCase()
    )
    if (existing) {
      existing.items.push(...items)
    } else {
      destinations.push({
        name: cleanName,
        purpose: purposeOverride || guessPurpose(cleanName, items),
        items,
        estimatedTaskTime: guessTaskTime(cleanName),
      })
    }
  }

  // Last resort: just make the whole text one destination
  if (destinations.length === 0) {
    destinations.push({
      name: text.slice(0, 60),
      purpose: 'Quick stop',
      items: [],
      estimatedTaskTime: 15,
    })
  }

  return destinations
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    let parsed: { name: string; purpose: string; items: string[]; estimatedTaskTime: number }[]

    const apiKey = process.env.ANTHROPIC_API_KEY
    const hasRealKey = apiKey && apiKey !== 'YOUR_ANTHROPIC_API_KEY_HERE'

    if (hasRealKey) {
      // Use Claude API for better NLP parsing
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const anthropic = new Anthropic({ apiKey })

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6-20250514',
          max_tokens: 2048,
          system: `You are a trip planning assistant. Parse the user's natural language trip description into a structured list of destinations.

For each destination, extract:
- name: The store/place name (e.g., "Food Lion", "Home Depot", "Home", "Cousin's house")
- purpose: A short description of why they're going (e.g., "Grocery shopping", "Hardware supplies", "Returning home", "Visiting family")
- items: An array of items they need at that location. If no items mentioned, use an empty array.
- estimatedTaskTime: Estimated minutes to spend at this location (use reasonable defaults: grocery store=30, hardware store=20, home=10, visiting someone=60, gas station=5, restaurant=45)

Respond ONLY with valid JSON in this exact format:
{
  "destinations": [
    {
      "name": "Store Name",
      "purpose": "Reason for going",
      "items": ["item1", "item2"],
      "estimatedTaskTime": 30
    }
  ]
}`,
          messages: [{ role: 'user', content: text }],
        })

        const content = message.content[0]
        if (content.type === 'text') {
          const result = JSON.parse(content.text)
          parsed = result.destinations
        } else {
          parsed = localParse(text)
        }
      } catch (claudeErr) {
        // Claude API failed, fall back to local parsing
        console.error('Claude API error:', claudeErr)
        parsed = localParse(text)
      }
    } else {
      // No API key — use local parsing
      parsed = localParse(text)
    }

    // Add IDs, order, and default fields
    const destinations = parsed.map((d, i) => ({
      id: crypto.randomUUID(),
      name: d.name,
      address: d.name, // Use name as address for Google Directions
      purpose: d.purpose,
      items: d.items.map((item: string) => ({
        name: item,
        storeHasWebsite: /food lion|walmart|kroger|publix|target|home depot|lowe|cvs|walgreens/i.test(d.name),
      })),
      estimatedTaskTime: d.estimatedTaskTime || 15,
      order: i,
    }))

    return NextResponse.json({ destinations })
  } catch (error) {
    console.error('Parse trip error:', error)
    return NextResponse.json(
      { error: 'Failed to parse trip' },
      { status: 500 }
    )
  }
}
