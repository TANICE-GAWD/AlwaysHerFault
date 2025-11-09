'use client'

import { useState } from 'react'

export default function Translator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError('')
    setOutput('')

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed')
      }

      setOutput(data.translated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="translator">
      <div>
        <label htmlFor="input">
          <strong>Enter your text:</strong>
        </label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I'm sorry, I made a mistake"
        />
      </div>

      <button onClick={handleTranslate} disabled={loading || !input.trim()}>
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {loading && <div className="output loading">Generating translation...</div>}

      {output && (
        <div className="output">
          <h3>Translated:</h3>
          <p>{output}</p>
        </div>
      )}

      {error && (
        <div className="output error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
