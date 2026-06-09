import React, { useState, useEffect } from 'react';
import { Copy, Trash, Check, Key, Info } from 'lucide-react';

function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    return null;
  }
}

export default function JWTDecoder({ showToast, t }) {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  const getCounters = (str) => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    const lines = str ? str.split('\n').length : 0;
    return `${chars} chars | ${words} words | ${lines} lines`;
  };

  useEffect(() => {
    decodeJWT();
  }, [token]);

  const decodeJWT = () => {
    if (!token.trim()) {
      setHeader('');
      setPayload('');
      setSignature('');
      setError(null);
      setMeta(null);
      return;
    }
    setError(null);

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setError('JWT must consist of exactly 3 parts separated by dots.');
      setHeader('');
      setPayload('');
      setSignature('');
      setMeta(null);
      return;
    }

    const decodedHeader = base64UrlDecode(parts[0]);
    const decodedPayload = base64UrlDecode(parts[1]);

    if (!decodedHeader || !decodedPayload) {
      setError('Failed to base64-decode JWT segments. Check characters.');
      return;
    }

    try {
      const headerObj = JSON.parse(decodedHeader);
      const payloadObj = JSON.parse(decodedPayload);

      setHeader(JSON.stringify(headerObj, null, 2));
      setPayload(JSON.stringify(payloadObj, null, 2));
      setSignature(parts[2]);

      const metaData = {};
      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        metaData.expiry = expDate.toLocaleString();
        const now = new Date();
        const expired = now > expDate;
        metaData.isExpired = expired;
        
        if (!expired) {
          const diffMs = expDate - now;
          const mins = Math.floor(diffMs / 60000);
          const hours = Math.floor(mins / 60);
          metaData.timeLeft = hours > 0 
            ? `${hours}h ${mins % 60}m` 
            : `${mins}m`;
        }
      }
      if (payloadObj.sub) metaData.subject = payloadObj.sub;
      if (payloadObj.iss) metaData.issuer = payloadObj.iss;

      setMeta(metaData);
    } catch (e) {
      setError('JWT segments decoded successfully but are not valid JSON.');
    }
  };

  const handleCopy = async (section, value) => {
    if (!value) return;
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(value);
    } else {
      await navigator.clipboard.writeText(value);
    }
    if (showToast) {
      showToast(t.copiedToast || 'Copied!', 'success');
    }
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const loadSample = () => {
    const sampleHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, '');
    const samplePayload = btoa(JSON.stringify({ 
      sub: "usr_9812408", 
      name: "Alex Dev", 
      email: "alex@devkit.dev",
      role: "admin", 
      iat: Math.floor(Date.now() / 1000) - 3600, 
      exp: Math.floor(Date.now() / 1000) + 86400 // expires in 24h
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    setToken(`${sampleHeader}.${samplePayload}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`);
  };

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Key size={18} />
            <span>{t.jwtTokenInput}</span>
          </div>
          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={loadSample} style={{ padding: '6px 12px' }}>
              {t.loadSample}
            </button>
            <button className="btn-icon-only" onClick={() => setToken('')} title={t.clear}>
              <Trash size={18} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <textarea
            className="input-area"
            placeholder="Paste your encoded JWT token here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}
          />
          <div className="input-counter">{getCounters(token)}</div>
        </div>

        {meta && (
          <div className="settings-card" style={{ padding: '12px', border: '1px solid rgba(var(--accent-rgb), 0.2)', flex: 'none', background: 'rgba(var(--accent-rgb), 0.03)' }}>
            <div className="settings-info">
              <div className="settings-title">{t.jwtMetaInfo}</div>
              <div className="settings-desc">
                {meta.subject && <div><strong>{t.jwtSubject}:</strong> {meta.subject}</div>}
                {meta.issuer && <div><strong>{t.jwtIssuer}:</strong> {meta.issuer}</div>}
                {meta.expiry && (
                  <div>
                    <strong>{t.jwtExpiry}:</strong> {meta.expiry} {' '}
                    {meta.isExpired ? (
                      <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>{t.jwtExpired}</span>
                    ) : (
                      <span style={{ color: 'var(--success)' }}>{t.jwtExpiresIn.replace('{time}', meta.timeLeft)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['jwt-decoder-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ overflowY: 'auto' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.decode} {t.output}</span>
          </div>
        </div>

        {error ? (
          <div className="input-area" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            JWT Error: {error}
          </div>
        ) : (
          <div className="settings-grid">
            {/* Header section (RED/VIOLET themed border) */}
            <div className="form-group" style={{ flex: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ color: '#ff79c6' }}>{t.jwtHeaderTitle}</label>
                {header && (
                  <button className="btn-icon-only" onClick={() => handleCopy('header', header)}>
                    {copiedSection === 'header' ? <Check size={14} className="success" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <textarea
                readOnly
                className="input-area"
                style={{ 
                  height: '110px', 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '0.8rem',
                  borderColor: header ? 'rgba(255, 121, 198, 0.25)' : 'var(--border-color)',
                  color: '#ff79c6',
                  minHeight: '110px'
                }}
                value={header || 'Waiting for valid token...'}
              />
            </div>

            {/* Payload section (BLUE themed border) */}
            <div className="form-group" style={{ flex: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ color: '#8be9fd' }}>{t.jwtPayloadTitle}</label>
                {payload && (
                  <button className="btn-icon-only" onClick={() => handleCopy('payload', payload)}>
                    {copiedSection === 'payload' ? <Check size={14} className="success" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <textarea
                readOnly
                className="input-area"
                style={{ 
                  height: '200px', 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '0.8rem',
                  borderColor: payload ? 'rgba(139, 233, 253, 0.25)' : 'var(--border-color)',
                  color: '#8be9fd',
                  minHeight: '200px'
                }}
                value={payload || 'Waiting for valid token...'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
