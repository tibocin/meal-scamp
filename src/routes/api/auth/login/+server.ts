<!--
  src/routes/api/auth/login/+server.ts
  User login API endpoint
  Related components: Login, AuthGuard
  Tags: api, authentication, user-login
-->

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return json(
        { message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // TODO: Fetch user from database
    // For now, we'll simulate a database query
    const user = {
      id: `user_${Date.now()}`,
      email,
      username: email.split('@')[0], // Mock username from email
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // TODO: Verify password hash from database
    // For now, we'll accept any password for demo purposes
    const isValidPassword = true; // Replace with: await bcrypt.compare(password, hashedPasswordFromDB)

    if (!isValidPassword) {
      return json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // TODO: Generate JWT token
    // For now, we'll create a mock token
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};
