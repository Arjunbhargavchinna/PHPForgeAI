import React, { useState } from 'react';
import { Send, Sparkles, Zap, Code, Database, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const PromptInput: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { 
    generateCode, 
    isGenerating, 
    generationProgress,
    aiProvider,
    availableProviders,
    setAIProvider
  } = useProject();

  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      await generateCode(prompt);
      setPrompt('');
    }
  };

  const suggestions = [
    {
      icon: Code,
      text: 'Create a complete blog system with user authentication, post management, categories, comments, and admin dashboard',
      category: 'Blog',
      complexity: 'Advanced'
    },
    {
      icon: Database,
      text: 'Build an e-commerce store with product catalog, shopping cart, user accounts, order management, and payment processing',
      category: 'E-commerce',
      complexity: 'Expert'
    },
    {
      icon: Zap,
      text: 'Generate a customer relationship management (CRM) system with contact management, lead tracking, and sales pipeline',
      category: 'Business',
      complexity: 'Advanced'
    },
    {
      icon: Sparkles,
      text: 'Create a task management application with team collaboration, project tracking, and deadline notifications',
      category: 'Productivity',
      complexity: 'Intermediate'
    },
    {
      icon: Code,
      text: 'Build a real estate listing platform with property search, filters, agent profiles, and inquiry management',
      category: 'Real Estate',
      complexity: 'Advanced'
    },
    {
      icon: Database,
      text: 'Generate a learning management system (LMS) with courses, quizzes, student progress tracking, and certificates',
      category: 'Education',
      complexity: 'Expert'
    }
  ];

  const currentProvider = availableProviders.find(p => p.id === aiProvider);
  const hasConfiguredProvider = availableProviders.some(p => p.configured);

  return (
    <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-850 to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              What would you like to build today?
            </h2>
            <p className="text-gray-400 text-sm">
              Describe your PHP/MySQL application and I'll generate complete, production-ready code
            </p>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="AI Settings"
          >
            <Settings size={20} className="text-gray-400" />
          </button>
        </div>

        {/* AI Provider Settings */}
        {showSettings && (
          <div className="mb-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">AI Provider Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setAIProvider(provider.id)}
                  disabled={!provider.configured}
                  className={`p-3 rounded-lg border transition-all ${
                    aiProvider === provider.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : provider.configured
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                      : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{provider.name}</span>
                    {provider.configured ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {provider.configured ? 'Ready to use' : 'API key required'}
                  </p>
                </button>
              ))}
            </div>
            
            {!hasConfiguredProvider && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} className="text-yellow-400" />
                  <span className="text-sm text-yellow-300">
                    No AI providers configured. Add API keys to .env file to enable code generation.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Provider Status */}
        <div className="mb-4 flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Using:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            currentProvider?.configured 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-red-500/20 text-red-300'
          }`}>
            {currentProvider?.name || 'No provider selected'}
          </span>
          {currentProvider?.configured && (
            <CheckCircle size={14} className="text-green-400" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your PHP/MySQL application in detail. For example: 'Create a professional blog system with user authentication, categories, comments, and an admin dashboard for content management' or 'Build an e-commerce store with product catalog, shopping cart, and payment processing'"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-4 pr-16 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-white placeholder-gray-400"
              rows={4}
              disabled={isGenerating || !hasConfiguredProvider}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating || !hasConfiguredProvider}
              className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {isGenerating ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send size={20} className="text-white" />
              )}
            </button>
          </div>
          
          {isGenerating && generationProgress && (
            <div className="flex items-center space-x-3 text-blue-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">{generationProgress}</span>
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
                  disabled={isGenerating || !hasConfiguredProvider}
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.complexity === 'Expert' ? 'bg-red-500/20 text-red-300' :
                          suggestion.complexity === 'Advanced' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {suggestion.complexity}
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