import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, tools, onSelectTool }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredTools.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          onSelectTool(filteredTools[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onSelectTool, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-palette-input-container">
          <Search className="cmd-palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a tool name to search..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>
        <ul className="cmd-palette-list">
          {filteredTools.map((tool, idx) => (
            <li
              key={tool.id}
              className={`cmd-palette-item ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => {
                onSelectTool(tool.id);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="cmd-palette-item-left">
                <tool.icon className="cmd-palette-item-icon" />
                <span>{tool.name}</span>
              </div>
              <span className="cmd-palette-item-shortcut">{tool.category}</span>
            </li>
          ))}
          {filteredTools.length === 0 && (
            <li className="cmd-palette-item" style={{ cursor: 'default', opacity: 0.5 }}>
              No tools found matching "{search}"
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
