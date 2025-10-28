# Admin Login Fix - October 23, 2025

## Problem Identified

When testing admin login, the user was successfully authenticated but:
1. The user name showed as "Test User" instead of "System Administrator"
2. The user role was "USER" instead of "ADMIN"
3. The Admin Dashboard menu option was not visible
4. localStorage contained **mock data** instead of real API responses

## Root Cause

The web service was using `/web/lib/auth-context.tsx` which contained **hardcoded mock login data**:

```typescript
// MOCK CODE - Lines 62-76
const mockUser = {
  id: "temp_user_id",
  name: "Test User",
  email,
  role: "USER" as const,
  isVerified: true,
  profile: null
}

const userWithToken = {
  ...mockUser,
  token: "temp_token"
}
```

The root directory `/lib/auth-context.tsx` had been updated to use API calls, but the **web service mounts `./web` to `/app` in Docker**, so it was using the web-specific file with mock data.

## Solution

Updated `/web/lib/auth-context.tsx` to:

1. **Added `register` function** to `AuthContextType`:
   ```typescript
   interface AuthContextType {
     user: User | null
     isLoading: boolean
     login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
     register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
     logout: () => void
   }
   ```

2. **Replaced mock login with API call**:
   ```typescript
   const login = async (email: string, password: string) => {
     setIsLoading(true)

     try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
       
       const response = await fetch(`${apiUrl}/api/auth/login`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email, password }),
       })

       const result = await response.json()
       
       if (result.success && result.user) {
         const userWithToken = {
           ...result.user,
           token: result.token
         }
         setUser(userWithToken)
         localStorage.setItem("user", JSON.stringify(userWithToken))
       }
       
       return { success: result.success, message: result.message }
     } catch (error) {
       console.error("Login error:", error)
       return { success: false, message: "An unexpected error occurred." }
     } finally {
       setIsLoading(false)
     }
   }
   ```

3. **Added register function** with API call:
   ```typescript
   const register = async (name: string, email: string, password: string) => {
     // Similar structure to login, calls POST /api/auth/register
   }
   ```

4. **Updated signup form** at `/web/components/signup-form.tsx`:
   - Removed: `import { signup } from "@/app/actions"`
   - Added: `import { useAuth } from "@/lib/auth-context"`
   - Changed: `const result = await signup(formDataToSubmit)`
   - To: `const result = await register(formData.name.trim(), formData.email.trim(), formData.password)`

## Testing Results

After clearing localStorage and logging in with `admin@syrianmartyrs.com`:

### Before Fix:
```json
{
  "id": "temp_user_id",
  "name": "Test User",
  "email": "admin@syrianmartyrs.com",
  "role": "USER",
  "token": "temp_token"
}
```

### After Fix:
```json
{
  "id": "...",
  "name": "System Administrator",
  "email": "admin@syrianmartyrs.com",
  "role": "ADMIN",
  "isVerified": true,
  "profile": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Verification

✅ **Admin Login Works**:
- User button displays: "System Administrator"
- Role is correctly set to: "ADMIN"
- JWT token is properly stored

✅ **Admin Dashboard Accessible**:
- "Admin Dashboard" menu item appears for admin users
- Can navigate to `/admin` page
- Admin page displays:
  - Review Contributions
  - Manage Martyrs
  - Manage Users

✅ **Signup Works**:
- Uses API backend for registration
- Creates users in Prisma Accelerate database

## Key Learnings

1. **Monorepo Structure**: In this monorepo, there are TWO sets of files:
   - Root directory: `/lib/`, `/components/`, `/app/`
   - Web service: `/web/lib/`, `/web/components/`, `/web/app/`

2. **Docker Volumes**: The `web-dev` service mounts `./web:/app`, so it uses files from `/web/`, not the root.

3. **Always Check Active Code**: When debugging, verify which files are actually being used by the running service.

## Status

✅ **COMPLETE** - Admin login functionality is fully working with proper authentication via API backend.

## Related Files

- `/web/lib/auth-context.tsx` - Fixed auth context
- `/web/components/signup-form.tsx` - Updated to use register from context
- `/web/components/header.tsx` - Already had proper admin menu logic
- `/api/src/routes/auth.ts` - Backend auth routes
- `/api/lib/auth-utils.ts` - JWT and password utilities

## Environment Variables

Ensure `NEXT_PUBLIC_API_URL=http://localhost:3001` is set in `docker-compose.dev.yml` for the `web-dev` service.

