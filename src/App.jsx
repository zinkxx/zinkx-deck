import React, { useState, useEffect } from 'react';
import {
  Cpu, FileCode, Binary, Link, Target, ShieldAlert,
  Palette, Key, Layers, Database, Columns, Settings,
  Search, Shield, Check, X, ClipboardCopy, Calendar, Code
} from 'lucide-react';

// Hooks & Components
import { useClipboardDetector } from './hooks/useClipboardDetector';
import CommandPalette from './components/CommandPalette';
import Toast from './components/Toast';

// Translations Dictionary
import translations from './utils/translations';

// Tool Components
import JSONFormatter from './components/JSONFormatter';
import Base64Tool from './components/Base64Tool';
import URLEncoder from './components/URLEncoder';
import RegexTester from './components/RegexTester';
import HashGenerator from './components/HashGenerator';
import ColorConverter from './components/ColorConverter';
import JWTDecoder from './components/JWTDecoder';
import UUIDGenerator from './components/UUIDGenerator';
import SQLFormatter from './components/SQLFormatter';
import DiffViewer from './components/DiffViewer';
import Playground from './components/Playground';
import CronParser from './components/CronParser';

export default function App() {
  const [activeTool, setActiveTool] = useState('json-formatter');
  const [theme, setTheme] = useState(localStorage.getItem('zinkxdeck-theme') || 'slate');
  const [lang, setLang] = useState(localStorage.getItem('zinkxdeck-lang') || 'tr');
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Settings state
  const [clipboardAutoDetect, setClipboardAutoDetect] = useState(
    localStorage.getItem('zinkxdeck-clip-detect') !== 'false'
  );
  const [alwaysOnTop, setAlwaysOnTop] = useState(
    localStorage.getItem('zinkxdeck-always-on-top') === 'true'
  );
  const [opacity, setOpacity] = useState(
    Number(localStorage.getItem('zinkxdeck-opacity') || '1')
  );

  const t = translations[lang];

  // Apply window settings (Desktop Mode)
  useEffect(() => {
    if (window.electronAPI?.setAlwaysOnTop) {
      window.electronAPI.setAlwaysOnTop(alwaysOnTop);
    }
    localStorage.setItem('zinkxdeck-always-on-top', alwaysOnTop);
  }, [alwaysOnTop]);

  useEffect(() => {
    if (window.electronAPI?.setOpacity) {
      window.electronAPI.setOpacity(opacity);
    }
    localStorage.setItem('zinkxdeck-opacity', opacity);
  }, [opacity]);

  // Save language state
  useEffect(() => {
    localStorage.setItem('zinkxdeck-lang', lang);
  }, [lang]);

  // List of all tools (base configuration)
  const baseTools = [
    { id: 'json-formatter', name: 'JSON Formatter', description: 'Beautify and validate JSON structures', category: 'Formatters', icon: FileCode, component: JSONFormatter },
    { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format and beautify SQL queries', category: 'Formatters', icon: Database, component: SQLFormatter },
    { id: 'base64-tool', name: 'Base64 Tool', description: 'Encode or decode Base64 content', category: 'Encoders', icon: Binary, component: Base64Tool },
    { id: 'url-encoder', name: 'URL Encoder', description: 'Encode or decode URL components', category: 'Encoders', icon: Link, component: URLEncoder },
    { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens', category: 'Encoders', icon: Key, component: JWTDecoder },
    { id: 'hash-generator', name: 'Hash Generator', description: 'Compute MD5, SHA-1, SHA-256 hashes', category: 'Hashing', icon: ShieldAlert, component: HashGenerator },
    { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions in real-time', category: 'Utilities', icon: Target, component: RegexTester },
    { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, HSL colors', category: 'Utilities', icon: Palette, component: ColorConverter },
    { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUIDs and strong passwords', category: 'Utilities', icon: Layers, component: UUIDGenerator },
    { id: 'diff-viewer', name: 'Diff Viewer', description: 'Compare texts and show line diffs', category: 'Utilities', icon: Columns, component: DiffViewer },
    { id: 'playground', name: 'Playground', description: 'Canlı HTML/CSS/JS kod deneme alanı', category: 'Utilities', icon: Code, component: Playground },
    { id: 'cron-parser', name: 'Cron Parser', description: 'Cron ifadesi çözümleyici ve şablon oluşturucu', category: 'Utilities', icon: Calendar, component: CronParser },
  ];

  // Map tools dynamic translations
  const tools = baseTools.map(tool => ({
    ...tool,
    name: t[tool.id] || tool.name,
    description: t[`${tool.id}-desc`] || tool.description
  }));

  // Apply Theme on load and change
  useEffect(() => {
    document.body.className = '';
    if (theme !== 'slate') {
      document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('zinkxdeck-theme', theme);
  }, [theme]);

  // Handle setting updates
  useEffect(() => {
    localStorage.setItem('zinkxdeck-clip-detect', clipboardAutoDetect);
  }, [clipboardAutoDetect]);

  // Command palette keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show dynamic toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Smart Clipboard detector hook
  const { detectedType, detectedContent, resetDetection, ignoreCurrent } = useClipboardDetector(
    (type, content) => {
      if (!clipboardAutoDetect) {
        resetDetection();
      }
    }
  );

  const handleOpenDetectedTool = () => {
    if (detectedType === 'JWT') setActiveTool('jwt-decoder');
    else if (detectedType === 'JSON') setActiveTool('json-formatter');
    else if (detectedType === 'URL') setActiveTool('url-encoder');
    else if (detectedType === 'Base64') setActiveTool('base64-tool');
    resetDetection();
  };

  const currentTool = tools.find(t => t.id === activeTool);
  const ActiveComponent = currentTool ? currentTool.component : JSONFormatter;
  const isSettings = activeTool === 'settings';

  return (
    <div className="app-container">
      {/* Ambient glowing background bulb */}
      <div className="ambient-glow" />

      {/* macOS window drag handles offset bar */}
      <div className="titlebar-drag">
        <div className="titlebar-nodrag" style={{ position: 'absolute', right: '16px', top: '10px' }} />
      </div>

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">
            <Cpu size={18} />
          </div>
          <span className="logo-title">ZinkxDeck</span>
        </div>

        <nav className="menu-list">
          {/* Formatters */}
          <div className="menu-category">{t.formatters}</div>
          {tools.filter(t => t.category === 'Formatters').map(t => (
            <div
              key={t.id}
              className={`menu-item ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => setActiveTool(t.id)}
            >
              <t.icon className="menu-icon" />
              <span>{t.name}</span>
            </div>
          ))}

          {/* Encoders */}
          <div className="menu-category">{t.encoders}</div>
          {tools.filter(t => t.category === 'Encoders').map(t => (
            <div
              key={t.id}
              className={`menu-item ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => setActiveTool(t.id)}
            >
              <t.icon className="menu-icon" />
              <span>{t.name}</span>
            </div>
          ))}

          {/* Hashing */}
          <div className="menu-category">{t.cryptography}</div>
          {tools.filter(t => t.category === 'Hashing').map(t => (
            <div
              key={t.id}
              className={`menu-item ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => setActiveTool(t.id)}
            >
              <t.icon className="menu-icon" />
              <span>{t.name}</span>
            </div>
          ))}

          {/* Utilities */}
          <div className="menu-category">{t.utilities}</div>
          {tools.filter(t => t.category === 'Utilities').map(t => (
            <div
              key={t.id}
              className={`menu-item ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => setActiveTool(t.id)}
            >
              <t.icon className="menu-icon" />
              <span>{t.name}</span>
            </div>
          ))}

          {/* Settings */}
          <div className="menu-category">{t.system}</div>
          <div
            className={`menu-item ${activeTool === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTool('settings')}
          >
            <Settings className="menu-icon" />
            <span>{t.settings}</span>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Language Switcher */}
          <div className="lang-switcher-container">
            <span className="lang-switcher-label">Language:</span>
            <div className="lang-switcher-buttons">
              <button
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <button
                className={`lang-btn ${lang === 'tr' ? 'active' : ''}`}
                onClick={() => setLang('tr')}
              >
                TR
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="theme-selector-container">
            <span className="theme-label">Theme:</span>
            <div className="theme-buttons">
              <div
                className={`theme-dot theme-slate-dot ${theme === 'slate' ? 'active' : ''}`}
                onClick={() => setTheme('slate')}
                title="Slate"
              />
              <div
                className={`theme-dot theme-dracula-dot ${theme === 'dracula' ? 'active' : ''}`}
                onClick={() => setTheme('dracula')}
                title="Dracula"
              />
              <div
                className={`theme-dot theme-cyberpunk-dot ${theme === 'cyberpunk' ? 'active' : ''}`}
                onClick={() => setTheme('cyberpunk')}
                title="Cyberpunk"
              />
              <div
                className={`theme-dot theme-nord-dot ${theme === 'nord' ? 'active' : ''}`}
                onClick={() => setTheme('nord')}
                title="Nord"
              />
            </div>
          </div>
          <div className="privacy-badge">
            <Shield size={14} />
            <span>{t.privacyBadge}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title-container" style={{ zIndex: 1 }}>
            <h1 className="header-title">{isSettings ? t.settings : currentTool?.name}</h1>
            <p className="header-subtitle">{isSettings ? t.generalPrefs : currentTool?.description}</p>
          </div>
          <div className="header-actions">
            <button className="cmd-k-trigger" onClick={() => setIsCmdPaletteOpen(true)}>
              <Search size={14} />
              <span>{t.searchPlaceholder}</span>
              <kbd className="kbd">⌘K</kbd>
            </button>
          </div>
        </header>

        <section className="content-body" style={{ zIndex: 1 }}>
          {isSettings ? (
            <div className="panel tool-layout-single" style={{ height: 'auto', maxHeight: '100%' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Settings size={18} />
                  <span>{t.generalPrefs}</span>
                </div>
              </div>

              <div className="settings-grid">
                {/* Desktop controls (Electron-only window controls) */}
                {window.electronAPI && (
                  <>
                    <div className="settings-card">
                      <div className="settings-info">
                        <div className="settings-title">{t.alwaysOnTopTitle}</div>
                        <div className="settings-desc">{t.alwaysOnTopDesc}</div>
                      </div>
                      <div
                        className={`checkbox-toggle ${alwaysOnTop ? 'active' : ''}`}
                        onClick={() => setAlwaysOnTop(!alwaysOnTop)}
                      >
                        <div className="checkbox-toggle-handle" />
                      </div>
                    </div>

                    <div className="settings-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="settings-info">
                          <div className="settings-title">{t.opacityTitle}</div>
                          <div className="settings-desc">{t.opacityDesc}</div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)' }}>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={1.0}
                        step={0.05}
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        style={{ accentColor: 'var(--accent)', cursor: 'pointer', height: '6px', marginTop: '4px' }}
                      />
                    </div>
                  </>
                )}

                {/* Clipboard auto detect */}
                <div className="settings-card">
                  <div className="settings-info">
                    <div className="settings-title">{t.clipboardDetectTitle}</div>
                    <div className="settings-desc">{t.clipboardDetectDesc}</div>
                  </div>
                  <div
                    className={`checkbox-toggle ${clipboardAutoDetect ? 'active' : ''}`}
                    onClick={() => setClipboardAutoDetect(!clipboardAutoDetect)}
                  >
                    <div className="checkbox-toggle-handle" />
                  </div>
                </div>

                {/* Developer Credit */}
                <div className="settings-card" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '8px' }}>
                  <div className="settings-info">
                    <div className="settings-title">{t.aboutDevkit}</div>
                    <div className="settings-desc" style={{ marginTop: '4px' }}>
                      ZinkxDeck is a premium, open-source macOS productivity app designed to keep developers fast, secure, and offline.
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <strong>{t.version}:</strong> 1.0.0 (Release)<br />
                    <strong>{t.sourceCode}:</strong> <span className="selectable" style={{ color: 'var(--accent)', cursor: 'pointer' }}>github.com/zinkx/zinkxdeck</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ActiveComponent showToast={showToast} t={t} lang={lang} />
          )}
        </section>

        {/* Command Palette Modal */}
        <CommandPalette
          isOpen={isCmdPaletteOpen}
          onClose={() => setIsCmdPaletteOpen(false)}
          tools={tools}
          onSelectTool={(id) => setActiveTool(id)}
        />

        {/* Floating Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Clipboard Smart Detect Alert Toast */}
        {clipboardAutoDetect && detectedType && (
          <div className="clipboard-alert-bar">
            <ClipboardCopy size={16} style={{ color: 'var(--accent)' }} />
            <div className="clipboard-alert-text">
              {lang === 'tr' ? (
                <>Panoda <span>{detectedType}</span> tespit edildi. Aracı aç?</>
              ) : (
                <>Detected <span>{detectedType}</span> in clipboard. Open?</>
              )}
            </div>
            <div className="clipboard-alert-buttons">
              <button className="btn btn-secondary" onClick={ignoreCurrent} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                <X size={14} />
              </button>
              <button className="btn btn-primary" onClick={handleOpenDetectedTool} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                <Check size={14} /> {lang === 'tr' ? 'Aç' : 'Open'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
