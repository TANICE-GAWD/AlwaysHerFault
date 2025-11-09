'use client'

import { useState } from 'react'
import { tacticDefinitions } from '@/lib/tacticDefinitions'
import { translateText, languages } from '@/lib/translator'

export default function Translator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [originalOutput, setOriginalOutput] = useState('')
  const [tactics, setTactics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTactic, setSelectedTactic] = useState(null)
  const [copied, setCopied] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translating, setTranslating] = useState(false)

  const MAX_LENGTH = 500

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError('')
    setOutput('')
    setTactics([])
    setSelectedTactic(null)
    setCopied(false)

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
      setOriginalOutput(data.translated)
      setTactics(data.tactics || [])
      setSelectedLanguage('en')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTranslate()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLanguageChange = async (langCode) => {
    if (langCode === selectedLanguage) return
    
    setTranslating(true)
    setSelectedLanguage(langCode)
    
    try {
      if (langCode === 'en') {
        setOutput(originalOutput)
      } else {
        const translated = await translateText(originalOutput, langCode)
        setOutput(translated)
      }
    } catch (err) {
      setError('Translation to selected language failed')
      setSelectedLanguage('en')
      setOutput(originalOutput)
    } finally {
      setTranslating(false)
    }
  }

  const charCount = input.length
  const charCountClass = charCount > MAX_LENGTH ? 'error' : charCount > MAX_LENGTH * 0.8 ? 'warning' : ''

  return (
    <div className="translator">
      <div className="input-wrapper">
        <label htmlFor="input">
          <span>Input Text</span>
          <span className={`char-count ${charCountClass}`}>
            {charCount}/{MAX_LENGTH}
          </span>
        </label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., I am sorry"
          maxLength={MAX_LENGTH}
        />
      </div>

      <div className="button-wrapper">
        <button onClick={handleTranslate} disabled={loading || !input.trim()}>
          {loading ? 'Processing' : 'Translate'}
        </button>
        
      </div>

      {loading && <div className="output loading">Analyzing and translating</div>}

      {output && (
        <div className="output">
          <div className="output-header">
            <h3>Result</h3>
            <div className="language-selector">
              <select 
                value={selectedLanguage} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={translating}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p>{translating ? 'Translating...' : output}</p>
          <button onClick={handleCopy} className={`copy-button ${copied ? 'copied' : ''}`} disabled={translating}>
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          {tactics.length > 0 && (
            <div className="tactics">
              <h4>Detected Tactics (Click them)</h4>
              <div className="tactics-tags">
                {tactics.map((tactic, index) => (
                  <button
                    key={index}
                    className="tactic-tag"
                    onClick={() => setSelectedTactic(selectedTactic === tactic ? null : tactic)}
                    type="button"
                  >
                    {tactic}
                  </button>
                ))}
              </div>
              {selectedTactic && tacticDefinitions[selectedTactic] && (
                <div className="tactic-explanation">
                  <strong>{selectedTactic}</strong>
                  {tacticDefinitions[selectedTactic]}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="output error">
          <h3>Error</h3>
          <p>{error}</p>
          {error.includes('Rate limit') && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Too many requests. Please wait before trying again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
