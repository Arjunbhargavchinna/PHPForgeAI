import React from 'react';
import { ProjectExplorer } from './ProjectExplorer';
import { Templates } from './Templates';
import { DatabaseDesigner } from './DatabaseDesigner';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">PROJECT EXPLORER</h2>
          <ProjectExplorer />
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">TEMPLATES</h2>
          <Templates />
        </div>
        
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">DATABASE DESIGNER</h2>
          <DatabaseDesigner />
        </div>
      </div>
    </div>
  );
};