import React from 'react';
import { Folder, FolderOpen, FileText, Database } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const ProjectExplorer: React.FC = () => {
  const { files, setActiveFile, activeFile } = useProject();
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set(['app', 'config', 'public']));

  // Group files by directory
  const groupedFiles = React.useMemo(() => {
    const groups: { [key: string]: typeof files } = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      const directory = pathParts.length > 1 ? pathParts[0] : 'root';
      
      if (!groups[directory]) {
        groups[directory] = [];
      }
      groups[directory].push(file);
    });
    
    return groups;
  }, [files]);

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Folder size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No files generated yet</p>
        <p className="text-xs text-gray-600 mt-1">Use AI prompt to create a project</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {Object.entries(groupedFiles).map(([folderName, folderFiles]) => (
        <div key={folderName}>
          <button
            onClick={() => toggleFolder(folderName)}
            className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-gray-700 rounded transition-colors text-left"
          >
            {expandedFolders.has(folderName) ? (
              <FolderOpen size={16} className="text-blue-400" />
            ) : (
              <Folder size={16} className="text-blue-400" />
            )}
            <span className="text-sm">{folderName}</span>
            <span className="text-xs text-gray-500 ml-auto">{folderFiles.length}</span>
          </button>
          
          {expandedFolders.has(folderName) && (
            <div className="ml-6 space-y-1">
              {folderFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`w-full flex items-center space-x-2 px-2 py-1 rounded transition-colors text-left ${
                    activeFile === file.name ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  {file.name.includes('.sql') ? (
                    <Database size={14} className="text-green-400" />
                  ) : (
                    <FileText size={14} className="text-gray-400" />
                  )}
                  <span className="text-sm">{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};