import React, { useState } from 'react';
import { Copy, Trash, Check, Database, Info } from 'lucide-react';
import { format } from 'sql-formatter';

export default function SQLFormatter({ showToast, t }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [keywordCase, setKeywordCase] = useState('upper');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const getCounters = (str) => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    const lines = str ? str.split('\n').length : 0;
    return `${chars} chars | ${words} words | ${lines} lines`;
  };

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      setError(null);
      const formatted = format(input, {
        language: dialect,
        tabWidth: 2,
        keywordCase: keywordCase
      });
      setOutput(formatted);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(output);
    } else {
      await navigator.clipboard.writeText(output);
    }
    if (showToast) {
      showToast(t.copiedToast || 'Copied!', 'success');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadSample = () => {
    const sample = "select id, name, email, created_at from users where role = 'admin' and active = 1 order by created_at desc limit 10;";
    setInput(sample);
    setError(null);
  };

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Database size={18} />
            <span>{t.input} SQL Query</span>
          </div>
          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={loadSample} style={{ padding: '6px 12px' }}>
              {t.loadSample}
            </button>
            <button className="btn-icon-only" onClick={handleClear} title={t.clear}>
              <Trash size={18} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <textarea
            className="input-area"
            placeholder="Paste raw SQL here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="input-counter">{getCounters(input)}</div>
        </div>

        <div className="form-group-horizontal" style={{ justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label>{t.sqlDialect}:</label>
              <select
                className="text-input"
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                style={{ padding: '6px 12px' }}
              >
                <option value="sql">Standard SQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label>{t.sqlKeywords}:</label>
              <select
                className="text-input"
                value={keywordCase}
                onChange={(e) => setKeywordCase(e.target.value)}
                style={{ padding: '6px 12px' }}
              >
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleFormat}>
            {t.format} SQL
          </button>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['sql-formatter-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.output} SQL</span>
          </div>
          <div className="panel-actions">
            {output && (
              <button className="btn-icon-only" onClick={handleCopy} title={t.copy}>
                {copied ? <Check size={18} className="success" /> : <Copy size={18} />}
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="input-area" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            {t.error}: {error}
          </div>
        ) : (
          <div className="form-group">
            <textarea
              className="input-area"
              readOnly
              placeholder="Formatted SQL will appear here..."
              value={output}
            />
            {output && <div className="input-counter">{getCounters(output)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
