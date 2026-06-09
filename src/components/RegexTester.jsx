import React, { useState, useEffect } from 'react';
import { Target, AlertCircle, Info } from 'lucide-react';

export default function RegexTester({ t }) {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [text, setText] = useState('My email is hello@devkit.dev and work email is support@devkit.com.');
  const [globalMatch, setGlobalMatch] = useState(true);
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [multiline, setMultiline] = useState(false);
  const [error, setError] = useState(null);
  const [matchCount, setMatchCount] = useState(0);

  const getCounters = (str) => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    const lines = str ? str.split('\n').length : 0;
    return `${chars} chars | ${words} words | ${lines} lines`;
  };

  useEffect(() => {
    try {
      if (!pattern) {
        setError(null);
        setMatchCount(0);
        return;
      }
      const flags = (globalMatch ? 'g' : '') + (caseInsensitive ? 'i' : '') + (multiline ? 'm' : '');
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex);
      setMatchCount(matches ? matches.length : 0);
      setError(null);
    } catch (e) {
      setError(e.message);
      setMatchCount(0);
    }
  }, [pattern, text, globalMatch, caseInsensitive, multiline]);

  const getHighlightedText = () => {
    if (!pattern || !text || error) return text;
    try {
      const flags = (globalMatch ? 'g' : '') + (caseInsensitive ? 'i' : '') + (multiline ? 'm' : '');
      const regex = new RegExp(pattern, flags);
      
      let match;
      const result = [];
      let lastIndex = 0;
      let preventInfinite = 0;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          if (preventInfinite++ > 2000) break;
          const matchIndex = match.index;
          const matchedText = match[0];
          
          if (matchedText.length === 0) {
            regex.lastIndex++;
            continue;
          }
          
          if (matchIndex > lastIndex) {
            result.push(text.slice(lastIndex, matchIndex));
          }
          
          result.push(
            <span key={matchIndex} className="regex-highlight">
              {matchedText}
            </span>
          );
          
          lastIndex = regex.lastIndex;
        }
      } else {
        match = regex.exec(text);
        if (match && match[0].length > 0) {
          const matchIndex = match.index;
          const matchedText = match[0];
          if (matchIndex > 0) {
            result.push(text.slice(0, matchIndex));
          }
          result.push(
            <span key={matchIndex} className="regex-highlight">
              {matchedText}
            </span>
          );
          lastIndex = matchIndex + matchedText.length;
        }
      }
      
      if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
      }
      
      return result.length > 0 ? result : text;
    } catch (e) {
      return text;
    }
  };

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Target size={18} />
            <span>{t.regexPattern}</span>
          </div>
        </div>

        <div className="form-group" style={{ flex: 'none' }}>
          <label>{t.regexPattern}</label>
          <input
            type="text"
            className="text-input"
            style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. [a-z]+"
          />
        </div>

        <div className="form-group-horizontal" style={{ gap: '16px', margin: '8px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={globalMatch}
              onChange={(e) => setGlobalMatch(e.target.checked)}
            />
            {t.regexGlobal}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={(e) => setCaseInsensitive(e.target.checked)}
            />
            {t.regexCase}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={multiline}
              onChange={(e) => setMultiline(e.target.checked)}
            />
            {t.regexMultiline}
          </label>
        </div>

        <div className="form-group">
          <label>{t.regexTestText}</label>
          <textarea
            className="input-area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type sample text here..."
          />
          <div className="input-counter">{getCounters(text)}</div>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['regex-tester-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.regexResult}</span>
          </div>
          <div className="panel-actions">
            {!error && (
              <span className={`status-indicator ${matchCount > 0 ? 'success' : 'warning'}`}>
                {matchCount} matches found
              </span>
            )}
          </div>
        </div>

        {error ? (
          <div className="input-area" style={{ color: 'var(--error)', borderColor: 'var(--error)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>Regex Error: {error}</span>
          </div>
        ) : (
          <div className="form-group">
            <div className="regex-matches-container">
              {getHighlightedText()}
            </div>
            <div className="input-counter">{getCounters(text)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
