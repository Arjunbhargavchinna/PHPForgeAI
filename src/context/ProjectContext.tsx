import React, { createContext, useContext, useState, ReactNode } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ProjectFile {
  name: string;
  content: string;
  path: string;
}

interface DatabaseTable {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primary: boolean;
    autoIncrement: boolean;
  }>;
}

interface ProjectContextType {
  files: ProjectFile[];
  activeFile: string | null;
  activeTab: string;
  setActiveFile: (fileName: string) => void;
  setActiveTab: (tab: string) => void;
  generateCode: (prompt: string) => void;
  loadTemplate: (templateId: string) => void;
  addDatabaseTable: (table: DatabaseTable) => void;
  exportProject: () => void;
  generatePreview: () => string;
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

  const generateCode = (prompt: string) => {
    // Simulate AI code generation based on prompt
    const generatedFiles: ProjectFile[] = [];

    if (prompt.toLowerCase().includes('blog')) {
      generatedFiles.push(
        {
          name: 'index.php',
          path: 'public/index.php',
          content: `<?php
require_once '../config/database.php';
require_once '../app/controllers/BlogController.php';

$controller = new BlogController();

$action = $_GET['action'] ?? 'index';
$id = $_GET['id'] ?? null;

switch ($action) {
    case 'show':
        $controller->show($id);
        break;
    case 'create':
        $controller->create();
        break;
    case 'store':
        $controller->store();
        break;
    default:
        $controller->index();
        break;
}
?>`
        },
        {
          name: 'BlogController.php',
          path: 'app/controllers/BlogController.php',
          content: `<?php
require_once '../models/Post.php';
require_once '../models/User.php';

class BlogController {
    private $postModel;
    private $userModel;
    
    public function __construct() {
        $this->postModel = new Post();
        $this->userModel = new User();
    }
    
    public function index() {
        $posts = $this->postModel->getAllPosts();
        include '../views/blog/index.php';
    }
    
    public function show($id) {
        $post = $this->postModel->getPostById($id);
        $comments = $this->postModel->getComments($id);
        include '../views/blog/show.php';
    }
    
    public function create() {
        if (!$this->isAuthenticated()) {
            header('Location: /login.php');
            exit;
        }
        include '../views/blog/create.php';
    }
    
    public function store() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $title = $_POST['title'] ?? '';
            $content = $_POST['content'] ?? '';
            $userId = $_SESSION['user_id'] ?? null;
            
            if ($this->postModel->createPost($title, $content, $userId)) {
                header('Location: /');
                exit;
            }
        }
    }
    
    private function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
}
?>`
        },
        {
          name: 'Post.php',
          path: 'app/models/Post.php',
          content: `<?php
class Post {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getAllPosts($limit = 10, $offset = 0) {
        $sql = "SELECT p.*, u.name as author_name, c.name as category_name 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getPostById($id) {
        $sql = "SELECT p.*, u.name as author_name, c.name as category_name 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = :id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function createPost($title, $content, $userId, $categoryId = null) {
        $sql = "INSERT INTO posts (title, content, user_id, category_id, created_at) 
                VALUES (:title, :content, :user_id, :category_id, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
    
    public function getComments($postId) {
        $sql = "SELECT c.*, u.name as author_name 
                FROM comments c 
                LEFT JOIN users u ON c.user_id = u.id 
                WHERE c.post_id = :post_id 
                ORDER BY c.created_at ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':post_id', $postId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>`
        },
        {
          name: 'database.php',
          path: 'config/database.php',
          content: `<?php
class Database {
    private static $instance = null;
    private $connection;
    
    private $host = 'localhost';
    private $database = 'blog_app';
    private $username = 'root';
    private $password = '';
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host={$this->host};dbname={$this->database};charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

// Initialize session
session_start();
?>`
        },
        {
          name: 'schema.sql',
          path: 'database/schema.sql',
          content: `-- Blog Application Database Schema

CREATE DATABASE IF NOT EXISTS blog_app;
USE blog_app;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'author', 'subscriber') DEFAULT 'subscriber',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) UNIQUE,
    user_id INT NOT NULL,
    category_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    featured_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Comments table
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT,
    author_name VARCHAR(100),
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tags table
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post tags junction table
CREATE TABLE post_tags (
    post_id INT,
    tag_id INT,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (email, password, name, role) VALUES
('admin@blog.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin'),
('author@blog.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Author', 'author');

INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Latest tech news and tutorials'),
('Lifestyle', 'lifestyle', 'Life tips and personal stories'),
('Business', 'business', 'Business insights and strategies');

INSERT INTO posts (title, content, excerpt, slug, user_id, category_id, status) VALUES
('Welcome to Our Blog', 'This is the first post on our amazing blog platform...', 'Welcome post excerpt', 'welcome-to-our-blog', 1, 1, 'published'),
('Getting Started with PHP', 'PHP is a powerful server-side scripting language...', 'PHP tutorial for beginners', 'getting-started-with-php', 2, 1, 'published');`
        },
        {
          name: 'index.php',
          path: 'views/blog/index.php',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-bold text-gray-800">Professional Blog</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
                    <a href="/categories" class="text-gray-600 hover:text-gray-900">Categories</a>
                    <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
                    <a href="/contact" class="text-gray-600 hover:text-gray-900">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">Welcome to Our Blog</h1>
            <p class="text-xl md:text-2xl mb-8">Discover amazing content and insights</p>
            <a href="#posts" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Read Latest Posts
            </a>
        </div>
    </div>

    <!-- Posts Section -->
    <div id="posts" class="max-w-7xl mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Latest Posts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <?php foreach ($posts as $post): ?>
            <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            <?= htmlspecialchars($post['category_name'] ?? 'Uncategorized') ?>
                        </span>
                        <span class="text-gray-500 text-sm ml-auto">
                            <?= date('M j, Y', strtotime($post['created_at'])) ?>
                        </span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        <a href="/?action=show&id=<?= $post['id'] ?>" class="hover:text-blue-600 transition-colors">
                            <?= htmlspecialchars($post['title']) ?>
                        </a>
                    </h3>
                    <p class="text-gray-600 mb-4">
                        <?= htmlspecialchars(substr($post['content'], 0, 150)) ?>...
                    </p>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500">
                            By <?= htmlspecialchars($post['author_name']) ?>
                        </span>
                        <a href="/?action=show&id=<?= $post['id'] ?>" class="text-blue-600 hover:text-blue-800 font-medium">
                            Read More →
                        </a>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Professional Blog</h3>
                    <p class="text-gray-400">Your source for quality content and insights.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Quick Links</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/" class="hover:text-white">Home</a></li>
                        <li><a href="/about" class="hover:text-white">About</a></li>
                        <li><a href="/contact" class="hover:text-white">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Categories</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/category/technology" class="hover:text-white">Technology</a></li>
                        <li><a href="/category/lifestyle" class="hover:text-white">Lifestyle</a></li>
                        <li><a href="/category/business" class="hover:text-white">Business</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Connect</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white">Twitter</a></li>
                        <li><a href="#" class="hover:text-white">Facebook</a></li>
                        <li><a href="#" class="hover:text-white">LinkedIn</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Professional Blog. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>`
        },
        {
          name: 'README.md',
          path: 'README.md',
          content: `# Professional Blog Application

A complete PHP/MySQL blog application with modern features and responsive design.

## Features

- User authentication and authorization
- Post creation and management
- Category and tag system
- Comment system with moderation
- Responsive design with Tailwind CSS
- SEO-friendly URLs
- Admin dashboard
- Security best practices

## Installation

1. Clone or extract the project files
2. Import the database schema from \`database/schema.sql\`
3. Configure database connection in \`config/database.php\`
4. Set up your web server to point to the \`public\` directory
5. Ensure PHP 7.4+ and MySQL 5.7+ are installed

## Configuration

Edit \`config/database.php\` with your database credentials:

\`\`\`php
private $host = 'localhost';
private $database = 'blog_app';
private $username = 'your_username';
private $password = 'your_password';
\`\`\`

## Default Login

- Email: admin@blog.com
- Password: password

## File Structure

\`\`\`
├── app/
│   ├── controllers/
│   ├── models/
│   └── views/
├── config/
├── database/
├── public/
└── README.md
\`\`\`

## Security Features

- Password hashing with bcrypt
- SQL injection prevention with prepared statements
- XSS protection with output escaping
- CSRF protection
- Input validation and sanitization

## License

MIT License - feel free to use for personal or commercial projects.`
        }
      );
    } else if (prompt.toLowerCase().includes('ecommerce') || prompt.toLowerCase().includes('shop')) {
      generatedFiles.push(
        {
          name: 'index.php',
          path: 'public/index.php',
          content: `<?php
require_once '../config/database.php';
require_once '../app/controllers/ShopController.php';

$controller = new ShopController();

$action = $_GET['action'] ?? 'index';
$id = $_GET['id'] ?? null;

switch ($action) {
    case 'product':
        $controller->showProduct($id);
        break;
    case 'cart':
        $controller->showCart();
        break;
    case 'add-to-cart':
        $controller->addToCart();
        break;
    case 'checkout':
        $controller->checkout();
        break;
    default:
        $controller->index();
        break;
}
?>`
        },
        {
          name: 'ShopController.php',
          path: 'app/controllers/ShopController.php',
          content: `<?php
require_once '../models/Product.php';
require_once '../models/Cart.php';
require_once '../models/Order.php';

class ShopController {
    private $productModel;
    private $cartModel;
    private $orderModel;
    
    public function __construct() {
        $this->productModel = new Product();
        $this->cartModel = new Cart();
        $this->orderModel = new Order();
    }
    
    public function index() {
        $products = $this->productModel->getFeaturedProducts();
        $categories = $this->productModel->getCategories();
        include '../views/shop/index.php';
    }
    
    public function showProduct($id) {
        $product = $this->productModel->getProductById($id);
        $relatedProducts = $this->productModel->getRelatedProducts($id);
        include '../views/shop/product.php';
    }
    
    public function showCart() {
        $cartItems = $this->cartModel->getCartItems();
        $total = $this->cartModel->getCartTotal();
        include '../views/shop/cart.php';
    }
    
    public function addToCart() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $productId = $_POST['product_id'] ?? null;
            $quantity = $_POST['quantity'] ?? 1;
            
            if ($this->cartModel->addItem($productId, $quantity)) {
                header('Location: /?action=cart');
                exit;
            }
        }
    }
    
    public function checkout() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $orderData = [
                'customer_name' => $_POST['name'] ?? '',
                'customer_email' => $_POST['email'] ?? '',
                'shipping_address' => $_POST['address'] ?? '',
                'payment_method' => $_POST['payment_method'] ?? 'credit_card'
            ];
            
            if ($this->orderModel->createOrder($orderData)) {
                $this->cartModel->clearCart();
                header('Location: /?action=order-success');
                exit;
            }
        }
        
        $cartItems = $this->cartModel->getCartItems();
        $total = $this->cartModel->getCartTotal();
        include '../views/shop/checkout.php';
    }
}
?>`
        }
      );
    } else {
      // Default generic application
      generatedFiles.push(
        {
          name: 'index.php',
          path: 'public/index.php',
          content: `<?php
// Generated PHP Application
require_once '../config/database.php';

echo "<!DOCTYPE html>";
echo "<html><head><title>Generated App</title></head>";
echo "<body><h1>Your Generated PHP Application</h1>";
echo "<p>Application generated based on: " . htmlspecialchars('${prompt}') . "</p>";
echo "</body></html>";
?>`
        }
      );
    }

    setFiles(generatedFiles);
    if (generatedFiles.length > 0) {
      setActiveFile(generatedFiles[0].name);
    }
    setActiveTab('code');
  };

  const loadTemplate = (templateId: string) => {
    const templates = {
      'ecommerce': 'Create a complete e-commerce store with product catalog, shopping cart, user accounts, order management, and payment processing',
      'blog': 'Build a professional blog system with user authentication, post management, categories, comments, and admin dashboard',
      'crm': 'Generate a customer relationship management system with user roles, contact management, and reporting features',
      'chat': 'Create a real-time chat application with user authentication, private messaging, and group chat functionality'
    };

    const prompt = templates[templateId as keyof typeof templates] || templates.blog;
    generateCode(prompt);
  };

  const addDatabaseTable = (table: DatabaseTable) => {
    // Add database table logic here
    console.log('Adding database table:', table);
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

    // Generate and download zip
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'php-project.zip');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const generatePreview = (): string => {
    const indexFile = files.find(f => f.name === 'index.php' && f.path.includes('views'));
    
    if (indexFile) {
      // Convert PHP template to HTML for preview
      let html = indexFile.content;
      
      // Replace PHP echo statements with sample content
      html = html.replace(/<\?php.*?\?>/gs, '');
      html = html.replace(/<\?=.*?\?>/g, 'Sample Content');
      
      // Add sample data for loops
      html = html.replace(/foreach.*?:/g, '<!-- Sample items -->');
      html = html.replace(/endforeach;/g, '<!-- End sample items -->');
      
      return html;
    }
    
    return `
      <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: #333; margin-bottom: 20px;">Generated PHP Application Preview</h1>
        <p style="color: #666; margin-bottom: 30px;">This is a preview of your generated application.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057;">Features Included:</h3>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li>Modern PHP architecture</li>
            <li>MySQL database integration</li>
            <li>Responsive design</li>
            <li>Security best practices</li>
            <li>Clean code structure</li>
          </ul>
        </div>
        <p style="color: #6c757d; font-size: 14px;">Export the project to run it on your server.</p>
      </div>
    `;
  };

  return (
    <ProjectContext.Provider
      value={{
        files,
        activeFile,
        activeTab,
        setActiveFile,
        setActiveTab,
        generateCode,
        loadTemplate,
        addDatabaseTable,
        exportProject,
        generatePreview,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};