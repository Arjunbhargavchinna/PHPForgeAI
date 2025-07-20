import React from 'react';
import { PromptInput } from './PromptInput';
import { CodeEditor } from './CodeEditor';
import { Preview } from './Preview';
import { useProject } from '../context/ProjectContext';

export const MainContent: React.FC = () => {
  const { activeTab } = useProject();

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <PromptInput />
          <CodeEditor />
        </div>
        {activeTab === 'preview' && (
          <div className="w-1/2 border-l border-gray-700">
            <Preview />
          </div>
        )}
      </div>
    </div>
  );
};