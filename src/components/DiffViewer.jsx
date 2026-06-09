import React, { useState } from 'react';
import { Columns, ArrowLeft, RefreshCw, Trash, Info } from 'lucide-react';

function computeDiff(original, modified) {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  
  if (origLines.length > 500 || modLines.length > 500) {
    return [{ type: 'error', text: 'Files are too large. Line limit is 500 lines for the built-in diff viewer.' }];
  }

  const matrix = Array(origLines.length + 1).fill(null).map(() => Array(modLines.length + 1).fill(0));
  
  for (let i = 1; i <= origLines.length; i++) {
    for (let j = 1; j <= modLines.length; j++) {
      if (origLines[i-1] === modLines[j-1]) {
        matrix[i][j] = matrix[i-1][j-1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i-1][j], matrix[i][j-1]);
      }
    }
  }
  
  const diff = [];
  let i = origLines.length;
  let j = modLines.length;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i-1] === modLines[j-1]) {
      diff.unshift({ type: 'unchanged', text: origLines[i-1], leftLine: i, rightLine: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j-1] >= matrix[i-1][j])) {
      diff.unshift({ type: 'added', text: modLines[j-1], rightLine: j });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j-1] < matrix[i-1][j])) {
      diff.unshift({ type: 'removed', text: origLines[i-1], leftLine: i });
      i--;
    }
  }
  
  return diff;
}

export default function DiffViewer({ showToast, t }) {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [diffResult, setDiffResult] = useState([]);
  const [isCompared, setIsCompared] = useState(false);

  const getCounters = (str) => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    const lines = str ? str.split('\n').length : 0;
    return `${chars} chars | ${words} words | ${lines} lines`;
  };

  const handleCompare = () => {
    const result = computeDiff(original, modified);
    setDiffResult(result);
    setIsCompared(true);
    if (showToast) {
      if (result[0]?.type === 'error') {
        showToast(result[0].text, 'error');
      } else {
        showToast('Farklar hesaplandı / Diff calculated!', 'success');
      }
    }
  };

  const handleBack = () => {
    setIsCompared(false);
  };

  const clearAll = () => {
    setOriginal('');
    setModified('');
    setDiffResult([]);
    setIsCompared(false);
  };

  const loadSample = () => {
    const orig = `const app = express();
const PORT = 3000;

app.get('/users', (req, res) => {
  res.send('Get all users');
});

app.listen(PORT, () => {
  console.log('Server is running');
});`;

    const mod = `const app = express();
const PORT = 8080; // Changed port

app.get('/users', (req, res) => {
  // Added logs
  console.log('Fetching users');
  res.json({ users: [] }); // Updated format
});

app.get('/status', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`;

    setOriginal(orig);
    setModified(mod);
    setIsCompared(false);
  };

  if (isCompared) {
    return (
      <div className="panel tool-layout-single" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Columns size={18} />
            <span>{t.diffResultTitle}</span>
          </div>
          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={handleBack}>
              <ArrowLeft size={16} /> {t.back}
            </button>
          </div>
        </div>

        <div className="regex-matches-container" style={{ flex: 1, padding: '10px' }}>
          {diffResult[0]?.type === 'error' ? (
            <div style={{ color: 'var(--error)' }}>{diffResult[0].text}</div>
          ) : (
            diffResult.map((item, idx) => {
              let lineClass = '';
              let prefix = ' ';
              if (item.type === 'added') {
                lineClass = 'diff-added';
                prefix = '+';
              } else if (item.type === 'removed') {
                lineClass = 'diff-removed';
                prefix = '-';
              }

              return (
                <div key={idx} className={`diff-line ${lineClass}`}>
                  <span className="diff-line-num">
                    {item.leftLine || ''}
                  </span>
                  <span className="diff-line-num" style={{ borderRight: '1px solid var(--border-color)', marginRight: '10px' }}>
                    {item.rightLine || ''}
                  </span>
                  <span className="diff-line-content selectable">
                    {prefix} {item.text}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tool-layout-split">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.diffOriginalTitle}</span>
          </div>
          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={loadSample} style={{ padding: '6px 12px' }}>
              {t.loadSample}
            </button>
            <button className="btn-icon-only" onClick={clearAll} title={t.clear}>
              <Trash size={18} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <textarea
            className="input-area"
            placeholder="Paste your original code/text here..."
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
          />
          <div className="input-counter">{getCounters(original)}</div>
        </div>

        {/* Info Explainer Panel */}
        <div className="info-panel">
          <Info className="info-panel-icon" />
          <div className="info-panel-content">
            <div className="info-panel-title">{t.infoTitle}</div>
            <div className="info-panel-desc">{t['diff-viewer-info']}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>{t.diffModifiedTitle}</span>
          </div>
          <div className="panel-actions">
            <button className="btn btn-primary" onClick={handleCompare} disabled={!original && !modified}>
              <RefreshCw size={16} /> {t.compare}
            </button>
          </div>
        </div>

        <div className="form-group">
          <textarea
            className="input-area"
            placeholder="Paste your modified code/text here..."
            value={modified}
            onChange={(e) => setModified(e.target.value)}
          />
          <div className="input-counter">{getCounters(modified)}</div>
        </div>
      </div>
    </div>
  );
}
