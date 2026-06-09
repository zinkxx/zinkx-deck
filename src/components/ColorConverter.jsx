import React, { useState } from 'react';
import { Copy, Check, Palette, Info } from 'lucide-react';

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export default function ColorConverter({ showToast, t }) {
  const [hex, setHex] = useState('#6366f1');
  const [rgb, setRgb] = useState('rgb(99, 102, 241)');
  const [hsl, setHsl] = useState('hsl(238, 83%, 67%)');
  const [copiedType, setCopiedType] = useState(null);

  const popularColors = [
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', 
    '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7',
    '#bd93f9', '#ff79c6', '#8be9fd', '#50fa7b', '#ffb86c'
  ];

  const updateColors = (newHex) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(newHex)) return;
    setHex(newHex);
    const rgbVal = hexToRgb(newHex);
    if (rgbVal) {
      setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
      const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
      setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
    }
  };

  const handleHexChange = (val) => {
    let clean = val.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    setHex(clean);
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      updateColors(clean);
    }
  };

  const handleRgbChange = (val) => {
    setRgb(val);
    const match = val.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (match) {
      const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
      if (r <= 255 && g <= 255 && b <= 255) {
        const hexVal = rgbToHex(r, g, b);
        setHex(hexVal);
        const hslVal = rgbToHsl(r, g, b);
        setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
      }
    }
  };

  const handleHslChange = (val) => {
    setHsl(val);
    const match = val.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*\)/i);
    if (match) {
      const h = parseInt(match[1]), s = parseInt(match[2]), l = parseInt(match[3]);
      if (h <= 360 && s <= 100 && l <= 100) {
        const rgbVal = hslToRgb(h, s, l);
        const hexVal = rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
        setHex(hexVal);
        setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
      }
    }
  };

  const handleCopy = async (type, value) => {
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(value);
    } else {
      await navigator.clipboard.writeText(value);
    }
    if (showToast) {
      showToast(`${type.toUpperCase()} color copied!`, 'success');
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Palette size={18} />
            <span>Color Picker & Converter</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '12px', 
              backgroundColor: hex,
              border: '2px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <input 
              type="color" 
              value={hex}
              onChange={(e) => updateColors(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.colorPickerHelp}
            </span>
          </div>
        </div>

        <div className="settings-grid" style={{ marginTop: '10px' }}>
          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>HEX</label>
              <button className="btn-icon-only" onClick={() => handleCopy('hex', hex)}>
                {copiedType === 'hex' ? <Check size={14} className="success" /> : <Copy size={14} />}
              </button>
            </div>
            <input
              type="text"
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono' }}
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>RGB</label>
              <button className="btn-icon-only" onClick={() => handleCopy('rgb', rgb)}>
                {copiedType === 'rgb' ? <Check size={14} className="success" /> : <Copy size={14} />}
              </button>
            </div>
            <input
              type="text"
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono' }}
              value={rgb}
              onChange={(e) => handleRgbChange(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 'none' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>HSL</label>
              <button className="btn-icon-only" onClick={() => handleCopy('hsl', hsl)}>
                {copiedType === 'hsl' ? <Check size={14} className="success" /> : <Copy size={14} />}
              </button>
            </div>
            <input
              type="text"
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono' }}
              value={hsl}
              onChange={(e) => handleHslChange(e.target.value)}
            />
          </div>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['color-converter-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.colorPopularTitle}</span>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          {t.colorClickToSelect}
        </div>
        <div className="color-picker-grid">
          {popularColors.map((color) => (
            <div
              key={color}
              className="color-palette-card"
              onClick={() => updateColors(color)}
            >
              <div 
                className="color-palette-block" 
                style={{ backgroundColor: color }}
              />
              <div className="color-palette-label">
                {color}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
