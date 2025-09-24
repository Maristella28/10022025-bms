<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Barangay Clearance</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Open Sans', Arial, sans-serif;
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 50%, #a5d6a7 100%);
      height: 297mm;
      overflow: hidden;
    }
    .certificate-container {
      width: 210mm;
      height: 297mm;
      margin: 0;
      background: linear-gradient(145deg, #ffffff 0%, #f8fffe 100%);
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .certificate-container::before,
    .certificate-container::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      z-index: 1;
    }
    .certificate-container::before {
      top: 0;
      height: 120px;
      background: linear-gradient(135deg, #81c784 0%, #66bb6a 50%, #4caf50 100%);
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 70%);
      opacity: 0.9;
    }
    .certificate-container::after {
      bottom: 0;
      height: 80px;
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%);
      clip-path: polygon(0 30%, 100% 15%, 100% 100%, 0 100%);
      opacity: 0.9;
    }
    .corner-logo {
      position: absolute;
      top: 15px;
      width: 60px;
      height: 60px;
      object-fit: contain;
      background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
      border-radius: 50%;
      border: 2px solid #4caf50;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      z-index: 10;
    }
    .corner-logo:hover {
      transform: scale(1.05);
    }
    .left-corner-logo { left: 30px; }
    .right-corner-logo { right: 30px; }

    .header {
      padding: 25px 30px 0;
      text-align: center;
      position: relative;
      z-index: 11;
    }
    .republic {
      font-size: 14px;
      font-weight: 700;
      color: #2d3748;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.3px;
    }
    .province, .city {
      font-size: 12px;
      color: #4a5568;
      font-weight: 500;
      margin: 1px 0;
    }
    .barangay {
      font-size: 18px;
      font-weight: 700;
      color: #4caf50;
      font-family: 'Playfair Display', serif;
      margin: 5px 0;
    }
    .contact {
      font-size: 10px;
      color: #4caf50;
      font-weight: 500;
      margin-top: 3px;
    }

    .certificate-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 10px 0 5px;
      letter-spacing: 1px;
      text-align: center;
    }
    .blue-line {
      width: 80%;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #4caf50 20%, #2e7d32 50%, #4caf50 80%, transparent 100%);
      margin: 5px auto 10px;
      border-radius: 1px;
    }
    .content {
      padding: 0 30px;
      position: relative;
      z-index: 12;
    }
    .modern-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(76, 175, 80, 0.1);
    }
    .info-section {
      position: relative;
      width: 100%;
    }
    .info-fields {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .info-field {
      display: flex;
      align-items: center;
      font-size: 10px;
      margin-bottom: 4px;
      position: relative;
      padding: 1px 0;
    }
    .info-field:hover {
      background: rgba(76, 175, 80, 0.02);
      border-radius: 6px;
      padding: 4px 8px;
    }
    .field-label {
      font-weight: 600;
      width: 100px;
      color: #4a5568;
      font-family: 'Poppins', sans-serif;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .field-line {
      flex: 0 0 110px;
      border-bottom: 1px solid #e2e8f0;
      padding: 2px 4px;
      margin-left: 8px;
      font-weight: 500;
      color: #2d3748;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.03) 100%);
      border-radius: 2px 2px 0 0;
    }
    .field-line:hover {
      border-bottom-color: #4caf50;
      background: rgba(76, 175, 80, 0.05);
    }
    .photo-box {
      position: absolute;
      right: 20px;
      top: -3px;
      width: 75px;
      height: 90px;
      border: 1px dashed #4caf50;
      border-radius: 6px;
      background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: #4caf50;
      font-weight: 600;
      letter-spacing: 0.5px;
      font-family: 'Poppins', sans-serif;
      overflow: hidden;
    }
    .photo-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
    }
    .photo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .photo-placeholder {
      text-align: center;
      line-height: 1.2;
    }
    .thumb-box {
      position: absolute;
      right: 20px;
      top: -3px;
      width: 75px;
      height: 55px;
      border: 1px dashed #4caf50;
      border-radius: 6px;
      background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #4caf50;
      font-weight: 600;
      letter-spacing: 0.5px;
      font-family: 'Poppins', sans-serif;
    }
    .thumb-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
    }
    .footer-fields .info-field {
      font-size: 10px;
      margin-bottom: 5px;
    }
    .footer-section {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-top: 1px solid rgba(76, 175, 80, 0.1);
    }
    .signature-area {
      text-align: center;
      flex: 1;
      padding: 0 20px;
    }
    .signature-line {
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #4caf50 20%, #2e7d32 80%, transparent 100%);
      margin: 10px auto 4px;
      border-radius: 1px;
    }
    .signature-name {
      font-size: 11px;
      font-weight: 600;
      color: #2d3748;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 2px;
    }
    .signature-title {
      font-size: 9px;
      color: #4caf50;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <img src="{{ public_path('assets/logo.jpg') }}" class="corner-logo left-corner-logo" alt="Logo">
    <img src="{{ public_path('assets/logo1.jpg') }}" class="corner-logo right-corner-logo" alt="Logo">

    <div class="header">
      <div class="republic">REPUBLIC OF THE PHILIPPINES</div>
      <div class="province">PROVINCE OF LAGUNA</div>
      <div class="city">CABUYAO CITY</div>
      <div class="barangay">BARANGAY MAMATID</div>
      <div class="contact">0949-588-3131 0906-579-1460</div>
    </div>

    <div class="certificate-title">BARANGAY CLEARANCE</div>
    <div class="blue-line"></div>

    <div class="content">
      <div class="modern-card">
        <div style="margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #2d3748; font-family: 'Poppins', sans-serif;">TO WHOM IT MAY CONCERN:</div>
        <div style="margin-bottom: 10px; font-size: 11px; line-height: 1.4; color: #4a5568; text-align: justify;">
          As per record kept in this office, the person whose name, right thumbmark and signature appear hereon has requested a <strong style="color: #4caf50;">BARANGAY CLEARANCE</strong> with the following information:
        </div>

        <div class="info-section">
          <div class="info-fields">
            @php $fields = [
              ['CLEARANCE NO.', $documentRequest->id ?? 'N/A'],
              ['DATE ISSUED', \Carbon\Carbon::now()->format('M d, Y')],
              ['NAME', "{$resident->first_name} {$resident->middle_name} {$resident->last_name}" . ($resident->name_suffix ? " {$resident->name_suffix}" : '')],
              ['ADDRESS', $resident->full_address ?? 'N/A'],
              ['PERIOD OF STAY', $resident->years_in_barangay . ' years' ?? 'N/A'],
              ['CIVIL STATUS', $resident->civil_status ?? 'N/A'],
              ['DATE OF BIRTH', $resident->birth_date ? \Carbon\Carbon::parse($resident->birth_date)->format('M d, Y') : 'N/A'],
              ['BIRTH PLACE', $resident->birth_place ?? 'N/A'],
              ['GENDER', $resident->sex ?? 'N/A'],
              ['AGE', $resident->age . ' years old' ?? 'N/A'],
              ['PURPOSE', $documentRequest->fields['purpose'] ?? 'Official purposes'],
              ['REMARKS', 'No pending case'],
            ]; @endphp

            @foreach ($fields as $index => [$label, $value])
              <div class="info-field">
                <div class="field-label">{{ $label }}:</div>
                <div class="field-line">{{ $value }}</div>
                @if ($index == 2)
                  <div class="photo-box">
                    @if(isset($documentRequest->photo_path) && $documentRequest->photo_path)
                      @php
                        // Handle different photo sources
                        if (str_starts_with($documentRequest->photo_path, 'http')) {
                          $photoUrl = $documentRequest->photo_path;
                        } elseif (str_starts_with($documentRequest->photo_path, 'avatars/')) {
                          $photoUrl = public_path('storage/' . $documentRequest->photo_path);
                        } else {
                          $photoUrl = public_path('storage/' . $documentRequest->photo_path);
                        }
                      @endphp
                      <img src="{{ $photoUrl }}" alt="Resident Photo" class="photo-image">
                    @elseif(isset($resident->avatar) && $resident->avatar)
                      @php
                        // Use resident's profile photo as fallback
                        $avatarUrl = public_path('storage/' . $resident->avatar);
                      @endphp
                      <img src="{{ $avatarUrl }}" alt="Resident Photo" class="photo-image">
                    @else
                      <div class="photo-placeholder">PHOTO</div>
                    @endif
                  </div>
                @endif
                @if ($index == 6)
                  <div class="thumb-box">THUMBMARK</div>
                @endif
              </div>
            @endforeach
          </div>
        </div>

        <div class="blue-line"></div>

        <div class="footer-fields">
          <div class="info-field">
            <div class="field-label">CTC NO.:</div>
            <div class="field-line">N/A</div>
          </div>
          <div class="info-field">
            <div class="field-label">PLACE ISSUED:</div>
            <div class="field-line">Barangay Mamatid</div>
          </div>
          <div class="info-field">
            <div class="field-label">DATE ISSUED:</div>
            <div class="field-line">{{ \Carbon\Carbon::now()->format('M d, Y') }}</div>
          </div>
        </div>

        <div class="footer-section">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">SIGNATURE</div>
          </div>
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">HON. ERNANI G. HIMPISAO</div>
            <div class="signature-title">PUNONG BARANGAY</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</body>
</html>
