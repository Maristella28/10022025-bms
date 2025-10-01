<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
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
            padding: 30px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            margin: 10px 0;
        }
        .status-approved {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status-under-review {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }
        .admin-notes {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .admin-notes h4 {
            margin: 0 0 10px 0;
            color: #856404;
            font-size: 14px;
        }
        .admin-notes p {
            margin: 0;
            color: #856404;
            font-style: italic;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 20px 0;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .program-details {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .program-details h4 {
            margin: 0 0 10px 0;
            color: #495057;
        }
        .program-details p {
            margin: 5px 0;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Barangay e-Governance</h1>
            <p>Application Status Update</p>
        </div>
        
        <div class="content">
            <h2>Dear {{ $user->name ?? 'Resident' }},</h2>
            
            <p>We are writing to inform you about the status update of your program application.</p>
            
            <div class="info-box">
                <h3>Application Details:</h3>
                <div class="program-details">
                    <h4>{{ $submission->form->title ?? 'Program Application' }}</h4>
                    <p><strong>Application ID:</strong> #{{ $submission->id }}</p>
                    <p><strong>Submitted:</strong> {{ $submission->submitted_at->format('F j, Y \a\t g:i A') }}</p>
                    <p><strong>Program:</strong> {{ $submission->form->program->name ?? 'N/A' }}</p>
                </div>
            </div>
            
            <h3>Current Status:</h3>
            <span class="status-badge status-{{ $status }}">
                @switch($status)
                    @case('approved')
                        ✅ Approved
                        @break
                    @case('rejected')
                        ❌ Rejected
                        @break
                    @case('under_review')
                        🔍 Under Review
                        @break
                    @default
                        ⏳ {{ ucfirst(str_replace('_', ' ', $status)) }}
                @endswitch
            </span>
            
            @if($status === 'approved')
                <div class="info-box">
                    <h3>🎉 Congratulations!</h3>
                    <p>Your application has been <strong>approved</strong>! You can now access your benefits through the "My Benefits" section in your dashboard.</p>
                </div>
            @elseif($status === 'rejected')
                <div class="admin-notes">
                    <h4>📝 Admin Notes:</h4>
                    <p>{{ $adminNotes ?? 'No specific reason provided.' }}</p>
                </div>
                <div class="info-box">
                    <h3>📋 Next Steps:</h3>
                    <p>Unfortunately, your application was not approved at this time. Please review the feedback above and consider reapplying if you believe you meet the requirements.</p>
                </div>
            @elseif($status === 'under_review')
                <div class="info-box">
                    <h3>🔍 Under Review</h3>
                    <p>Your application is currently being reviewed by our team. We will notify you once the review process is complete.</p>
                </div>
            @endif
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ env('APP_URL', 'http://localhost:5173') }}/residents/my-benefits" class="btn">
                    View My Benefits
                </a>
            </div>
            
            <p>If you have any questions or concerns, please don't hesitate to contact our barangay office.</p>
            
            <p>Thank you for your patience and understanding.</p>
            
            <p>Best regards,<br>
            <strong>Barangay Administration Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Barangay e-Governance System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
