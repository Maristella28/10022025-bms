#!/bin/bash

# Barangay Certification System - Database Setup Script
# This script sets up the database for the new certification functionality

echo "🚀 Barangay Certification System - Database Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

# Check if we're in the backend directory
if [ ! -f "artisan" ]; then
    print_status "error" "Please run this script from the backend directory"
    exit 1
fi

print_status "info" "Starting database setup for Barangay Certification System..."
echo ""

# Step 1: Check Laravel installation
print_status "info" "Step 1: Checking Laravel installation..."
if php artisan --version > /dev/null 2>&1; then
    print_status "success" "Laravel is properly installed"
else
    print_status "error" "Laravel is not properly installed or configured"
    exit 1
fi

# Step 2: Check database connection
print_status "info" "Step 2: Testing database connection..."
if php artisan migrate:status > /dev/null 2>&1; then
    print_status "success" "Database connection is working"
else
    print_status "error" "Database connection failed. Please check your .env configuration"
    exit 1
fi

# Step 3: Show current migration status
print_status "info" "Step 3: Checking migration status..."
echo ""
php artisan migrate:status
echo ""

# Step 4: Run migrations
print_status "info" "Step 4: Running database migrations..."
if php artisan migrate --force; then
    print_status "success" "Migrations completed successfully"
else
    print_status "error" "Migration failed"
    exit 1
fi

# Step 5: Verify certification migration
print_status "info" "Step 5: Verifying certification migration..."
if php artisan migrate:status | grep -q "add_certification_support_to_document_requests_table"; then
    print_status "success" "Certification migration is present"
else
    print_status "warning" "Certification migration not found in status"
fi

# Step 6: Create storage directories
print_status "info" "Step 6: Setting up storage directories..."
mkdir -p storage/app/public/certificates
chmod -R 755 storage/app/public/certificates
if [ -d "storage/app/public/certificates" ]; then
    print_status "success" "Certificates directory created"
else
    print_status "error" "Failed to create certificates directory"
fi

# Step 7: Create storage link
print_status "info" "Step 7: Creating storage link..."
if php artisan storage:link; then
    print_status "success" "Storage link created"
else
    print_status "warning" "Storage link may already exist"
fi

# Step 8: Optional - Seed sample data
echo ""
read -p "Do you want to seed sample certification data? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "info" "Step 8: Seeding sample certification data..."
    if php artisan db:seed --class=CertificationSeeder; then
        print_status "success" "Sample data seeded successfully"
    else
        print_status "warning" "Sample data seeding failed (this is optional)"
    fi
else
    print_status "info" "Skipping sample data seeding"
fi

# Step 9: Test PDF system
print_status "info" "Step 9: Testing PDF generation system..."
if curl -s http://localhost:8000/api/test-pdf > /dev/null 2>&1; then
    print_status "success" "PDF system is accessible"
else
    print_status "warning" "PDF system test endpoint not accessible (server may not be running)"
fi

# Step 10: Verify database structure
print_status "info" "Step 10: Running database verification..."
if [ -f "database/verify_database.php" ]; then
    php database/verify_database.php
else
    print_status "warning" "Database verification script not found"
fi

echo ""
echo "🎉 Database Setup Complete!"
echo "=========================="
echo ""
print_status "success" "The database has been set up for the Barangay Certification system"
echo ""
echo "📋 Next Steps:"
echo "1. Start your Laravel server: php artisan serve"
echo "2. Start your frontend development server"
echo "3. Test the certification request functionality"
echo "4. Test the admin panel certification management"
echo ""
echo "📚 Documentation:"
echo "- Database Update Guide: database/DATABASE_UPDATE_GUIDE.md"
echo "- System Documentation: CERTIFICATION_SYSTEM.md"
echo "- Setup Guide: SETUP_GUIDE.md"
echo "- Bug Fixes Applied: FIXES_APPLIED.md"
echo ""
echo "🔧 Troubleshooting:"
echo "If you encounter issues:"
echo "1. Check Laravel logs: storage/logs/laravel.log"
echo "2. Verify .env database configuration"
echo "3. Ensure database user has proper permissions"
echo "4. Run: php artisan config:clear && php artisan cache:clear"
echo ""
print_status "info" "Setup completed at: $(date)"