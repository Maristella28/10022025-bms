<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>First Time Job Seeker Certification</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .page {
            width: 210mm;
            height: 297mm;
            position: relative;
            page-break-after: always;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .header {
            text-align: center;
            padding: 20mm 15mm 10mm 15mm;
            border-bottom: 3px solid #059669;
            margin-bottom: 15mm;
            background: rgba(255, 255, 255, 0.9);
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
            border-radius: 50%;
            background: #059669;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        
        .republic-header {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #1f2937;
        }
        
        .office-header {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #059669;
        }
        
        .cert-number {
            position: absolute;
            right: 15mm;
            top: 15mm;
            font-size: 10px;
            color: #6b7280;
            transform: rotate(90deg);
            transform-origin: right center;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 20mm 0 15mm 0;
            color: #1f2937;
            text-decoration: underline;
            letter-spacing: 2px;
        }
        
        .subtitle {
            font-size: 14px;
            text-align: center;
            margin-bottom: 20mm;
            color: #4b5563;
            font-style: italic;
        }
        
        .content {
            padding: 0 15mm;
            line-height: 1.8;
            font-size: 12px;
            color: #1f2937;
            text-align: justify;
        }
        
        .certification-text {
            margin-bottom: 15mm;
            text-indent: 30px;
        }
        
        .signature-section {
            margin-top: 30mm;
            display: flex;
            justify-content: space-between;
            padding: 0 15mm;
        }
        
        .signature-box {
            text-align: center;
            width: 45%;
        }
        
        .signature-line {
            border-bottom: 2px solid #374151;
            margin-bottom: 5px;
            height: 40px;
        }
        
        .signature-label {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 15px;
        }
        
        .signature-name {
            font-weight: bold;
            font-size: 12px;
            color: #1f2937;
        }
        
        .signature-title {
            font-size: 10px;
            color: #6b7280;
        }
        
        .date-issued {
            text-align: right;
            padding: 0 15mm;
            margin-top: 20mm;
            font-size: 11px;
            color: #4b5563;
        }
        
        /* Page 2 Styles */
        .oath-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 15mm 0;
            color: #1f2937;
            text-decoration: underline;
        }
        
        .oath-content {
            padding: 0 15mm;
            line-height: 1.6;
            font-size: 11px;
            color: #1f2937;
        }
        
        .oath-item {
            margin-bottom: 10px;
            text-align: justify;
        }
        
        .oath-signature {
            margin-top: 25mm;
            padding: 0 15mm;
        }
        
        .oath-signature-line {
            border-bottom: 2px solid #374151;
            width: 200px;
            height: 30px;
            margin: 10px 0;
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 48px;
            color: rgba(5, 150, 105, 0.1);
            font-weight: bold;
            z-index: 0;
        }
        
        .content-wrapper {
            position: relative;
            z-index: 1;
        }
    </style>
</head>
<body>
    <!-- Page 1: Certification -->
    <div class="page">
        <div class="watermark">BARANGAY CERTIFICATION</div>
        <div class="content-wrapper">
            <div class="cert-number">
                Barangay Certificate Number: {{ 'S' . now()->format('y') }}-{{ str_pad($documentRequest->id, 5, '0', STR_PAD_LEFT) }}
            </div>
            
            <div class="header">
                <div class="logo">BRG</div>
                <div class="republic-header">
                    Republic of the Philippines<br>
                    Province of Laguna<br>
                    City of Cabuyao<br>
                    <strong>BARANGAY MAMATID</strong><br>
                    OFFICE OF THE BARANGAY CHAIRMAN
                </div>
            </div>
            
            <div class="title">BARANGAY CERTIFICATION</div>
            <div class="subtitle">(First Time Jobseekers Assistance Act - RA 11261)</div>
            
            <div class="content">
                <div class="certification-text">
                    This is to Certify that Mr./Ms. <strong>{{ strtoupper($resident->first_name . ' ' . ($resident->middle_name ? $resident->middle_name . ' ' : '') . $resident->last_name . ($resident->name_suffix ? ' ' . $resident->name_suffix : '')) }}</strong>, is a resident of our Barangay
                    particularly residing at {{ $resident->current_address ?? $resident->full_address }}, City of
                    Cabuyao, Laguna for {{ $resident->years_in_barangay ?? 'six (6)' }} {{ $resident->years_in_barangay == 1 ? 'year' : 'years' }} and is a qualified availee of RA 11261 or the <em>First Time
                    Jobseekers Assistance Act of 2019</em>.
                </div>
                
                <div class="certification-text">
                    I further certify that the holder/bearer was informed of his/her rights, including the 
                    duties and responsibilities accorded by RA 11261, through the Oath of Undertaking he/she 
                    has signed and executed in the presence of Barangay Officials.
                </div>
                
                <div class="certification-text">
                    Signed this <strong>{{ now()->format('jS') }}</strong> day of {{ now()->format('F Y') }} in the Barangay Mamatid, City of Cabuyao, Laguna.
                </div>
                
                <div class="certification-text">
                    This certification is valid only until {{ now()->addYear()->format('F j, Y') }} one (1) year from issuance.
                </div>
            </div>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-label">Witnessed By:</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">RODNY C. PRAGOSO</div>
                    <div class="signature-title">Barangay Office Staff<br>Mamatid, City of Cabuyao, Laguna</div>
                </div>
                
                <div class="signature-box">
                    <div class="signature-label">Correct & Certified By:</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">Hon. FRANCIS C. JUMPOSAO</div>
                    <div class="signature-title">Punong Barangay<br>Mamatid, City of Cabuyao, Laguna</div>
                </div>
            </div>
            
            <div class="date-issued">
                <em>*not valid without official seal</em>
            </div>
        </div>
    </div>
    
    <!-- Page 2: Oath of Undertaking -->
    <div class="page">
        <div class="watermark">OATH OF UNDERTAKING</div>
        <div class="content-wrapper">
            <div class="cert-number">
                Barangay Certificate Number: {{ 'S' . now()->format('y') }}-{{ str_pad($documentRequest->id, 5, '0', STR_PAD_LEFT) }}
            </div>
            
            <div class="header">
                <div class="logo">BRG</div>
                <div class="republic-header">
                    Republic of the Philippines<br>
                    Province of Laguna<br>
                    City of Cabuyao<br>
                    <strong>BARANGAY MAMATID</strong><br>
                    OFFICE OF THE BARANGAY CHAIRMAN
                </div>
            </div>
            
            <div class="oath-title">OATH OF UNDERTAKING</div>
            
            <div class="oath-content">
                <div class="oath-item">
                    <strong>I, {{ strtoupper($resident->first_name . ' ' . ($resident->middle_name ? $resident->middle_name . ' ' : '') . $resident->last_name . ($resident->name_suffix ? ' ' . $resident->name_suffix : '')) }}</strong>, {{ $resident->age ? $resident->age . ' (' . $resident->age . ')' : 'twenty-three (23)' }} years of age, is a resident of our Barangay, with
                    postal address of {{ $resident->current_address ?? $resident->full_address }}, City of Cabuyao,
                    Laguna, otherwise known as the beneficiary of the First Time Jobseekers Assistance Act of 2019, do hereby declare, agree and
                    undertake to abide and be bound by the following:
                </div>
                
                <div class="oath-item">
                    <strong>1.</strong> That this is the first time that I will actively look for a job, and therefore requesting that a 
                    Barangay Certification be issued in my favour to avail the benefits of the law;
                </div>
                
                <div class="oath-item">
                    <strong>2.</strong> That I am aware that the benefit and privileges under the said law shall be valid only for 
                    one (1) year from the date that the Barangay Certification is issued;
                </div>
                
                <div class="oath-item">
                    <strong>3.</strong> That I can avail the benefits of the law only once;
                </div>
                
                <div class="oath-item">
                    <strong>4.</strong> That I understand that my personal information shall be included in the Roster List of First 
                    Time Jobseekers and will not be used for any unlawful purpose;
                </div>
                
                <div class="oath-item">
                    <strong>5.</strong> That I will inform and/or report to the Barangay personally, through text or other means, or 
                    through my family relatives once I get employed;
                </div>
                
                <div class="oath-item">
                    <strong>6.</strong> That I am not a beneficiary of the Job start Program under R.A No.10869 and other laws 
                    that give similar exemptions for the documents or transactions exempted under 
                    R.A.No.11261;
                </div>
                
                <div class="oath-item">
                    <strong>7.</strong> That if issued the requested Certification, I will not use the same in any fraud, neither falsify 
                    nor help and or assist in the fabrication of the said Certification;
                </div>
                
                <div class="oath-item">
                    <strong>8.</strong> That this undertaking is made solely for the purpose of obtaining a Barangay Certification 
                    consistent with the objective of R.A.No. 11261, and not for any other purpose;
                </div>
                
                <div class="oath-item">
                    <strong>9.</strong> That I consent to the use of my personal information pursuant to the Data Privacy Act and 
                    other applicable laws, rules and regulations.
                </div>
                
                <div class="oath-item" style="margin-top: 15mm;">
                    Signed this <strong>{{ now()->format('jS') }}</strong> day of {{ now()->format('F Y') }} at Barangay Mamatid, City of Cabuyao, Laguna.
                </div>
                
                <div class="oath-item" style="margin-top: 10mm;">
                    Signed by: ___________________________
                </div>
                
                <div class="oath-item" style="margin-top: 15mm; font-style: italic;">
                    <strong>First Time Jobseeker</strong>
                </div>
            </div>
        </div>
    </div>
</body>
</html>