import React, { useState, useEffect } from 'react';
import { Calendar, Copy, Check, Info } from 'lucide-react';

function translateField(field, type, lang) {
  if (!field) return '';
  const clean = field.trim();
  const isTr = lang === 'tr';
  
  if (clean === '*') {
    switch (type) {
      case 'min': return isTr ? 'her dakika' : 'every minute';
      case 'hour': return isTr ? 'her saat' : 'every hour';
      case 'dom': return isTr ? 'ayın her günü' : 'every day of the month';
      case 'month': return isTr ? 'her ay' : 'every month';
      case 'dow': return isTr ? 'haftanın her günü' : 'every day of the week';
      default: return '';
    }
  }

  if (clean.startsWith('*/')) {
    const step = clean.slice(2);
    switch (type) {
      case 'min': return isTr ? `her ${step} dakikada bir` : `every ${step} minutes`;
      case 'hour': return isTr ? `her ${step} saatte bir` : `every ${step} hours`;
      case 'dom': return isTr ? `her ${step} günde bir` : `every ${step} days`;
      case 'month': return isTr ? `her ${step} ayda bir` : `every ${step} months`;
      case 'dow': return isTr ? `her ${step} günde bir` : `every ${step} days of the week`;
      default: return '';
    }
  }

  if (clean.includes('-')) {
    const [start, end] = clean.split('-');
    switch (type) {
      case 'min': return isTr ? `${start}. dakikadan ${end}. dakikaya kadar her dakika` : `every minute from minute ${start} to ${end}`;
      case 'hour': return isTr ? `saat ${start} ile ${end} arası her saat` : `every hour from hour ${start} to ${end}`;
      case 'dom': return isTr ? `ayın ${start}. günü ile ${end}. günü arası` : `between day ${start} and ${end} of the month`;
      case 'month': return isTr ? `${start}. aydan ${end}. aya kadar` : `from month ${start} to ${end}`;
      case 'dow': return isTr ? `haftanın ${translateDay(start, lang)} günü ile ${translateDay(end, lang)} günü arası` : `from ${translateDay(start, lang)} to ${translateDay(end, lang)}`;
      default: return '';
    }
  }

  if (clean.includes(',')) {
    const list = clean.split(',').map(v => v.trim());
    switch (type) {
      case 'min': return isTr ? `${list.join(', ')}. dakikalarda` : `at minutes ${list.join(', ')}`;
      case 'hour': return isTr ? `saat ${list.join(', ')}'da` : `at hours ${list.join(', ')}`;
      case 'dom': return isTr ? `ayın ${list.join(', ')}. günlerinde` : `on days ${list.join(', ')} of the month`;
      case 'month': return isTr ? `${list.join(', ')}. aylarda` : `in months ${list.join(', ')}`;
      case 'dow': return isTr ? `haftanın ${list.map(d => translateDay(d, lang)).join(', ')} günlerinde` : `on ${list.map(d => translateDay(d, lang)).join(', ')}`;
      default: return '';
    }
  }

  switch (type) {
    case 'min': return isTr ? `dakika ${clean}'da` : `at minute ${clean}`;
    case 'hour': return isTr ? `saat ${clean}:00'da` : `at hour ${clean}:00`;
    case 'dom': return isTr ? `ayın ${clean}. günü` : `on day ${clean} of the month`;
    case 'month': return isTr ? `${clean}. ayda` : `in month ${clean}`;
    case 'dow': return isTr ? `haftanın ${translateDay(clean, lang)} gününde` : `on ${translateDay(clean, lang)}`;
    default: return '';
  }
}

function translateDay(day, lang) {
  const d = parseInt(day);
  const isTr = lang === 'tr';
  const mappingTr = {
    0: 'Pazar', 1: 'Pazartesi', 2: 'Salı', 3: 'Çarşamba', 4: 'Perşembe', 5: 'Cuma', 6: 'Cumartesi', 7: 'Pazar'
  };
  const mappingEn = {
    0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday'
  };
  return isTr ? (mappingTr[d] || day) : (mappingEn[d] || day);
}

export default function CronParser({ t, lang }) {
  const [cron, setCron] = useState('*/15 9-17 * * 1-5');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    parseCron();
  }, [cron, lang]);

  const parseCron = () => {
    setError(null);
    if (!cron.trim()) {
      setExplanation('');
      return;
    }

    const segments = cron.trim().split(/\s+/);
    if (segments.length !== 5) {
      setError(
        lang === 'tr' 
          ? 'Geçersiz Cron İfadesi. Cron ifadesi aralarında boşluk olan tam olarak 5 alandan oluşmalıdır.'
          : 'Invalid Cron Expression. Cron expression must contain exactly 5 space-separated fields.'
      );
      setExplanation('');
      return;
    }

    const cronFieldRegex = /^(\*|([0-9\-\,\/]+))$/;
    for (let i = 0; i < 5; i++) {
      if (!cronFieldRegex.test(segments[i])) {
        setError(
          lang === 'tr'
            ? `Alansal Hata: '${segments[i]}' geçersiz karakterler barındırıyor.`
            : `Field Error: '${segments[i]}' contains invalid characters.`
        );
        setExplanation('');
        return;
      }
    }

    const min = translateField(segments[0], 'min', lang);
    const hour = translateField(segments[1], 'hour', lang);
    const dom = translateField(segments[2], 'dom', lang);
    const month = translateField(segments[3], 'month', lang);
    const dow = translateField(segments[4], 'dow', lang);

    let sentence = '';
    if (lang === 'tr') {
      sentence = `${dow}, ${month}, ${dom}, ${hour}, ${min} çalışır.`;
    } else {
      sentence = `Runs ${min}, ${hour}, ${dom}, ${month}, ${dow}.`;
    }
    
    setExplanation(sentence.charAt(0).toUpperCase() + sentence.slice(1));
  };

  const handleCopy = async () => {
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(cron);
    } else {
      await navigator.clipboard.writeText(cron);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectPreset = (presetValue) => {
    setCron(presetValue);
  };

  const presets = [
    { name: lang === 'tr' ? 'Her 5 Dakikada Bir' : 'Every 5 Minutes', value: '*/5 * * * *' },
    { name: lang === 'tr' ? 'Her Saat Başı' : 'Every Hour', value: '0 * * * *' },
    { name: lang === 'tr' ? 'Her Gece Yarısı (00:00)' : 'Every Midnight', value: '0 0 * * *' },
    { name: lang === 'tr' ? 'Hafta İçi Her Gün 09:00' : 'Every Weekday 09:00', value: '0 9 * * 1-5' },
    { name: lang === 'tr' ? 'Her Ayın 1. Günü 12:00' : '1st of Every Month 12:00', value: '0 12 1 * *' },
    { name: lang === 'tr' ? 'Hafta Sonu Cumartesi/Pazar 18:00' : 'Weekends at 18:00', value: '0 18 * * 6,0' }
  ];

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Calendar size={18} />
            <span>Cron Expression Input</span>
          </div>
        </div>

        <div className="form-group" style={{ flex: 'none' }}>
          <label>Cron Expression (5 Fields)</label>
          <input
            type="text"
            className="text-input"
            style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', letterSpacing: '0.05em' }}
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            placeholder="e.g. */15 * * * *"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.6 }}>
            <span>min   hour   dom   month   dow</span>
            <span>(minute   hour   day   month   weekday)</span>
          </div>
        </div>

        <div className="form-group">
          <label>{t.cronPresetsLabel}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px' }}
                onClick={() => selectPreset(p.value)}
              >
                <span>{p.name}</span>
                <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>{p.value}</code>
              </button>
            ))}
          </div>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['cron-parser-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.cronExplanationTitle}</span>
          </div>
          <div className="panel-actions">
            {!error && (
              <button className="btn-icon-only" onClick={handleCopy} title={t.copy}>
                {copied ? <Check size={18} className="success" /> : <Copy size={18} />}
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="input-area" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            {error}
          </div>
        ) : (
          <div 
            className="input-area" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              fontFamily: 'inherit', 
              fontSize: '1rem',
              lineHeight: 1.6,
              background: 'rgba(var(--accent-rgb), 0.03)',
              border: '1px solid rgba(var(--accent-rgb), 0.15)'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', color: 'var(--accent)', alignItems: 'center', marginBottom: '8px' }}>
              <Info size={16} />
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.cronExplanationTitle}</strong>
            </div>
            <p className="selectable" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              {explanation || 'Waiting for input...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
