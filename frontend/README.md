# Frontend Documentation

## Authentication Flow

This application uses Laravel Sanctum for authentication with cookie-based sessions. The axios configuration is set to use `withCredentials: true` globally.

## Profile Avatars

It's normal for avatar values to be null in the console logs. This happens when users haven't uploaded profile pictures yet. The avatar field in the profile data will be populated once users upload their profile images.

## Common Issues

### CSRF Cookie 404 Errors

If you're seeing 404 errors for `/sanctum/csrf-cookie`, ensure that:

1. The Laravel backend has the proper CORS configuration
2. The axios configuration has `withCredentials: true`
3. The `/sanctum/csrf-cookie` route is properly defined in `routes/web.php`

### Avatar Null Values

Avatar null values in the console logs are expected behavior:
- New users haven't uploaded profile pictures yet
- The `current_photo` field in the Profile model will contain the avatar path once uploaded
- The frontend maps this to the `avatar` field for display
