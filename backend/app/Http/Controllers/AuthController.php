<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\EmailVerificationMail;
use App\Mail\VerificationCodeMail;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Str;

use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Register a new user (step 1: create user and send verification code)
     */
    public function register(Request $request)
    {
        \Log::info('Registration attempt:', $request->all());
        
        // Check if there's a recent registration attempt with the same email
        $recentUser = User::where('email', $request->email)
            ->where('created_at', '>', now()->subMinutes(5))
            ->first();
        
        if ($recentUser) {
            // If user exists but hasn't verified email yet, resend verification code
            if (!$recentUser->hasVerifiedEmail()) {
                // Generate new verification code
                $verificationCode = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
                
                $recentUser->update([
                    'verification_code' => $verificationCode,
                    'verification_code_expires_at' => now()->addMinute(),
                ]);
                
                // Send verification code email
                Mail::to($recentUser->email)->send(new VerificationCodeMail($recentUser, $verificationCode));
                \Log::info('Resent verification code to existing unverified user:', [
                    'user_id' => $recentUser->id,
                    'email' => $recentUser->email
                ]);
                
                return response()->json([
                    'message' => 'Registration initiated. Please check your email for the verification code.',
                    'user_id' => $recentUser->id,
                    'email' => $recentUser->email,
                    'requires_verification' => true,
                ], 201);
            }
        }
        
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|unique:users',
                'password' => 'required|string|min:8',
                'role'     => 'nullable|string|in:admin,staff,treasurer,residents',
                'agree_privacy_policy' => 'required|accepted',
            ], [
                'agree_privacy_policy.required' => 'You must agree to the privacy policy to register.',
                'agree_privacy_policy.accepted' => 'You must accept the privacy policy to register.',
            ]);
            
            \Log::info('Validation passed:', $validated);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Registration validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            // Generate 3-digit verification code
            $verificationCode = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
            
            \Log::info('Creating user with data:', [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role ?? 'residents',
                'verification_code' => $verificationCode
            ]);
            
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'residents',
                'verification_code' => $verificationCode,
                'verification_code_expires_at' => now()->addMinutes(15),
                'privacy_policy_accepted' => true,
                'privacy_policy_accepted_at' => now(),
            ]);

            \Log::info('User created successfully:', [
                'user_id' => $user->id,
                'email' => $user->email,
                'verification_code' => $user->verification_code,
                'verification_code_expires_at' => $user->verification_code_expires_at
            ]);

            // Log user registration
            ActivityLogService::logCreated($user, $request);

            // Send verification code email
            try {
                Mail::to($user->email)->send(new VerificationCodeMail($user, $verificationCode));
                \Log::info('Verification email sent successfully. Code: ' . $verificationCode);
            } catch (\Exception $mailError) {
                \Log::error('Failed to send verification email:', [
                    'error' => $mailError->getMessage(),
                    'user_id' => $user->id
                ]);
                // Log the code for testing purposes
                \Log::info('Verification code for testing: ' . $verificationCode);
                // Don't fail registration if email fails, just log it
            }

            return response()->json([
                'message' => 'Registration initiated. Please check your email for the verification code.',
                'user_id' => $user->id,
                'email' => $user->email,
                'requires_verification' => true,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Registration failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify registration with code (step 2: verify code and complete registration)
     */
    public function verifyRegistration(Request $request)
    {
        \Log::info('Verification attempt:', $request->all());

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'verification_code' => 'required|string|size:3',
        ]);

        $user = User::findOrFail($request->user_id);

        \Log::info('User before verification:', $user->toArray());

        if ($user->isVerificationCodeExpired()) {
            return response()->json(['message' => 'Verification code has expired. Please request a new one.', 'code_expired' => true], 400);
        }

        if ($user->verification_code !== $request->verification_code) {
            return response()->json(['message' => 'Invalid verification code. Please try again.', 'invalid_code' => true], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ]);

        \Log::info('User after verification:', $user->fresh()->toArray());

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration completed successfully! You can now log in to your account.',
            'user' => $user->fresh(),
            'token' => $token,
            'email_verified' => true,
        ]);
    }

    /**
     * Resend verification code
     */
    public function resendVerificationCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if user is already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified.'
            ], 400);
        }

        // Check if a verification code was recently sent (prevent spam)
        if ($user->verification_code_expires_at &&
            $user->verification_code_expires_at->isFuture()) {
            return response()->json([
                'message' => 'Please wait for your current verification code to expire before requesting a new one.'
            ], 429);
        }

        // Generate new verification code
        $verificationCode = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        
        $user->update([
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => now()->addMinute(), // 1 minute expiry
        ]);

        // Send new verification code email
        Mail::to($user->email)->send(new VerificationCodeMail($user, $verificationCode));

        return response()->json([
            'message' => 'New verification code sent successfully. Please check your inbox.'
        ]);
    }

    /**
     * Send verification email (legacy method - keeping for compatibility)
     */
    private function sendVerificationEmail($user)
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->email),
            ]
        );

        Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));
    }

    /**
     * Verify email address (legacy method - keeping for compatibility)
     */
    public function verifyEmail(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->email), $request->hash)) {
            return response()->json(['message' => 'Invalid verification link'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Email verified successfully! You can now log in to your account.',
            'user' => $user
        ]);
    }

    /**
     * Resend verification email (legacy method - keeping for compatibility)
     */
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified'], 400);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'message' => 'Verification email sent successfully. Please check your inbox.'
        ]);
    }

    /**
     * Login a user
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->getAuthPassword())) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'email_verified' => false,
                'user_id' => $user->id,
                'requires_verification' => true,
            ], 403);
        }

        // Update last activity timestamp
        $user->updateLastActivity();

        $token = $user->createToken('api-token')->plainTextToken;

        // Log successful login
        ActivityLogService::logAuth('login', $request);

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
            'email_verified' => true,
        ]);
    }

    /**
     * Logout a user
     */
    public function logout(Request $request)
    {
        // Log logout before deleting tokens
        ActivityLogService::logAuth('logout', $request);

        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Get authenticated user with profile
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->loadMissing('profile'),
        ]);
    }

    /**
     * Delete a user by ID (admin only)
     */
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Optional: Prevent deleting self
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.'], 200);
    }
}
