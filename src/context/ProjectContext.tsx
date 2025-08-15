import React, { createContext, useContext, useState, ReactNode } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { aiService, GeneratedProject, GeneratedFile, DatabaseTable } from '../services/aiService';

interface ProjectFile {
  name: string;
  content: string;
  path: string;
  type: string;
}

interface ProjectContextType {
  files: ProjectFile[];
  activeFile: string | null;
  activeTab: string;
  isGenerating: boolean;
  generationProgress: string;
  currentProject: GeneratedProject | null;
  databaseTables: DatabaseTable[];
  aiProvider: string;
  availableProviders: Array<{ id: string; name: string; configured: boolean }>;
  setActiveFile: (fileName: string) => void;
  setActiveTab: (tab: string) => void;
  generateCode: (prompt: string) => Promise<void>;
  loadTemplate: (templateId: string) => void;
  addDatabaseTable: (table: DatabaseTable) => void;
  exportProject: () => void;
  generatePreview: () => string;
  setAIProvider: (providerId: string) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('code');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [currentProject, setCurrentProject] = useState<GeneratedProject | null>(null);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [aiProvider, setAIProviderState] = useState(aiService.getCurrentProvider());
  const [availableProviders] = useState(aiService.getAvailableProviders());

  const generateCode = async (prompt: string) => {
    if (!aiService.isConfigured()) {
      alert('AI provider not configured. Please add your API key to the .env file.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Initializing AI generation...');
    
    try {
      setGenerationProgress('Analyzing your requirements...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGenerationProgress('Generating application architecture...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGenerationProgress('Creating database schema...');
      const project = await aiService.generateCode(prompt);
      
      setGenerationProgress('Generating PHP code...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGenerationProgress('Finalizing project structure...');
      
      // Convert generated files to project files
      const projectFiles: ProjectFile[] = project.files.map(file => ({
        name: file.name,
        content: file.content,
        path: file.path,
        type: file.type
      }));

      // Add additional files if not present
      if (!projectFiles.find(f => f.name === 'README.md')) {
        projectFiles.push({
          name: 'README.md',
          path: 'README.md',
          type: 'md',
          content: generateReadme(project)
        });
      }

      if (!projectFiles.find(f => f.name === '.env.example')) {
        projectFiles.push({
          name: '.env.example',
          path: '.env.example',
          type: 'txt',
          content: generateEnvExample()
        });
      }

      setFiles(projectFiles);
      setCurrentProject(project);
      setDatabaseTables(project.databaseSchema);
      
      if (projectFiles.length > 0) {
        setActiveFile(projectFiles[0].name);
      }
      
      setActiveTab('code');
      setGenerationProgress('Project generated successfully!');
      
      setTimeout(() => {
        setGenerationProgress('');
      }, 2000);
      
    } catch (error) {
      console.error('Code generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('402') || errorMessage.includes('Payment Required')) {
        setGenerationProgress('API credits exhausted. Please check your OpenRouter account billing or try a different AI provider.');
      } else if (errorMessage.includes('not configured')) {
        setGenerationProgress('AI provider not configured. Please add your API key to continue.');
      } else {
        setGenerationProgress('Generation failed. Please try again or switch to a different AI provider.');
      }
      
      setTimeout(() => {
        setGenerationProgress('');
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReadme = (project: GeneratedProject): string => {
    return `# ${project.description}

## Features
${project.features.map(feature => `- ${feature}`).join('\n')}

## Installation Instructions
${project.instructions}

## Database Setup
1. Create a MySQL database
2. Import the schema from \`database/schema.sql\`
3. Configure database connection in \`config/database.php\`

## Requirements
- PHP 8.0 or higher
- MySQL 8.0 or higher
- Web server (Apache/Nginx)

## Generated by PHPForge AI
This project was generated using AI-powered development tools.
Generated on: ${new Date().toISOString()}
AI Provider: ${aiService.getCurrentProvider()}

## License
MIT License - Feel free to use for personal or commercial projects.
`;
  };

  const generateEnvExample = (): string => {
    return `# Database Configuration
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_username
DB_PASS=your_password

# Application Settings
APP_NAME="Your App Name"
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost

# Security
APP_KEY=your_secret_key_here
SESSION_LIFETIME=120

# Email Configuration (if needed)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_password
`;
  };

  const loadTemplate = (templateId: string) => {
    const templates = {
      'ecommerce': 'Create a complete e-commerce store with product catalog, shopping cart, user accounts, order management, payment processing, inventory tracking, and admin dashboard with sales analytics',
      'blog': 'Build a professional blog system with user authentication, post management, categories, tags, comments with moderation, SEO optimization, admin dashboard, and responsive design',
      'crm': 'Generate a customer relationship management system with user roles, contact management, lead tracking, sales pipeline, reporting features, and team collaboration tools',
      'chat': 'Create a real-time chat application with user authentication, private messaging, group chat functionality, file sharing, emoji support, and notification system'
    };

    const prompt = templates[templateId as keyof typeof templates] || templates.blog;
    generateCode(prompt);
  };

  const addDatabaseTable = (table: DatabaseTable) => {
    setDatabaseTables(prev => [...prev, table]);
  };

  const exportProject = async () => {
    if (files.length === 0) {
      alert('No files to export. Generate a project first.');
      return;
    }

    const zip = new JSZip();
    
    // Add all files to zip
    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    // Add database schema if available
    if (databaseTables.length > 0) {
      const schema = generateDatabaseSchema();
      zip.file('database/schema.sql', schema);
    }

    // Generate and download zip
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const projectName = currentProject?.description.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'php-project';
      saveAs(content, `${projectName}.zip`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const generateDatabaseSchema = (): string => {
    let schema = '-- Generated Database Schema\n';
    schema += `-- Created: ${new Date().toISOString()}\n`;
    schema += `-- Generator: PHPForge AI\n\n`;

    databaseTables.forEach(table => {
      schema += `-- Table: ${table.name}\n`;
      schema += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
      
      const fieldDefinitions = table.fields.map(field => {
        let definition = `  ${field.name} ${field.type}`;
        if (!field.nullable) definition += ' NOT NULL';
        if (field.autoIncrement) definition += ' AUTO_INCREMENT';
        return definition;
      });
      
      schema += fieldDefinitions.join(',\n');
      
      const primaryKeys = table.fields.filter(f => f.primary).map(f => f.name);
      if (primaryKeys.length > 0) {
        schema += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
      }
      
      schema += '\n);\n\n';
    });

    // Add foreign key constraints
    schema += '-- Foreign Key Constraints\n';
    databaseTables.forEach(table => {
      table.fields.forEach(field => {
        if (field.foreignKey) {
          schema += `ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${field.name} `;
          schema += `FOREIGN KEY (${field.name}) REFERENCES ${field.foreignKey};\n`;
        }
      });
    });

    return schema;
  };

  const generatePreview = (): string => {
    if (!currentProject) {
      return `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 20px;">PHPForge AI</h1>
          <p style="color: #666; margin-bottom: 30px;">Generate your first project to see the preview.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057;">Ready to build amazing applications!</h3>
            <p>Use the AI prompt to describe your application and watch the magic happen.</p>
          </div>
        </div>
      `;
    }

    const indexFile = files.find(f => f.name.includes('index') && f.type === 'html') ||
                     files.find(f => f.path.includes('views') && f.name.includes('index'));
    
    if (indexFile) {
      let html = indexFile.content;
      
      // Convert PHP to HTML for preview
      html = html.replace(/<\?php[\s\S]*?\?>/g, '');
      html = html.replace(/<\?=\s*([^?]+)\s*\?>/g, '$1');
      html = html.replace(/foreach\s*\([^)]+\)\s*:/g, '<!-- Loop start -->');
      html = html.replace(/endforeach;/g, '<!-- Loop end -->');
      
      return html;
    }
    
    return `
      <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: #333; margin-bottom: 20px;">${currentProject.description}</h1>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057;">Features:</h3>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            ${currentProject.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
        <p style="color: #6c757d; font-size: 14px;">Export the project to run it on your server.</p>
      </div>
    `;
  };

  const setAIProvider = (providerId: string) => {
    if (aiService.setProvider(providerId)) {
      setAIProviderState(providerId);
    }
  };

  const clearProject = () => {
    setFiles([]);
    setActiveFile(null);
    setCurrentProject(null);
    setDatabaseTables([]);
    setActiveTab('code');
  };

  return (
    <ProjectContext.Provider
      value={{
        files,
        activeFile,
        activeTab,
        isGenerating,
        generationProgress,
        currentProject,
        databaseTables,
        aiProvider,
        availableProviders,
        setActiveFile,
        setActiveTab,
        generateCode,
        loadTemplate,
        addDatabaseTable,
        exportProject,
        generatePreview,
        setAIProvider,
        clearProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};