import React, { useState, useEffect } from 'react';
import { Play, Trash, Info } from 'lucide-react';

export default function Playground({ t }) {
  const [html, setHtml] = useState(
    `<div class="card">
  <h2>ZinkxDeck Live Playground</h2>
  <p>Modify HTML, CSS and JS to see live changes instantly!</p>
  <button id="btn">Click Me 🚀</button>
</div>`
  );
  
  const [css, setCss] = useState(
    `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 320px;
}

button {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  transition: transform 0.2s;
}

button:active {
  transform: scale(0.95);
}`
  );

  const [js, setJs] = useState(
    `const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  btn.innerText = 'Hello from ZinkxDeck! 🎉';
  btn.style.transform = 'scale(1.1)';
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
  }, 200);
});`
  );

  const [srcDoc, setSrcDoc] = useState('');

  const runCode = () => {
    const combined = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (err) {
              document.body.innerHTML += \`
                <div style="background: #fee2e2; color: #ef4444; padding: 12px; border-radius: 8px; margin-top: 15px; font-family: monospace; font-size: 0.8rem; text-align: left;">
                  <strong>JS Error:</strong> \${err.message}
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `;
    setSrcDoc(combined);
  };

  useEffect(() => {
    runCode();
  }, []);

  const clearAll = () => {
    setHtml('');
    setCss('');
    setJs('');
    setSrcDoc('');
  };

  return (
    <div className="sandbox-container">
      <div className="sandbox-editors">
        <div className="panel" style={{ padding: '10px', gap: '6px' }}>
          <div className="panel-header" style={{ paddingBottom: '4px' }}>
            <span className="panel-title" style={{ fontSize: '0.8rem' }}>HTML</span>
          </div>
          <textarea
            className="input-area"
            style={{ fontSize: '0.78rem', padding: '6px' }}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<!-- HTML here -->"
          />
        </div>

        <div className="panel" style={{ padding: '10px', gap: '6px' }}>
          <div className="panel-header" style={{ paddingBottom: '4px' }}>
            <span className="panel-title" style={{ fontSize: '0.8rem' }}>CSS</span>
          </div>
          <textarea
            className="input-area"
            style={{ fontSize: '0.78rem', padding: '6px' }}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder="/* CSS here */"
          />
        </div>

        <div className="panel" style={{ padding: '10px', gap: '6px' }}>
          <div className="panel-header" style={{ paddingBottom: '4px' }}>
            <span className="panel-title" style={{ fontSize: '0.8rem' }}>JS</span>
          </div>
          <textarea
            className="input-area"
            style={{ fontSize: '0.78rem', padding: '6px' }}
            value={js}
            onChange={(e) => setJs(e.target.value)}
            placeholder="// JS here"
          />
          
          {/* Info Explainer Panel placed in JS editor block bottom */}
          <div className="info-panel" style={{ padding: '8px 10px', marginTop: '6px', gap: '8px' }}>
            <Info size={14} style={{ marginTop: '1px' }} />
            <div className="info-panel-content">
              <div className="info-panel-title" style={{ fontSize: '0.7rem' }}>{t.infoTitle}</div>
              <div className="info-panel-desc" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>{t['playground-info']}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sandbox-preview-container">
        <div className="sandbox-preview-header">
          <span>{t.playgroundLivePreview}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={clearAll} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
              {t.clear}
            </button>
            <button className="btn btn-primary" onClick={runCode} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
              <Play size={12} /> {t.playgroundRunCode}
            </button>
          </div>
        </div>
        <iframe
          srcDoc={srcDoc}
          title="Sandbox Preview"
          className="sandbox-iframe"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
