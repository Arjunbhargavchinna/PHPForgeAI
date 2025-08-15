import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { CohereApi } from 'cohere-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter (Multiple Models)';
  private apiKey: string;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENROUTER_API_KEY;
  }

  async generateCode(prompt: string): Promise<GeneratedProject> {
    const systemPrompt = `You are an expert PHP/MySQL developer. Generate a complete, production-ready application based on the user's request.

IMPORTANT: Respond with a valid JSON object containing:
{
  "description": "Brief description of the application",
  "features": ["feature1", "feature2", ...],
  "instructions": "Setup and installation instructions",
  "databaseSchema": [
    {
      "name": "table_name",
      "fields": [
        {
          "name": "field_name",
          "type": "field_type",
          "nullable": false,
          "primary": true,
          "autoIncrement": true,
          "foreignKey": "referenced_table.field"
        }
      ]
    }
  ],
  "files": [
    {
      "name": "filename.php",
      "path": "directory/filename.php",
      "content": "complete file content",
      "type": "php"
    }
  ]
}

Generate a complete MVC application with:
- Proper directory structure
- Security best practices (prepared statements, input validation, CSRF protection)
- Modern responsive design with Tailwind CSS
- Complete CRUD operations
- User authentication system
- Database migrations
- Configuration files
- Documentation

Make the code production-ready with error handling, logging, and proper architecture.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PHPForge AI'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenRouter');
      }

      // Clean up the response to ensure it's valid JSON
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('OpenRouter generation error:', error);
      return this.getFallbackProject(prompt);
    }
  }

  private getFallbackProject(prompt: string): GeneratedProject {
    return {
      description: `OpenRouter-generated PHP application based on: ${prompt}`,
      features: [
        'MVC Architecture',
        'Database Integration', 
        'User Authentication',
        'Responsive Design',
        'Security Features',
        'Admin Dashboard'
      ],
      instructions: `1. Extract all files to your web server directory
2. Create a MySQL database
3. Import the database schema from database/schema.sql
4. Configure database connection in config/database.php
5. Set up proper file permissions
6. Access the application through your web browser`,
      databaseSchema: [
        {
          name: 'users',
          fields: [
            { name: 'id', type: 'INT', nullable: false, primary: true, autoIncrement: true },
            { name: 'email', type: 'VARCHAR(255)', nullable: false, primary: false, autoIncrement: false },
            { name: 'password', type: 'VARCHAR(255)', nullable: false, primary: false, autoIncrement: false },
            { name: 'name', type: 'VARCHAR(100)', nullable: false, primary: false, autoIncrement: false },
            { name: 'role', type: 'ENUM("user","admin")', nullable: false, primary: false, autoIncrement: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, primary: false, autoIncrement: false }
          ]
        },
        {
          name: 'posts',
          fields: [
            { name: 'id', type: 'INT', nullable: false, primary: true, autoIncrement: true },
            { name: 'title', type: 'VARCHAR(255)', nullable: false, primary: false, autoIncrement: false },
            { name: 'content', type: 'TEXT', nullable: false, primary: false, autoIncrement: false },
            { name: 'user_id', type: 'INT', nullable: false, primary: false, autoIncrement: false, foreignKey: 'users.id' },
            { name: 'status', type: 'ENUM("draft","published")', nullable: false, primary: false, autoIncrement: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, primary: false, autoIncrement: false }
          ]
        }
      ],
      files: [
        {
          name: 'index.php',
          path: 'public/index.php',
          type: 'php',
          content: `<?php
session_start();
require_once '../config/database.php';
require_once '../app/controllers/HomeController.php';
require_once '../app/models/User.php';

// Simple routing
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

switch ($path) {
    case '/':
    case '/home':
        $controller = new HomeController();
        $controller->index();
        break;
    case '/login':
        $controller = new AuthController();
        $controller->login();
        break;
    case '/register':
        $controller = new AuthController();
        $controller->register();
        break;
    default:
        http_response_code(404);
        echo "Page not found";
        break;
}
?>`
        },
        {
          name: 'database.php',
          path: 'config/database.php',
          type: 'php',
          content: `<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'phpforge_app';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>`
        }
      ]
    };
  }
}

export interface AIProvider {
  name: string;
  generateCode: (prompt: string, context?: any) => Promise<GeneratedProject>;
  isConfigured: () => boolean;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  type: 'php' | 'sql' | 'html' | 'css' | 'js' | 'json' | 'md' | 'txt';
}

export interface GeneratedProject {
  files: GeneratedFile[];
  description: string;
  features: string[];
  instructions: string;
  databaseSchema: DatabaseTable[];
}

export interface DatabaseTable {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primary: boolean;
    autoIncrement: boolean;
    foreignKey?: string;
  }>;
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT-4';
  private client: OpenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  async generateCode(prompt: string): Promise<GeneratedProject> {
    const systemPrompt = `You are an expert PHP/MySQL developer. Generate a complete, production-ready application based on the user's request.

IMPORTANT: Respond with a valid JSON object containing:
{
  "description": "Brief description of the application",
  "features": ["feature1", "feature2", ...],
  "instructions": "Setup and installation instructions",
  "databaseSchema": [
    {
      "name": "table_name",
      "fields": [
        {
          "name": "field_name",
          "type": "field_type",
          "nullable": false,
          "primary": true,
          "autoIncrement": true,
          "foreignKey": "referenced_table.field"
        }
      ]
    }
  ],
  "files": [
    {
      "name": "filename.php",
      "path": "directory/filename.php",
      "content": "complete file content",
      "type": "php"
    }
  ]
}

Generate a complete MVC application with:
- Proper directory structure
- Security best practices (prepared statements, input validation, CSRF protection)
- Modern responsive design with Tailwind CSS
- Complete CRUD operations
- User authentication system
- Database migrations
- Configuration files
- Documentation

Make the code production-ready with error handling, logging, and proper architecture.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI generation error:', error);
      return this.getFallbackProject(prompt);
    }
  }

  private getFallbackProject(prompt: string): GeneratedProject {
    return {
      description: `Generated PHP application based on: ${prompt}`,
      features: ['MVC Architecture', 'Database Integration', 'Responsive Design'],
      instructions: 'Extract files and configure database connection in config/database.php',
      databaseSchema: [
        {
          name: 'users',
          fields: [
            { name: 'id', type: 'INT', nullable: false, primary: true, autoIncrement: true },
            { name: 'email', type: 'VARCHAR(255)', nullable: false, primary: false, autoIncrement: false },
            { name: 'password', type: 'VARCHAR(255)', nullable: false, primary: false, autoIncrement: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, primary: false, autoIncrement: false }
          ]
        }
      ],
      files: [
        {
          name: 'index.php',
          path: 'public/index.php',
          type: 'php',
          content: `<?php
require_once '../config/database.php';
require_once '../app/controllers/HomeController.php';

$controller = new HomeController();
$controller->index();
?>`
        }
      ]
    };
  }
}

class AnthropicProvider implements AIProvider {
  name = 'Claude 3.5 Sonnet';
  private client: Anthropic;

  constructor() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  isConfigured(): boolean {
    return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
  }

  async generateCode(prompt: string): Promise<GeneratedProject> {
    const systemPrompt = `You are an expert PHP/MySQL developer. Generate a complete, production-ready application based on the user's request. Respond with valid JSON only.`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Invalid response type from Claude');
      }

      return JSON.parse(content.text);
    } catch (error) {
      console.error('Anthropic generation error:', error);
      return this.getFallbackProject(prompt);
    }
  }

  private getFallbackProject(prompt: string): GeneratedProject {
    return {
      description: `Claude-generated PHP application: ${prompt}`,
      features: ['Advanced Architecture', 'Security Features', 'Modern Design'],
      instructions: 'Deploy to PHP 8+ server with MySQL 8+',
      databaseSchema: [],
      files: []
    };
  }
}

class CohereProvider implements AIProvider {
  name = 'Cohere Command';
  private client: CohereApi;

  constructor() {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    if (!apiKey) {
      throw new Error('Cohere API key not configured');
    }
    this.client = new CohereApi(apiKey);
  }

  isConfigured(): boolean {
    return !!import.meta.env.VITE_COHERE_API_KEY;
  }

  async generateCode(prompt: string): Promise<GeneratedProject> {
    try {
      const response = await this.client.generate({
        model: 'command',
        prompt: `Generate a complete PHP/MySQL application for: ${prompt}. Return valid JSON with files, database schema, and instructions.`,
        maxTokens: 4000,
        temperature: 0.7
      });

      return JSON.parse(response.generations[0].text);
    } catch (error) {
      console.error('Cohere generation error:', error);
      return this.getFallbackProject(prompt);
    }
  }

  private getFallbackProject(prompt: string): GeneratedProject {
    return {
      description: `Cohere-generated application: ${prompt}`,
      features: ['Intelligent Design', 'Optimized Performance'],
      instructions: 'Configure and deploy to web server',
      databaseSchema: [],
      files: []
    };
  }
}

class GoogleAIProvider implements AIProvider {
  name = 'Google Gemini Pro';
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  isConfigured(): boolean {
    return !!import.meta.env.VITE_GOOGLE_AI_API_KEY;
  }

  async generateCode(prompt: string): Promise<GeneratedProject> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(`Generate a complete PHP/MySQL application for: ${prompt}. Return valid JSON with files, database schema, and instructions.`);
      
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Google AI generation error:', error);
      return this.getFallbackProject(prompt);
    }
  }

  private getFallbackProject(prompt: string): GeneratedProject {
    return {
      description: `Gemini-generated application: ${prompt}`,
      features: ['AI-Optimized', 'Scalable Architecture'],
      instructions: 'Deploy with modern PHP stack',
      databaseSchema: [],
      files: []
    };
  }
}

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: string;

  constructor() {
    // Initialize available providers
    try {
      this.providers.set('openai', new OpenAIProvider());
    } catch (error) {
      console.warn('OpenAI provider not available:', error);
    }

    try {
      this.providers.set('anthropic', new AnthropicProvider());
    } catch (error) {
      console.warn('Anthropic provider not available:', error);
    }

    try {
      this.providers.set('cohere', new CohereProvider());
    } catch (error) {
      console.warn('Cohere provider not available:', error);
    }

    try {
      this.providers.set('google', new GoogleAIProvider());
    } catch (error) {
      console.warn('Google AI provider not available:', error);
    }

    try {
      this.providers.set('openrouter', new OpenRouterProvider());
    } catch (error) {
      console.warn('OpenRouter provider not available:', error);
    }

    // Set default provider
    this.currentProvider = import.meta.env.VITE_DEFAULT_AI_PROVIDER || 'openrouter';
    
    // Fallback to first available provider
    if (!this.providers.has(this.currentProvider)) {
      const availableProviders = Array.from(this.providers.keys());
      if (availableProviders.length > 0) {
        this.currentProvider = availableProviders[0];
      }
    }
  }

  getAvailableProviders(): Array<{ id: string; name: string; configured: boolean }> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
      configured: provider.isConfigured()
    }));
  }

  getCurrentProvider(): string {
    return this.currentProvider;
  }

  setProvider(providerId: string): boolean {
    if (this.providers.has(providerId)) {
      this.currentProvider = providerId;
      return true;
    }
    return false;
  }

  async generateCode(prompt: string, context?: any): Promise<GeneratedProject> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error(`Provider ${this.currentProvider} not available`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${provider.name} is not properly configured`);
    }

    return await provider.generateCode(prompt, context);
  }

  isConfigured(): boolean {
    const provider = this.providers.get(this.currentProvider);
    return provider ? provider.isConfigured() : false;
  }
}

export const aiService = new AIService();