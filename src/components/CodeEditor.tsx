import React, { useState } from 'react';
import { FileText, Database, Globe, Settings, Download, Copy, Play } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { MonacoEditor } from './MonacoEditor';

export const CodeEditor: React.FC = () => {
  const { activeFile, setActiveFile, files, activeTab, setActiveTab, exportProject } = useProject();
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'code', label: 'Code Editor', icon: FileText },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'preview', label: 'Preview', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const copyToClipboard = async () => {
    if (activeFile && files.find(f => f.name === activeFile)) {
      const content = files.find(f => f.name === activeFile)?.content || '';
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'php': return 'php';
      case 'js': return 'javascript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'sql': return 'sql';
      case 'json': return 'json';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center space-x-2 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-gray-700 text-blue-400'
                  : 'border-transparent hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'code' && (
        <>
          {files.length > 0 && (
            <div className="flex border-b border-gray-700 bg-gray-800 overflow-x-auto">
              {files.map((file) => (
                <div key={file.name} className="flex items-center">
                  <button
                    onClick={() => setActiveFile(file.name)}
                    className={`px-4 py-2 text-sm whitespace-nowrap border-r border-gray-700 transition-colors ${
                      activeFile === file.name
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {file.name}
                  </button>
                </div>
              ))}
              {activeFile && (
                <div className="flex items-center space-x-2 px-3">
                  <button
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} className={copied ? 'text-green-400' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={exportProject}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                    title="Export project"
                  >
                    <Download size={14} className="text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {activeFile && files.find(f => f.name === activeFile) ? (
              <MonacoEditor
                value={files.find(f => f.name === activeFile)?.content || ''}
                language={getFileLanguage(activeFile)}
                onChange={() => {}} // Read-only for now
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-900">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No file selected</p>
                  <p className="text-sm">Use the AI prompt to generate PHP/MySQL code</p>
                  <div className="mt-4 text-xs text-gray-600">
                    <p>Try prompts like:</p>
                    <ul className="mt-2 space-y-1">
                      <li>"Create a user authentication system"</li>
                      <li>"Build a blog with CRUD operations"</li>
                      <li>"Generate an e-commerce product catalog"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'database' && (
        <div className="flex-1 p-4 bg-gray-900 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Database Schema</h3>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                  Generate SQL
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-blue-400 mb-3 flex items-center">
                    <Database size={16} className="mr-2" />
                    users
                  </h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>id</span>
                      <span className="text-yellow-400">INT PRIMARY KEY AUTO_INCREMENT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>email</span>
                      <span className="text-green-400">VARCHAR(255) UNIQUE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>password</span>
                      <span className="text-green-400">VARCHAR(255)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>name</span>
                      <span className="text-green-400">VARCHAR(100)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>created_at</span>
                      <span className="text-purple-400">TIMESTAMP</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-3 flex items-center">
                    <Database size={16} className="mr-2" />
                    posts
                  </h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>id</span>
                      <span className="text-yellow-400">INT PRIMARY KEY AUTO_INCREMENT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>title</span>
                      <span className="text-green-400">VARCHAR(255)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>content</span>
                      <span className="text-green-400">TEXT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>user_id</span>
                      <span className="text-orange-400">INT FOREIGN KEY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>category_id</span>
                      <span className="text-orange-400">INT FOREIGN KEY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>created_at</span>
                      <span className="text-purple-400">TIMESTAMP</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-purple-400 mb-3 flex items-center">
                    <Database size={16} className="mr-2" />
                    categories
                  </h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>id</span>
                      <span className="text-yellow-400">INT PRIMARY KEY AUTO_INCREMENT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>name</span>
                      <span className="text-green-400">VARCHAR(100)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>slug</span>
                      <span className="text-green-400">VARCHAR(100) UNIQUE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>description</span>
                      <span className="text-green-400">TEXT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-orange-400 mb-3 flex items-center">
                    <Database size={16} className="mr-2" />
                    comments
                  </h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>id</span>
                      <span className="text-yellow-400">INT PRIMARY KEY AUTO_INCREMENT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>post_id</span>
                      <span className="text-orange-400">INT FOREIGN KEY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>user_id</span>
                      <span className="text-orange-400">INT FOREIGN KEY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>content</span>
                      <span className="text-green-400">TEXT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>created_at</span>
                      <span className="text-purple-400">TIMESTAMP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-300 mb-3">Relationships</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>• posts.user_id → users.id (One-to-Many)</div>
                  <div>• posts.category_id → categories.id (Many-to-One)</div>
                  <div>• comments.post_id → posts.id (Many-to-One)</div>
                  <div>• comments.user_id → users.id (Many-to-One)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex-1 p-4 bg-gray-900 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Project Configuration</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      defaultValue="my-php-app"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      PHP Version
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors">
                      <option>PHP 8.3</option>
                      <option>PHP 8.2</option>
                      <option>PHP 8.1</option>
                      <option>PHP 8.0</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Framework
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors">
                      <option>Vanilla PHP</option>
                      <option>Laravel</option>
                      <option>Symfony</option>
                      <option>CodeIgniter</option>
                      <option>CakePHP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Database
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors">
                      <option>MySQL 8.0</option>
                      <option>MySQL 5.7</option>
                      <option>MariaDB</option>
                      <option>PostgreSQL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Database Configuration
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Database Host"
                      defaultValue="localhost"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Database Name"
                      defaultValue="app_database"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      defaultValue="root"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Features to Include
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'User Authentication',
                      'Admin Panel',
                      'Email System',
                      'File Upload',
                      'API Endpoints',
                      'Session Management',
                      'Input Validation',
                      'Security Headers'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium">
                    Apply Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};