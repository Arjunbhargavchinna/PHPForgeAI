import React, { useState } from 'react';
import { Send, Sparkles, Zap, Code, Database } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const PromptInput: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateCode } = useProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      setIsGenerating(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        generateCode(prompt);
        setPrompt('');
        setIsGenerating(false);
      }, 2000);
    }
  };

  const suggestions = [
    {
      icon: Code,
      text: 'Create a complete blog system with user authentication and admin panel',
      category: 'Blog'
    },
    {
      icon: Database,
      text: 'Build an e-commerce store with product catalog, cart, and checkout',
      category: 'E-commerce'
    },
    {
      icon: Zap,
      text: 'Generate a user management system with roles and permissions',
      category: 'Auth'
    },
    {
      icon: Sparkles,
      text: 'Create a task management application with team collaboration',
      category: 'Productivity'
    },
    {
      icon: Code,
      text: 'Build a real estate listing platform with search and filters',
      category: 'Business'
    },
    {
      icon: Database,
      text: 'Generate a customer support ticket system with live chat',
      category: 'Support'
    }
  ];

  return (
    <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-850 to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">
            What would you like to build today?
          </h2>
          <p className="text-gray-400 text-sm">
            Describe your PHP/MySQL application and I'll generate complete, production-ready code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your PHP/MySQL application in detail. For example: 'Create a professional blog system with user authentication, categories, comments, and an admin dashboard for content management' or 'Build an e-commerce store with product catalog, shopping cart, and payment processing'"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-4 pr-16 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-white placeholder-gray-400"
              rows={4}
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {isGenerating ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send size={20} className="text-white" />
              )}
            </button>
          </div>
          
          {isGenerating && (
            <div className="flex items-center space-x-3 text-blue-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">Generating your PHP application...</span>
            </div>
          )}
        </form>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Popular Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion.text)}
                  disabled={isGenerating}
                  className="text-left p-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                      <Icon size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                          {suggestion.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                        {suggestion.text}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};