import React from 'react';
import { Menu, Zap, Download, Play, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { exportProject, clearProject, files, isGenerating } = useProject();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PHPForge AI
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={clearProject}
          disabled={files.length === 0 || isGenerating}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>
        <button 
          onClick={exportProject}
          disabled={files.length === 0 || isGenerating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};