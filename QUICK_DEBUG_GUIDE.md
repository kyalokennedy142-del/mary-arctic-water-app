## 🚀 QUICK START: Using the Debug Panel

### Step 1: Start Your App
```bash
npm run dev
```

### Step 2: Open in Browser
- Go to http://localhost:5173
- Press Ctrl+Shift+R to clear cache

### Step 3: Find the Debug Button
- Look for **🐛** button in bottom-right corner
- It will be **RED with pulse** if there are errors

### Step 4: Try to Reproduce the Hang
1. Click "Login"
2. Enter email:   `nyamburamary89@gmail.com`
3. Enter password: `Mary@Secur3`
4. Click "Sign In"
5. **Watch the Debug Panel** as it happens

### Step 5: Check the Debug Panel
If the app hangs, the Debug Panel will show you WHY:

#### 🔴 **If you see RED errors:**
- Click **Errors** tab
- Copy the error message
- This is your clue!

#### ⏱️ **If you see requests that don't complete:**
- Click **Timing** tab
- Look for requests that say "IN PROGRESS"
- Scroll to see request names like:
  - `getCustomers` - stuck?
  - `getStock` - stuck?  
  - `getSales` - stuck?
  - `getSession` - stuck?

#### 🔐 **If you see RLS violations:**
- Click **RLS** tab
- See messages like "RLS Violation (403)"
- This means Supabase is blocking queries

#### 📊 **Performance issues:**
- Click **Timing** tab
- See how long each request takes
- Anything over 5 seconds is suspicious

### Step 6: Adjust Log Level to See More Details
- In Debug Panel, click **Status** tab
- Click buttons: `NONE` `ERROR` `WARN` `INFO` `DEBUG` `VERBOSE`
- Set to **DEBUG** or **VERBOSE** for maximum detail

### Step 7: Copy the Logs
In browser console (F12 key):

```javascript
// Copy all logs as text
JSON.stringify(window.__DEBUG_LOGS__, null, 2)

// Copy only errors
JSON.stringify(window.__DEBUG_LOGS__.filter(l => l.level === 'ERROR'), null, 2)

// Copy only RLS issues
JSON.stringify(window.__DEBUG_LOGS__.filter(l => l.category === 'RLS'), null, 2)
```

---

## 🎯 IS RLS THE PROBLEM?

**Quick test:** In Supabase dashboard:

1. Go to **SQL Editor**
2. Run this:
```sql
SELECT * FROM customers LIMIT 1;
```

- **Works?** → RLS isn't totally blocking reads
- **Error: permission denied?** → RLS is the problem
- **Timeout (takes forever)?** → RLS policy is inefficient or buggy

---

## 🔧 IF YOU FIND THE PROBLEM

### Common Issues:

**1. RLS is blocking (403 errors):**
```
Solution: Fix RLS policies in Supabase → Authentication → Policies
Check if policy logic is correct
Ensure it properly identifies authenticated users
```

**2. Requests timing out (no response):**
```
Solution: Check Supabase status page
Check your internet connection
May be Supabase server issue
```

**3. Auth token issues:**
```
In Debug Panel, click "Status" tab
Look for message about clearing tokens
The app has no button for this yet - will add if needed
```

**4. One specific query is hanging:**
```
The timing will show which one
Then we know exactly which table has the issue
Can test just that table in SQL Editor
```

---

## 📝 WHAT TO TELL ME AFTER TEST

1. **Did the app hang?**
   - Yes / Briefly / No

2. **What does the Debug Panel show?**
   - Screenshot of the "Errors" tab
   - Screenshot of the "Timing" tab
   - Any messages in "RLS" tab?

3. **What's in the browser console (F12)?**
   - Any red errors?
   - Copy them

4. **Can you see which request is stuck?**
   - `getRoleRole` (getting user profile)
   - `getCustomers` (loading customer list)
   - `getStock` (loading stock list)
   - `getSales` (loading sales records)
   - Something else?

With this info, I can tell you EXACTLY what to fix! 🎯

---

## 🌟 BONUS: Disable RLS Temporarily to Test

If you want to test if RLS is the problem:

1. In Supabase Dashboard
2. Go to your table (customers, stock, sales, user_profiles)
3. Click the 🔐 icon (lock)
4. Toggle **Row Level Security OFF**  
5. Refresh your app
6. See if it still hangs

⚠️ **WARNING:** Don't leave RLS off in production!

If app works with RLS off = RLS is definitely the problem
