# Barangay Certification System - Setup Guide

## Quick Setup Commands

### 1. Run Database Migrations
```bash
# Navigate to backend directory
cd backend

# Run the new certification migration
php artisan migrate

# Check migration status
php artisan migrate:status
```

### 2. Seed Sample Data (Optional)
```bash
# Run the certification seeder to create sample data
php artisan db:seed --class=CertificationSeeder

# Or run all seeders
php artisan db:seed
```

### 3. Test the System
```bash
# Test PDF generation system
curl -X GET http://localhost:8000/api/test-pdf

# Or visit in browser:
# http://localhost:8000/api/test-pdf
```

### 4. Storage Setup (if needed)
```bash
# Create storage link for public access
php artisan storage:link

# Check if certificates directory exists
ls -la storage/app/public/
```

## Verification Steps

### 1. Check Database Tables
```sql
-- Check if new columns were added
DESCRIBE document_requests;

-- Check sample data
SELECT id, document_type, certification_type, status, priority FROM document_requests WHERE document_type = 'Brgy Certification';
```

### 2. Test Frontend
1. Start the Laravel backend: `php artisan serve`
2. Start the React frontend: `npm start` (in frontend directory)
3. Navigate to the Request Documents page
4. Try selecting "Barangay Certification" and different certification types
5. Verify conditional fields appear/disappear correctly

### 3. Test PDF Generation
1. Create a certification request through the frontend
2. As admin, approve the request
3. Generate PDF certificate
4. Download and verify the PDF content

## Troubleshooting

### Migration Issues
```bash
# If migration fails, rollback and retry
php artisan migrate:rollback --step=1
php artisan migrate

# Check for any pending migrations
php artisan migrate:status
```

### PDF Generation Issues
```bash
# Check if DomPDF is installed
composer show barryvdh/laravel-dompdf

# Install if missing
composer require barryvdh/laravel-dompdf

# Clear config cache
php artisan config:clear
```

### Template Issues
```bash
# Check if all templates exist
ls -la resources/views/certificates/

# Required templates:
# - brgy-certification.blade.php
# - brgy-certification-solo-parent.blade.php
# - brgy-certification-delayed-registration.blade.php
# - brgy-certification-first-time-jobseeker.blade.php
```

### Storage Issues
```bash
# Check storage permissions
ls -la storage/app/public/

# Create certificates directory if missing
mkdir -p storage/app/public/certificates
chmod 755 storage/app/public/certificates

# Recreate storage link
rm public/storage
php artisan storage:link
```

## Testing Checklist

- [ ] Database migration completed successfully
- [ ] New columns added to document_requests table
- [ ] Sample certification data seeded (optional)
- [ ] Frontend displays 5 document types including Barangay Certification
- [ ] Conditional fields work for Solo Parent and Delayed Registration
- [ ] PDF test endpoint returns success
- [ ] Storage link exists and is accessible
- [ ] All certificate templates are present
- [ ] Can submit certification requests through frontend
- [ ] Admin can approve requests and generate PDFs
- [ ] PDFs download correctly with proper content

## API Testing with Postman/curl

### Submit Certification Request
```bash
curl -X POST http://localhost:8000/api/document-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "document_type": "Brgy Certification",
    "fields": {
      "fullName": "John Doe",
      "address": "123 Main St",
      "dateOfBirth": "1990-01-01",
      "civilStatus": "Single",
      "age": 34,
      "purpose": "Solo Parent Certification",
      "childName": "Jane Doe",
      "childBirthDate": "2015-05-15"
    }
  }'
```

### Generate PDF
```bash
curl -X POST http://localhost:8000/api/document-requests/1/generate-pdf \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Success Indicators

✅ **Database Updated**: New columns visible in document_requests table
✅ **Frontend Enhanced**: 5 document cards with conditional forms
✅ **Backend Ready**: API endpoints handle certification data
✅ **Templates Created**: All certification templates exist
✅ **PDF System**: Can generate and download certificates
✅ **Documentation**: Complete system documentation available

## Next Steps

After successful setup:
1. Create resident profiles for testing
2. Submit various certification requests
3. Test the admin approval workflow
4. Verify PDF generation for each certification type
5. Test the complete user journey from request to download