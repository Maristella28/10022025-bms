<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Indigency</title>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            min-height: 100vh;
        }
        .certificate-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding: 40px 20px 20px;
            border-bottom: 3px solid #6f42c1;
            background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header h2 {
            margin: 10px 0 0;
            font-size: 18px;
            font-weight: normal;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
            text-align: center;
        }
        .certificate-title {
            font-size: 32px;
            font-weight: bold;
            color: #6f42c1;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .certificate-text {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
            text-align: justify;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .resident-info {
            background: #f8f9fa;
            border: 2px solid #6f42c1;
            border-radius: 10px;
            padding: 30px;
            margin: 30px 0;
            text-align: left;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
            min-width: 150px;
        }
        .info-value {
            color: #212529;
            flex: 1;
            text-align: right;
        }
        .purpose-section {
            margin: 30px 0;
            text-align: left;
        }
        .purpose-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 10px;
        }
        .purpose-value {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #6f42c1;
        }
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .signature-box {
            text-align: center;
            flex: 1;
            margin: 0 20px;
        }
        .signature-line {
            width: 200px;
            height: 2px;
            background: #000;
            margin: 50px auto 10px;
        }
        .signature-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .signature-title {
            font-size: 12px;
            color: #6c757d;
        }
        .stamp-area {
            position: absolute;
            top: 50%;
            right: 50px;
            transform: translateY(-50%);
            width: 100px;
            height: 100px;
            border: 3px solid #6f42c1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(111, 66, 193, 0.1);
        }
        .stamp-text {
            font-size: 10px;
            font-weight: bold;
            color: #6f42c1;
            text-align: center;
            text-transform: uppercase;
        }
        .footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
        }
        .certificate-number {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 12px;
            color: #6c757d;
            background: #f8f9fa;
            padding: 5px 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-number">
            Certificate No: {{ $documentRequest->id ?? 'N/A' }}
        </div>
        
        <div class="header">
            <h1>Republic of the Philippines</h1>
            <h2>Province of [Province]</h2>
            <h2>Municipality of [Municipality]</h2>
            <h2>Barangay [Barangay Name]</h2>
        </div>

        <div class="content">
            <div class="certificate-title">Certificate of Indigency</div>
            
            <div class="certificate-text">
                TO WHOM IT MAY CONCERN:
            </div>
            
            <div class="certificate-text">
                This is to certify that <strong>{{ $documentRequest->fields['fullName'] ?? ($resident->first_name . ' ' . $resident->last_name) }}</strong>, 
                of legal age, {{ $resident->civil_status ?? '' }}, {{ $resident->nationality ?? 'Filipino' }}, 
                and a resident of this barangay, is classified as indigent based on the assessment conducted by this office.
            </div>
            
            <div class="certificate-text">
                This certification is being issued upon the request of the above-named person for <strong>{{ $documentRequest->fields['purpose'] ?? 'official purposes' }}</strong>.
            </div>

            <div class="resident-info">
                <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">{{ $documentRequest->fields['fullName'] ?? ($resident->first_name . ' ' . $resident->last_name) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">{{ $resident->birth_date ? \Carbon\Carbon::parse($resident->birth_date)->format('F d, Y') : 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Age:</span>
                    <span class="info-value">{{ $resident->age ?? 'N/A' }} years old</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Civil Status:</span>
                    <span class="info-value">{{ $resident->civil_status ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">House Number:</span>
                    <span class="info-value">{{ $documentRequest->fields['houseNumber'] ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Street:</span>
                    <span class="info-value">{{ $documentRequest->fields['street'] ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Purok:</span>
                    <span class="info-value">{{ $documentRequest->fields['purok'] ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Barangay:</span>
                    <span class="info-value">{{ $documentRequest->fields['barangay'] ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contact Number:</span>
                    <span class="info-value">{{ $resident->contact_number ?? 'N/A' }}</span>
                </div>
            </div>

            <div class="purpose-section">
                <div class="purpose-label">Purpose of Certification:</div>
                <div class="purpose-value">{{ $documentRequest->fields['purpose'] ?? 'Official purposes' }}</div>
            </div>

            <div class="certificate-text">
                This certification is valid for 6 months from the date of issuance and may be used for various government and private transactions requiring proof of indigency status.
            </div>

            <div class="certificate-text">
                Issued this <strong>{{ \Carbon\Carbon::now()->format('jS \d\a\y \of F, Y') }}</strong> at Barangay [Barangay Name], [Municipality], [Province], Philippines.
            </div>

            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-name">HON. [BARANGAY CAPTAIN NAME]</div>
                    <div class="signature-title">Barangay Captain</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-name">[SECRETARY NAME]</div>
                    <div class="signature-title">Barangay Secretary</div>
                </div>
            </div>
        </div>

        <div class="stamp-area">
            <div class="stamp-text">
                Official<br>Seal
            </div>
        </div>

        <div class="footer">
            <p>This certificate is valid for 6 months from the date of issuance.</p>
            <p>For verification, please contact the Barangay Office at [Contact Number]</p>
        </div>
    </div>
</body>
</html> 