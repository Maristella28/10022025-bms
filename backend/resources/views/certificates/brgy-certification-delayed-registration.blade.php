<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delayed Registration of Birth Certificate</title>
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
            border-bottom: 3px solid #2196f3;
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
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
            color: #2196f3;
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
        .person-info {
            background: #f8f9fa;
            border: 2px solid #2196f3;
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
            min-width: 200px;
        }
        .info-value {
            color: #212529;
            flex: 1;
            text-align: right;
        }
        .registration-section {
            margin: 30px 0;
            text-align: left;
        }
        .registration-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .registration-info {
            background: #e3f2fd;
            border: 2px solid #2196f3;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
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
            border-left: 4px solid #2196f3;
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
            border: 3px solid #2196f3;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(33, 150, 243, 0.1);
        }
        .stamp-text {
            font-size: 10px;
            font-weight: bold;
            color: #2196f3;
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
            <h2>Province of Laguna</h2>
            <h2>City of Cabuyao</h2>
            <h2>Barangay Mamatid</h2>
            <h2>Office of the Barangay Chairman</h2>
        </div>

        <div class="content">
            <div class="certificate-title">Certification</div>
            
            <div class="certificate-text">
                <strong>To Whom It May Concern:</strong>
            </div>
            
            <div class="certificate-text">
                This is to certify that <strong>JACOB CIUDAD ADVINCULA</strong>, presently Block 66 Lot 13 Phase 7 
                Extra Ordinary Homes Mabuay City Mabuay Laguna was born on 
                December 31, 2014 at City of Bacoor, Cavite parents: MARIA LOURDES EYANO CIUDAD 
                and ALVIN PENOLA ADVINCULA.
            </div>
            
            <div class="certificate-text">
                This certification is being issued upon the request MARIA LOURDES EYANO CIUDAD 
                for <strong>DELAYED REGISTRATION OF BIRTH CERTIFICATE</strong> at LOCAL CIVIL 
                REGISTRY OFFICE, City of Cabuyao, Laguna. That their family belongs to many indigent 
                families in our Barangay.
            </div>

            <div class="registration-section">
                <div class="registration-label">Registration Information:</div>
                <div class="registration-info">
                    <div class="info-row">
                        <span class="info-label">Registration Office:</span>
                        <span class="info-value">{{ $documentRequest->fields['registrationOffice'] ?? 'LOCAL CIVIL REGISTRY OFFICE' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Registration Date:</span>
                        <span class="info-value">{{ $documentRequest->fields['registrationDate'] ? \Carbon\Carbon::parse($documentRequest->fields['registrationDate'])->format('F j, Y') : 'N/A' }}</span>
                    </div>
                </div>
            </div>

            <div class="person-info">
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
                    <span class="info-label">Complete Address:</span>
                    <span class="info-value">{{ $documentRequest->fields['address'] ?? $resident->current_address }}</span>
                </div>
            </div>

            <div class="certificate-text">
                Given this <strong>{{ \Carbon\Carbon::now()->format('jS \d\a\y \of F Y') }}</strong> at Barangay Mamatid, City of Cabuyao, Laguna
            </div>

            <div class="signature-section">
                <div class="signature-box">
                    <div style="margin-bottom: 10px; font-size: 12px; color: #495057;">Certified Correct By:</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">HON. ERNANI G. HIMPISAO</div>
                    <div class="signature-title">Punong Barangay</div>
                    <div class="signature-title">Mamatid City of Cabuyao Laguna</div>
                </div>
            </div>

            <div style="position: absolute; bottom: 100px; left: 40px; font-size: 12px; font-style: italic; color: #6c757d;">
                *not valid without official seal
            </div>
        </div>

        <div class="stamp-area">
            <div class="stamp-text">
                Official<br>Seal
            </div>
        </div>

        <div class="footer">
            <p>This certification is valid for official purposes.</p>
            <p>For verification, please contact the Barangay Office</p>
        </div>
    </div>
</body>
</html>