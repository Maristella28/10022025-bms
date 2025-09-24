# Barangay E-Governance System - Reporting Module

## Overview
The reporting module provides barangay officials with comprehensive tools to monitor and manage resident profiles based on their activity and update status. This module includes filtering, sorting, and flagging capabilities to ensure data accuracy and timely updates.

## Features Implemented

### 1. Last Modified Timestamp
- **Field**: `last_modified` (timestamp)
- **Purpose**: Tracks when each resident's profile was last updated
- **Automation**: Automatically set to current time whenever a resident profile is updated

### 2. For Review Flagging System
- **Field**: `for_review` (boolean)
- **Purpose**: Flags records that require administrative review
- **Logic**: Automatically flags records if:
  - No update activity within 12 months
  - No login activity within 12 months
  - Profile has never been updated

### 3. Advanced Filtering & Sorting
- **Endpoint**: `GET /api/admin/residents/report`
- **Filter Options**:
  - `update_status`: active, outdated, needs_verification, for_review
  - `verification_status`: any verification status value
- **Sort Options**:
  - `last_modified` (default: desc)
  - `created_at`
  - `first_name`
  - `last_name`
  - `verification_status`

### 4. Batch Review Status Check
- **Endpoint**: `POST /api/admin/residents/batch-check-review`
- **Purpose**: Processes all residents to update their `for_review` status
- **Use Case**: Run periodically (e.g., monthly) to ensure accurate flagging

## API Endpoints

### 1. Get Residents Report
```http
GET /api/admin/residents/report
```

**Query Parameters:**
- `update_status` (optional): active, outdated, needs_verification, for_review
- `verification_status` (optional): pending, approved, denied, etc.
- `sort_by` (optional): last_modified, created_at, first_name, last_name, verification_status
- `sort_order` (optional): asc, desc (default: desc)

**Response:**
```json
{
  "residents": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "last_modified": "2024-01-15T10:30:00.000000Z",
      "for_review": false,
      "verification_status": "approved",
      "profile": { ... },
      "user": { ... }
    }
  ],
  "filters": {
    "update_status": "active",
    "sort_by": "last_modified",
    "sort_order": "desc"
  },
  "total_count": 1
}
```

### 2. Batch Check Review Status
```http
POST /api/admin/residents/batch-check-review
```

**Response:**
```json
{
  "message": "Review status checked for 150 residents. 25 records updated."
}
```

## Update Status Classification

| Status | Criteria | Description |
|--------|----------|-------------|
| **Active** | Updated within last 6 months | Regularly maintained profiles |
| **Outdated** | Updated 6-12 months ago | Needs attention soon |
| **Needs Verification** | Never updated OR >12 months since update | Requires immediate attention |
| **For Review** | `for_review` = true | Flagged for administrative review |

## Database Migration

The module adds two new fields to the `residents` table:

```php
Schema::table('residents', function (Blueprint $table) {
    $table->timestamp('last_modified')->nullable()->after('updated_at');
    $table->boolean('for_review')->default(false)->after('last_modified');
    $table->index(['for_review', 'last_modified']);
});
```

## Usage Examples

### 1. Get All Active Residents
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:8000/api/admin/residents/report?update_status=active"
```

### 2. Get Residents Needing Verification, Sorted by Name
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:8000/api/admin/residents/report?update_status=needs_verification&sort_by=last_name&sort_order=asc"
```

### 3. Run Batch Review Check
```bash
curl -X POST -H "Authorization: Bearer {token}" \
  "http://localhost:8000/api/admin/residents/batch-check-review"
```

## Integration with Frontend

Frontend developers can use this module to:

1. **Dashboard Widgets**: Show counts of residents by update status
2. **Reporting Interface**: Build advanced filtering UI for barangay officials
3. **Notification System**: Alert officials when residents need review
4. **Export Functionality**: Generate reports based on filtered data

## Testing

The module includes comprehensive tests in `tests/Feature/ResidentReportingTest.php` covering:
- Filtering by update status
- Sorting functionality
- Batch review status updates
- Automatic last_modified timestamp setting

Run tests with:
```bash
php artisan test --filter ResidentReportingTest
```

## Maintenance

### Scheduled Tasks
Consider adding a scheduled task to run the batch review check periodically:

```php
// In app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('residents:check-review-status')->monthly();
}
```

### Performance Considerations
- The `for_review` and `last_modified` fields are indexed for optimal query performance
- Large datasets may benefit from pagination in future enhancements
- Consider caching frequently accessed report data

## Future Enhancements

1. **Pagination Support**: Add pagination to reports for large datasets
2. **Export to CSV/PDF**: Add export functionality for reports
3. **Email Notifications**: Notify officials when residents are flagged for review
4. **Advanced Analytics**: Add trend analysis for profile update patterns
5. **Custom Date Ranges**: Allow filtering by custom date ranges
