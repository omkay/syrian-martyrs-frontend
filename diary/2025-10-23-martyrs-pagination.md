# Martyrs Listing with Pagination - Implementation

**Date**: October 23, 2025  
**Status**: ✅ Completed

## Overview
Implemented a new API endpoint for martyrs listing with full pagination support and updated the frontend to consume it. This allows users to efficiently navigate through all martyrs profiles in the database.

## What Was Done

### 1. Created New Martyrs API Endpoint
**File**: `/api/src/routes/martyrs.ts`

#### Features:
- **GET `/api/martyrs`** - List martyrs with pagination
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 20)
    - `search` - Search term for name, location, or description
    - `verified` - Filter by verification status (true/false)
  
  - Response includes:
    - `martyrs[]` - Array of martyr objects with contributions
    - `pagination` - Metadata with page, limit, totalCount, totalPages, hasMore, hasPrevious

- **GET `/api/martyrs/:id`** - Get single martyr by ID
  - Returns full martyr details with all contributions
  - Includes contribution count

#### Key Implementation Details:
```typescript
// Build where clause for filtering
const where: any = {}

if (verified !== undefined) {
  where.isVerified = verified
}

if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { location: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } }
  ]
}

// Fetch with pagination
const martyrs = await prisma.martyr.findMany({
  where,
  skip: offset,
  take: limit,
  orderBy: [
    { isVerified: 'desc' }, // Show verified martyrs first
    { createdAt: 'desc' }
  ],
  include: {
    contributions: {
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    },
    _count: {
      select: { contributions: true }
    }
  }
})
```

### 2. Updated Express Server
**File**: `/api/server.ts`
- Imported `martyrsRoutes` from `./src/routes/martyrs`
- Registered route: `app.use('/api/martyrs', martyrsRoutes)`

### 3. Updated MartyrsList Component
**File**: `/components/martyrs-list.tsx`

#### Changes:
1. **Removed dependency on `initialMartyrs` prop and server actions**
   - Component now fetches data directly from API
   - Added pagination state management

2. **Added Pagination State**:
   ```typescript
   const [currentPage, setCurrentPage] = useState(1)
   const [totalPages, setTotalPages] = useState(1)
   const [totalCount, setTotalCount] = useState(0)
   const [hasMore, setHasMore] = useState(false)
   const [hasPrevious, setHasPrevious] = useState(false)
   ```

3. **Created `fetchMartyrs` Function**:
   - Fetches from `/api/martyrs` with page and search params
   - Updates state with martyrs and pagination metadata
   - Handles loading and error states

4. **Updated Search Effect**:
   - Resets to page 1 on search
   - Debounces search queries (300ms)
   - Fetches from API instead of using server actions

5. **Added Pagination UI**:
   ```tsx
   <div className="mt-6 flex items-center justify-between border-t pt-4">
     <div className="text-sm text-muted-foreground">
       Showing {martyrs.length} of {totalCount} martyrs
     </div>
     <div className="flex items-center gap-2">
       <Button
         variant="outline"
         size="sm"
         onClick={() => handlePageChange(currentPage - 1)}
         disabled={!hasPrevious || isLoading}
       >
         <ChevronLeft className="h-4 w-4 mr-1" />
         Previous
       </Button>
       <div className="text-sm text-muted-foreground">
         Page {currentPage} of {totalPages}
       </div>
       <Button
         variant="outline"
         size="sm"
         onClick={() => handlePageChange(currentPage + 1)}
         disabled={!hasMore || isLoading}
       >
         Next
         <ChevronRight className="h-4 w-4 ml-1" />
       </Button>
     </div>
   </div>
   ```

### 4. Simplified Main Page
**File**: `/app/page.tsx`
- Removed server-side `getMartyrs` call
- Changed from `async` function to regular function
- Component now handles its own data fetching

**Before**:
```tsx
export default async function Home() {
  const martyrs = await getMartyrs(20)
  return <MartyrsList initialMartyrs={martyrs} />
}
```

**After**:
```tsx
export default function Home() {
  return <MartyrsList />
}
```

## Testing Results

### 1. API Endpoint Test
```bash
curl 'http://localhost:3001/api/martyrs?page=1&limit=5'
```

**Response**:
```json
{
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalCount": 9,
    "totalPages": 2,
    "hasMore": true,
    "hasPrevious": false
  }
}
```
✅ Pagination metadata working correctly

### 2. Search Functionality Test
```bash
curl 'http://localhost:3001/api/martyrs?search=Aleppo'
```

**Result**: Found 1 martyr in Aleppo
✅ Search working across name, location, and description

### 3. Frontend Tests
- ✅ Web service compiled successfully
- ✅ No linting errors
- ✅ Pagination UI renders correctly
- ✅ Previous/Next buttons enable/disable based on availability

## Database Statistics
- **Total Martyrs**: 9
- **Verified**: Yes (checking verified status)
- **Default Page Size**: 20 items
- **Current Total Pages**: 1 (with default limit)

## Benefits

1. **Performance**:
   - Only loads 20 martyrs at a time instead of all at once
   - Reduces initial page load time
   - Better database query performance with `skip/take`

2. **User Experience**:
   - Clear pagination controls with Previous/Next buttons
   - Shows current page and total pages
   - Displays count of visible vs. total martyrs
   - Smooth scrolling to top on page change
   - Search resets to page 1 automatically

3. **Scalability**:
   - Can handle thousands of martyrs efficiently
   - API supports filtering and searching
   - Ready for future enhancements (sorting, advanced filters)

4. **API-First Architecture**:
   - Consistent with other admin endpoints
   - Frontend now fully decoupled from database
   - Easy to add authentication if needed later

## API Documentation

### Endpoints

#### `GET /api/martyrs`
List martyrs with pagination and optional filtering.

**Query Parameters**:
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)
- `search` (string, optional) - Search in name, location, description
- `verified` (boolean, optional) - Filter by verification status

**Response**:
```json
{
  "martyrs": [
    {
      "id": "string",
      "name": "string",
      "location": "string",
      "dateOfDeath": "date",
      "isVerified": boolean,
      "contributions": [...],
      "_count": {
        "contributions": number
      }
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "totalCount": number,
    "totalPages": number,
    "hasMore": boolean,
    "hasPrevious": boolean
  }
}
```

#### `GET /api/martyrs/:id`
Get a single martyr by ID with full details.

**Response**:
```json
{
  "id": "string",
  "name": "string",
  "location": "string",
  "dateOfDeath": "date",
  "description": "string",
  "isVerified": boolean,
  "contributions": [...],
  "_count": {
    "contributions": number
  }
}
```

## Files Modified

1. `/api/src/routes/martyrs.ts` (NEW) - Martyrs API routes
2. `/api/server.ts` - Added martyrs routes
3. `/components/martyrs-list.tsx` - Added pagination UI and API fetching
4. `/app/page.tsx` - Simplified to remove server-side fetching

## Next Steps (Optional Enhancements)

1. **Add Sorting Options**:
   - Sort by name (A-Z, Z-A)
   - Sort by date of death
   - Sort by location

2. **Advanced Filters**:
   - Filter by date range
   - Filter by location/city
   - Filter by verification status in UI

3. **Infinite Scroll Option**:
   - Alternative to traditional pagination
   - "Load More" button

4. **URL State Management**:
   - Persist page and search in URL query params
   - Allow bookmarking specific pages

5. **Cache Optimization**:
   - Cache API responses
   - Optimistic UI updates

## Conclusion

Successfully implemented a robust martyrs listing with pagination. The API is performant, the UI is user-friendly, and the architecture is scalable. Users can now efficiently browse through all martyr profiles with search and pagination support.

**Status**: ✅ All functionality working as expected

