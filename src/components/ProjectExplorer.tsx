import React from 'react';
import { Folder, FolderOpen, FileText, Database } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const ProjectExplorer: React.FC = () => {
  const { files, setActiveFile, activeFile } = useProject();
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set(['app', 'config', 'public']));

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const folders = [
    { name: 'app', files: ['User.php', 'Post.php', 'Controller.php'] },
    { name: 'config', files: ['database.php', 'app.php'] },
    { name: 'public', files: ['index.php', 'style.css'] },
    { name: 'views', files: ['login.php', 'dashboard.php'] }
  ];

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <div key={folder.name}>
          <button
            onClick={() => toggleFolder(folder.name)}
            className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-gray-700 rounded transition-colors text-left"
          >
            {expandedFolders.has(folder.name) ? (
              <FolderOpen size={16} className="text-blue-400" />
            ) : (
              <Folder size={16} className="text-blue-400" />
            )}
            <span className="text-sm">{folder.name}</span>
          </button>
          
          {expandedFolders.has(folder.name) && (
            <div className="ml-6 space-y-1">
              {folder.files.map((file) => (
                <button
                  key={file}
                  onClick={() => setActiveFile(file)}
                  className={`w-full flex items-center space-x-2 px-2 py-1 rounded transition-colors text-left ${
                    activeFile === file ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  {file.includes('.sql') ? (
                    <Database size={14} className="text-green-400" />
                  ) : (
                    <FileText size={14} className="text-gray-400" />
                  )}
                  <span className="text-sm">{file}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};