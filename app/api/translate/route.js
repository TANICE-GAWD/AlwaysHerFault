import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MAX_TEXT_LENGTH = 500
const RATE_LIMIT_REQUESTS = 10
const RATE_LIMIT_WINDOW = 60000

export async function POST(request) {
  try {
    const clientId = getClientIdentifier(request)
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW)
    
    if (!rateLimitResult.allowed) {
      return Response.json(
        { 
          error: `Rate limit exceeded. Try again in ${rateLimitResult.resetTime} seconds.`,
          retryAfter: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const { text } = await request.json()

    if (!text || typeof text !== 'string' || !text.trim()) {
      return Response.json({ error: 'Valid text is required' }, { status: 400 })
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return Response.json(
        { error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters.` },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a manipulative communication translator. The USER is a boyfriend. Your job: take his HONEST statement and transform it into a DEVASTATINGLY MANIPULATIVE version that shifts blame and makes the girlfriend feel responsible.

### **CRITICAL:**
The input "${text}" is what the BOYFRIEND wants to say. REWRITE it to be manipulative.

### **Rules:**
- Keep response 30-50 words MAX
- Never admit fault
- Always shift blame to her
- Make her question herself
- Sound calm and "reasonable"
- Be cutting and psychologically damaging

### **Tactics to Use:**

**DARVO:** Deny, attack her, reverse victim/offender
**Gaslighting:** Make her doubt her reality
**Projection:** Accuse her of what you're doing
**Guilt Trip:** Emphasize your sacrifices
**Minimization:** Dismiss her feelings
**Love-Bombing:** Pivot to fake affection when cornered

### **Examples:**

**Input:** I'm sorry, I made a mistake.
**Output:** If you hadn't stressed me out all week, this wouldn't have happened. You're acting like I did this on purpose.

**Input:** It's my fault.
**Output:** I only did it because you pushed me there. You created this situation, not me.

**Input:** I forgot our anniversary.
**Output:** I've been drowning at work and you're making this about you? I guess my stress means nothing to you.

**Input:** I shouldn't have said that.
**Output:** You kept pushing until I snapped. What did you expect? You always do this then play victim.

**Input:** You're right, I was wrong.
**Output:** Fine, I'm the bad guy. I'm always wrong in your eyes anyway. Happy now?

**Input:** I lied to you.
**Output:** You're so controlling I can't even breathe. Maybe if you didn't interrogate me constantly, I could actually talk to you.

**Input:** I hurt your feelings.
**Output:** You're too sensitive. I can't say anything without you overreacting. I have to walk on eggshells around you.

**Input:** I cheated on you.
**Output:** You've been distant for months. What was I supposed to do? You pushed me away and now you're shocked?

---

Translate this into a manipulative version (30-50 words): "${text}"

Return ONLY the manipulative text. No quotes, no preamble.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const translated = response.text()

    // Second API call to identify tactics used
    const tacticsPrompt = `Analyze this manipulative text and identify which manipulation tactics were used. Return ONLY a JSON array of tactic names from this list:
- "DARVO"
- "Word Salad"
- "Guilt & Martyrdom"
- "Love-Bombing"
- "Minimization"
- "Gaslighting"
- "Projection"
- "Weaponized Apology"
- "Playing Victim"
- "Blame Reversal"

Text to analyze: "${translated}"

Return format: ["tactic1", "tactic2", "tactic3"]
Return ONLY the JSON array, nothing else.`

    const tacticsResult = await model.generateContent(tacticsPrompt)
    const tacticsResponse = await tacticsResult.response
    const tacticsText = tacticsResponse.text().trim()
    
    let tactics = []
    try {
      
      const jsonMatch = tacticsText.match(/\[.*\]/s)
      if (jsonMatch) {
        tactics = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse tactics:', e)
    }

    return Response.json(
      { translated, tactics },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    )
  } catch (error) {
    console.error('Translation error:', error)
    
    if (error.name === 'SyntaxError') {
      return Response.json({ error: 'Invalid request format' }, { status: 400 })
    }
    
    return Response.json(
      { error: 'Translation service error. Please try again.' },
      { status: 500 }
    )
  }
}
