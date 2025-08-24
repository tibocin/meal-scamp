/**
 * src/routes/api/pushover/+server.ts
 * Pushover push notification API endpoint
 * Related components: Settings, any component needing notifications
 * Tags: api, notifications, pushover, external-service
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Validation schema for pushover notification
const pushoverSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1024, 'Message too long'),
  title: z.string().optional(),
  priority: z.number().min(-2).max(2).optional().default(0),
  sound: z.string().optional(),
  url: z.string().url().optional(),
  urlTitle: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = pushoverSchema.safeParse(body);
    if (!validationResult.success) {
      return json(
        { message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { message, title, priority, sound, url, urlTitle } = validationResult.data;

    // TODO: Get Pushover credentials from environment variables or user settings
    const pushoverToken = process.env.PUSHOVER_TOKEN || 'your-app-token';
    const pushoverUser = process.env.PUSHOVER_USER || 'your-user-key';

    // Prepare notification data for Pushover API
    const notificationData = {
      token: pushoverToken,
      user: pushoverUser,
      message,
      title: title || 'Meal Scamp',
      priority,
      sound: sound || 'pushover',
      ...(url && { url }),
      ...(urlTitle && { url_title: urlTitle })
    };

    // Send notification to Pushover
    const pushoverResponse = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    if (!pushoverResponse.ok) {
      const errorData = await pushoverResponse.json();
      console.error('Pushover API error:', errorData);
      return json(
        { message: 'Failed to send push notification', error: errorData },
        { status: 500 }
      );
    }

    const result = await pushoverResponse.json();

    return json({
      message: 'Push notification sent successfully',
      pushoverResponse: result
    });

  } catch (error) {
    console.error('Pushover notification error:', error);
    return json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Handle GET requests (when someone visits the API endpoint directly)
export const GET: RequestHandler = async () => {
  return json(
    { 
      message: 'This endpoint only accepts POST requests for sending push notifications.',
      usage: 'Send a POST request with message and optional title, priority, sound, url, urlTitle',
      example: {
        message: 'Your meal is ready!',
        title: 'Meal Scamp',
        priority: 0,
        sound: 'pushover'
      }
    },
    { status: 405 }
  );
};
