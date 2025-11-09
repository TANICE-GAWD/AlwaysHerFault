export async function POST(request) {
  try {
    const { text, targetLang } = await request.json()

    if (!text || !targetLang) {
      return Response.json({ error: 'Text and target language required' }, { status: 400 })
    }

    if (targetLang === 'en') {
      return Response.json({ translated: text })
    }

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    )

    if (!response.ok) {
      throw new Error('Translation service error')
    }

    const data = await response.json()

    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translated = data[0].map(item => item[0]).join('')
      return Response.json({ translated })
    }

    throw new Error('Invalid translation response')
  } catch (error) {
    console.error('Translation error:', error)
    return Response.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    )
  }
}
