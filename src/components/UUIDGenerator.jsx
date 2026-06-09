import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Layers, Info } from 'lucide-react';

function generateUUID() {
  const tempUrl = URL.createObjectURL(new Blob());
  const uuid = tempUrl.toString().split('/').pop();
  URL.revokeObjectURL(tempUrl);
  return uuid;
}

function generatePassword(length, options) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (options.useLower) chars += lowercase;
  if (options.useUpper) chars += uppercase;
  if (options.useNum) chars += numbers;
  if (options.useSym) chars += symbols;

  if (!chars) return '';

  let pwd = '';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    pwd += chars[randomValues[i] % chars.length];
  }
  return pwd;
}

export default function UUIDGenerator({ showToast, t }) {
  const [activeTab, setActiveTab] = useState('uuid'); // uuid or password
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuids, setUuids] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Password generator state
  const [passLength, setPassLength] = useState(16);
  const [passOpts, setPassOpts] = useState({
    useLower: true,
    useUpper: true,
    useNum: true,
    useSym: true
  });
  const [password, setPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleGenerateUUIDs = () => {
    const list = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = generateUUID();
      if (uuidUpper) u = u.toUpperCase();
      list.push(u);
    }
    setUuids(list);
  };

  const handleGeneratePassword = () => {
    const pass = generatePassword(passLength, passOpts);
    setPassword(pass);
  };

  const handleCopyUUID = async (index, val) => {
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(val);
    } else {
      await navigator.clipboard.writeText(val);
    }
    if (showToast) {
      showToast(t.copiedToast || 'Copied!', 'success');
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllUUIDs = async () => {
    const text = uuids.join('\n');
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
    if (showToast) {
      showToast(t.copiedToast || 'Copied!', 'success');
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(password);
    } else {
      await navigator.clipboard.writeText(password);
    }
    if (showToast) {
      showToast(t.copiedToast || 'Copied!', 'success');
    }
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  // Run generation initially
  React.useEffect(() => {
    if (uuids.length === 0) handleGenerateUUIDs();
    if (!password) handleGeneratePassword();
  }, []);

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={18} />
            <span>{t.uuidTabTitle} & {t.pwdTabTitle}</span>
          </div>
        </div>

        <div className="form-group-horizontal" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'uuid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('uuid')}
            style={{ flex: 1 }}
          >
            {t.uuidTabTitle}
          </button>
          <button
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('password')}
            style={{ flex: 1 }}
          >
            {t.pwdTabTitle}
          </button>
        </div>

        {activeTab === 'uuid' ? (
          <div className="settings-grid" style={{ flex: 1 }}>
            <div className="form-group" style={{ flex: 'none' }}>
              <label>{t.uuidCountLabel}</label>
              <select
                className="text-input"
                value={uuidCount}
                onChange={(e) => setUuidCount(Number(e.target.value))}
              >
                <option value={1}>1 UUID</option>
                <option value={5}>5 UUIDs</option>
                <option value={10}>10 UUIDs</option>
                <option value={20}>20 UUIDs</option>
                <option value={50}>50 UUIDs</option>
              </select>
            </div>

            <div className="settings-card" style={{ flex: 'none' }}>
              <div className="settings-info">
                <div className="settings-title">{t.uuidUpperLabel}</div>
                <div className="settings-desc">Generate UUIDs with uppercase letters</div>
              </div>
              <div
                className={`checkbox-toggle ${uuidUpper ? 'active' : ''}`}
                onClick={() => setUuidUpper(!uuidUpper)}
              >
                <div className="checkbox-toggle-handle" />
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button className="btn btn-primary" onClick={handleGenerateUUIDs} style={{ width: '100%' }}>
                <RefreshCw size={16} /> {t.generate} UUIDs
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-grid" style={{ flex: 1 }}>
            <div className="form-group" style={{ flex: 'none' }}>
              <label>{t.pwdLengthLabel}: {passLength}</label>
              <input
                type="range"
                min={8}
                max={64}
                value={passLength}
                onChange={(e) => setPassLength(Number(e.target.value))}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer', height: '6px' }}
              />
            </div>

            <div className="settings-card" style={{ flex: 'none', padding: '10px 14px' }}>
              <div className="settings-info">
                <div className="settings-title" style={{ fontSize: '0.85rem' }}>{t.pwdLowerLabel}</div>
              </div>
              <div
                className={`checkbox-toggle ${passOpts.useLower ? 'active' : ''}`}
                onClick={() => setPassOpts(prev => ({ ...prev, useLower: !prev.useLower }))}
                style={{ transform: 'scale(0.85)' }}
              >
                <div className="checkbox-toggle-handle" />
              </div>
            </div>

            <div className="settings-card" style={{ flex: 'none', padding: '10px 14px' }}>
              <div className="settings-info">
                <div className="settings-title" style={{ fontSize: '0.85rem' }}>{t.pwdUpperLabel}</div>
              </div>
              <div
                className={`checkbox-toggle ${passOpts.useUpper ? 'active' : ''}`}
                onClick={() => setPassOpts(prev => ({ ...prev, useUpper: !prev.useUpper }))}
                style={{ transform: 'scale(0.85)' }}
              >
                <div className="checkbox-toggle-handle" />
              </div>
            </div>

            <div className="settings-card" style={{ flex: 'none', padding: '10px 14px' }}>
              <div className="settings-info">
                <div className="settings-title" style={{ fontSize: '0.85rem' }}>{t.pwdNumLabel}</div>
              </div>
              <div
                className={`checkbox-toggle ${passOpts.useNum ? 'active' : ''}`}
                onClick={() => setPassOpts(prev => ({ ...prev, useNum: !prev.useNum }))}
                style={{ transform: 'scale(0.85)' }}
              >
                <div className="checkbox-toggle-handle" />
              </div>
            </div>

            <div className="settings-card" style={{ flex: 'none', padding: '10px 14px' }}>
              <div className="settings-info">
                <div className="settings-title" style={{ fontSize: '0.85rem' }}>{t.pwdSymLabel}</div>
              </div>
              <div
                className={`checkbox-toggle ${passOpts.useSym ? 'active' : ''}`}
                onClick={() => setPassOpts(prev => ({ ...prev, useSym: !prev.useSym }))}
                style={{ transform: 'scale(0.85)' }}
              >
                <div className="checkbox-toggle-handle" />
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleGeneratePassword} 
                style={{ width: '100%' }}
                disabled={!passOpts.useLower && !passOpts.useUpper && !passOpts.useNum && !passOpts.useSym}
              >
                <RefreshCw size={16} /> {t.generate} Password
              </button>
            </div>
          </div>
        )}

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['uuid-generator-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ overflowY: 'auto' }}>
        {activeTab === 'uuid' ? (
          <>
            <div className="panel-header">
              <div className="panel-title">
                <span>{t.uuidGeneratedTitle}</span>
              </div>
              <div className="panel-actions">
                {uuids.length > 0 && (
                  <button className="btn btn-secondary" onClick={handleCopyAllUUIDs} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    {t.copy} All
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uuids.map((u, idx) => (
                <div
                  key={idx}
                  className="settings-card"
                  style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)' }}
                >
                  <span className="selectable" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {u}
                  </span>
                  <button className="btn-icon-only" onClick={() => handleCopyUUID(idx, u)}>
                    {copiedIndex === idx ? <Check size={14} className="success" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="panel-header">
              <div className="panel-title">
                <span>{t.pwdGeneratedTitle}</span>
              </div>
            </div>
            <div 
              className="settings-card"
              style={{ 
                padding: '16px', 
                background: 'rgba(0,0,0,0.15)', 
                border: '1px solid var(--border-color)',
                marginTop: '10px',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'stretch'
              }}
            >
              <div 
                className="selectable" 
                style={{ 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '1.1rem', 
                  color: password ? 'var(--text-primary)' : 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  textAlign: 'center',
                  padding: '12px 6px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  border: '1px dashed var(--border-color)'
                }}
              >
                {password || 'Click Generate...'}
              </div>
              {password && (
                <button className="btn btn-primary" onClick={handleCopyPassword} style={{ width: '100%' }}>
                  {passwordCopied ? <Check size={16} /> : <Copy size={16} />} 
                  {passwordCopied ? ' ' + t.copied : ' ' + t.copy + ' Password'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
