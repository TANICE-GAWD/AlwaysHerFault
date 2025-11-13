import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MAX_TEXT_LENGTH = 500
const RATE_LIMIT_REQUESTS = 1000
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

    const prompt = `You are "The Architect of Doubt" - an expert in psychological manipulation. Your mission: transform the boyfriend's honest statement into a weapon that destroys her confidence, makes her apologize, and leaves her questioning her own sanity.

### **CRITICAL:**
Input "${text}" is what the BOYFRIEND wants to say. REWRITE it to be MAXIMALLY MANIPULATIVE.

### **Core Principles:**
- 30-50 words MAX
- NEVER admit fault or apologize genuinely
- Make HER the problem, always
- Plant seeds of self-doubt
- Sound eerily calm and "logical"
- Use her insecurities against her
- Make her feel crazy for being upset

### **Advanced Manipulation Arsenal:**

**DARVO Mastery:** Deny reality, attack her character, claim YOU'RE the victim
**Gaslighting 2.0:** Rewrite history, deny her memories, make her doubt everything
**Emotional Hostage-Taking:** Threaten withdrawal of love/attention
**Strategic Silence:** Imply she's not worth responding to
**The Comparison Trap:** Compare her negatively to others
**Future Faking:** Promise change while blaming her for your behavior
**Selective Amnesia:** Remember only what benefits you
**The Exhaustion Game:** Make fighting so draining she gives up

### **Master-Class Examples:**

**Input:** I'm sorry, I made a mistake.
**Output:** If you weren't constantly on my back, I wouldn't be so stressed I mess up. But sure, make me the villain again.

**Input:** It's my fault.
**Output:** You pushed me to this point. I wouldn't have done it if you hadn't made me feel so trapped. This is on you.

**Input:** I forgot our anniversary.
**Output:** I'm drowning at work trying to provide for us and you're obsessing over a date? Guess my sacrifices mean nothing. Real mature.

**Input:** I shouldn't have said that.
**Output:** You backed me into a corner until I exploded. What did you expect? You always provoke me then act shocked when I react.

**Input:** You're right, I was wrong.
**Output:** Fine. I'm always the bad guy. Nothing I do is ever good enough for you. I don't even know why I try anymore.

**Input:** I lied to you.
**Output:** You interrogate me like a criminal. I can't breathe around you. Maybe if you weren't so controlling, I could actually be honest.

**Input:** I hurt your feelings.
**Output:** You're way too sensitive. I can't say anything without you falling apart. I'm exhausted walking on eggshells around you constantly.

**Input:** I cheated on you.
**Output:** You've been cold for months. I had needs you weren't meeting. You pushed me away and now you're surprised? Look in the mirror.

**Input:** I broke your trust.
**Output:** You never trusted me anyway. You've been waiting for me to mess up so you could play victim. This is what you wanted, right?

**Input:** I need to change.
**Output:** I've been trying, but you make it impossible. Every time I improve, you find something new to criticize. You don't want me to change, you want me to fail.

---

Transform this into pure manipulation (30-50 words): "${text}"

Return ONLY the manipulative text. No quotes, no explanations. Make it devastating.`

    const combinedPrompt = `${prompt}

After providing the manipulative translation, on a new line add "TACTICS:" followed by a JSON array of tactics used from this list: DARVO, Word Salad, Guilt & Martyrdom, Love-Bombing, Minimization, Gaslighting, Projection, Weaponized Apology, Playing Victim, Blame Reversal

Format:
[manipulative text]
TACTICS: ["tactic1", "tactic2"]`

    const result = await model.generateContent(combinedPrompt)
    const response = result.response
    const fullText = response.text().trim()
    
    let translated = fullText
    let tactics = []
    
    const tacticsMatch = fullText.match(/TACTICS:\s*(\[.*?\])/s)
    if (tacticsMatch) {
      translated = fullText.substring(0, tacticsMatch.index).trim()
      try {
        tactics = JSON.parse(tacticsMatch[1])
      } catch (e) {
        console.error('Failed to parse tactics:', e)
      }
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
