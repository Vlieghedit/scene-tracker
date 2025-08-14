# Supabase Setup Guide for Cross-Device Data Sync

This guide will help you set up Supabase to store your episode tracker data in the cloud, making it accessible across different computers and devices.

## What is Supabase?

Supabase is a free, open-source alternative to Firebase that provides:
- PostgreSQL database
- Real-time subscriptions
- Authentication
- Auto-generated APIs
- Dashboard for data management

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Create a new organization (if prompted)

## Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization
3. Enter a project name (e.g., "episode-tracker")
4. Enter a database password (save this!)
5. Choose a region close to you
6. Click "Create new project"

## Step 3: Set Up Database Tables

Once your project is created, go to the SQL Editor in your Supabase dashboard and run these SQL commands:

### Create the groups table:
```sql
CREATE TABLE groups (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  episodes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create the user_preferences table:
```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY DEFAULT 1,
  selected_group_id BIGINT,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Set up Row Level Security (RLS):
```sql
-- Enable RLS on tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for this simple app)
CREATE POLICY "Allow anonymous access to groups" ON groups
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to user_preferences" ON user_preferences
  FOR ALL USING (true);
```

## Step 4: Get Your API Keys

1. Go to Settings → API in your Supabase dashboard
2. Copy the "Project URL" (looks like: `https://your-project-id.supabase.co`)
3. Copy the "anon public" key (starts with `eyJ...`)

## Step 5: Configure Environment Variables

Create a `.env` file in your project root (same level as package.json):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace the values with your actual Supabase URL and anon key.

## Step 6: Deploy to Netlify

1. Push your code to GitHub (including the .env file)
2. In Netlify, go to Site settings → Environment variables
3. Add the same environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Redeploy your site

## Step 7: Test the Setup

1. Open your deployed app
2. Create some groups, episodes, and scenes
3. Open the app on a different device/browser
4. Your data should now sync across devices!

## How It Works

- **Hybrid Storage**: The app uses Supabase when configured, localStorage as fallback
- **Automatic Sync**: Data is saved to both Supabase and localStorage for reliability
- **Offline Support**: If Supabase is unavailable, the app continues working with localStorage
- **Real-time**: Changes are immediately saved to the cloud

## Troubleshooting

### Data not syncing?
1. Check your environment variables are correct
2. Verify your Supabase tables exist
3. Check browser console for errors
4. Ensure RLS policies are set up correctly

### App not working?
1. The app will fall back to localStorage if Supabase fails
2. Check the browser console for error messages
3. Verify your API keys are correct

### Performance issues?
1. Supabase has generous free limits
2. The app batches operations to minimize API calls
3. localStorage backup ensures fast local access

## Security Notes

- The anon key is safe to use in client-side code
- RLS policies control data access
- For production apps, consider adding authentication
- The current setup allows anonymous access for simplicity

## Next Steps

Once this is working, you could enhance it with:
- User authentication
- Real-time collaboration
- Data export/import
- Backup/restore functionality
- Multiple user support

## Support

If you need help:
- Check the [Supabase documentation](https://supabase.com/docs)
- Look at the browser console for error messages
- The app will continue working with localStorage if Supabase fails
