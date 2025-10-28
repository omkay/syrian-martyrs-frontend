# Admin Dashboard Statistics Fix - October 23, 2025

## Problem

The admin dashboard was showing an error:
```
Failed to load statistics: HTTP error! status: 404
```

The statistics panel was unable to display:
- Total martyrs (verified/unverified)
- Pending contributions
- User counts by role
- System health metrics

## Root Causes

### 1. **Incorrect API Endpoint URL**
The frontend was calling `/api/admin/stats` (Next.js route) instead of the Express API endpoint.

### 2. **Missing Authorization Header**
The frontend was not sending the JWT token in the Authorization header.

### 3. **Wrong Response Format**
The backend was returning a flat structure instead of the nested structure expected by the frontend.

### 4. **Invalid Permission Names**
The admin routes were using non-existent permission names:
- `VIEW_ADMIN_STATS` (doesn't exist)
- `VIEW_ALL_USERS` (doesn't exist)
- `VIEW_ALL_MARTYRS` (doesn't exist)

### 5. **Missing Authentication Middleware**
The admin routes were not applying the `authMiddleware` to decode JWT tokens.

## Solutions

### Fix 1: Updated Backend Stats Endpoint

**File**: `/api/src/routes/admin.ts`

Changed from flat structure:
```typescript
res.json({
  martyrs: 10,
  users: 5,
  contributions: 20,
  pendingContributions: 5
})
```

To nested structure matching frontend expectations:
```typescript
res.json({
  martyrs: {
    total: totalMartyrs,
    verified: verifiedMartyrs,
    unverified: unverifiedMartyrs,
    verificationRate: 67
  },
  contributions: {
    total: totalContributions,
    pending: pendingContributions,
    approved: approvedContributions,
    rejected: rejectedContributions,
    approvalRate: 29
  },
  users: {
    total: totalUsers,
    admins: adminUsers,
    moderators: moderatorUsers,
    regular: regularUsers
  },
  recentActivity: {
    contributions: [...],
    martyrs: [...]
  }
})
```

### Fix 2: Updated Frontend to Call API Backend

**File**: `/web/app/admin/page.tsx`

```typescript
const loadStats = async () => {
  try {
    setStatsLoading(true)
    setStatsError(null)
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token
    
    const response = await fetch(`${apiUrl}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    setStats(data)
  } catch (err: any) {
    console.error("Failed to load admin stats:", err)
    setStatsError(`Failed to load statistics: ${err.message}`)
  } finally {
    setStatsLoading(false)
  }
}
```

### Fix 3: Corrected Permission Names

**File**: `/api/src/routes/admin.ts`

```typescript
// Before (incorrect):
router.get('/stats', requirePermission('VIEW_ADMIN_STATS'), ...)
router.get('/users', requirePermission('VIEW_ALL_USERS'), ...)
router.get('/martyrs', requirePermission('VIEW_ALL_MARTYRS'), ...)

// After (correct):
router.get('/stats', requirePermission('VIEW_ANALYTICS'), ...)
router.get('/users', requirePermission('VIEW_USERS'), ...)
router.get('/martyrs', requirePermission('EDIT_MARTYRS'), ...)
```

### Fix 4: Added Authentication Middleware

**File**: `/api/src/routes/admin.ts`

```typescript
import { authMiddleware, adminMiddleware, requirePermission, AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication middleware to all admin routes
router.use(authMiddleware)
```

## Testing Results

### API Endpoint Test (curl)
```bash
$ curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/admin/stats
```

**Response**:
```json
{
  "martyrs": {
    "total": 9,
    "verified": 6,
    "unverified": 3,
    "verificationRate": 67
  },
  "contributions": {
    "total": 7,
    "pending": 5,
    "approved": 2,
    "rejected": 0,
    "approvalRate": 29
  },
  "users": {
    "total": 4,
    "admins": 2,
    "moderators": 0,
    "regular": 2
  },
  "recentActivity": {
    "contributions": [
      {
        "id": "...",
        "type": "MARTYR_ADDITION",
        "status": "PENDING",
        "content": {...},
        "user": {...},
        "martyr": {...}
      }
    ],
    "martyrs": [
      {
        "id": "...",
        "name": "Safaa Shareef",
        "isVerified": false,
        "createdAt": "2025-09-26T19:33:54.822Z"
      }
    ]
  }
}
```

✅ **Success!** The endpoint returns proper statistics.

## Current Statistics (from database)

### Martyrs
- **Total**: 9
- **Verified**: 6 (67% verification rate)
- **Unverified**: 3

### Contributions
- **Total**: 7
- **Pending**: 5
- **Approved**: 2
- **Rejected**: 0
- **Approval Rate**: 29%

### Users
- **Total**: 4
- **Admins**: 2
- **Moderators**: 0
- **Regular Users**: 2

## Files Modified

1. `/api/src/routes/admin.ts` - Updated stats endpoint with correct structure and permissions
2. `/web/app/admin/page.tsx` - Updated to call API backend with auth token

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard (localhost:3000/admin)                       │
│  - Displays stats cards                                      │
│  - Calls loadStats() on mount                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ GET /api/admin/stats
                         │ Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Express API (localhost:3001)                                 │
│  - authMiddleware: Verifies JWT                              │
│  - requirePermission('VIEW_ANALYTICS'): Checks permissions   │
│  - Queries Prisma for statistics                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Prisma queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Prisma Accelerate Database                                   │
│  - Martyrs table (9 records)                                 │
│  - Contributions table (7 records)                           │
│  - Users table (4 records)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Status: ✅ COMPLETE

The admin dashboard statistics are now fully functional and displaying real data from the database!

## What's Displayed

The dashboard now shows:

### Overview Cards
1. **Total Martyrs**: 9 (67% verified)
2. **Pending Contributions**: 5 (29% approval rate)
3. **Verified Martyrs**: 6 (3 unverified)
4. **Total Users**: 4 (2 admins, 0 moderators)

### Detailed Panels
1. **Contributions Overview**: Total, Approved, Rejected counts
2. **User Roles**: Admins, Moderators, Regular users breakdown
3. **System Health**: Verification & Approval rates

### Recent Activity
- Last 5 contributions with user and martyr details
- Last 5 martyrs added with verification status

## Next Steps (Optional)

- [ ] Add real-time updates (WebSockets)
- [ ] Add date range filters for statistics
- [ ] Add charts/graphs for visualization
- [ ] Add export functionality for reports
- [ ] Implement caching for better performance

