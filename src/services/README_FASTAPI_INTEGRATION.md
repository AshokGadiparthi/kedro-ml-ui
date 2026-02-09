# FastAPI Backend Integration Guide

## Overview

This ML Platform now integrates with a **FastAPI backend** at `http://192.168.1.147:8000`. The integration includes:

- ✅ **Authentication** (Register, Login, Get User)
- ✅ **Workspaces** (CRUD operations)
- ✅ **Smart Fallback System** (Auto-switches to mock data when backend is unavailable)
- ✅ **TypeScript Types** (Fully typed API responses)
- ✅ **React Hooks** (Easy-to-use hooks for React components)

---

## Base URL

```
http://192.168.1.147:8000
```

The base URL has been updated in `/src/config/environment.ts`.

---

## Services Available

### 1. Authentication Service

**Location:** `/src/services/auth/authService.ts`

#### Methods:

```typescript
// Register a new user
import { register } from '@/services/auth/authService';

const user = await register({
  email: 'john@example.com',
  username: 'john_doe',
  password: 'password123',
  full_name: 'John Doe'
});

// Login
import { login } from '@/services/auth/authService';

const loginData = await login({
  email: 'john@example.com',
  password: 'password123'
});
// Token and user are automatically stored in localStorage

// Get current user
import { getCurrentUser } from '@/services/auth/authService';

const user = await getCurrentUser();

// Logout
import { logout } from '@/services/auth/authService';

logout();
// Clears token and user from localStorage

// Check if authenticated
import { isAuthenticated } from '@/services/auth/authService';

if (isAuthenticated()) {
  // User is logged in
}
```

---

### 2. Workspace Service

**Location:** `/src/services/workspaces/workspaceService.ts`

#### Methods:

```typescript
// List all workspaces
import { getWorkspaces } from '@/services/workspaces/workspaceService';

const workspaces = await getWorkspaces();

// Get a specific workspace
import { getWorkspace } from '@/services/workspaces/workspaceService';

const workspace = await getWorkspace('workspace-id-here');

// Create a workspace
import { createWorkspace } from '@/services/workspaces/workspaceService';

const newWorkspace = await createWorkspace({
  name: 'My New Workspace',
  slug: 'my-new-workspace',
  description: 'For testing'
});

// Update a workspace
import { updateWorkspace } from '@/services/workspaces/workspaceService';

const updated = await updateWorkspace('workspace-id', {
  name: 'Updated Name',
  description: 'Updated description'
});

// Delete a workspace
import { deleteWorkspace } from '@/services/workspaces/workspaceService';

const success = await deleteWorkspace('workspace-id');

// Generate slug from name
import { generateSlug } from '@/services/workspaces/workspaceService';

const slug = generateSlug('My Workspace'); // 'my-workspace'

// Validate slug format
import { validateSlug } from '@/services/workspaces/workspaceService';

const isValid = validateSlug('my-workspace'); // true
const isInvalid = validateSlug('My Workspace'); // false
```

---

## React Hooks

### 1. useAuth Hook

**Location:** `/src/hooks/useAuth.ts`

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { user, isAuthenticated, isLoading, error, login, logout, register } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'john@example.com',
        password: 'password123'
      });
      // Success! user is now authenticated
    } catch (err) {
      // Error handled in hook
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        email: 'john@example.com',
        username: 'john_doe',
        password: 'password123',
        full_name: 'John Doe'
      });
      // Success! Now login
    } catch (err) {
      console.error(error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.full_name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      )}
    </div>
  );
}
```

---

### 2. useWorkspaces Hook

**Location:** `/src/hooks/useWorkspaces.ts`

```typescript
import { useWorkspaces } from '@/hooks/useWorkspaces';

function WorkspacesPage() {
  const {
    workspaces,
    selectedWorkspace,
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    generateSlug,
    validateSlug
  } = useWorkspaces(); // Auto-loads workspaces on mount

  const handleCreate = async () => {
    try {
      const newWorkspace = await createWorkspace({
        name: 'My Workspace',
        slug: generateSlug('My Workspace'),
        description: 'Testing workspace'
      });
      console.log('Created:', newWorkspace);
    } catch (err) {
      console.error(error);
    }
  };

  const handleUpdate = async (workspaceId: string) => {
    try {
      await updateWorkspace(workspaceId, {
        name: 'Updated Name'
      });
    } catch (err) {
      console.error(error);
    }
  };

  const handleDelete = async (workspaceId: string) => {
    try {
      await deleteWorkspace(workspaceId);
    } catch (err) {
      console.error(error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button onClick={handleCreate}>Create Workspace</button>
      
      <ul>
        {workspaces.map(ws => (
          <li key={ws.id} onClick={() => selectWorkspace(ws)}>
            {ws.name} ({ws.slug})
            <button onClick={() => handleUpdate(ws.id)}>Edit</button>
            <button onClick={() => handleDelete(ws.id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      {selectedWorkspace && (
        <div>
          <h3>Selected: {selectedWorkspace.name}</h3>
          <p>{selectedWorkspace.description}</p>
        </div>
      )}
    </div>
  );
}
```

---

## TypeScript Types

All API types are defined in `/src/services/api/types.ts`:

```typescript
// User
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

// Workspace
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Authentication
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Workspace Operations
export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}
```

---

## Smart Fallback System

The integration includes a **smart fallback system** that:

1. **Checks backend availability** before each API call
2. **Caches the result** for 60 seconds to avoid excessive checks
3. **Automatically switches to mock data** when backend is unreachable
4. **Silently falls back** without throwing errors (for better UX)
5. **Logs warnings** in development mode

### How it Works:

```typescript
// In authService.ts and workspaceService.ts
const isBackendAvailable = async (): Promise<boolean> => {
  // Use cached result if recent (within 60 seconds)
  const now = Date.now();
  if (backendAvailable !== null && (now - lastCheckTime) < CHECK_INTERVAL) {
    return backendAvailable;
  }

  // Try to ping backend
  try {
    await apiClient.get('/health', { timeout: 3000 });
    backendAvailable = true;
    return true;
  } catch (error) {
    backendAvailable = false;
    console.log('⚠️ Backend unreachable - Using mock data as fallback');
    return false;
  }
};
```

### Mock Data:

- **Auth:** Returns a demo user with mock token
- **Workspaces:** Returns 3 sample workspaces (ML, Production, Fraud Detection)

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| GET | `/auth/me` | Get current user |

### Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces` | List all workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/{id}` | Get workspace details |
| PUT | `/api/workspaces/{id}` | Update workspace |
| DELETE | `/api/workspaces/{id}` | Delete workspace |

---

## Error Handling

All services handle errors gracefully:

```typescript
try {
  const workspaces = await getWorkspaces();
} catch (error: any) {
  // Network errors (status 0) → Fallback to mock data
  // Validation errors (400, 422) → Throw with message
  // Auth errors (401) → Clear storage and redirect
  // Other errors → Throw with message
  console.error(error.message);
}
```

---

## Testing Locally

1. **Start the FastAPI backend:**
   ```bash
   cd backend
   python main.py
   # Backend runs on http://192.168.1.147:8000
   ```

2. **Test endpoints with curl:**
   ```bash
   # Register
   curl -X POST "http://192.168.1.147:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","username":"test","password":"test123","full_name":"Test User"}'

   # Login
   curl -X POST "http://192.168.1.147:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'

   # Get workspaces (with token)
   TOKEN="your-token-here"
   curl -X GET "http://192.168.1.147:8000/api/workspaces" \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Test in React app:**
   - Open your app in the browser
   - Open DevTools Console
   - Look for logs like:
     - `🚀 API Request:` (successful calls)
     - `⚠️ Backend unreachable` (fallback to mock data)
     - `✅ API Response:` (successful responses)

---

## Integration Checklist

- [x] Updated base URL to FastAPI (http://192.168.1.147:8000)
- [x] Created TypeScript types for User, Workspace, Auth
- [x] Implemented authService with smart fallback
- [x] Implemented workspaceService with smart fallback
- [x] Created useAuth hook for React components
- [x] Created useWorkspaces hook for React components
- [x] Added mock data for offline development
- [x] Exported services from main index
- [x] Added comprehensive documentation

---

## Next Steps

1. **Create UI Components:**
   - Login/Register forms
   - Workspace management UI
   - User profile page

2. **Add Context Providers:**
   - AuthContext for app-wide authentication state
   - WorkspaceContext for workspace selection

3. **Protected Routes:**
   - Route guards for authenticated pages
   - Redirect to login for unauthenticated users

4. **Error Boundaries:**
   - Global error handling
   - User-friendly error messages

5. **Testing:**
   - Unit tests for services
   - Integration tests for hooks
   - E2E tests for user flows

---

## Support

For questions or issues:
- Check the FastAPI backend logs
- Review browser DevTools Console
- Check Network tab for API calls
- Verify backend is running on http://192.168.1.147:8000

---

**Happy coding! 🚀**
