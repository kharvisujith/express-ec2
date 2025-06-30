import express, { Request, Response } from 'express';
import cors from 'cors';
import { users, getNextId } from './data';
import { CreateUserRequest, UpdateUserRequest, User } from './types';
import { serverConfig, corsConfig, environment } from './config';

const app = express();
const PORT = serverConfig.port;

// Middleware
if (corsConfig.enabled) {
  app.use(cors());
}
app.use(express.json());

// GET - Get all users
app.get('/api/users', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
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
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
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
    
    // Basic validation
    if (!name || !email || !age) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and age are required'
      });
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
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
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
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
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being updated and if it already exists
    if (updates.email && updates.email !== users[userIndex].email) {
      const existingUser = users.find(u => u.email === updates.email);
      if (existingUser) {
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
    
    res.status(200).json({
      success: true,
      data: users[userIndex],
      message: 'User updated successfully'
    });
  } catch (error) {
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
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    
    res.status(200).json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: environment,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
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
}); 