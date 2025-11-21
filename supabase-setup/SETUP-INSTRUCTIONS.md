# K&E HVAC - New Supabase Project Setup Guide

This guide will walk you through setting up a fresh Supabase project for your K&E HVAC application.

## Overview

Your app uses Supabase for:
- **Database**: Customer records, work orders, estimates, AI conversations
- **Authentication**: Admin login with email/password
- **Storage**: Customer photos and inspection images
- **Edge Functions**: Email notifications for estimates

---

## Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `kne-hvac` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location (e.g., US West)
   - **Pricing Plan**: Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning to complete

---

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-setup/01-schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see: `Success. No rows returned`

This creates all your tables, indexes, and triggers.

---

## Step 3: Set Up Row Level Security (RLS)

1. Still in the **SQL Editor**, create a new query
2. Open the file `supabase-setup/02-rls-policies.sql`
3. Copy and paste the entire contents
4. Click **"Run"**
5. You should see: `Success. No rows returned`

This enables security policies so only authenticated admins can access data.

---

## Step 4: Add Sample Data (Optional)

This step is optional but helpful for testing:

1. Create a new query in **SQL Editor**
2. Open the file `supabase-setup/03-sample-data.sql`
3. Copy and paste the contents
4. Click **"Run"**

This adds sample customers, work orders, and technicians for testing.

---

## Step 5: Set Up Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **"Create a new bucket"**
3. Configure bucket:
   - **Name**: `customer_photos`
   - **Public bucket**: OFF (keep private)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: Leave empty (allows all)
4. Click **"Create bucket"**

### Set Storage Policies:

1. Click on the `customer_photos` bucket
2. Go to **"Policies"** tab
3. Click **"New policy"**

**Policy 1 - Allow authenticated uploads:**
- Template: Create a custom policy
- Policy name: `Authenticated users can upload`
- Target roles: `authenticated`
- Policy definition (SELECT/INSERT/UPDATE/DELETE): Check `INSERT`
- Policy command: `INSERT`
- USING expression: `true`
- Click **"Review"** then **"Save policy"**

**Policy 2 - Allow authenticated viewing:**
- Click **"New policy"** again
- Policy name: `Authenticated users can view`
- Target roles: `authenticated`
- Policy definition: Check `SELECT`
- Policy command: `SELECT`
- USING expression: `true`
- Click **"Review"** then **"Save policy"**

---

## Step 6: Create Admin User

1. Go to **Authentication** → **Users** in the left sidebar
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: Your admin email (e.g., `admin@knehvac.com`)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ON (toggle this!)
4. Click **"Create user"**

This is your admin login for the dashboard at `/admin/login`.

---

## Step 7: Get API Credentials

1. Go to **Settings** → **API** in the left sidebar
2. You'll need these values:

### Project URL:
```
https://YOUR_PROJECT_ID.supabase.co
```

### Anon/Public Key (starts with `eyJ...`):
```
eyJhbGc...
```

Keep these handy for the next step!

---

## Step 8: Update Your Environment Variables

1. In your project root, open `.env.local`
2. Update with your new Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key_here
```

3. Also update `src/services/supabase.js`:

Open the file and replace lines 5-6:
```javascript
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = 'eyJhbGc...your_anon_key_here';
```

**IMPORTANT**: Keep your existing OpenAI and Google Maps API keys unchanged!

---

## Step 9: Set Up Email Notifications (Optional)

Your app sends email notifications when customers request estimates. To enable this:

### Option A: Use Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Set up edge functions (see below)

### Option B: Skip for Now

Email notifications will fail gracefully - the app will still work without them.

### Create Edge Functions:

If you want email notifications, you'll need to create two edge functions:

1. Go to **Edge Functions** in Supabase dashboard
2. Follow Supabase docs to create:
   - `send-estimate-notification` - Notifies admins of new estimates
   - `send-customer-confirmation` - Confirms to customers

Reference the code in your current app:
- Admin notification trigger: `src/components/FreeEstimate.jsx:35`
- Customer confirmation: `src/components/FreeEstimate.jsx:63`

---

## Step 10: Test Your Setup

1. Start your React app:
```bash
npm start
```

2. Test the following:
   - ✅ **Homepage loads** (http://localhost:3000)
   - ✅ **Admin login works** (http://localhost:3000/admin/login)
     - Use the email/password you created in Step 6
   - ✅ **Dashboard shows sample data** (if you added it)
   - ✅ **Can create a new customer**
   - ✅ **Can create a work order**

---

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` has the correct values
- Restart your React dev server after changing `.env.local`
- Make sure you updated `src/services/supabase.js` too

### "Row level security policy violation"
- Verify you ran `02-rls-policies.sql`
- Check that you're logged in as an authenticated user
- In Supabase dashboard, go to **Authentication** → **Policies** and verify policies exist

### "relation does not exist" error
- Run `01-schema.sql` again
- Check for any error messages when running the script

### Can't log in to admin
- Verify user exists in **Authentication** → **Users**
- Make sure "Auto Confirm User" was enabled
- Try resetting password in Supabase dashboard

### Photos won't upload
- Verify `customer_photos` bucket exists
- Check storage policies are set correctly
- Make sure bucket is NOT public

---

## Next Steps

Once everything is working:

1. ✅ Delete sample data (if you added it):
   ```sql
   DELETE FROM work_orders;
   DELETE FROM customers;
   DELETE FROM estimate_requests;
   DELETE FROM technicians;
   ```

2. ✅ Create your real technicians in the admin dashboard

3. ✅ Start adding real customers!

4. ✅ Consider setting up automatic backups in Supabase settings

---

## Important Notes

### API Keys Security

- ✅ **SAFE to expose**: `REACT_APP_SUPABASE_ANON_KEY` (frontend)
- ❌ **NEVER expose**: Service Role Key (backend only!)
- Your `.env.local` should NOT be committed to git (it's in `.gitignore`)

### Free Tier Limits

The Supabase free tier includes:
- 500 MB database space
- 1 GB file storage
- 50,000 monthly active users
- 500 MB bandwidth

This is more than enough for a small HVAC business!

### Upgrading Later

If you need more resources:
- Pro plan: $25/month
- Includes 8 GB database, 100 GB storage, more bandwidth

---

## Support

If you run into issues:

1. Check Supabase logs: **Logs** → **Query** in dashboard
2. Check browser console for errors (F12)
3. Refer to [Supabase documentation](https://supabase.com/docs)

---

## Summary Checklist

- [ ] Created new Supabase project
- [ ] Ran `01-schema.sql` in SQL Editor
- [ ] Ran `02-rls-policies.sql` in SQL Editor
- [ ] (Optional) Ran `03-sample-data.sql`
- [ ] Created `customer_photos` storage bucket with policies
- [ ] Created admin user account
- [ ] Updated `.env.local` with new credentials
- [ ] Updated `src/services/supabase.js` with new credentials
- [ ] Tested admin login
- [ ] Tested creating customers/work orders

Once all checkboxes are complete, you're ready to go! 🎉
