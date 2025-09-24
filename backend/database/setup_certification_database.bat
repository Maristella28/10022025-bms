@echo off
setlocal enabledelayedexpansion

REM Barangay Certification System - Database Setup Script (Windows)
REM This script sets up the database for the new certification functionality

echo.
echo 🚀 Barangay Certification System - Database Setup
echo ==================================================
echo.

REM Check if we're in the backend directory
if not exist "artisan" (
    echo ❌ Please run this script from the backend directory
    pause
    exit /b 1
)

echo ℹ️  Starting database setup for Barangay Certification System...
echo.

REM Step 1: Check Laravel installation
echo ℹ️  Step 1: Checking Laravel installation...
php artisan --version >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Laravel is properly installed
) else (
    echo ❌ Laravel is not properly installed or configured
    pause
    exit /b 1
)

REM Step 2: Check database connection
echo ℹ️  Step 2: Testing database connection...
php artisan migrate:status >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Database connection is working
) else (
    echo ❌ Database connection failed. Please check your .env configuration
    pause
    exit /b 1
)

REM Step 3: Show current migration status
echo ℹ️  Step 3: Checking migration status...
echo.
php artisan migrate:status
echo.

REM Step 4: Run migrations
echo ℹ️  Step 4: Running database migrations...
php artisan migrate --force
if !errorlevel! equ 0 (
    echo ✅ Migrations completed successfully
) else (
    echo ❌ Migration failed
    pause
    exit /b 1
)

REM Step 5: Verify certification migration
echo ℹ️  Step 5: Verifying certification migration...
php artisan migrate:status | findstr "add_certification_support_to_document_requests_table" >nul
if !errorlevel! equ 0 (
    echo ✅ Certification migration is present
) else (
    echo ⚠️  Certification migration not found in status
)

REM Step 6: Create storage directories
echo ℹ️  Step 6: Setting up storage directories...
if not exist "storage\app\public\certificates" mkdir "storage\app\public\certificates"
if exist "storage\app\public\certificates" (
    echo ✅ Certificates directory created
) else (
    echo ❌ Failed to create certificates directory
)

REM Step 7: Create storage link
echo ℹ️  Step 7: Creating storage link...
php artisan storage:link
if !errorlevel! equ 0 (
    echo ✅ Storage link created
) else (
    echo ⚠️  Storage link may already exist
)

REM Step 8: Optional - Seed sample data
echo.
set /p "seed=Do you want to seed sample certification data? (y/N): "
if /i "!seed!"=="y" (
    echo ℹ️  Step 8: Seeding sample certification data...
    php artisan db:seed --class=CertificationSeeder
    if !errorlevel! equ 0 (
        echo ✅ Sample data seeded successfully
    ) else (
        echo ⚠️  Sample data seeding failed (this is optional)
    )
) else (
    echo ℹ️  Skipping sample data seeding
)

REM Step 9: Test PDF system
echo ℹ️  Step 9: Testing PDF generation system...
curl -s http://localhost:8000/api/test-pdf >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ PDF system is accessible
) else (
    echo ⚠️  PDF system test endpoint not accessible (server may not be running)
)

REM Step 10: Verify database structure
echo ℹ️  Step 10: Running database verification...
if exist "database\verify_database.php" (
    php database\verify_database.php
) else (
    echo ⚠️  Database verification script not found
)

echo.
echo 🎉 Database Setup Complete!
echo ==========================
echo.
echo ✅ The database has been set up for the Barangay Certification system
echo.
echo 📋 Next Steps:
echo 1. Start your Laravel server: php artisan serve
echo 2. Start your frontend development server
echo 3. Test the certification request functionality
echo 4. Test the admin panel certification management
echo.
echo 📚 Documentation:
echo - Database Update Guide: database\DATABASE_UPDATE_GUIDE.md
echo - System Documentation: CERTIFICATION_SYSTEM.md
echo - Setup Guide: SETUP_GUIDE.md
echo - Bug Fixes Applied: FIXES_APPLIED.md
echo.
echo 🔧 Troubleshooting:
echo If you encounter issues:
echo 1. Check Laravel logs: storage\logs\laravel.log
echo 2. Verify .env database configuration
echo 3. Ensure database user has proper permissions
echo 4. Run: php artisan config:clear ^&^& php artisan cache:clear
echo.
echo ℹ️  Setup completed at: %date% %time%
echo.
pause