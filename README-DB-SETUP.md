# Database Setup Instructions

## Medical Records Table Setup

To enable the medical records feature, you need to create the required database tables. Follow these steps:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL script from `migrations/create-required-tables.sql`
4. Run the script

The script will:
- Create the medical_records table if it doesn't exist
- Set up proper indexes for performance
- Configure Row Level Security policies
- Grant appropriate permissions

After running the script, the medical records feature will be immediately available to users.

## Troubleshooting

If you encounter any issues:

1. Check the Supabase logs for any SQL errors
2. Verify that the patients table exists and has the expected structure
3. Ensure that the authenticated role has the necessary permissions

For additional help, contact the development team.
