import React, { useState, useEffect } from 'react';
import { Copy, Trash, Check, ShieldAlert, Info } from 'lucide-react';

export default function HashGenerator({ showToast, t }) {
  const [input, setInput] = useState('');
  const [copiedAlgo, setCopiedAlgo] = useState(null);
  const [hashes, setHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: ''
  });

  const getCounters = (str) => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    const lines = str ? str.split('\n').length : 0;
    return `${chars} chars | ${words} words | ${lines} lines`;
  };

  useEffect(() => {
    generateHashes();
  }, [input]);

  const generateHashes = async () => {
    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }

    if (window.electronAPI?.hash) {
      setHashes({
        md5: window.electronAPI.hash(input, 'md5'),
        sha1: window.electronAPI.hash(input, 'sha1'),
        sha256: window.electronAPI.hash(input, 'sha256'),
        sha512: window.electronAPI.hash(input, 'sha512')
      });
    } else {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        
        const sha1Buf = await crypto.subtle.digest('SHA-1', data);
        const sha256Buf = await crypto.subtle.digest('SHA-256', data);
        const sha512Buf = await crypto.subtle.digest('SHA-512', data);

        const bufferToHex = (buffer) => {
          return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        };

        setHashes({
          md5: 'MD5 not supported in browser preview mode',
          sha1: bufferToHex(sha1Buf),
          sha256: bufferToHex(sha256Buf),
          sha512: bufferToHex(sha512Buf)
        });
      } catch (e) {
        console.error('Hashing failed', e);
      }
    }
  };

  const handleCopy = async (algo, value) => {
    if (!value || value.startsWith('MD5 not')) return;
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(value);
    } else {
      await navigator.clipboard.writeText(value);
    }
    if (showToast) {
      showToast(`${algo.toUpperCase()} hash copied!`, 'success');
    }
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  const clearAll = () => {
    setInput('');
    setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
  };

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <ShieldAlert size={18} />
            <span>{t.input} Text</span>
          </div>
          <div className="panel-actions">
            <button className="btn-icon-only" onClick={clearAll} title={t.clear}>
              <Trash size={18} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <textarea
            className="input-area"
            placeholder="Type text here to compute hashes..."
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
            <div className="info-panel-desc">{t['hash-generator-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ overflowY: 'auto' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>Computed Hashes</span>
          </div>
        </div>

        <div className="settings-grid">
          {/* MD5 */}
          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>MD5</label>
              {hashes.md5 && !hashes.md5.startsWith('MD5 not') && (
                <button className="btn-icon-only" onClick={() => handleCopy('md5', hashes.md5)}>
                  {copiedAlgo === 'md5' ? <Check size={14} className="success" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <input
              type="text"
              readOnly
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', opacity: hashes.md5 ? 1 : 0.4 }}
              value={hashes.md5 || 'Hash output will appear here...'}
            />
          </div>

          {/* SHA-1 */}
          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>SHA-1</label>
              {hashes.sha1 && (
                <button className="btn-icon-only" onClick={() => handleCopy('sha1', hashes.sha1)}>
                  {copiedAlgo === 'sha1' ? <Check size={14} className="success" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <input
              type="text"
              readOnly
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', opacity: hashes.sha1 ? 1 : 0.4 }}
              value={hashes.sha1 || 'Hash output will appear here...'}
            />
          </div>

          {/* SHA-256 */}
          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>SHA-256</label>
              {hashes.sha256 && (
                <button className="btn-icon-only" onClick={() => handleCopy('sha256', hashes.sha256)}>
                  {copiedAlgo === 'sha256' ? <Check size={14} className="success" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <input
              type="text"
              readOnly
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', opacity: hashes.sha256 ? 1 : 0.4 }}
              value={hashes.sha256 || 'Hash output will appear here...'}
            />
          </div>

          {/* SHA-512 */}
          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>SHA-512</label>
              {hashes.sha512 && (
                <button className="btn-icon-only" onClick={() => handleCopy('sha512', hashes.sha512)}>
                  {copiedAlgo === 'sha512' ? <Check size={14} className="success" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <div className="form-group">
              <textarea
                readOnly
                rows={2}
                className="input-area"
                style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', opacity: hashes.sha512 ? 1 : 0.4, minHeight: '60px' }}
                value={hashes.sha512 || 'Hash output will appear here...'}
              />
              {hashes.sha512 && <div className="input-counter">{getCounters(hashes.sha512)}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
