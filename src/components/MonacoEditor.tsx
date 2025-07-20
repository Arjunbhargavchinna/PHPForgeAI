import React, { useRef, useEffect } from 'react';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  onChange,
  readOnly = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Since Monaco Editor requires complex setup, we'll use a simpler syntax-highlighted display
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      
      const pre = document.createElement('pre');
      pre.className = 'language-' + language;
      pre.style.cssText = `
        margin: 0;
        padding: 16px;
        background: #1a1a1a;
        color: #e5e7eb;
        font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        overflow: auto;
        height: 100%;
        white-space: pre-wrap;
        word-wrap: break-word;
      `;

      const code = document.createElement('code');
      code.className = 'language-' + language;
      code.textContent = value;
      
      // Apply basic syntax highlighting
      highlightCode(code, language);
      
      pre.appendChild(code);
      editorRef.current.appendChild(pre);
    }
  }, [value, language]);

  const highlightCode = (element: HTMLElement, lang: string) => {
    const text = element.textContent || '';
    let highlighted = text;

    if (lang === 'php') {
      highlighted = highlighted
        .replace(/(&lt;\?php|\?&gt;)/g, '<span style="color: #8B5CF6;">$1</span>')
        .replace(/\b(class|function|public|private|protected|static|return|if|else|elseif|foreach|for|while|try|catch|throw|new|extends|implements)\b/g, '<span style="color: #F59E0B;">$1</span>')
        .replace(/\$\w+/g, '<span style="color: #10B981;">$&</span>')
        .replace(/'([^']*)'|"([^"]*)"/g, '<span style="color: #EF4444;">$&</span>')
        .replace(/\/\/.*$/gm, '<span style="color: #6B7280;">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span style="color: #6B7280;">$&</span>');
    } else if (lang === 'sql') {
      highlighted = highlighted
        .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|DATABASE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|AUTO_INCREMENT|VARCHAR|INT|TEXT|TIMESTAMP|DEFAULT)\b/gi, '<span style="color: #3B82F6;">$1</span>')
        .replace(/'([^']*)'|"([^"]*)"/g, '<span style="color: #EF4444;">$&</span>')
        .replace(/--.*$/gm, '<span style="color: #6B7280;">$&</span>');
    } else if (lang === 'css') {
      highlighted = highlighted
        .replace(/([.#][\w-]+)/g, '<span style="color: #10B981;">$1</span>')
        .replace(/\b(color|background|margin|padding|border|width|height|display|position|font-size|font-weight)\b/g, '<span style="color: #3B82F6;">$1</span>')
        .replace(/'([^']*)'|"([^"]*)"/g, '<span style="color: #EF4444;">$&</span>');
    } else if (lang === 'html') {
      highlighted = highlighted
        .replace(/&lt;(\/?[\w\s="'-]+)&gt;/g, '<span style="color: #8B5CF6;">$&</span>')
        .replace(/\b(class|id|src|href|alt|title)=/g, '<span style="color: #F59E0B;">$1</span>=')
        .replace(/'([^']*)'|"([^"]*)"/g, '<span style="color: #EF4444;">$&</span>');
    }

    element.innerHTML = highlighted;
  };

  return (
    <div 
      ref={editorRef} 
      className="flex-1 bg-gray-900 overflow-auto"
      style={{ fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace" }}
    />
  );
};