# R2 Quick Setup Guide - Step by Step

## ✅ What You Already Have
- ✅ Account ID: `87001b07874e84e7839c624361f60a3d`
- ✅ Bucket Name: `lessonflarer2`
- ✅ Public URL: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`

## 🔑 What You Need to Do

### Step 1: Create R2 API Tokens

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Log in to your account

2. **Navigate to R2**
   - Click **R2** in the left sidebar
   - You should see your bucket `lessonflarer2`

3. **Create API Token**
   - Click **Manage R2 API Tokens** (usually at the top right or in settings)
   - Click **Create API Token** button
   - Give it a name (e.g., "Edutaktika Editor")

4. **Set Permissions**
   - **Object Read**: ✅ Allow
   - **Object Write**: ✅ Allow
   - **Object Delete**: ✅ Allow (optional, but recommended)
   - **Admin**: ❌ Leave unchecked (not needed)

5. **Create and Save**
   - Click **Create API Token**
   - **IMPORTANT**: You'll see two values:
     - **Access Key ID** (looks like: `abc123def456...`)
     - **Secret Access Key** (looks like: `xyz789uvw012...`)
   - **COPY BOTH VALUES NOW** - you won't be able to see the Secret Access Key again!
   - Save them somewhere safe (password manager, secure note, etc.)

### Step 2: Enable Public Access (If Not Already Done)

1. **Go to Your Bucket**
   - In R2 dashboard, click on `lessonflarer2` bucket

2. **Check Public Access**
   - Go to **Settings** tab
   - Look for **Public Access** or **Public Domain**
   - If it shows your public URL (`pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`), you're good!
   - If not enabled, click **Enable Public Access** or **Create Public Domain**

### Step 3: Create Your .env File

1. **Navigate to Editor Directory**
   ```bash
   cd Editor
   ```

2. **Create .env File**
   - Copy `env.template` to `.env`:
     ```bash
     # On Windows (Git Bash)
     cp env.template .env
     
     # Or just create a new file named .env
     ```

3. **Edit .env File**
   - Open `.env` in a text editor
   - Find these lines:
     ```env
     VITE_R2_ACCESS_KEY_ID=your_access_key_id_here
     VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
     ```
   - Replace `your_access_key_id_here` with your actual **Access Key ID**
   - Replace `your_secret_access_key_here` with your actual **Secret Access Key**
   - Save the file

4. **Your .env should look like this:**
   ```env
   VITE_POLOTNO_API_KEY=KZiuYryOVcs9sz8q8A1l
   
   VITE_R2_ACCOUNT_ID=87001b07874e84e7839c624361f60a3d
   VITE_R2_ACCESS_KEY_ID=abc123def456...  # Your actual Access Key ID
   VITE_R2_SECRET_ACCESS_KEY=xyz789uvw012...  # Your actual Secret Access Key
   VITE_R2_BUCKET_NAME=lessonflarer2
   VITE_R2_PUBLIC_URL=https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev
   ```

### Step 4: Restart Your Development Server

1. **Stop your current dev server** (if running)
   - Press `Ctrl+C` in the terminal

2. **Start it again**
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Check the Console**
   - Open browser console (F12)
   - Look for R2 upload messages when you save a design
   - You should see: `✅ Upload successful to R2: ...`

## 🧪 Test Your Setup

1. **Try uploading a design**
   - Create or open a design in the editor
   - Save it
   - Check browser console for R2 messages

2. **Verify in Cloudflare**
   - Go to R2 dashboard
   - Click on `lessonflarer2` bucket
   - You should see your uploaded files

3. **Test File Access**
   - Upload a file
   - Get the file path from console
   - Try accessing: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev/lessonflarer2/<file-path>`
   - The file should load in your browser

## ❌ Troubleshooting

### "R2 not configured" Error
- ✅ Check that `.env` file exists in `Editor` directory
- ✅ Verify all 5 R2 variables are set (no empty values)
- ✅ Make sure you restarted the dev server after creating `.env`
- ✅ Check for typos in variable names (they must start with `VITE_`)

### "Access Denied" or "403 Forbidden"
- ✅ Verify your API token has Read and Write permissions
- ✅ Check that the bucket name matches: `lessonflarer2`
- ✅ Make sure you copied the full Access Key ID and Secret Access Key

### Files Not Accessible via Public URL
- ✅ Verify public access is enabled on the bucket
- ✅ Check that the public URL matches: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`
- ✅ Wait a few minutes after enabling public access (propagation delay)

### Still Having Issues?
- Check browser console for detailed error messages
- Verify credentials in Cloudflare dashboard
- Make sure `.env` file is not in `.gitignore` (it should be, but check it exists)

## ✅ Checklist

- [ ] Created R2 API Token in Cloudflare
- [ ] Saved Access Key ID and Secret Access Key
- [ ] Enabled public access on bucket (or verified it's enabled)
- [ ] Created `.env` file in `Editor` directory
- [ ] Added all R2 credentials to `.env`
- [ ] Restarted development server
- [ ] Tested uploading a file
- [ ] Verified file appears in R2 bucket
- [ ] Tested accessing file via public URL

Once all checkboxes are done, your R2 integration is complete! 🎉

