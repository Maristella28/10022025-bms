<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Residency Verification Denied - Barangay e-Governance</title>
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
        .reason {
            background-color: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .reason-title {
            font-weight: 600;
            color: #c53030;
            margin-top: 0;
        }
        .reason-content {
            color: #2d3748;
            margin-bottom: 0;
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #718096;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .support-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .support-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .closing {
            font-size: 14px;
            color: #718096;
            margin-top: 30px;
        }
        .signature {
            font-weight: 600;
            color: #2d3748;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Residency Verification Denied</h1>
        </div>
        <div class="content">
            <p class="greeting">Dear {{ $user->name }},</p>
            
            <p class="message">
                We regret to inform you that your residency verification document has been denied by the barangay administrator.
            </p>
            
            <div class="reason">
                <h3 class="reason-title">Reason for Denial:</h3>
                <p class="reason-content">{{ $reason }}</p>
            </div>
            
            <p class="message">
                Please review the reason provided above and upload a new residency verification document that meets the requirements.
                You can upload a new document through the barangay e-governance portal.
            </p>
            
            <p class="message">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ url('/') }}" class="support-link">Upload New Document</a>
            </div>
            
            <p class="closing">
                Thank you for your cooperation.<br>
                <span class="signature">Barangay e-Governance Team</span>
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">
                This is an automated message. Please do not reply directly to this email.
            </p>
            <p class="footer-text">
                &copy; {{ date('Y') }} Barangay e-Governance. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>