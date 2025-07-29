import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';

const router = express.Router();

// Async wrapper to handle promise rejections
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /auth/signup - Register a new user
router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { email, password } = req.body;
      const user = await AuthService.signUp(email, password);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user account',
      });
    }
  })
);

// POST /auth/signin - Sign in an existing user
router.post(
  '/signin',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { email, password } = req.body;
      const user = await AuthService.signIn(email, password);

      return res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        user,
      });
    } catch (error: any) {
      console.error('Signin error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials',
      });
    }
  })
);

// POST /auth/signout - Sign out the current user
router.post('/signout', asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  try {
    await AuthService.signOut();
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error: any) {
    console.error('Signout error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to sign out',
    });
  }
}));

// GET /auth/me - Get current user profile
router.get('/me', asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await AuthService.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user profile',
    });
  }
}));

// POST /auth/refresh - Refresh access token
router.post('/refresh', asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await AuthService.refreshSession();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Failed to refresh session'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      user,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Failed to refresh token',
    });
  }
}));

// POST /auth/forgot-password - Send password reset email
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
  ],
  asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { email } = req.body;
      await AuthService.resetPassword(email);

      return res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send password reset email',
      });
    }
  })
);

// POST /auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { password } = req.body;
      await AuthService.updatePassword(password);

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      console.error('Update password error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update password',
      });
    }
  })
);

export default router;
