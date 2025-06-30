import express, { Request, Response } from 'express';
import cors from 'cors';
import { users, getNextId } from './data';
import { CreateUserRequest, UpdateUserRequest, User } from './types';
import { serverConfig, corsConfig, environment } from './config';

const app = express();
const PORT = serverConfig.port;

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log the incoming request
  console.log(`[${timestamp}] ${req.method} ${req.url} - Started`);
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusText = res.statusMessage || '';
    
    // Color coding for different status codes
    let statusColor = '';
    if (status >= 200 && status < 300) statusColor = '\x1b[32m'; // Green
    else if (status >= 400 && status < 500) statusColor = '\x1b[33m'; // Yellow
    else if (status >= 500) statusColor = '\x1b[31m'; // Red
    else statusColor = '\x1b[36m'; // Cyan
    
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${statusColor}${status} ${statusText}\x1b[0m - ${duration}ms`);
  });
  
  next();
});

// Middleware
if (corsConfig.enabled) {
  app.use(cors());
}
app.use(express.json());

// GET - Get all users
app.get('/api/users', (req: Request, res: Response) => {
  try {
    console.log(`[${new Date().toISOString()}] 📋 Fetching all users (${users.length} users found)`);
    res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error fetching users:`, error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET - Get user by ID
app.get('/api/users/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[${new Date().toISOString()}] 🔍 Fetching user with ID: ${id}`);
    
    const user = users.find(u => u.id === id);
    
    if (!user) {
      console.log(`[${new Date().toISOString()}] ❌ User not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`[${new Date().toISOString()}] ✅ User found: ${user.name} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error fetching user:`, error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST - Create new user
app.post('/api/users', (req: Request, res: Response) => {
  try {
    const { name, email, age }: CreateUserRequest = req.body;
    console.log(`[${new Date().toISOString()}] ➕ Creating new user: ${name} (${email})`);
    
    // Basic validation
    if (!name || !email || !age) {
      console.log(`[${new Date().toISOString()}] ❌ Validation failed: Missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'Name, email, and age are required'
      });
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log(`[${new Date().toISOString()}] ❌ User creation failed: Email already exists (${email})`);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    const newUser: User = {
      id: getNextId(),
      name,
      email,
      age
    };
    
    users.push(newUser);
    console.log(`[${new Date().toISOString()}] ✅ User created successfully: ${name} (ID: ${newUser.id})`);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error creating user:`, error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT - Update user
app.put('/api/users/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates: UpdateUserRequest = req.body;
    console.log(`[${new Date().toISOString()}] 🔄 Updating user with ID: ${id}`, updates);
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      console.log(`[${new Date().toISOString()}] ❌ User not found for update: ID ${id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being updated and if it already exists
    if (updates.email && updates.email !== users[userIndex].email) {
      const existingUser = users.find(u => u.email === updates.email);
      if (existingUser) {
        console.log(`[${new Date().toISOString()}] ❌ Update failed: Email already exists (${updates.email})`);
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates
    };
    
    console.log(`[${new Date().toISOString()}] ✅ User updated successfully: ${users[userIndex].name} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: users[userIndex],
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error updating user:`, error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE - Delete user
app.delete('/api/users/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[${new Date().toISOString()}] 🗑️ Deleting user with ID: ${id}`);
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      console.log(`[${new Date().toISOString()}] ❌ User not found for deletion: ID ${id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    
    console.log(`[${new Date().toISOString()}] ✅ User deleted successfully: ${deletedUser.name} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error deleting user:`, error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] 🏥 Health check requested`);
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: environment,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] 📖 API documentation requested`);
  res.status(200).json({
    success: true,
    message: 'Simple Express API with TypeScript',
    environment: environment,
    endpoints: {
      'GET /api/users': 'Get all users',
      'GET /api/users/:id': 'Get user by ID',
      'POST /api/users': 'Create new user',
      'PUT /api/users/:id': 'Update user',
      'DELETE /api/users/:id': 'Delete user',
      'GET /health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`📋 Request logging enabled - all API calls will be logged`);
}); 