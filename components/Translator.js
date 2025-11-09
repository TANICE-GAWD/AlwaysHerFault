'use client'

import { useState } from 'react'

export default function Translator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [tactics, setTactics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError('')
    setOutput('')
    setTactics([])

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
      setTactics(data.tactics || [])
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
          {tactics.length > 0 && (
            <div className="tactics">
              <h4>Manipulation Tactics Used:</h4>
              <div className="tactics-tags">
                {tactics.map((tactic, index) => (
                  <span key={index} className="tactic-tag">
                    {tactic}
                  </span>
                ))}
              </div>
            </div>
          )}
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
