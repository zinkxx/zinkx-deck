import React, { useState, useEffect } from 'react';
import { Copy, Trash, Check, Link, Info } from 'lucide-react';

export default function URLEncoder({ showToast, t }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // encode or decode
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const getCounters = (str) => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    const lines = str ? str.split('\n').length : 0;
    return `${chars} chars | ${words} words | ${lines} lines`;
  };

  useEffect(() => {
    handleProcess();
  }, [input, mode]);

  const handleProcess = () => {
    if (!input) {
      setOutput('');
      setError(null);
      return;
    }
    setError(null);

    if (mode === 'encode') {
      try {
        setOutput(encodeURIComponent(input));
      } catch (e) {
        setError(e.message);
        setOutput('');
      }
    } else {
      try {
        setOutput(decodeURIComponent(input));
      } catch (e) {
        setError('Invalid URL string for decoding.');
        setOutput('');
      }
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

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Link size={18} />
            <span>{t.input}</span>
          </div>
          <div className="panel-actions">
            <button className="btn-icon-only" onClick={() => setInput('')} title={t.clear}>
              <Trash size={18} />
            </button>
          </div>
        </div>

        <div className="form-group-horizontal" style={{ gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="url-mode"
              checked={mode === 'encode'}
              onChange={() => setMode('encode')}
            />
            {t.encode}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="url-mode"
              checked={mode === 'decode'}
              onChange={() => setMode('decode')}
            />
            {t.decode}
          </label>
        </div>

        <div className="form-group">
          <textarea
            className="input-area"
            placeholder={mode === 'encode' ? 'Enter plain URL text...' : 'Enter encoded URL text...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="input-counter">{getCounters(input)}</div>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['url-encoder-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.output} ({mode === 'encode' ? 'Encoded URL' : 'Decoded URL'})</span>
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
          <div className="input-area" style={{ color: 'var(--error)', borderColor: 'var(--error)', whiteSpace: 'pre-wrap' }}>
            Error: {error}
          </div>
        ) : (
          <div className="form-group">
            <textarea
              className="input-area"
              readOnly
              placeholder="Result will appear here..."
              value={output}
            />
            {output && <div className="input-counter">{getCounters(output)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
