import React from 'react';
import { ShoppingCart, Users, FileText, MessageSquare } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const Templates: React.FC = () => {
  const { loadTemplate } = useProject();

  const templates = [
    { 
      id: 'ecommerce', 
      name: 'E-commerce', 
      icon: ShoppingCart, 
      description: 'Product catalog with cart',
      color: 'text-green-400'
    },
    { 
      id: 'blog', 
      name: 'Blog System', 
      icon: FileText, 
      description: 'Content management blog',
      color: 'text-blue-400'
    },
    { 
      id: 'crm', 
      name: 'User Management', 
      icon: Users, 
      description: 'Authentication & profiles',
      color: 'text-purple-400'
    },
    { 
      id: 'chat', 
      name: 'Chat App', 
      icon: MessageSquare, 
      description: 'Real-time messaging',
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-2">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.id}
            onClick={() => loadTemplate(template.id)}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start space-x-3">
              <Icon size={20} className={template.color} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">{template.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{template.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};