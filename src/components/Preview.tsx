import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const Preview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { files, generatePreview } = useProject();
  const [previewContent, setPreviewContent] = useState('');

  const viewModes = [
    { id: 'desktop', icon: Monitor, width: '100%' },
    { id: 'tablet', icon: Tablet, width: '768px' },
    { id: 'mobile', icon: Smartphone, width: '375px' }
  ];

  const handleGeneratePreview = () => {
    const preview = generatePreview();
    setPreviewContent(preview);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Live Preview</h3>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`p-2 rounded transition-colors ${
                      viewMode === mode.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-400'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
            <div className="w-px h-6 bg-gray-600" />
            <button
              onClick={handleGeneratePreview}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-400"
              title="Refresh preview"
            >
              <RefreshCw size={16} />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-400">
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-100 p-4 overflow-auto">
        <div 
          className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
          style={{ 
            width: viewModes.find(m => m.id === viewMode)?.width,
            minHeight: '600px'
          }}
        >
          {previewContent ? (
            <div 
              className="h-full"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          ) : files.length > 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-600 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Monitor size={24} className="text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Preview Ready</h4>
                <p className="text-sm mb-4">Click refresh to generate live preview</p>
                <button
                  onClick={handleGeneratePreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Preview
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-600 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Monitor size={24} className="text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">No Project Generated</h4>
                <p className="text-sm">Generate PHP code to see live preview</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>The preview will show your generated PHP application</p>
                  <p>with simulated database interactions</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};