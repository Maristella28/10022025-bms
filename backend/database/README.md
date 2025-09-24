# Database Components - Barangay Certification System

This directory contains all database-related components for the enhanced Barangay Management System with certification support.

## 📁 Directory Structure

```
backend/database/
├── migrations/
│   └── 2025_07_31_000000_add_certification_support_to_document_requests_table.php
├── seeders/
│   ├── CertificationSeeder.php
│   └── DatabaseSeeder.php
├── factories/
├── DATABASE_UPDATE_GUIDE.md          # Comprehensive update instructions
├── verify_database.php               # Database verification script
├── setup_certification_database.sh   # Linux/Mac setup script
├── setup_certification_database.bat  # Windows setup script
└── README.md                         # This file
```

## 🚀 Quick Setup

### For Linux/Mac Users:
```bash
cd backend
chmod +x database/setup_certification_database.sh
./database/setup_certification_database.sh
```

### For Windows Users:
```cmd
cd backend
database\setup_certification_database.bat
```

### Manual Setup:
```bash
cd backend
php artisan migrate
php artisan db:seed --class=CertificationSeeder
php artisan storage:link
php database/verify_database.php
```

## 📋 Database Schema Changes

The certification system adds the following fields to the `document_requests` table:

| Field | Type | Description |
|-------|------|-------------|
| `certification_type` | VARCHAR(100) | Type of certification (solo_parent, delayed_registration, etc.) |
| `certification_data` | JSON | Certification-specific data (children info, birth details, etc.) |
| `priority` | ENUM | Request priority (low, normal, high, urgent) |
| `processing_notes` | TEXT | Admin notes for processing |
| `estimated_completion` | DATE | Estimated completion date |
| `completed_at` | TIMESTAMP | Actual completion timestamp |

## 🔧 Available Tools

### 1. Database Verification Script
**File:** `verify_database.php`
**Purpose:** Comprehensive database structure and functionality testing
**Usage:** `php database/verify_database.php`

**Features:**
- Tests database connection
- Verifies table structure
- Checks column types and constraints
- Tests data insertion and retrieval
- Validates JSON field functionality
- Provides detailed success/error reporting

### 2. Setup Scripts
**Files:** `setup_certification_database.sh` (Linux/Mac), `setup_certification_database.bat` (Windows)
**Purpose:** Automated database setup and configuration
**Features:**
- Laravel installation verification
- Database connection testing
- Migration execution
- Storage directory setup
- Optional sample data seeding
- PDF system testing
- Comprehensive status reporting

### 3. Migration File
**File:** `2025_07_31_000000_add_certification_support_to_document_requests_table.php`
**Purpose:** Database schema updates for certification support
**Features:**
- Adds certification-specific columns
- Maintains backward compatibility
- Includes proper indexing
- Safe rollback capability

### 4. Seeder
**File:** `CertificationSeeder.php`
**Purpose:** Sample data for testing certification functionality
**Features:**
- Creates sample certification requests
- Demonstrates different certification types
- Includes realistic test data
- Helps with development and testing

## 📚 Documentation

### Primary Documentation Files:
1. **DATABASE_UPDATE_GUIDE.md** - Step-by-step database update instructions
2. **../CERTIFICATION_SYSTEM.md** - Complete system documentation
3. **../SETUP_GUIDE.md** - Installation and setup guide
4. **../FIXES_APPLIED.md** - Bug fixes and solutions

### Key Features Documented:
- Database migration procedures
- Backup and recovery processes
- Troubleshooting common issues
- Performance optimization
- Security considerations
- Testing procedures

## 🧪 Testing

### Database Testing Checklist:
- [ ] Run `php database/verify_database.php`
- [ ] Execute migrations: `php artisan migrate`
- [ ] Seed test data: `php artisan db:seed --class=CertificationSeeder`
- [ ] Test document request creation
- [ ] Verify certification data storage
- [ ] Test admin panel data retrieval
- [ ] Validate PDF generation with certification data

### Sample Test Commands:
```bash
# Test database connection
php artisan migrate:status

# Test model functionality
php artisan tinker
>>> App\Models\DocumentRequest::with('resident')->get()

# Test seeder
php artisan db:seed --class=CertificationSeeder

# Verify database structure
php database/verify_database.php
```

## 🔍 Troubleshooting

### Common Issues and Solutions:

1. **Migration Fails**
   - Check database connection in `.env`
   - Ensure database user has proper permissions
   - Run: `php artisan config:clear`

2. **Seeder Errors**
   - Verify residents table has data
   - Check foreign key constraints
   - Run migrations before seeding

3. **JSON Field Issues**
   - Ensure MySQL version supports JSON (5.7+)
   - Check column casting in model
   - Validate JSON data format

4. **Storage Issues**
   - Run: `php artisan storage:link`
   - Check directory permissions
   - Verify storage path configuration

### Debug Commands:
```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Check logs
tail -f storage/logs/laravel.log

# Test database connection
php artisan migrate:status
```

## 🔐 Security Considerations

- All user inputs are validated and sanitized
- JSON data is properly escaped
- Database queries use parameter binding
- File uploads are restricted and validated
- Admin actions require proper authentication

## 📈 Performance Notes

- Indexes added for frequently queried fields
- JSON fields optimized for common queries
- Efficient eager loading implemented
- Database queries optimized for large datasets

## 🔄 Maintenance

### Regular Maintenance Tasks:
1. Monitor database size and performance
2. Review and archive old requests
3. Update indexes as query patterns change
4. Backup database regularly
5. Monitor error logs for issues

### Backup Recommendations:
```bash
# Create database backup
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u username -p database_name < backup_file.sql
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the comprehensive documentation files
3. Run the verification script for detailed diagnostics
4. Check Laravel logs for specific error messages

---

**Last Updated:** July 31, 2025
**Version:** 1.0.0
**Compatibility:** Laravel 8+, MySQL 5.7+, PHP 7.4+