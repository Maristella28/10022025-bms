<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benefit Payment Receipt</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .receipt-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .receipt-number {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
        }
        .info-value {
            color: #212529;
        }
        .amount-section {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
        }
        .amount-label {
            font-size: 16px;
            margin-bottom: 5px;
            opacity: 0.9;
        }
        .amount-value {
            font-size: 36px;
            font-weight: bold;
            margin: 0;
        }
        .beneficiary-details {
            background: #fff;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .beneficiary-details h3 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 18px;
        }
        .program-details {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 20px 0;
        }
        .program-details h3 {
            margin: 0 0 15px 0;
            color: #1976d2;
            font-size: 18px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid {
            background: #d4edda;
            color: #155724;
        }
        .signature-section {
            margin-top: 30px;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            margin: 0 auto 5px auto;
        }
        .signature-label {
            font-size: 12px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- Header -->
        <div class="header">
            <h1>BENEFIT PAYMENT RECEIPT</h1>
            <p>Official Payment Confirmation</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Receipt Information -->
            <div class="receipt-info">
                <div class="receipt-number">Receipt #: {{ $receipt_number }}</div>
                <div class="info-row">
                    <span class="info-label">Date Generated:</span>
                    <span class="info-value">{{ $generated_at->format('F j, Y \a\t g:i A') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Status:</span>
                    <span class="info-value">
                        <span class="status-badge status-paid">PAID</span>
                    </span>
                </div>
            </div>

            <!-- Amount Section -->
            <div class="amount-section">
                <div class="amount-label">Total Amount Paid</div>
                <div class="amount-value">₱{{ number_format($amount, 2) }}</div>
            </div>

            <!-- Beneficiary Details -->
            <div class="beneficiary-details">
                <h3>Beneficiary Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">{{ $beneficiary->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Beneficiary Type:</span>
                    <span class="info-value">{{ $beneficiary->beneficiary_type }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contact Number:</span>
                    <span class="info-value">{{ $beneficiary->contact_number ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $beneficiary->email ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">{{ $beneficiary->full_address ?? 'N/A' }}</span>
                </div>
            </div>

            <!-- Program Details -->
            <div class="program-details">
                <h3>Program Information</h3>
                <div class="info-row">
                    <span class="info-label">Program Name:</span>
                    <span class="info-value">{{ $program->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Description:</span>
                    <span class="info-value">{{ $program->description ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Assistance Type:</span>
                    <span class="info-value">{{ $beneficiary->assistance_type }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Program Period:</span>
                    <span class="info-value">
                        @if($program->start_date && $program->end_date)
                            {{ \Carbon\Carbon::parse($program->start_date)->format('M j, Y') }} - {{ \Carbon\Carbon::parse($program->end_date)->format('M j, Y') }}
                        @else
                            N/A
                        @endif
                    </span>
                </div>
            </div>

            <!-- Signature Section -->
            <div class="signature-section">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
                <div style="margin-top: 20px; font-size: 12px; color: #6c757d;">
                    This receipt serves as official confirmation of benefit payment.<br>
                    Please keep this receipt for your records.
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Barangay Management System</strong></p>
            <p>Official Benefit Payment Receipt</p>
            <p>Generated on {{ $generated_at->format('F j, Y \a\t g:i A') }}</p>
        </div>
    </div>
</body>
</html>
