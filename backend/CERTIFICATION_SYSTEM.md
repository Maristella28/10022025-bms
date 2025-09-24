# Barangay Certification System

## Overview
The Barangay Certification System is an enhanced document request system that supports various types of certifications with dynamic templates and conditional form fields.

## Features

### 1. Document Types Supported
- **Barangay Clearance** - General clearance certificate
- **Barangay Business Permit** - Business operation permits
- **Certificate of Indigency** - Financial assistance certificates
- **Certificate of Residency** - Proof of residence
- **Barangay Certification** - Various specialized certifications

### 2. Certification Types (Under Barangay Certification)
- **Solo Parent Certification** - For single parents
- **Delayed Registration of Birth Certificate** - For delayed birth registrations
- **Good Moral Character** - Character reference certificates
- **First Time Job Seeker** - Employment assistance certificates
- **Senior Citizen Certification** - Senior citizen benefits
- **PWD Certification** - Person with disability certificates
- **Cohabitation Certificate** - Proof of cohabitation
- **No Income Certificate** - Income verification

### 3. Dynamic Templates
The system automatically selects the appropriate template based on the certification type:

- `brgy-certification-solo-parent.blade.php` - Solo Parent template
- `brgy-certification-delayed-registration.blade.php` - Delayed Registration template
- `brgy-certification-first-time-jobseeker.blade.php` - First Time Jobseeker template
- `brgy-certification.blade.php` - General certification template (fallback)

### 4. Database Schema

#### New Fields in `document_requests` table:
- `certification_type` - Type of certification (for Brgy Certification documents)
- `certification_data` - JSON field for certification-specific data
- `processing_notes` - Admin notes for processing
- `priority` - Request priority (low, normal, high, urgent)
- `estimated_completion` - Estimated completion date
- `completed_at` - Actual completion timestamp

## Implementation Details

### Frontend (React)
- **File**: `frontend/src/pages/residents/RequestDocuments.jsx`
- **Features**:
  - Conditional form fields based on certification type
  - Auto-fill from resident profile data
  - Modern UI with animations and glassmorphism effects
  - Smart validation for required fields

### Backend (Laravel)

#### Models
- **DocumentRequest** (`app/Models/DocumentRequest.php`)
  - Added new fillable fields for certification support
  - Proper casting for JSON and date fields

#### Controllers
- **DocumentRequestController** (`app/Http/Controllers/DocumentRequestController.php`)
  - Enhanced store method to handle certification data
  - Updated validation and processing logic
  - Added support for new fields in update method

#### Services
- **PdfService** (`app/Services/PdfService.php`)
  - Intelligent template selection based on certification type
  - Support for certification-specific data in PDF generation
  - Enhanced error handling and logging

### Database Migrations
- **2025_07_31_000000_add_certification_support_to_document_requests_table.php**
  - Adds new fields to support certification system
  - Maintains backward compatibility

### Seeders
- **CertificationSeeder** (`database/seeders/CertificationSeeder.php`)
  - Creates sample certification requests for testing
  - Demonstrates different certification types and statuses

## API Endpoints

### Document Requests
- `GET /api/document-requests` - Admin: Fetch all requests
- `POST /api/document-requests` - Resident: Submit new request
- `PUT/PATCH /api/document-requests/{id}` - Admin: Update request
- `GET /api/document-requests/my` - Resident: View own requests
- `POST /api/document-requests/{id}/generate-pdf` - Generate PDF certificate
- `GET /api/document-requests/{id}/download-pdf` - Download PDF certificate

### Request Payload Example (Barangay Certification)
```json
{
  "document_type": "Brgy Certification",
  "fields": {
    "fullName": "John Doe",
    "address": "123 Main St, Barangay 727",
    "dateOfBirth": "1990-01-01",
    "civilStatus": "Single",
    "age": 34,
    "purpose": "Solo Parent Certification",
    "childName": "Jane Doe",
    "childBirthDate": "2015-05-15"
  }
}
```

## Template Variables

### Available in all certification templates:
- `$documentRequest` - The document request model
- `$resident` - The resident model with profile data
- `$certificationData` - Certification-specific data array

### Certification-specific data:
- **Solo Parent**: `child_name`, `child_birth_date`
- **Delayed Registration**: `registration_office`, `registration_date`
- **First Time Jobseeker**: No additional data required

## Installation & Setup

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Seed Sample Data (Optional)
```bash
php artisan db:seed --class=CertificationSeeder
```

### 3. Generate Storage Link (if not exists)
```bash
php artisan storage:link
```

### 4. Test PDF System
```bash
curl -X GET http://your-domain/api/test-pdf
```

## Usage Flow

1. **Resident submits request**:
   - Selects "Barangay Certification" document type
   - Chooses specific certification type from dropdown
   - Fills conditional fields (if required)
   - Submits request

2. **System processes request**:
   - Extracts certification type and specific data
   - Stores in database with proper structure
   - Sets initial status as "pending"

3. **Admin reviews and approves**:
   - Views request in admin panel
   - Can add processing notes and set priority
   - Updates status to "approved"

4. **PDF generation**:
   - System selects appropriate template
   - Generates PDF with resident and certification data
   - Stores PDF path in database

5. **Download**:
   - Resident can download approved certificates
   - Admin can download for distribution

## Error Handling

The system includes comprehensive error handling for:
- Missing templates
- Invalid certification types
- PDF generation failures
- File storage issues
- Database validation errors

## Security Features

- User authentication required
- Role-based access control
- Input validation and sanitization
- Secure file storage
- Audit trail through timestamps

## Future Enhancements

- Email notifications for status updates
- Digital signatures for certificates
- Batch processing for multiple requests
- Advanced reporting and analytics
- Mobile app integration