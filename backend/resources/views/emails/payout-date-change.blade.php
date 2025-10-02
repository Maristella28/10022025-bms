<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Updated Payout Schedule</title>
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
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .message {
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        .highlight-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .highlight-box h3 {
            margin: 0 0 10px 0;
            color: #1e40af;
            font-size: 18px;
        }
        .payout-date {
            font-size: 20px;
            font-weight: 700;
            color: #1e40af;
            margin: 10px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding: 15px;
            background-color: #f3f4f6;
            border-radius: 6px;
            font-size: 14px;
        }
        .icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-right: 8px;
            vertical-align: middle;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .warning-icon {
            color: #f59e0b;
            font-weight: bold;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>📅 Updated Payout Schedule</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Dear {{ $beneficiaryName }},
            </div>

            <div class="message">
                Please be informed that the payout schedule for the program <strong>"{{ $programName }}"</strong> has been updated.
            </div>

            <!-- Highlight Box for New Payout Date -->
            <div class="highlight-box">
                <h3>🕐 New Payout Date & Time</h3>
                <div class="payout-date">{{ $newPayoutDate }}</div>
            </div>

            <div class="message">
                We apologize for any inconvenience this change may cause. Please make sure to mark this new date and time on your calendar.
            </div>

            <!-- Warning Box -->
            <div class="warning">
                <span class="warning-icon">⚠️</span>
                <strong>Important:</strong> Please arrive on time for the payout. Late arrivals may not be accommodated due to scheduling constraints.
            </div>

            <div class="message">
                If you have any questions or concerns about this schedule change, please don't hesitate to contact our office.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="contact-info">
                <strong>Your Barangay / Social Services Office</strong><br>
                <span class="icon">📧</span> For inquiries, please contact our office<br>
                <span class="icon">📞</span> Phone: [Office Phone Number]<br>
                <span class="icon">📍</span> Address: [Office Address]
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This is an automated notification. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
