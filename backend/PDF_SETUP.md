# PDF Certificate Generation Setup

## Installation

1. Install the DomPDF package:
```bash
composer require barryvdh/laravel-dompdf
```

2. Run the migration to add pdf_path column:
```bash
php artisan migrate
```

3. Create the certificates directory in storage:
```bash
mkdir -p storage/app/public/certificates
```

4. Create a symbolic link for public storage:
```bash
php artisan storage:link
```

## Features

### For Admins:
- Generate PDF certificates for approved document requests
- Download generated PDFs
- Professional certificate templates for all document types

### For Residents:
- Download their approved document PDFs
- View certificate status

## Certificate Templates

The system includes professional templates for:
- **Barangay Clearance** (Green theme)
- **Barangay Business Permit** (Blue theme)
- **Certificate of Indigency** (Purple theme)
- **Certificate of Residency** (Orange theme)

## API Endpoints

- `POST /document-requests/{id}/generate-pdf` - Generate PDF certificate
- `GET /document-requests/{id}/download-pdf` - Download PDF certificate

## Usage

1. **Admin generates PDF**: Click "Generate PDF" button for approved requests
2. **Admin downloads PDF**: Click "Download" button after generation
3. **Resident downloads PDF**: Available in Document Status page for approved requests

## File Storage

PDFs are stored in `storage/app/public/certificates/` with the naming format:
`{document-type}-{resident-name}-{date}-{id}.pdf`

## Customization

To customize certificate templates:
1. Edit the Blade templates in `resources/views/certificates/`
2. Modify the styling in the `<style>` sections
3. Update the data fields as needed

## Troubleshooting

- Ensure DomPDF is properly installed
- Check storage permissions
- Verify symbolic link is created
- Make sure resident profile data is complete 