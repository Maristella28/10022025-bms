# Database Update Guide - Barangay Certification System

## Overview
This guide provides step-by-step instructions for updating the database to support the new Barangay Certification system.

## Database Changes Summary

### 1. New Migration: Certification Support
**File**: `2025_07_31_000000_add_certification_support_to_document_requests_table.php`

**New Fields Added to `document_requests` table:**
- `certification_type` (string, nullable) - Type of certification for Brgy Certification documents
- `certification_data` (json, nullable) - Certification-specific data (child info, registration details, etc.)
- `processing_notes` (text, nullable) - Admin processing notes
- `priority` (enum: low, normal, high, urgent, default: normal) - Request priority level
- `estimated_completion` (date, nullable) - Estimated completion date
- `completed_at` (timestamp, nullable) - Actual completion timestamp

### 2. Updated Seeder: Sample Certification Data
**File**: `CertificationSeeder.php`

**Sample Data Includes:**
- Solo Parent Certification with child information
- Delayed Registration of Birth Certificate with registration details
- First Time Job Seeker certification
- Good Moral Character certification

## Step-by-Step Update Process

### Step 1: Backup Current Database
```bash
# For MySQL
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# For PostgreSQL
pg_dump -U username database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Database Migrations
```bash
# Navigate to backend directory
cd backend

# Check current migration status
php artisan migrate:status

# Run the new certification migration
php artisan migrate

# Verify migration was successful
php artisan migrate:status
```

### Step 3: Seed Sample Data (Optional)
```bash
# Run certification seeder for testing
php artisan db:seed --class=CertificationSeeder

# Or run all seeders
php artisan db:seed
```

### Step 4: Verify Database Structure
```sql
-- Check the updated document_requests table structure
DESCRIBE document_requests;

-- Verify new columns exist
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'document_requests' 
AND COLUMN_NAME IN ('certification_type', 'certification_data', 'processing_notes', 'priority', 'estimated_completion', 'completed_at');
```

### Step 5: Test Data Insertion
```sql
-- Test inserting a certification request
INSERT INTO document_requests (
    user_id, 
    document_type, 
    certification_type, 
    fields, 
    certification_data, 
    status, 
    priority, 
    created_at, 
    updated_at
) VALUES (
    1, 
    'Brgy Certification', 
    'Solo Parent Certification', 
    '{"fullName": "Test User", "purpose": "Solo Parent Certification"}', 
    '{"child_name": "Test Child", "child_birth_date": "2015-01-01"}', 
    'pending', 
    'normal', 
    NOW(), 
    NOW()
);

-- Verify the insertion
SELECT * FROM document_requests WHERE document_type = 'Brgy Certification';
```

## Database Schema Changes

### Before Migration
```sql
CREATE TABLE document_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    fields JSON NULL,
    status VARCHAR(255) DEFAULT 'pending',
    attachment VARCHAR(255) NULL,
    pdf_path VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### After Migration
```sql
CREATE TABLE document_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    certification_type VARCHAR(255) NULL,           -- NEW
    fields JSON NULL,
    certification_data JSON NULL,                   -- NEW
    status VARCHAR(255) DEFAULT 'pending',
    processing_notes TEXT NULL,                     -- NEW
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal', -- NEW
    estimated_completion DATE NULL,                 -- NEW
    completed_at TIMESTAMP NULL,                    -- NEW
    attachment VARCHAR(255) NULL,
    pdf_path VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Rollback Instructions

### If Issues Occur, Rollback the Migration
```bash
# Rollback the certification migration
php artisan migrate:rollback --step=1

# Verify rollback
php artisan migrate:status

# Restore from backup if needed
mysql -u username -p database_name < backup_file.sql
```

## Verification Checklist

- [ ] Migration file exists: `2025_07_31_000000_add_certification_support_to_document_requests_table.php`
- [ ] Migration runs successfully without errors
- [ ] All new columns are created in `document_requests` table
- [ ] Sample data can be inserted and retrieved
- [ ] Frontend can fetch and display certification data
- [ ] Admin panel shows certification information
- [ ] PDF generation works with certification templates
- [ ] No existing functionality is broken

## Common Issues and Solutions

### Issue 1: Migration Fails
**Error**: Column already exists
**Solution**: Check if migration was already run with `php artisan migrate:status`

### Issue 2: JSON Column Issues
**Error**: JSON column not supported
**Solution**: Ensure database version supports JSON (MySQL 5.7+, PostgreSQL 9.4+)

### Issue 3: Enum Values
**Error**: Invalid enum value
**Solution**: Ensure priority values are one of: 'low', 'normal', 'high', 'urgent'

### Issue 4: Foreign Key Constraints
**Error**: Cannot add foreign key constraint
**Solution**: Ensure referenced tables exist and have proper indexes

## Performance Considerations

### Indexes for New Columns
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_document_requests_certification_type ON document_requests(certification_type);
CREATE INDEX idx_document_requests_priority ON document_requests(priority);
CREATE INDEX idx_document_requests_status_priority ON document_requests(status, priority);
CREATE INDEX idx_document_requests_completed_at ON document_requests(completed_at);
```

### Query Optimization
```sql
-- Efficient query for certification requests
SELECT dr.*, r.first_name, r.last_name 
FROM document_requests dr 
LEFT JOIN residents r ON dr.user_id = r.user_id 
WHERE dr.document_type = 'Brgy Certification' 
AND dr.status = 'pending' 
ORDER BY dr.priority DESC, dr.created_at ASC;
```

## Post-Migration Testing

### 1. Frontend Testing
- Submit new certification requests through resident interface
- Verify conditional fields work correctly
- Check data persistence and retrieval

### 2. Admin Panel Testing
- View certification requests in admin panel
- Edit certification details and priorities
- Generate and download PDF certificates

### 3. API Testing
```bash
# Test API endpoints
curl -X GET http://localhost:8000/api/document-requests
curl -X POST http://localhost:8000/api/document-requests \
  -H "Content-Type: application/json" \
  -d '{"document_type": "Brgy Certification", "fields": {"purpose": "Solo Parent Certification"}}'
```

## Success Indicators

✅ **Migration Completed**: All new columns added successfully
✅ **Data Integrity**: Existing data remains intact
✅ **Functionality**: New certification features work as expected
✅ **Performance**: No significant performance degradation
✅ **Compatibility**: All existing features continue to work

## Support and Troubleshooting

For issues during database update:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check database error logs
3. Verify database user permissions
4. Ensure database version compatibility
5. Review migration file syntax

## Maintenance

### Regular Tasks
- Monitor certification request volumes
- Archive completed requests periodically
- Update indexes based on query patterns
- Review and optimize certification data structure

### Backup Strategy
- Daily automated backups
- Pre-migration backups
- Test restore procedures regularly
- Document recovery procedures