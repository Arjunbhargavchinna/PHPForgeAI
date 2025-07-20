import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ProjectProvider } from './context/ProjectContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProjectProvider>
      <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} />
          <MainContent />
        </div>
      </div>
    </ProjectProvider>
  );
}

export default App;