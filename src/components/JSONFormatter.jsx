import React, { useState } from 'react';
import { Copy, Trash, Check, FileCode, Info } from 'lucide-react';

export default function JSONFormatter({ showToast, t }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
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
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, Number(indent));
      setOutput(formatted);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      setError(null);
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
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
    const sample = {
      name: "ZinkxDeck",
      type: "macOS App",
      author: "Open Source Community",
      features: [
        "JSON Formatter",
        "Base64 Decoder",
        "JWT Visualizer",
        "UUID Generator"
      ],
      stats: {
        stars: 1250,
        version: "1.0.0",
        active: true
      }
    };
    setInput(JSON.stringify(sample, null, 2));
    setError(null);
  };

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <FileCode size={18} />
            <span>{t.input} JSON</span>
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
            placeholder="Paste your JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="input-counter">{getCounters(input)}</div>
        </div>

        <div className="form-group-horizontal" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label>{t.jsonIndentSize}:</label>
            <select
              className="text-input"
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
              style={{ padding: '6px 12px' }}
            >
              <option value={2}>2 {t.jsonSpaces}</option>
              <option value={4}>4 {t.jsonSpaces}</option>
              <option value={0}>{t.jsonTab}</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleMinify}>
              {t.minify}
            </button>
            <button className="btn btn-primary" onClick={handleFormat}>
              {t.format}
            </button>
          </div>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['json-formatter-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.output} JSON</span>
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
            {t.error}:
            {'\n' + error}
          </div>
        ) : (
          <div className="form-group">
            <textarea
              className="input-area"
              readOnly
              placeholder="Formatted output will appear here..."
              value={output}
            />
            {output && <div className="input-counter">{getCounters(output)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
