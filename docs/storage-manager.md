# Storage Manager

## Overview

The Storage Manager provides two specialized classes for working with browser storage (localStorage or sessionStorage):

- **`StringStorageManager`** - For simple string values
- **`JsonStorageManager<T>`** - For complex objects with type safety

Both classes provide a clean, consistent API and handle storage backend selection automatically.

## Location

```typescript
src/core/StorageManager.ts
```

## Configuration

The storage backend (localStorage or sessionStorage) is configured via the environment variable:

```typescript
ENV.authStorage = 'localStorage' | 'sessionStorage'
```

The system defaults to `localStorage` if not specified.

## Basic Usage

### Predefined Storage Instances

Several storage instances are pre-configured and exported from `StorageManager.ts`:

```typescript
import {
  AuthTokenStorage,
  AuthMethodStorage,
  RedirectStorage,
  ImpersonationStorage,
  InvitationTokenStorage,
  GroupInvitationTokenStorage,
  LanguageStorage,
} from '@waldur/core/StorageManager';
```

### String Storage

For simple string values using `StringStorageManager`:

```typescript
// Set a value
AuthTokenStorage.set('my-auth-token');

// Get a value (returns string | null)
const token = AuthTokenStorage.get();

// Remove a value
AuthTokenStorage.remove();
```

### JSON Storage

For complex objects using `JsonStorageManager` (strongly typed):

```typescript
// Set a JSON value
RedirectStorage.set({
  toState: 'profile.details',
  toParams: { id: 123 },
});

// Get a JSON value (returns T | null)
const redirect = RedirectStorage.get();

// Remove the value
RedirectStorage.remove();
```

## Creating New Storage Instances

### For String Values

Use `StringStorageManager` for simple string storage:

```typescript
export const MyStorage = new StringStorageManager('waldur/my/key');

// Usage
MyStorage.set('value');
const value = MyStorage.get();
MyStorage.remove();
```

### For Typed JSON Values

Use `JsonStorageManager` with a type parameter for complex objects:

```typescript
export const MyStorage = new JsonStorageManager<{
  userId: string;
  timestamp: number;
}>('waldur/my/key');

// Usage - fully typed!
MyStorage.set({
  userId: 'user-123',
  timestamp: Date.now(),
});

const data = MyStorage.get(); // Type is inferred as the interface above
```

## API Reference

### StringStorageManager

#### `set(value: string): void`

Stores a string value in storage.

```typescript
AuthTokenStorage.set('my-token');
```

#### `get(): string | null`

Retrieves a string value from storage. Returns `null` if the key doesn't exist.

```typescript
const token = AuthTokenStorage.get();
if (token) {
  // Use token
}
```

#### `remove(): void`

Removes the value from storage.

```typescript
AuthTokenStorage.remove();
```

### JsonStorageManager\<T\>

#### `set(value: T): void`

Serializes and stores a JSON object.

```typescript
RedirectStorage.set({
  toState: 'home',
  toParams: {},
});
```

#### `get(): T | null`

Retrieves and deserializes a JSON object. Returns `null` if:

- The key doesn't exist
- The stored value is not valid JSON
- Parsing fails for any reason

```typescript
const redirect = RedirectStorage.get();
if (redirect) {
  router.stateService.go(redirect.toState, redirect.toParams);
}
```

#### `remove(): void`

Removes the value from storage.

```typescript
RedirectStorage.remove();
```

## Best Practices

### 1. Choose the Right Manager Class

Use the appropriate manager for your data type:

```typescript
// ✅ Good - string data uses StringStorageManager
export const TokenStorage = new StringStorageManager('waldur/auth/token');

// ✅ Good - complex data uses JsonStorageManager
export const ConfigStorage = new JsonStorageManager<Config>('waldur/config');

// ❌ Bad - using JSON manager for simple strings is unnecessary
export const TokenStorage = new JsonStorageManager<string>('waldur/auth/token');
```

### 2. Always Export Storage Instances

Create storage instances in `StorageManager.ts` and export them:

```typescript
// ✅ Good - centralized, reusable
export const MyFeatureStorage = new StringStorageManager('waldur/feature/data');

// ❌ Bad - scattered throughout codebase
const storage = new StringStorageManager('waldur/feature/data');
```

### 3. Use Type Parameters for JSON Storage

Always specify types when storing complex objects:

```typescript
// ✅ Good - type-safe
export const ConfigStorage = new JsonStorageManager<{
  theme: 'light' | 'dark';
  notifications: boolean;
}>('waldur/config');

// ❌ Bad - no type safety
export const ConfigStorage = new JsonStorageManager('waldur/config');
```

### 4. Check for Null Returns

Always handle the possibility of `null` returns:

```typescript
// ✅ Good
const token = AuthTokenStorage.get();
if (token) {
  // Use token safely
}

// ❌ Bad - may cause errors
const token = AuthTokenStorage.get();
apiClient.setAuth(token); // token might be null!
```

### 5. Use Consistent Key Naming

Follow the established pattern for storage keys:

```typescript
// ✅ Good - follows pattern
'waldur/feature/key'

// ❌ Bad - inconsistent
'myFeature.data'
'feature_key'
```

## Available Storage Instances

| Instance | Type | Key | Purpose |
|----------|------|-----|---------|
| `AuthTokenStorage` | String | `waldur/auth/token` | Authentication token |
| `AuthMethodStorage` | String | `waldur/auth/method` | Authentication method (local, oauth, etc.) |
| `RedirectStorage` | JSON | `waldur/auth/redirect` | Post-login redirect state |
| `ImpersonationStorage` | String | `waldur/auth/impersonation` | Impersonated user UUID |
| `InvitationTokenStorage` | String | `waldur/invitation/token` | Invitation acceptance token |
| `GroupInvitationTokenStorage` | String | `waldur/group-invitation/token` | Group invitation token |
| `LanguageStorage` | String | `waldur/i18n/lang` | Current language code |

## Differences Between Manager Classes

### StringStorageManager

- **Purpose**: Store and retrieve plain string values
- **Methods**: `set(string)`, `get()`, `remove()`
- **Use for**: Tokens, IDs, language codes, simple flags

```typescript
const storage = new StringStorageManager('key');
storage.set('simple-value');
const value: string | null = storage.get();
```

### JsonStorageManager\<T\>

- **Purpose**: Store and retrieve typed objects with automatic serialization
- **Methods**: `set(T)`, `get()`, `remove()`
- **Use for**: Configuration objects, state data, complex structures
- **Type parameter**: Provides compile-time type checking

```typescript
interface Config {
  theme: string;
  enabled: boolean;
}

const storage = new JsonStorageManager<Config>('key');
storage.set({ theme: 'dark', enabled: true });
const config: Config | null = storage.get();
```

## Error Handling

The `JsonStorageManager.get()` method handles parsing errors gracefully:

```typescript
// If stored value is corrupted or invalid JSON
const data = MyJsonStorage.get();
// Returns null instead of throwing an error
```

This ensures your application doesn't crash due to corrupted storage data.

## Testing

When testing code that uses Storage Managers:

```typescript
import { AuthTokenStorage } from '@waldur/core/StorageManager';

// Mock the storage
jest.spyOn(AuthTokenStorage, 'get').mockReturnValue('mock-token');
jest.spyOn(AuthTokenStorage, 'set').mockImplementation(() => {});

// Test your code
expect(AuthTokenStorage.get()).toBe('mock-token');
```

For JSON storage:

```typescript
import { RedirectStorage } from '@waldur/core/StorageManager';

jest.spyOn(RedirectStorage, 'get').mockReturnValue({
  toState: 'home',
  toParams: {},
});

const redirect = RedirectStorage.get();
expect(redirect?.toState).toBe('home');
```

## Technical Details

### Storage Backend Selection

The actual storage backend is determined at runtime by the `getStorage()` function:

```typescript
const getStorage = (): Storage => {
  if (ENV.authStorage === 'localStorage') {
    return localStorage;
  } else if (ENV.authStorage === 'sessionStorage') {
    return sessionStorage;
  }
  return localStorage; // Default fallback
};
```

This allows the application to switch between:

- **localStorage** - Persists across browser sessions
- **sessionStorage** - Cleared when the tab/browser closes

### Type Safety

The `JsonStorageManager` type parameter ensures type safety:

```typescript
const storage = new JsonStorageManager<{ count: number }>('key');

storage.set({ count: 42 }); // ✅ Type-checked
storage.set({ count: 'invalid' }); // ❌ TypeScript error

const data = storage.get(); // Type: { count: number } | null
```

### Separation of Concerns

The two manager classes follow the **Single Responsibility Principle**:

- `StringStorageManager` focuses only on string operations
- `JsonStorageManager` handles serialization/deserialization
- No unnecessary methods on either class
- Clear intent when reading code

This design makes it immediately obvious whether a storage instance contains strings or complex objects:

```typescript
// Clear: stores strings
export const Token = new StringStorageManager('token');

// Clear: stores typed objects
export const Config = new JsonStorageManager<AppConfig>('config');
```
