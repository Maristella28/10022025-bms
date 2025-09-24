<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code - Barangay e-Governance</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #4a5568;
            line-height: 1.7;
        }
        .verification-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
        }
        .footer {
            background-color: #f7fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 5px 0;
            color: #718096;
            font-size: 14px;
        }
        .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-bottom: 15px;
        }
        .warning {
            background-color: #fef5e7;
            border: 1px solid #f6ad55;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .warning p {
            margin: 0;
            color: #c05621;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ asset('assets/images/logo.jpg') }}" alt="Barangay Logo" class="logo">
            <h1>Barangay e-Governance</h1>
            <p>Verification Code</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello <strong>{{ $user->name }}</strong>,
            </div>
            
            <div class="message">
                Thank you for registering with Barangay e-Governance! To complete your registration, please enter the verification code below in your registration form.
            </div>
            
            <div class="verification-code">
                {{ $verificationCode }}
            </div>
            
            <div class="message">
                This verification code will expire in 1 minute. If you don't enter the code in time, you can request a new one.
            </div>

            <div class="warning">
                <p><strong>Important:</strong> Never share this code with anyone. Barangay e-Governance will never ask for this code via phone or email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Barangay e-Governance System</strong></p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If you have any questions, please contact your barangay office.</p>
        </div>
    </div>
</body>
</html> 