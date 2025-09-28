<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Rental Receipt</title>
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
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
      height: 297mm;
      overflow: hidden;
    }
    .receipt-container {
      width: 210mm;
      height: 297mm;
      margin: 0;
      background: linear-gradient(145deg, #ffffff 0%, #f5f9ff 100%);
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .receipt-container::before,
    .receipt-container::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      z-index: 1;
    }
    .receipt-container::before {
      top: 0;
      height: 120px;
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #0d47a1 100%);
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 70%);
      opacity: 0.9;
    }
    .receipt-container::after {
      bottom: 0;
      height: 80px;
      background: linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #2196f3 100%);
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
      border: 2px solid #2196f3;
      box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
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
      color: #2196f3;
      font-family: 'Playfair Display', serif;
      margin: 5px 0;
    }
    .contact {
      font-size: 10px;
      color: #2196f3;
      font-weight: 500;
      margin-top: 3px;
    }

    .receipt-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #2196f3 0%, #0d47a1 100%);
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
      background: linear-gradient(90deg, transparent 0%, #2196f3 20%, #0d47a1 50%, #2196f3 80%, transparent 100%);
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
      border: 1px solid rgba(33, 150, 243, 0.1);
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
      background: rgba(33, 150, 243, 0.02);
      border-radius: 6px;
      padding: 4px 8px;
    }
    .field-label {
      font-weight: 600;
      width: 120px;
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
      background: linear-gradient(90deg, transparent 0%, rgba(33, 150, 243, 0.03) 100%);
      border-radius: 2px 2px 0 0;
    }
    .field-line:hover {
      border-bottom-color: #2196f3;
      background: rgba(33, 150, 243, 0.05);
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10px;
    }
    .items-table th {
      background: rgba(33, 150, 243, 0.1);
      padding: 8px;
      text-align: left;
      font-weight: 600;
      color: #0d47a1;
      border-bottom: 1px solid #2196f3;
    }
    .items-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .items-table tr:hover {
      background: rgba(33, 150, 243, 0.02);
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .total-section {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid rgba(33, 150, 243, 0.2);
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
    }
    .total-label {
      font-weight: 600;
      color: #4a5568;
    }
    .total-amount {
      font-weight: 700;
      color: #0d47a1;
    }
    .footer-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-top: 1px solid rgba(33, 150, 243, 0.1);
    }
    .signature-area {
      text-align: center;
      flex: 1;
      padding: 0 20px;
    }
    .signature-line {
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #2196f3 20%, #0d47a1 80%, transparent 100%);
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
      color: #2196f3;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .notes {
      margin-top: 20px;
      padding: 10px;
      background: rgba(33, 150, 243, 0.05);
      border-radius: 6px;
      font-size: 9px;
      color: #4a5568;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <img src="{{ public_path('assets/logo.jpg') }}" class="corner-logo left-corner-logo" alt="Logo">
    <img src="{{ public_path('assets/logo1.jpg') }}" class="corner-logo right-corner-logo" alt="Logo">

    <div class="header">
      <div class="republic">REPUBLIC OF THE PHILIPPINES</div>
      <div class="province">PROVINCE OF LAGUNA</div>
      <div class="city">CABUYAO CITY</div>
      <div class="barangay">BARANGAY MAMATID</div>
      <div class="contact">0949-588-3131 0906-579-1460</div>
    </div>

    <div class="receipt-title">ASSET RENTAL RECEIPT</div>
    <div class="blue-line"></div>

    <div class="content">
      <div class="modern-card">
        <div style="margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #2d3748; font-family: 'Poppins', sans-serif;">RECEIPT DETAILS:</div>
        
        <div class="info-section">
          <div class="info-fields">
            @php 
            // Debug: Let's see what data is available
            $resident = $assetRequest->resident;
            $contactNumber = $resident->contact_number ?? $resident->mobile_number ?? 'N/A';
            $address = $resident->full_address ?? $resident->current_address ?? 'N/A';
            
            $receiptFields = [
              ['RECEIPT NO.', $receiptNumber ?? 'N/A'],
              ['DATE ISSUED', \Carbon\Carbon::now()->format('M d, Y')],
              ['TIME ISSUED', \Carbon\Carbon::now()->format('h:i A')],
              ['RESIDENT NAME', ($resident->first_name ?? '') . ' ' . ($resident->last_name ?? '') ?: 'N/A'],
              ['RESIDENT ID', $resident->resident_id ?? 'N/A'],
              ['CONTACT NUMBER', $contactNumber],
              ['ADDRESS', $address],
            ]; 
            @endphp

            @foreach ($receiptFields as [$label, $value])
              <div class="info-field">
                <div class="field-label">{{ $label }}:</div>
                <div class="field-line">{{ $value }}</div>
              </div>
            @endforeach
          </div>
        </div>

        <div style="margin: 15px 0 10px; font-size: 12px; font-weight: 600; color: #2d3748; font-family: 'Poppins', sans-serif;">RENTED ITEMS:</div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Quantity</th>
              <th>Request Date</th>
              <th>Price (₱)</th>
              <th class="text-right">Subtotal (₱)</th>
            </tr>
          </thead>
          <tbody>
            @php $totalAmount = 0; @endphp
            @foreach($assetRequest->items as $item)
              @php 
                $subtotal = ($item->asset->price ?? 0) * $item->quantity;
                $totalAmount += $subtotal;
              @endphp
              <tr>
                <td>{{ $item->asset->name ?? 'N/A' }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ \Carbon\Carbon::parse($item->request_date)->format('M d, Y') }}</td>
                <td>{{ number_format($item->asset->price ?? 0, 2) }}</td>
                <td class="text-right">{{ number_format($subtotal, 2) }}</td>
              </tr>
            @endforeach
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <div class="total-label">TOTAL AMOUNT:</div>
            <div class="total-amount">₱{{ number_format($totalAmount, 2) }}</div>
          </div>
          <div class="total-row">
            <div class="total-label">AMOUNT PAID:</div>
            <div class="total-amount">₱{{ number_format($amountPaid ?? 0, 2) }}</div>
          </div>
          <div class="total-row">
            <div class="total-label">PAYMENT STATUS:</div>
            <div class="total-amount">PAID</div>
          </div>
        </div>

        <div class="blue-line"></div>

        <div class="footer-section">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">RECEIVED BY</div>
          </div>
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">{{ ($assetRequest->resident->first_name ?? '') . ' ' . ($assetRequest->resident->last_name ?? '') ?: 'N/A' }}</div>
            <div class="signature-title">RESIDENT</div>
          </div>
        </div>

        <div class="notes">
          <p><strong>NOTE:</strong> This receipt is proof of payment for asset rental. Please keep this receipt for your records. No refunds or exchanges after 24 hours of payment.</p>
          <p style="margin-top: 5px; text-align: center; font-weight: 600;">Thank you for using our services!</p>
          
          <!-- Debug Information (remove in production) -->
          <div style="margin-top: 10px; padding: 5px; background: #f0f0f0; font-size: 8px; color: #666;">
            <strong>DEBUG INFO:</strong><br>
            Contact Number (contact_number): {{ $resident->contact_number ?? 'NULL' }}<br>
            Contact Number (mobile_number): {{ $resident->mobile_number ?? 'NULL' }}<br>
            Address (full_address): {{ $resident->full_address ?? 'NULL' }}<br>
            Address (current_address): {{ $resident->current_address ?? 'NULL' }}<br>
            Resident ID: {{ $resident->resident_id ?? 'NULL' }}<br>
            Resident Attributes: {{ implode(', ', array_keys($resident->getAttributes())) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>