---
sidebar_label: 📚 API Reference
sidebar_position: 3
description: "Complete reference for the MOS REST API: every endpoint, parameter, request/response schema and example requests (cURL & JavaScript)."
toc_min_heading_level: 2
toc_max_heading_level: 2
---

# 📚 MOS API Reference

This is the complete reference for the **MOS REST API** (`MOS API` v0.1.0).
It mirrors everything that is documented in the built-in Swagger UI at `http://<MOS-IP>/api-docs/`, including every endpoint, parameter, request/response schema and example requests.

The API base path is `/api/v1`. In the examples below, replace `<MOS-IP>` with the IP address or hostname of your MOS server, and `<TOKEN>` with a valid Admin API token.

:::info[Authentication]
Most endpoints require a **Bearer token**. Create a token in the WebUI under **User Settings → Admin API Tokens**, then send it in the `Authorization` header:
```
Authorization: Bearer <TOKEN>
```
:::

## Sections

- [Authentication](#authentication) — User authentication and management
- [Disks](#disks) — Disk and Storage Management
- [SMART](#smart) — SMART Monitoring Configuration and Status
- [Disks WebSocket](#disks-websocket) — Real-time disk monitoring via WebSocket
- [Pools](#pools) — Storage Pool Management
- [Pools WebSocket](#pools-websocket) — Real-time pool monitoring via WebSocket
- [iSCSI Targets](#iscsi-targets) — iSCSI Target Management
- [iSCSI Initiators](#iscsi-initiators) — iSCSI Initiator Management
- [Docker](#docker) — Docker Container Management
- [Docker Compose](#docker-compose) — Docker Compose Stack Management
- [Docker WebSocket](#docker-websocket) — Real-time Docker operations via WebSocket
- [LXC](#lxc) — LXC Container Management
- [LXC WebSocket](#lxc-websocket) — Real-time LXC container monitoring via WebSocket
- [VM](#vm) — Virtual Machine Management with libvirt/QEMU
- [VM WebSocket](#vm-websocket) — Real-time VM monitoring via WebSocket
- [Users](#users) — SMB Users and System User Management
- [Shares](#shares) — Network Shares Management (SMB/CIFS)
- [Remotes](#remotes) — Remote Shares Management (SMB/NFS Mount)
- [Cron](#cron) — Cron Jobs Management
- [System](#system) — System Information, Monitoring and Power Management
- [System Load WebSocket](#system-load-websocket) — Real-time system load monitoring via WebSocket
- [MOS](#mos) — MOS System Configuration and Settings Management
- [File Operations WebSocket](#file-operations-websocket) — File Operations WebSocket
- [MOS Hub](#mos-hub) — MOS Hub Repository Management
- [MOS Plugins](#mos-plugins) — MOS Plugin Management
- [Terminal](#terminal) — Terminal Management
- [Terminal WebSocket](#terminal-websocket) — Terminal WebSocket management and documentation
- [NUT](#nut) — Network UPS Tools configuration and status
- [NUT WebSocket](#nut-websocket) — Real-time UPS status monitoring via WebSocket
- [Notifications](#notifications) — Notifications Management
- [LLM](#llm) — LLM Integration and Chat

## Authentication {#authentication}

User authentication and management.


#### `GET` `/auth/firstsetup` {#get-auth-firstsetup}

**Get first setup token**

Returns the boot token if it exists in the token file, otherwise returns null. Used for initial system setup. This endpoint requires no authentication.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | First setup token status | object |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "firstsetup": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/auth/firstsetup" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/firstsetup", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/auth/login` {#post-auth-login}

**User login**

**Request body** (`application/json`)

```json
{
  "username": "admin",
  "password": "password123"
}
```

| Field | Type | Required |
|-------|------|----------|
| username | string — Username | **Yes** |
| password | string — Password | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Login successful | LoginResponse |
| 400 | Bad request | Error |
| 401 | Invalid credentials | Error |
| 429 | Too many login attempts | object |

Example `200` response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin"
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/auth/login" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/login", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"username":"admin","password":"password123"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/auth/mfa` {#post-auth-mfa}

**Verify MFA code during login**

Verify TOTP code or recovery code to complete MFA login. Accepts the temporary mfa_token from login response. If recovery code is used, MFA is automatically disabled.

**Request body** (`application/json`)

```json
{
  "mfa_token": "string",
  "code": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| mfa_token | string — Temporary MFA JWT token from login response | **Yes** |
| code | string — 6-digit TOTP code or recovery code (XXXX-XXXX-XXXX) | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | MFA verification successful | object |
| 401 | Invalid MFA code or expired token | Error |

Example `200` response:

```json
{
  "token": "string",
  "user": {
    "id": "123",
    "username": "admin",
    "role": "admin",
    "language": "en",
    "primary_color": "#607d8b",
    "darkmode": false,
    "byte_format": "binary",
    "samba_user": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "mfa_disabled": false
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/auth/mfa" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mfa_token":"string","code":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/mfa", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"mfa_token":"string","code":"string"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/auth/mfa` {#delete-auth-mfa}

**Disable MFA**

Disable MFA for the authenticated user. Requires password confirmation. Removes all MFA data.

**Request body** (`application/json`)

```json
{
  "password": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| password | string — Current password for confirmation | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | MFA disabled successfully | object |
| 400 | Bad request or MFA not enabled | - |
| 401 | Not authenticated or invalid password | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/auth/mfa" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"password":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/mfa", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"password":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/auth/mfa/setup` {#post-auth-mfa-setup}

**Setup or confirm MFA**

Two-step MFA setup:
- Without `code`: Generates TOTP secret, returns QR code and secret for manual entry
- With `code`: Verifies TOTP code and activates MFA, returns recovery code
Password is always required for security.


**Request body** (`application/json`)

```json
{
  "password": "string",
  "code": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| password | string — Current password for confirmation | **Yes** |
| code | string — 6-digit TOTP code from authenticator app (for confirmation step) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | MFA setup or confirmation successful | - |
| 400 | Bad request or MFA already enabled | - |
| 401 | Not authenticated or invalid password | - |

Example `200` response:

```json
{
  "secret": "string",
  "otpauth_url": "string",
  "qr_code": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/auth/mfa/setup" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"password":"string","code":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/mfa/setup", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"password":"string","code":"string"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/auth/users` {#get-auth-users}

**Get users (admin sees all, user sees only themselves)**

Retrieve users - admins can see all users with optional filtering, normal users only see their own profile (both return arrays)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| samba_user | query | boolean | No | Filter users by samba_user status (admin only). Set to true to get only Samba users, false to get only non-Samba users. |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Users retrieved successfully | array[User] |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": "123",
    "username": "admin",
    "role": "admin",
    "language": "en",
    "primary_color": "#607d8b",
    "darkmode": false,
    "byte_format": "binary",
    "samba_user": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/auth/users" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/users", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/auth/users` {#post-auth-users}

**Create new user (admin only)**

**Request body** (`application/json`)

```json
{
  "username": "newuser",
  "password": "securepassword",
  "role": "user",
  "samba_user": false
}
```

| Field | Type | Required |
|-------|------|----------|
| username | string — Username | **Yes** |
| password | string — Password | **Yes** |
| role | string ["admin","user","samba_only"] — User role | **Yes** |
| samba_user | boolean — Create SMB/CIFS user for file sharing (automatically true for samba_only role) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | User created successfully | User |
| 400 | Bad request | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "id": "123",
  "username": "admin",
  "role": "admin",
  "language": "en",
  "primary_color": "#607d8b",
  "darkmode": false,
  "byte_format": "binary",
  "samba_user": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/auth/users" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"securepassword","role":"user","samba_user":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/users", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"username":"newuser","password":"securepassword","role":"user","samba_user":false})
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/auth/users/{id}` {#put-auth-users-id}

**Update user (admin can update any user, users can update themselves)**

Update user information - admins can update any user, normal users can only update their own profile with limited fields

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | User ID |

**Request body** (`application/json`)

```json
{
  "username": "string",
  "password": "string",
  "role": "admin",
  "samba_user": false
}
```

| Field | Type | Required |
|-------|------|----------|
| username | string — Username | No |
| password | string — New password | No |
| role | string ["admin","user","samba_only"] — User role | No |
| samba_user | boolean — Enable/disable SMB/CIFS user for file sharing | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | User updated successfully | User |
| 400 | Bad request | Error |
| 401 | Not authenticated | Error |
| 403 | No permission to update this user | Error |

Example `200` response:

```json
{
  "id": "123",
  "username": "admin",
  "role": "admin",
  "language": "en",
  "primary_color": "#607d8b",
  "darkmode": false,
  "byte_format": "binary",
  "samba_user": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/auth/users/{id}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"string","password":"string","role":"admin","samba_user":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/users/{id}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"username":"string","password":"string","role":"admin","samba_user":false})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/auth/users/{id}` {#delete-auth-users-id}

**Delete user (admin only)**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | User ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 204 | User deleted successfully | - |
| 400 | Bad request (e.g., cannot delete yourself) | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/auth/users/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/users/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/auth/profile` {#get-auth-profile}

**Get own user profile**

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | User profile retrieved successfully | User |
| 401 | Not authenticated | Error |
| 404 | User not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "id": "1",
  "username": "admin",
  "role": "admin",
  "hide_inactive_menus": true,
  "group_menus": false
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/auth/profile" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/profile", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/auth/logout` {#post-auth-logout}

**User logout**

Invalidate the current session. Note that JWT tokens cannot be truly invalidated server-side, but this endpoint provides a consistent logout mechanism.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Logout successful | object |
| 401 | Not authenticated | Error |

Example `200` response:

```json
{
  "message": "Logout successful"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/auth/logout" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/logout", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/auth/jwt-settings` {#get-auth-jwt-settings}

**Get JWT settings**

Retrieve current JWT token expiry settings (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | JWT settings retrieved successfully | JwtSettings |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "expiryDays": 7
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/auth/jwt-settings" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/jwt-settings", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/auth/jwt-settings` {#put-auth-jwt-settings}

**Update JWT expiry time**

Update JWT token expiry time in days (admin only)

**Request body** (`application/json`)

```json
{
  "expiryDays": 7
}
```

| Field | Type | Required |
|-------|------|----------|
| expiryDays | integer — Number of days for JWT expiry | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | JWT expiry updated successfully | object |
| 400 | Bad request - validation failed | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "JWT expiry updated to 7 day(s)",
  "data": {
    "expiryDays": 7,
    "updated_at": "string"
  }
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/auth/jwt-settings" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"expiryDays":7}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/jwt-settings", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"expiryDays":7})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/auth/admin-tokens` {#get-auth-admin-tokens}

**Get all admin tokens**

Retrieve list of all admin API tokens (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Admin tokens retrieved successfully | array[AdminToken] |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "id": "1640995200000",
    "name": "CI/CD Pipeline",
    "description": "Token for automated deployments",
    "token": "a1b2c3d4e5f6...",
    "createdAt": "string",
    "isActive": false,
    "permissions": {
      "mode": "readonly",
      "resources": {
        "docker": "write",
        "vm": "read"
      }
    }
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/auth/admin-tokens" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/admin-tokens", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/auth/admin-tokens` {#post-auth-admin-tokens}

**Create admin token**

Create a new permanent admin API token (admin only)

**Request body** (`application/json`)

```json
{
  "name": "API Integration",
  "description": "Token for third-party API integration",
  "permissions": {
    "mode": "readonly",
    "resources": {
      "docker": "write",
      "vm": "read"
    }
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Descriptive name for the token | **Yes** |
| description | string — Optional description | No |
| permissions | TokenPermissions — Token permission scope. null or mode 'full' = unrestricted (admin). 'readonly' = only read (GET/HEAD) requests are allowed, except for sensitive resources (auth, users) which are always blocked for readonly tokens. 'custom' = per-resource levels (none/read/write); unlisted resources default to 'none'. Sensitive resources can be granted explicitly in custom mode.  | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Admin token created successfully | object |
| 400 | Bad request - validation failed | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `201` response:

```json
{
  "success": true,
  "message": "Admin token created successfully",
  "data": {
    "id": "1640995200000",
    "name": "CI/CD Pipeline",
    "description": "Token for automated deployments",
    "token": "a1b2c3d4e5f6...",
    "createdAt": "string",
    "isActive": false,
    "permissions": {
      "mode": "readonly",
      "resources": {
        "docker": "write",
        "vm": "read"
      }
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/auth/admin-tokens" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Integration","description":"Token for third-party API integration","permissions":{"mode":"readonly","resources":{"docker":"write","vm":"read"}}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/admin-tokens", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"API Integration","description":"Token for third-party API integration","permissions":{"mode":"readonly","resources":{"docker":"write","vm":"read"}}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/auth/admin-tokens/me` {#get-auth-admin-tokens-me}

**Get current token permissions**

Introspect the permissions of the token used for this request. Only reachable when authenticated with an API token (boot token or admin token).

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Current token permissions | object |
| 401 | Not authenticated | - |
| 403 | Only available for API tokens | - |

Example `200` response:

```json
{
  "id": "string",
  "name": "string",
  "role": "admin",
  "isBootToken": false,
  "permissions": {
    "mode": "readonly",
    "resources": {
      "docker": "write",
      "vm": "read"
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/auth/admin-tokens/me" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/admin-tokens/me", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/auth/admin-tokens/{id}/permissions` {#put-auth-admin-tokens-id-permissions}

**Update admin token permissions**

Update the permission scope of an existing admin API token (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Token ID |

**Request body** (`application/json`)

```json
{
  "permissions": {
    "mode": "readonly",
    "resources": {
      "docker": "write",
      "vm": "read"
    }
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| permissions | TokenPermissions — Token permission scope. null or mode 'full' = unrestricted (admin). 'readonly' = only read (GET/HEAD) requests are allowed, except for sensitive resources (auth, users) which are always blocked for readonly tokens. 'custom' = per-resource levels (none/read/write); unlisted resources default to 'none'. Sensitive resources can be granted explicitly in custom mode.  | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Admin token permissions updated successfully | object |
| 400 | Bad request - validation failed or token not found | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Admin token permissions updated successfully",
  "data": {
    "id": "1640995200000",
    "name": "CI/CD Pipeline",
    "description": "Token for automated deployments",
    "token": "a1b2c3d4e5f6...",
    "createdAt": "string",
    "isActive": false,
    "permissions": {
      "mode": "readonly",
      "resources": {
        "docker": "write",
        "vm": "read"
      }
    }
  }
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/auth/admin-tokens/{id}/permissions" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"permissions":{"mode":"readonly","resources":{"docker":"write","vm":"read"}}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/admin-tokens/{id}/permissions", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"permissions":{"mode":"readonly","resources":{"docker":"write","vm":"read"}}})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/auth/admin-tokens/{id}` {#delete-auth-admin-tokens-id}

**Delete admin token**

Permanently delete an admin API token (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Token ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Admin token deleted successfully | object |
| 400 | Bad request - token not found | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Admin token deleted successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/auth/admin-tokens/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/admin-tokens/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/auth/admin-tokens/{id}/deactivate` {#put-auth-admin-tokens-id-deactivate}

**Deactivate admin token**

Deactivate an admin API token without deleting it (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Token ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Admin token deactivated successfully | object |
| 400 | Bad request - token not found | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Admin token deactivated successfully"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/auth/admin-tokens/{id}/deactivate" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/auth/admin-tokens/{id}/deactivate", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Disks {#disks}

Disk and Storage Management.


#### `GET` `/disks` {#get-disks}

**List all disks with partitions**

Retrieve a comprehensive list of all disks with their partitions and power status. Uses live data without caching.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| performance | query | string [true,false] | No | Include performance metrics and live temperature (standby disks are not woken; their temperature is null) |
| skipStandby | query | string [true,false] | No | Skip disks in standby mode to avoid waking them |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of all disks retrieved successfully | array[DiskInfo] |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "device": "/dev/sda",
    "name": "sda",
    "model": "WD Blue 1TB",
    "serial": "WD-WCC4N7XXXXXX",
    "size": 1000204886016,
    "sizeHuman": "1.00 TB",
    "powerStatus": "active",
    "type": "hdd",
    "rotational": true,
    "removable": false,
    "usbInfo": {
      "vendorId": "0781",
      "productId": "5567",
      "manufacturer": "SanDisk",
      "product": "Cruzer Blade",
      "speed": "480"
    },
    "partitions": [
      {
        "number": 1,
        "device": "/dev/sda1",
        "size": 536870912000,
        "filesystem": "ext4",
        "mountpoint": "/mnt/disk1",
        "uuid": "12345678-1234-1234-1234-123456789abc",
        "label": "Data",
        "status": {
          "mounted": true,
          "totalSpace": 1000204886016,
          "usedSpace": 500000000000,
          "freeSpace": 500204886016,
          "health": "healthy",
          "error": "string"
        }
      }
    ],
    "performance": {},
    "temperature": 35,
    "standbySkipped": false,
    "preclearRunning": false,
    "smartWarning": false,
    "description": "Media Pool Disk 3"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/{device}/usage` {#get-disks-device-usage}

**Get disk usage statistics**

Retrieve usage statistics for a specific disk or partition using df command

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda, sda1) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk usage retrieved successfully | DiskUsage |
| 401 | Not authenticated | Error |
| 500 | Error getting disk usage | Error |

Example `200` response:

```json
{
  "device": "/dev/sda1",
  "total": 1000204886016,
  "used": 500000000000,
  "available": 500204886016,
  "percentage": 50,
  "totalHuman": "string",
  "usedHuman": "string",
  "availableHuman": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/{device}/usage" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/usage", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/{device}/power` {#get-disks-device-power}

**Get disk power status**

Retrieve the current power status of a specific disk

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Power status retrieved successfully | PowerStatus |
| 401 | Not authenticated | Error |
| 500 | Error getting power status | Error |

Example `200` response:

```json
{
  "device": "sda",
  "powerStatus": "active",
  "active": false,
  "type": "hdd",
  "rotational": false,
  "removable": false
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/{device}/power" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/power", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/{device}/iostats` {#get-disks-device-iostats}

**Get disk I/O statistics**

Retrieve I/O statistics for a specific disk

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | I/O statistics retrieved successfully | IOStats |
| 401 | Not authenticated | Error |
| 500 | Error getting I/O statistics | Error |

Example `200` response:

```json
{
  "device": "sda",
  "ioStats": {
    "reads": 12345,
    "writes": 6789,
    "readBytes": 1073741824,
    "writeBytes": 536870912
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/{device}/iostats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/iostats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/{device}/wake` {#post-disks-device-wake}

**Wake disk from standby**

Wake a disk from standby or sleep mode (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk woken successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error waking disk | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/{device}/wake" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/wake", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/{device}/sleep` {#post-disks-device-sleep}

**Put disk to sleep/standby**

Put a disk into standby or sleep mode (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Request body** (`application/json`)

```json
{
  "mode": "standby"
}
```

| Field | Type | Required |
|-------|------|----------|
| mode | string ["standby","sleep"] — Sleep mode | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk put to sleep successfully | OperationResult |
| 400 | Invalid mode parameter | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error putting disk to sleep | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/{device}/sleep" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mode":"standby"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/sleep", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"mode":"standby"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/{device}/smart` {#get-disks-device-smart}

**Get SMART information**

Retrieve comprehensive SMART data for a specific disk. Data is sourced from
smartd state files (no disk I/O) or smartctl (live). If the disk is sleeping,
all SMART fields are null unless wakeUp=true is specified.
Response structure is always consistent - fields are null when unavailable.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |
| wakeUp | query | string [true,false] | No | Wake the disk from standby before reading SMART data |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SMART information retrieved successfully | object |
| 401 | Not authenticated | Error |
| 500 | Error getting SMART information | Error |

Example `200` response:

```json
{
  "device": "/dev/sda",
  "deviceName": "sda",
  "serial": "5PJJ26DF",
  "model": "WDC WD120EDAZ-11F3RA0",
  "diskType": "hdd",
  "sleeping": false,
  "warning": false,
  "smartStatus": "PASSED",
  "temperature": {
    "current": 0,
    "min": 0,
    "max": 0
  },
  "powerOnHours": 0,
  "powerCycleCount": 0,
  "errorCount": 0,
  "attributes": [
    {
      "id": 0,
      "name": "string",
      "value": 0,
      "worst": 0,
      "threshold": 0,
      "rawValue": 0,
      "status": "ok"
    }
  ],
  "source": "smartctl_live",
  "monitoringConfig": {
    "temperatureWarning": 0,
    "temperatureCritical": 0
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/{device}/smart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/smart", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/descriptions/orphaned` {#get-disks-descriptions-orphaned}

**List orphaned disk descriptions**

Get all disk descriptions whose disk is no longer physically present

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Orphaned descriptions retrieved | array[object] |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "serial": "5PJJ26DF",
    "description": "Media Pool Disk 3",
    "model": "WDC WD120EDAZ-11F3RA0"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/descriptions/orphaned" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/descriptions/orphaned", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/descriptions/orphaned` {#delete-disks-descriptions-orphaned}

**Delete all orphaned disk descriptions**

Remove all descriptions whose disk is no longer physically present (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All orphaned descriptions deleted | object |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "2 orphaned descriptions removed",
  "count": 2
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/descriptions/orphaned" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/descriptions/orphaned", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/descriptions/orphaned/{serial}` {#delete-disks-descriptions-orphaned-serial}

**Delete a specific orphaned disk description**

Remove a single description by serial number, only if the disk is not currently present (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| serial | path | string | **Yes** | Serial number of the orphaned disk |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Orphaned description deleted | - |
| 403 | Admin permission required | - |
| 404 | Description not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/descriptions/orphaned/{serial}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/descriptions/orphaned/{serial}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/disks/{device}/description` {#put-disks-device-description}

**Set or clear a disk description**

Set a user-defined description for a disk. The description is stored persistently
keyed by the disk's serial number (survives device name changes). An empty or null
description removes the entry. The config file is only written on change (admin only).


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Request body** (`application/json`)

```json
{
  "description": "Media Pool Disk 3"
}
```

| Field | Type | Required |
|-------|------|----------|
| description | string — Description text (empty or null clears the entry) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Description set or cleared | object |
| 400 | Could not resolve serial for device | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "serial": "5PJJ26DF",
  "description": "Media Pool Disk 3"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/disks/{device}/description" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Media Pool Disk 3"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/description", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"description":"Media Pool Disk 3"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/availablefilesystems` {#get-disks-availablefilesystems}

**Get available filesystems**

Retrieve a simple array of available filesystem names for formatting.
Use the pooltype parameter to filter filesystems based on pool type:
- **multi**: Returns only btrfs and zfs (if available) - these support multiple disks
- **nonraid**, **single**, **mergerfs** or no parameter: Returns all available filesystems


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| pooltype | query | string ["multi","nonraid","single","mergerfs"] | No | Filter filesystems by pool type. 'multi' returns only btrfs/zfs (multi-disk capable). Other values or omitting returns all filesystems.  |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Available filesystems retrieved successfully | array[string] |
| 401 | Not authenticated | Error |
| 500 | Error getting available filesystems | Error |

Example `200` response:

```json
[
  "string"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/availablefilesystems" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/availablefilesystems", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/format` {#post-disks-format}

**Format disk/device**

Format a disk or device with specified filesystem (admin only)

**Request body** (`application/json`)

```json
{
  "device": "/dev/sdb",
  "filesystem": "ext4",
  "partition": true,
  "wipeExisting": true,
  "preClear": {
    "wipes": 2,
    "algorithm": "zero",
    "readCheck": false,
    "log": false
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| device | string — Device to format (e.g., /dev/sdb) | **Yes** |
| filesystem | string ["ext4","xfs","btrfs","ntfs","fat32","exfat","vfat","zfs"] — Target filesystem | **Yes** |
| partition | boolean — Create partition table | No |
| wipeExisting | boolean — Wipe existing data (wipefs) | No |
| preClear | object — PreClear options for secure disk wiping before format. Operation runs async. | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device formatted successfully | OperationResult |
| 400 | Invalid request parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error formatting device | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/format" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"device":"/dev/sdb","filesystem":"ext4","partition":true,"wipeExisting":true,"preClear":{"wipes":2,"algorithm":"zero","readCheck":false,"log":false}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/format", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"device":"/dev/sdb","filesystem":"ext4","partition":true,"wipeExisting":true,"preClear":{"wipes":2,"algorithm":"zero","readCheck":false,"log":false}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/{device}/preclear/abort` {#post-disks-device-preclear-abort}

**Abort preClear operation**

Abort a running preClear operation on a device (admin only). The disk will be left in an undefined state.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda, nvme0n1) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | PreClear operation aborted successfully | PreClearAbortResult |
| 400 | No preClear operation running on device | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error aborting preClear operation | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "PreClear operation on /dev/sdb aborted",
  "device": "/dev/sdb"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/{device}/preclear/abort" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/preclear/abort", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/{device}/partition` {#post-disks-device-partition}

**Create partition**

Create a new partition on the specified device (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Request body** (`application/json`)

```json

```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Partition created successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error creating partition | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/{device}/partition" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d 'null'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/partition", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify(null)
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/{device}/partition/{partitionNumber}` {#delete-disks-device-partition-partitionnumber}

**Delete partition**

Delete a specific partition from a device (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |
| partitionNumber | path | integer | **Yes** | Partition number to delete |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Partition deleted successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error deleting partition | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/{device}/partition/{partitionNumber}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/partition/{partitionNumber}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/{device}/wipe` {#delete-disks-device-wipe}

**Wipe entire disk**

Completely wipe a disk, removing all partitions and data (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk wiped successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error wiping disk | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/{device}/wipe" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/wipe", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/{device}/partitions` {#get-disks-device-partitions}

**Get disk partitions**

Retrieve all partitions for a specific disk

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Partitions retrieved successfully | object |
| 401 | Not authenticated | Error |
| 500 | Error getting partitions | Error |

Example `200` response:

```json
{
  "device": "sda",
  "partitions": [
    {
      "number": 1,
      "device": "/dev/sda1",
      "size": 536870912000,
      "filesystem": "ext4",
      "mountpoint": "/mnt/disk1",
      "uuid": "12345678-1234-1234-1234-123456789abc",
      "label": "Data",
      "status": {
        "mounted": true,
        "totalSpace": 1000204886016,
        "usedSpace": 500000000000,
        "freeSpace": 500204886016,
        "health": "healthy",
        "error": "string"
      }
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/{device}/partitions" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/partitions", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/wake` {#post-disks-wake}

**Wake multiple disks**

Wake multiple disks from standby simultaneously (admin only)

**Request body** (`application/json`)

```json
{
  "devices": [
    "sda",
    "sdb",
    "sdc"
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — Array of device names | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Wake operations completed | object |
| 400 | Invalid devices array | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error waking disks | Error |

Example `200` response:

```json
{
  "results": [
    {
      "success": true,
      "message": "Operation completed successfully",
      "device": "sda"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/wake" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["sda","sdb","sdc"]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/wake", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["sda","sdb","sdc"]})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/sleep` {#post-disks-sleep}

**Sleep multiple disks**

Put multiple disks to sleep/standby simultaneously (admin only)

**Request body** (`application/json`)

```json
{
  "devices": [
    "sda",
    "sdb",
    "sdc"
  ],
  "mode": "standby"
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — Array of device names | **Yes** |
| mode | string ["standby","sleep"] — Sleep mode (for sleep operations) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sleep operations completed | object |
| 400 | Invalid request parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error putting disks to sleep | Error |

Example `200` response:

```json
{
  "results": [
    {
      "success": true,
      "message": "Operation completed successfully",
      "device": "sda"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/sleep" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["sda","sdb","sdc"],"mode":"standby"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/sleep", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["sda","sdb","sdc"],"mode":"standby"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/power/status` {#post-disks-power-status}

**Get power status for multiple disks**

Get power status for multiple disks simultaneously (admin only)

**Request body** (`application/json`)

```json
{
  "devices": [
    "sda",
    "sdb",
    "sdc"
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — Array of device names | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Power status retrieved for all devices | object |
| 400 | Invalid devices array | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error getting power status | Error |

Example `200` response:

```json
{
  "results": [
    {
      "device": "sda",
      "powerStatus": "active",
      "active": false,
      "type": "hdd",
      "rotational": false,
      "removable": false
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/power/status" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["sda","sdb","sdc"]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/power/status", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["sda","sdb","sdc"]})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/power/manage` {#post-disks-power-manage}

**Manage disk power settings**

Configure power management settings for a disk (admin only)

**Request body** (`application/json`)

```json
{
  "device": "sda",
  "check": true
}
```

| Field | Type | Required |
|-------|------|----------|
| device | string — Device name | **Yes** |
| check | boolean — Only check current settings | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Power settings managed successfully | OperationResult |
| 400 | Invalid request parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error managing power settings | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "device": "sda"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/power/manage" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"device":"sda","check":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/power/manage", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"device":"sda","check":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/unassigned` {#get-disks-unassigned}

**List unassigned disks**

Retrieve a list of disks that are not assigned to any pool or array and are not system disks

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| includePerformance | query | string [true,false] | No | Include performance metrics |
| skipStandby | query | string [true,false] | No | Skip disks in standby mode |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Unassigned disks retrieved successfully | object |
| 401 | Not authenticated | Error |
| 500 | Error getting unassigned disks | Error |

Example `200` response:

```json
{
  "unassignedDisks": [
    {
      "device": "/dev/sda",
      "name": "sda",
      "model": "WD Blue 1TB",
      "serial": "WD-WCC4N7XXXXXX",
      "size": 1000204886016,
      "sizeHuman": "1.00 TB",
      "powerStatus": "active",
      "type": "hdd",
      "rotational": true,
      "removable": false,
      "usbInfo": {
        "vendorId": "0781",
        "productId": "5567",
        "manufacturer": "SanDisk",
        "product": "Cruzer Blade",
        "speed": "480"
      },
      "partitions": [
        {
          "number": 1,
          "device": "/dev/sda1",
          "size": 536870912000,
          "filesystem": "ext4",
          "mountpoint": "/mnt/disk1",
          "uuid": "12345678-1234-1234-1234-123456789abc",
          "label": "Data",
          "status": {
            "mounted": true,
            "totalSpace": 1000204886016,
            "usedSpace": 500000000000,
            "freeSpace": 500204886016,
            "health": "healthy",
            "error": "string"
          }
        }
      ],
      "performance": {},
      "temperature": 35,
      "standbySkipped": false,
      "preclearRunning": false,
      "smartWarning": false,
      "description": "Media Pool Disk 3"
    }
  ],
  "totalUnassigned": 3,
  "totalDisks": 8,
  "metadata": {
    "skipStandby": true,
    "includePerformance": false,
    "timestamp": 1705749600000
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/unassigned" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/unassigned", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/{device}/mount` {#post-disks-device-mount}

**Mount a disk device**

Mount a single disk device or partition to /mnt/disks/ with automatic mountability checks (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda1, sdb) |

**Request body** (`application/json`)

```json
{
  "mountOptions": "defaults,noatime"
}
```

| Field | Type | Required |
|-------|------|----------|
| mountOptions | string — Custom mount options | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device mounted successfully | object |
| 400 | Invalid request or device not mountable | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error mounting device | Error |

Example `200` response:

```json
{
  "success": true,
  "device": "sdb1",
  "mountPoint": "/mnt/disks/MyData",
  "filesystem": "ext4",
  "uuid": "12345678-1234-1234-1234-123456789abc",
  "label": "MyData",
  "alreadyMounted": false,
  "message": "Device sdb1 successfully mounted at /mnt/disks/MyData"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/{device}/mount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mountOptions":"defaults,noatime"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/mount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"mountOptions":"defaults,noatime"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/{device}/unmount` {#post-disks-device-unmount}

**Unmount a disk device**

Unmount a single disk device or partition, handles BTRFS multi-device properly (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g., sda1, sdb) |

**Request body** (`application/json`)

```json
{
  "force": false,
  "lazy": false
}
```

| Field | Type | Required |
|-------|------|----------|
| force | boolean — Force unmount even if busy | No |
| lazy | boolean — Lazy unmount - detach immediately | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device unmounted successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error unmounting device | Error |

Example `200` response:

```json
{
  "success": true,
  "device": "sdb1",
  "mountPoint": "/mnt/disks/MyData",
  "alreadyUnmounted": false,
  "message": "Device sdb1 successfully unmounted from /mnt/disks/MyData"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/{device}/unmount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force":false,"lazy":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/{device}/unmount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"force":false,"lazy":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/zram/ramdisks` {#get-disks-zram-ramdisks}

**Get ZRAM ramdisk devices**

Returns all active ZRAM ramdisk devices (type=ramdisk, enabled=true) that can be used as storage pools

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of ZRAM ramdisk devices | array[object] |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "device": "/dev/zram0",
    "name": "Temp Ramdisk",
    "id": "string",
    "size": 0,
    "sizeHuman": "string",
    "type": "ramdisk",
    "algorithm": "string",
    "filesystem": "string",
    "uuid": "string",
    "isZram": false
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/zram/ramdisks" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/zram/ramdisks", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## SMART {#smart}

SMART Monitoring Configuration and Status.


#### `GET` `/disks/smart/config` {#get-disks-smart-config}

**Get SMART monitoring configuration**

Retrieve the complete SMART monitoring configuration including defaults, per-disk settings, and orphaned entries

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SMART configuration retrieved successfully | SmartConfig |
| 500 | Server error | - |

Example `200` response:

```json
{
  "defaults": {
    "temperatureLimits": {
      "hdd": {
        "warning": 45,
        "critical": 55
      },
      "ssd": {
        "warning": 55,
        "critical": 70
      },
      "nvme": {
        "warning": 65,
        "critical": 80
      }
    },
    "monitoredAttributes": [
      5,
      187,
      198,
      199
    ],
    "attributeNotificationCooldown": 300,
    "bootCheck": true
  },
  "smartdOptions": {
    "quietMode": "errorsonly"
  },
  "disks": {
    "<key>": {
      "temperatureWarning": 45,
      "temperatureCritical": 55,
      "monitoredAttributes": [
        5,
        187,
        198,
        199
      ],
      "attributeNotificationCooldown": 300,
      "lastSeen": "string",
      "model": "WDC WD120EDAZ-11F3RA0",
      "diskType": "hdd",
      "acknowledged": {
        "5": 8
      },
      "warning": false
    }
  },
  "orphaned": [
    {
      "serial": "5PJJ26DF",
      "lastSeen": "2026-04-05T17:13:48.918Z",
      "model": "WDC WD120EDAZ-11F3RA0",
      "diskType": "hdd"
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/smart/config" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/disks/smart/config` {#put-disks-smart-config}

**Update global SMART configuration**

Update global SMART settings (defaults, smartdOptions). Supports partial updates via deep merge -
only send the fields you want to change. After update, smartd.conf is regenerated and smartd reloaded.
Note: Use the per-disk endpoints to manage individual disk configurations.


**Request body** (`application/json`)

```json
{
  "defaults": {},
  "smartdOptions": {}
}
```

| Field | Type | Required |
|-------|------|----------|
| defaults | object — Partial defaults to merge | No |
| smartdOptions | object — Partial smartd options to merge | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration updated successfully | SmartConfig |
| 400 | Invalid request body | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "defaults": {
    "temperatureLimits": {
      "hdd": {
        "warning": 45,
        "critical": 55
      },
      "ssd": {
        "warning": 55,
        "critical": 70
      },
      "nvme": {
        "warning": 65,
        "critical": 80
      }
    },
    "monitoredAttributes": [
      5,
      187,
      198,
      199
    ],
    "attributeNotificationCooldown": 300,
    "bootCheck": true
  },
  "smartdOptions": {
    "quietMode": "errorsonly"
  },
  "disks": {
    "<key>": {
      "temperatureWarning": 45,
      "temperatureCritical": 55,
      "monitoredAttributes": [
        5,
        187,
        198,
        199
      ],
      "attributeNotificationCooldown": 300,
      "lastSeen": "string",
      "model": "WDC WD120EDAZ-11F3RA0",
      "diskType": "hdd",
      "acknowledged": {
        "5": 8
      },
      "warning": false
    }
  },
  "orphaned": [
    {
      "serial": "5PJJ26DF",
      "lastSeen": "2026-04-05T17:13:48.918Z",
      "model": "WDC WD120EDAZ-11F3RA0",
      "diskType": "hdd"
    }
  ]
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/disks/smart/config" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"defaults":{},"smartdOptions":{}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"defaults":{},"smartdOptions":{}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/smart/config/disks/{device}` {#get-disks-smart-config-disks-device}

**Get SMART config for a specific disk**

Retrieve the monitoring configuration for a disk by device name (e.g. sda) or serial number

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g. sda, nvme0n1) or serial number |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk configuration retrieved | SmartDiskConfig |
| 404 | Disk not found in configuration | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "temperatureWarning": 45,
  "temperatureCritical": 55,
  "monitoredAttributes": [
    5,
    187,
    198,
    199
  ],
  "attributeNotificationCooldown": 300,
  "lastSeen": "string",
  "model": "WDC WD120EDAZ-11F3RA0",
  "diskType": "hdd",
  "acknowledged": {
    "5": 8
  },
  "warning": false
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/disks/smart/config/disks/{device}` {#put-disks-smart-config-disks-device}

**Update SMART config for a specific disk**

Update monitoring settings for a specific disk by device name or serial.
Supports partial updates - only send the fields you want to change.
After update, smartd.conf is regenerated.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g. sda, nvme0n1) or serial number |

**Request body** (`application/json`)

```json
{
  "temperatureWarning": 0,
  "temperatureCritical": 0,
  "monitoredAttributes": [
    0
  ],
  "attributeNotificationCooldown": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| temperatureWarning | integer | No |
| temperatureCritical | integer | No |
| monitoredAttributes | array[integer] | No |
| attributeNotificationCooldown | integer | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk configuration updated | SmartDiskConfig |
| 400 | Invalid request | - |
| 403 | Admin permission required | - |
| 404 | Disk not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "temperatureWarning": 45,
  "temperatureCritical": 55,
  "monitoredAttributes": [
    5,
    187,
    198,
    199
  ],
  "attributeNotificationCooldown": 300,
  "lastSeen": "string",
  "model": "WDC WD120EDAZ-11F3RA0",
  "diskType": "hdd",
  "acknowledged": {
    "5": 8
  },
  "warning": false
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"temperatureWarning":0,"temperatureCritical":0,"monitoredAttributes":[0],"attributeNotificationCooldown":0}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"temperatureWarning":0,"temperatureCritical":0,"monitoredAttributes":[0],"attributeNotificationCooldown":0})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/smart/config/disks/{device}` {#delete-disks-smart-config-disks-device}

**Delete disk SMART config**

Remove custom configuration for a disk by device name or serial.
The disk will be re-added with default settings on the next sync if still present.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g. sda, nvme0n1) or serial number |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Disk configuration deleted | - |
| 403 | Admin permission required | - |
| 404 | Disk not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/disks/smart/config/disks/{device}/acknowledge` {#post-disks-smart-config-disks-device-acknowledge}

**Acknowledge current SMART errors for a disk**

Acknowledge the current raw values of a disk's monitored SMART attributes as a baseline.
Unlike removing an attribute from monitoring ("ignore"), acknowledged errors stay visible
(the disk keeps warning=true) but no further boot/live notifications are sent until a
value rises above its acknowledged baseline. Values are taken from the cached smartd state
(no disk wakeup). Send an empty body to acknowledge all currently reported attributes, or
\{ attributes: [187] \} to acknowledge a specific attribute at its current value (no number needed).
A baseline can also be cleared inline by sending "" or null for an attribute under
"acknowledged"; to clear baselines explicitly use DELETE on the same path.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g. sda, nvme0n1) or serial number |

**Request body** (`application/json`)

```json
{
  "attributes": [
    5,
    187
  ],
  "acknowledged": {
    "5": 8,
    "187": ""
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| attributes | array[integer] — Attribute IDs to acknowledge at their current cached raw value | No |
| acknowledged | object — Explicit baselines per attribute ID; empty string or null clears the baseline | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Errors acknowledged, returns updated disk configuration | SmartDiskConfig |
| 400 | Invalid request body | - |
| 403 | Admin permission required | - |
| 404 | Disk not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "temperatureWarning": 45,
  "temperatureCritical": 55,
  "monitoredAttributes": [
    5,
    187,
    198,
    199
  ],
  "attributeNotificationCooldown": 300,
  "lastSeen": "string",
  "model": "WDC WD120EDAZ-11F3RA0",
  "diskType": "hdd",
  "acknowledged": {
    "5": 8
  },
  "warning": false
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}/acknowledge" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"attributes":[5,187],"acknowledged":{"5":8,"187":""}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}/acknowledge", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"attributes":[5,187],"acknowledged":{"5":8,"187":""}})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/smart/config/disks/{device}/acknowledge` {#delete-disks-smart-config-disks-device-acknowledge}

**Clear acknowledged SMART errors for a disk**

Remove acknowledgement baselines for a disk. Send an empty body to clear all baselines,
or \{ attributes: [...] \} to clear only specific attribute IDs. After clearing, the normal
boot/live notification behaviour applies again for those attributes.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| device | path | string | **Yes** | Device name (e.g. sda, nvme0n1) or serial number |

**Request body** (`application/json`)

```json
{
  "attributes": [
    0
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| attributes | array[integer] — Attribute IDs to clear; omit to clear all | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Acknowledgement cleared, returns updated disk configuration | SmartDiskConfig |
| 400 | Invalid request body | - |
| 403 | Admin permission required | - |
| 404 | Disk not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "temperatureWarning": 45,
  "temperatureCritical": 55,
  "monitoredAttributes": [
    5,
    187,
    198,
    199
  ],
  "attributeNotificationCooldown": 300,
  "lastSeen": "string",
  "model": "WDC WD120EDAZ-11F3RA0",
  "diskType": "hdd",
  "acknowledged": {
    "5": 8
  },
  "warning": false
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}/acknowledge" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"attributes":[0]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/disks/{device}/acknowledge", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"attributes":[0]})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/smart/config/orphaned` {#get-disks-smart-config-orphaned}

**List orphaned disk entries**

Get all disk configurations that were previously known but the disk is no longer physically present

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Orphaned entries retrieved | array[SmartOrphan] |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "serial": "5PJJ26DF",
    "lastSeen": "2026-04-05T17:13:48.918Z",
    "model": "WDC WD120EDAZ-11F3RA0",
    "diskType": "hdd"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/smart/config/orphaned" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/orphaned", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/smart/config/orphaned` {#delete-disks-smart-config-orphaned}

**Delete all orphaned entries**

Remove all orphaned disk configuration entries at once

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All orphaned entries deleted | object |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string",
  "count": 0
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/smart/config/orphaned" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/orphaned", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/disks/smart/config/orphaned/{serial}` {#delete-disks-smart-config-orphaned-serial}

**Delete a specific orphaned entry**

Remove a single orphaned disk configuration entry by serial number

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| serial | path | string | **Yes** | Serial number of the orphaned disk |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Orphaned entry deleted | - |
| 403 | Admin permission required | - |
| 404 | Orphaned entry not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/disks/smart/config/orphaned/{serial}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/smart/config/orphaned/{serial}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Disks WebSocket {#disks-websocket}

Real-time disk monitoring via WebSocket.


#### `GET` `/disks/websocket/stats` {#get-disks-websocket-stats}

**Get Disks WebSocket monitoring statistics**

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket monitoring statistics | object |
| 401 | Unauthorized | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": false,
  "data": {
    "clientCount": 2,
    "samplingActive": true,
    "subscriptions": {
      "throughput": {
        "interval": 2000,
        "isActive": false
      },
      "temperature": {
        "interval": 10000,
        "isActive": false
      }
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/disks/websocket/events` {#get-disks-websocket-events}

**Disks WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time disk monitoring.

**Connection:** Connect to WebSocket at `/disks` namespace with path `/api/v1/socket.io/`

**Events to emit (client → server):**

- `subscribe-disks`: Subscribe to disk throughput and temperature updates
- `unsubscribe-disks`: Unsubscribe from disk updates
- `get-disks`: Get immediate disk data (one-time)

**Events to listen for (server → client):**

- `disks-update`: Real-time throughput data (every 2s)
- `disks-temperature-update`: Temperature data (every 10s if includeTemperature=true)
- `disks-subscription-confirmed`: Subscription confirmation
- `disks-unsubscription-confirmed`: Unsubscription confirmation
- `error`: Error messages

**Important Notes:**
- Standby disks are NOT woken up for temperature queries
- Throughput comes from /proc/diskstats (no disk wake-up)
- Temperature uses `smartctl -n standby` (safe for standby disks)

**Example Usage:**

Connect to WebSocket:
```javascript
const socket = io('http://localhost:3000/disks', {
  path: '/api/v1/socket.io/'
});
```

Subscribe to all disks with temperature:
```javascript
socket.emit('subscribe-disks', {
  token: 'your-jwt-token',
  devices: [],  // empty = all disks
  includeTemperature: true
});
```

Subscribe to specific disks:
```javascript
socket.emit('subscribe-disks', {
  token: 'your-jwt-token',
  devices: ['sda', 'sdb'],
  includeTemperature: false
});
```

Listen for updates:
```javascript
socket.on('disks-update', (data) => {
  console.log('Throughput:', data.throughput);
});

socket.on('disks-temperature-update', (data) => {
  console.log('Temperatures:', data.temperatures);
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "events": {
    "client_to_server": [
      {}
    ],
    "server_to_client": [
      {}
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/disks/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/disks/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Pools {#pools}

Storage Pool Management.


#### `GET` `/pools/vpools` {#get-pools-vpools}

**List all vpools (MergerFS Path Pools)**

List all MergerFS Path Pools with mount status and storage info. Storage is
reported from a single df on the mergerfs union mount, like regular pools.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of vpools | array[Vpool] |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": "1719158400123",
    "name": "mediapath",
    "type": "vpool",
    "index": 1,
    "automount": true,
    "comment": "",
    "paths": [
      "/mnt/disk1/media",
      "/mnt/disk2/media"
    ],
    "config": {
      "policies": {
        "create": "mspmfs",
        "search": "ff"
      },
      "shared": false
    },
    "status": {
      "mounted": true,
      "totalSpace": 1000000000000,
      "totalSpace_human": "931 GiB",
      "usedSpace": 250000000000,
      "usedSpace_human": "233 GiB",
      "freeSpace": 750000000000,
      "freeSpace_human": "699 GiB",
      "usagePercent": 25
    },
    "mountPoint": "/mnt/mediapath"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/vpools" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/vpools` {#post-pools-vpools}

**Create a vpool (MergerFS Path Pool)**

Create a new MergerFS Path Pool by unioning existing filesystem paths under
/mnt/\{name\}. The name must be globally unique (across pools and vpools) and
must not be a reserved name. When automount is enabled (default), the pool is
mounted immediately; all configured paths must exist as directories.


**Request body** (`application/json`)

```json
{
  "name": "mediapath",
  "paths": [
    "/mnt/disk1/media",
    "/mnt/disk2/media"
  ],
  "automount": true,
  "comment": "",
  "config": {
    "policies": {
      "create": "mspmfs",
      "search": "ff"
    },
    "shared": false
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | **Yes** |
| paths | array[string] — Source directory paths to union, in branch order | **Yes** |
| automount | boolean | No |
| comment | string | No |
| config | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Vpool created successfully | object |
| 400 | Invalid request (bad name, reserved/duplicate name, missing/invalid paths) | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "string",
  "pool": {
    "id": "1719158400123",
    "name": "mediapath",
    "type": "vpool",
    "index": 1,
    "automount": true,
    "comment": "",
    "paths": [
      "/mnt/disk1/media",
      "/mnt/disk2/media"
    ],
    "config": {
      "policies": {
        "create": "mspmfs",
        "search": "ff"
      },
      "shared": false
    },
    "status": {
      "mounted": true,
      "totalSpace": 1000000000000,
      "totalSpace_human": "931 GiB",
      "usedSpace": 250000000000,
      "usedSpace_human": "233 GiB",
      "freeSpace": 750000000000,
      "freeSpace_human": "699 GiB",
      "usagePercent": 25
    },
    "mountPoint": "/mnt/mediapath"
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/vpools" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"mediapath","paths":["/mnt/disk1/media","/mnt/disk2/media"],"automount":true,"comment":"","config":{"policies":{"create":"mspmfs","search":"ff"},"shared":false}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"mediapath","paths":["/mnt/disk1/media","/mnt/disk2/media"],"automount":true,"comment":"","config":{"policies":{"create":"mspmfs","search":"ff"},"shared":false}})
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/pools/vpools/order` {#put-pools-vpools-order}

**Update vpool display order**

Update the display order (index) of vpools (admin only)

**Request body** (`application/json`)

```json
{
  "order": [
    {
      "id": "1719158400123",
      "index": 1
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| order | array[object] | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Order updated successfully | - |
| 400 | Invalid request | Error |
| 500 | Server error | Error |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/pools/vpools/order" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"order":[{"id":"1719158400123","index":1}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools/order", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"order":[{"id":"1719158400123","index":1}]})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools/vpools/{id}` {#get-pools-vpools-id}

**Get a vpool by ID**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Vpool ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Vpool details | Vpool |
| 404 | Vpool not found | Error |

Example `200` response:

```json
{
  "id": "1719158400123",
  "name": "mediapath",
  "type": "vpool",
  "index": 1,
  "automount": true,
  "comment": "",
  "paths": [
    "/mnt/disk1/media",
    "/mnt/disk2/media"
  ],
  "config": {
    "policies": {
      "create": "mspmfs",
      "search": "ff"
    },
    "shared": false
  },
  "status": {
    "mounted": true,
    "totalSpace": 1000000000000,
    "totalSpace_human": "931 GiB",
    "usedSpace": 250000000000,
    "usedSpace_human": "233 GiB",
    "freeSpace": 750000000000,
    "freeSpace_human": "699 GiB",
    "usagePercent": 25
  },
  "mountPoint": "/mnt/mediapath"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/vpools/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools/{id}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/pools/vpools/{id}` {#delete-pools-vpools-id}

**Delete a vpool by ID**

Unmount (if mounted) and remove the vpool from vpools.json. Source paths are
never deleted. Fails if the pool is in use unless force is set (admin only).


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Vpool ID |

**Request body** (`application/json`)

```json
{
  "force": false
}
```

| Field | Type | Required |
|-------|------|----------|
| force | boolean | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Vpool removed successfully | - |
| 400 | Removal failed (e.g. in use) | Error |
| 404 | Vpool not found | Error |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/pools/vpools/{id}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"force":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/vpools/{id}/mount` {#post-pools-vpools-id-mount}

**Mount a vpool by ID**

Mount the mergerfs union at /mnt/\{name\}. All configured source paths are
validated first; if any path is missing or not a directory, the mount is
aborted with an error.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Vpool ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Vpool mounted successfully | - |
| 400 | Mount failed (e.g. a path does not exist) | Error |
| 404 | Vpool not found | Error |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/vpools/{id}/mount" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools/{id}/mount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/vpools/{id}/unmount` {#post-pools-vpools-id-unmount}

**Unmount a vpool by ID**

Unmount the mergerfs union at /mnt/\{name\}. Source paths are left untouched.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Vpool ID |

**Request body** (`application/json`)

```json
{
  "force": false
}
```

| Field | Type | Required |
|-------|------|----------|
| force | boolean — Force lazy unmount, bypassing dependency checks | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Vpool unmounted successfully | - |
| 400 | Unmount failed (e.g. in use) | Error |
| 404 | Vpool not found | Error |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/vpools/{id}/unmount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools/{id}/unmount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"force":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/vpools/{id}/automount` {#post-pools-vpools-id-automount}

**Toggle automount for a vpool**

Enable or disable automount (flag only, does not mount/unmount) (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Vpool ID |

**Request body** (`application/json`)

```json
{
  "enabled": true
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Automount toggled successfully | - |
| 400 | Invalid request | Error |
| 500 | Server error | Error |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/vpools/{id}/automount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/vpools/{id}/automount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools` {#get-pools}

**List all pools**

Get a list of all storage pools with optional filtering, performance and temperature data

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| type | query | string | No | Filter pools by type |
| exclude_type | query | string | No | Exclude pools of specific type |
| includeMetrics | query | boolean | No | Include performance and temperature data for each disk |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of pools | array[Pool] |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools/availablepooltypes` {#get-pools-availablepooltypes}

**Get available pool types**

Retrieve a simple array of available pool types.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Available pool types retrieved successfully | array[string] |
| 401 | Not authenticated | Error |
| 500 | Error getting available filesystems | Error |

Example `200` response:

```json
[
  "single",
  "multi",
  "mergerfs",
  "nonraid",
  "bcachefs"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/availablepooltypes" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/availablepooltypes", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools/{id}` {#get-pools-id}

**Get pool by ID**

Get a specific pool by its ID

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Pool details | Pool |
| 404 | Pool not found | Error |

Example `200` response:

```json
{
  "id": "1234567890",
  "name": "data_pool",
  "type": "btrfs",
  "automount": true,
  "comment": "My data pool",
  "raid_level": "raid1",
  "data_devices": [
    {
      "device": "/dev/sdj1",
      "powerStatus": "active",
      "performance": {
        "readSpeed": 0,
        "writeSpeed": 0,
        "readSpeed_human": "string",
        "writeSpeed_human": "string"
      },
      "temperature": 0,
      "smartWarning": false,
      "temperatureStatus": null
    }
  ],
  "parity_devices": [
    {}
  ],
  "performance": {
    "readSpeed": 0,
    "writeSpeed": 0,
    "readSpeed_human": "string",
    "writeSpeed_human": "string"
  },
  "config": {
    "encrypted": false,
    "shared": false
  },
  "status": {
    "parity_operation": true,
    "parity_valid": true,
    "parity_progress": {
      "operation": "check P Q",
      "description": "Checking both parities",
      "status": "running",
      "percent": 52,
      "height": "27.5 GB",
      "speed": "519 MB/s",
      "eta": "11:04",
      "correction_enabled": false,
      "start_time": 1732099200,
      "end_time": 1732102800,
      "last_exit_code": 0,
      "parity_errors": 0,
      "stripes": "495 stripe/s"
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/pools/{id}` {#delete-pools-id}

**Remove pool by ID**

Remove a storage pool

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Pool removed successfully | object |
| 404 | Pool not found | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Pool 'data_pool' removed successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/pools/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools/{id}/status` {#get-pools-id-status}

**Get pool status**

Get the current status of a pool

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Pool status | object |
| 404 | Pool not found | Error |
| 500 | Server error | - |

Example `200` response:

```json
{
  "mounted": true,
  "mountPoint": "/mnt/storage/data_pool"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/{id}/status" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/status", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/automount` {#post-pools-id-automount}

**Toggle automount setting for a pool**

Enable or disable automatic mounting of a pool on system boot (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "enabled": true
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean — Whether to enable or disable automount | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Automount setting updated successfully | object |
| 400 | Invalid request parameters | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Automount enabled for pool 'data_pool' (ID: 1746318722394)",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/automount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/automount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/shared` {#post-pools-id-shared}

**Toggle shared mount propagation for a pool**

Enable or disable shared mount propagation (mount --make-shared / --make-private) live without remounting; the setting is persisted and reapplied on mount (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "enabled": true
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean — Whether to enable (make-shared) or disable (make-private) shared propagation | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Shared setting updated successfully | object |
| 400 | Invalid request parameters | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Shared enabled for pool 'data_pool' (ID: 1746318722394)",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/shared" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/shared", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true})
});
const data = await res.json();
console.log(data);
```

#### `PATCH` `/pools/{id}/comment` {#patch-pools-id-comment}

**Update pool comment**

Update the comment/description for a storage pool (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "comment": "My storage pool"
}
```

| Field | Type | Required |
|-------|------|----------|
| comment | string — Pool comment | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Comment updated successfully | object |
| 400 | Bad request | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "string",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
}
```

**Example request**

```bash
curl -X PATCH "http://<MOS-IP>/api/v1/pools/{id}/comment" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"comment":"My storage pool"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/comment", {
  method: 'PATCH',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"comment":"My storage pool"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools/{id}/config` {#get-pools-id-config}

**Get pool configuration**

Retrieve the configuration settings for a specific pool

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Pool configuration retrieved successfully (returns config object directly) | object |
| 404 | Pool not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "unclean_check": true,
  "encrypted": false,
  "shared": false,
  "sync": {
    "enabled": true,
    "schedule": "0 4 * * *"
  },
  "spindown": {
    "data_devices": [
      {
        "slot": 1,
        "device": "/dev/sdk1",
        "value": 300
      },
      {
        "slot": 2,
        "device": "/dev/sdl1",
        "value": null
      }
    ],
    "parity_devices": [
      {
        "slot": 1,
        "device": "/dev/sdm1",
        "value": null
      }
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/{id}/config" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/config", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PATCH` `/pools/{id}/config` {#patch-pools-id-config}

**Update pool configuration**

Update configuration settings for a pool (works for all pool types - mergerfs, btrfs, xfs, etc.)

**Supports dot-notation for nested properties:**
- Direct: `{ "unclean_check": false }`
- Nested: `{ "sync.enabled": true, "sync.schedule": "0 5 * * *" }`


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "unclean_check": false,
  "encrypted": false,
  "raid_level": "string",
  "shared": false,
  "sync.enabled": false,
  "sync.schedule": "string",
  "usage_alert.warning": 70,
  "usage_alert.alert": 90,
  "spindown": {
    "data_devices": [
      {
        "slot": 1,
        "value": 300
      },
      {
        "slot": 2,
        "value": null
      }
    ],
    "parity_devices": [
      {
        "slot": 1,
        "value": null
      }
    ]
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| unclean_check | boolean — Enable/disable unclean filesystem check on mount | No |
| encrypted | boolean — Whether pool is encrypted | No |
| raid_level | string — RAID level for BTRFS pools | No |
| shared | boolean — Whether pool is shared (applies to all pool types - mergerfs, nonraid, btrfs, bcachefs, single) | No |
| sync.enabled | boolean — Enable SnapRAID sync (dot-notation example) | No |
| sync.schedule | string — SnapRAID sync cron schedule (dot-notation example) | No |
| usage_alert.warning | integer — Usage warning threshold in percent (default 70). 0 disables the warning level. | No |
| usage_alert.alert | integer — Usage alert threshold in percent (default 90). 0 disables the alert level. warning=0 AND alert=0 disables usage monitoring for the pool. | No |
| spindown | object — Per-device spindown configuration mirroring pool structure. value is minutes (\>= 0), null, or empty string to use global spindown from system.json. | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration updated successfully | object |
| 404 | Pool not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string",
  "pool": {},
  "updatedConfig": {}
}
```

**Example request**

```bash
curl -X PATCH "http://<MOS-IP>/api/v1/pools/{id}/config" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"unclean_check":false,"encrypted":false,"raid_level":"string","shared":false,"sync.enabled":false,"sync.schedule":"string","usage_alert.warning":70,"usage_alert.alert":90,"spindown":{"data_devices":[{"slot":1,"value":300},{"slot":2,"value":null}],"parity_devices":[{"slot":1,"value":null}]}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/config", {
  method: 'PATCH',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"unclean_check":false,"encrypted":false,"raid_level":"string","shared":false,"sync.enabled":false,"sync.schedule":"string","usage_alert.warning":70,"usage_alert.alert":90,"spindown":{"data_devices":[{"slot":1,"value":300},{"slot":2,"value":null}],"parity_devices":[{"slot":1,"value":null}]}})
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/pools/order` {#put-pools-order}

**Update order of all pools**

Update the display order for multiple pools at once by providing an array of pool IDs with their new index values (admin only)

**Request body** (`application/json`)

```json
{
  "order": [
    {
      "id": "string",
      "index": 0
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| order | array[object] | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Order updated successfully | object |
| 400 | Bad request | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "string"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/pools/order" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"order":[{"id":"string","index":0}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/order", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"order":[{"id":"string","index":0}]})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/single` {#post-pools-single}

**Create single device pool**

Create a new single device pool

**Request body** (`application/json`)

```json
{
  "name": "data_pool",
  "device": "/dev/sdb",
  "filesystem": "xfs",
  "format": false,
  "config": {
    "encrypted": false,
    "create_keyfile": false
  },
  "passphrase": "my_secure_password",
  "options": {
    "automount": true,
    "comment": "My data pool"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Name for the new pool | **Yes** |
| device | string — Path to the device to use | **Yes** |
| filesystem | string ["ext4","xfs","btrfs"] — Filesystem to format the device with | No |
| format | boolean — Whether to force format the device | No |
| config | object | No |
| passphrase | string — Encryption passphrase (required if encrypted=true) | No |
| options | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Pool created successfully | object |
| 400 | Bad request | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Successfully created single device pool 'data_pool'",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/single" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"data_pool","device":"/dev/sdb","filesystem":"xfs","format":false,"config":{"encrypted":false,"create_keyfile":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My data pool"}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/single", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"data_pool","device":"/dev/sdb","filesystem":"xfs","format":false,"config":{"encrypted":false,"create_keyfile":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My data pool"}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/multi` {#post-pools-multi}

**Create multi-device BTRFS pool**

Create a new multi-device BTRFS pool

**Request body** (`application/json`)

```json
{
  "name": "data_raid1",
  "devices": [
    "/dev/sdb",
    "/dev/sdc"
  ],
  "raidLevel": "raid1",
  "format": true,
  "config": {
    "encrypted": false,
    "create_keyfile": false
  },
  "passphrase": "my_secure_password",
  "options": {
    "automount": true,
    "comment": "My RAID1 pool"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Name for the new pool | **Yes** |
| devices | array[string] — Array of device paths to use in the pool | **Yes** |
| raidLevel | string ["single","raid0","raid1","raid10"] — BTRFS RAID level for the pool | **Yes** |
| format | boolean — Whether to force format the devices | No |
| config | object | No |
| passphrase | string — Encryption passphrase (required if encrypted=true) | No |
| options | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Pool created successfully | object |
| 400 | Bad request | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Successfully created multi-device BTRFS pool 'data_raid1' with raid1 configuration",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/multi" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"data_raid1","devices":["/dev/sdb","/dev/sdc"],"raidLevel":"raid1","format":true,"config":{"encrypted":false,"create_keyfile":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My RAID1 pool"}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/multi", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"data_raid1","devices":["/dev/sdb","/dev/sdc"],"raidLevel":"raid1","format":true,"config":{"encrypted":false,"create_keyfile":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My RAID1 pool"}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/mergerfs` {#post-pools-mergerfs}

**Create MergerFS pool**

Create a new MergerFS pool

**Request body** (`application/json`)

```json
{
  "name": "mergerfs_pool",
  "devices": [
    "/dev/sdb",
    "/dev/sdc"
  ],
  "filesystem": "xfs",
  "format": true,
  "config": {
    "encrypted": false,
    "create_keyfile": false
  },
  "passphrase": "my_secure_password",
  "options": {
    "automount": true,
    "comment": "My MergerFS pool",
    "policies": {
      "create": "mspmfs",
      "search": "ff"
    },
    "minfreespace": "20G",
    "moveonenospc": true,
    "mergerfsOptions": "defaults,allow_other,use_ino,category.create=mfs,minfreespace=5G"
  },
  "skip_size_check": false
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Name for the new pool | **Yes** |
| devices | array[string] — Array of device paths to use in the pool | **Yes** |
| filesystem | string ["ext4","xfs","btrfs"] — Filesystem to format individual devices with | No |
| format | boolean — Whether to force format the devices | No |
| config | object | No |
| passphrase | string — Encryption passphrase (required if encrypted=true) | No |
| options | object | No |
| skip_size_check | boolean — Skip the parity device size validation (SnapRAID normally requires parity \>= largest data device) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Pool created successfully | object |
| 400 | Bad request | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Successfully created MergerFS pool 'mergerfs_pool' with 2 device(s)",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/mergerfs" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"mergerfs_pool","devices":["/dev/sdb","/dev/sdc"],"filesystem":"xfs","format":true,"config":{"encrypted":false,"create_keyfile":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My MergerFS pool","policies":{"create":"mspmfs","search":"ff"},"minfreespace":"20G","moveonenospc":true,"mergerfsOptions":"defaults,allow_other,use_ino,category.create=mfs,minfreespace=5G"},"skip_size_check":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/mergerfs", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"mergerfs_pool","devices":["/dev/sdb","/dev/sdc"],"filesystem":"xfs","format":true,"config":{"encrypted":false,"create_keyfile":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My MergerFS pool","policies":{"create":"mspmfs","search":"ff"},"minfreespace":"20G","moveonenospc":true,"mergerfsOptions":"defaults,allow_other,use_ino,category.create=mfs,minfreespace=5G"},"skip_size_check":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/bcachefs` {#post-pools-bcachefs}

**Create bcachefs pool**

Creates a bcachefs pool. bcachefs is a native multi-device filesystem, so redundancy is
a configuration property instead of a dedicated parity disk and parity_devices stays empty.

Redundancy maps to RAID levels as follows:
- `data_replicas: 1` - striping without redundancy (RAID 0)
- `data_replicas: 2` - mirroring (RAID 1/10)
- `data_replicas: 2` + `erasure_code: true` - single parity (RAID 5)
- `data_replicas: 3` + `erasure_code: true` - double parity (RAID 6)

Cache devices are passed separately and get the `ssd` device group, data devices get `hdd`.
Requires the bcachefs kernel module from the mos-bcachefs plugin.


**Request body** (`application/json`)

```json
{
  "name": "tank",
  "devices": [
    "/dev/sdb",
    "/dev/sdc",
    "/dev/sdd"
  ],
  "cache_devices": [
    "/dev/nvme0n1"
  ],
  "format": true,
  "config": {
    "encrypted": false,
    "create_keyfile": false,
    "data_replicas": 2,
    "metadata_replicas": 2,
    "erasure_code": true,
    "compression": "lz4",
    "background_compression": "zstd",
    "cache_mode": "writethrough",
    "shared": false
  },
  "passphrase": "my_secure_password",
  "options": {
    "automount": true,
    "comment": "My bcachefs pool"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Name for the new pool | **Yes** |
| devices | array[string] — Data device paths (device group 'hdd') | **Yes** |
| cache_devices | array[string] — Optional cache device paths (device group 'ssd') | No |
| format | boolean — Whether to format the devices. false imports an existing bcachefs filesystem, every member must already sit on a partition | No |
| config | object | No |
| passphrase | string — Encryption passphrase (required if encrypted=true) | No |
| options | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Pool created successfully | object |
| 400 | Bad request or bcachefs kernel module unavailable | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Successfully created bcachefs pool 'tank' with 3 data device(s) and 1 cache device(s)",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/bcachefs" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"tank","devices":["/dev/sdb","/dev/sdc","/dev/sdd"],"cache_devices":["/dev/nvme0n1"],"format":true,"config":{"encrypted":false,"create_keyfile":false,"data_replicas":2,"metadata_replicas":2,"erasure_code":true,"compression":"lz4","background_compression":"zstd","cache_mode":"writethrough","shared":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My bcachefs pool"}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/bcachefs", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"tank","devices":["/dev/sdb","/dev/sdc","/dev/sdd"],"cache_devices":["/dev/nvme0n1"],"format":true,"config":{"encrypted":false,"create_keyfile":false,"data_replicas":2,"metadata_replicas":2,"erasure_code":true,"compression":"lz4","background_compression":"zstd","cache_mode":"writethrough","shared":false},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My bcachefs pool"}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/nonraid` {#post-pools-nonraid}

**Create NonRAID pool**

Create a new NonRAID pool with optional parity devices (max 2).

**Important:**
- Only one NonRAID pool per system
- Parity check runs automatically after creation unless parity_valid is true
- When parity_valid is true, parity is marked as valid and no check runs


**Request body** (`application/json`)

```json
{
  "name": "nonraid_pool",
  "devices": [
    "/dev/sdb",
    "/dev/sdc",
    "/dev/sdd"
  ],
  "filesystem": "xfs",
  "format": true,
  "parity": [
    "/dev/sde",
    "/dev/sdf"
  ],
  "parity_valid": false,
  "config": {
    "encrypted": false,
    "create_keyfile": false,
    "md_writemode": "normal"
  },
  "passphrase": "my_secure_password",
  "options": {
    "automount": true,
    "comment": "My NonRAID pool",
    "policies": {
      "create": "mspmfs",
      "search": "ff"
    },
    "minfreespace": "20G",
    "moveonenospc": true
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Name for the new pool (only one NonRAID pool allowed per system) | **Yes** |
| devices | array[string] — Array of device paths to use in the pool (max 28 devices) | **Yes** |
| filesystem | string ["ext4","xfs","btrfs"] — Filesystem to format individual devices with | No |
| format | boolean — Whether to force format the devices | No |
| parity | array[string] — Array of parity device paths (max 2 devices) | No |
| parity_valid | boolean — Whether existing parity is valid (for importing existing arrays) | No |
| config | object | No |
| passphrase | string — Encryption passphrase (required if encrypted=true) | No |
| options | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Pool created successfully | object |
| 400 | Bad request | Error |
| 403 | Admin permission required | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Successfully created NonRAID pool 'nonraid_pool' with 2 parity device(s). Parity check started",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/nonraid" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"nonraid_pool","devices":["/dev/sdb","/dev/sdc","/dev/sdd"],"filesystem":"xfs","format":true,"parity":["/dev/sde","/dev/sdf"],"parity_valid":false,"config":{"encrypted":false,"create_keyfile":false,"md_writemode":"normal"},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My NonRAID pool","policies":{"create":"mspmfs","search":"ff"},"minfreespace":"20G","moveonenospc":true}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/nonraid", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"nonraid_pool","devices":["/dev/sdb","/dev/sdc","/dev/sdd"],"filesystem":"xfs","format":true,"parity":["/dev/sde","/dev/sdf"],"parity_valid":false,"config":{"encrypted":false,"create_keyfile":false,"md_writemode":"normal"},"passphrase":"my_secure_password","options":{"automount":true,"comment":"My NonRAID pool","policies":{"create":"mspmfs","search":"ff"},"minfreespace":"20G","moveonenospc":true}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/nonraid/replace` {#post-pools-nonraid-replace}

**Replace devices in a NonRAID pool**

Replace one or more devices in the NonRAID pool with parity reconstruction (admin only).

**Important:**
- Only one NonRAID pool can exist per system
- Pool must be unmounted before replacement
- Maximum replacements: 1 device with 1 parity, 2 devices with 2 parities
- Data and parity devices can be replaced simultaneously
- Parity reconstruction starts automatically after replacement

**Size Requirements:**
- New data devices must be \<= smallest parity device
- New parity devices must be \>= largest data device

**Encryption:**
- Passphrase required when replacing data devices in encrypted pools
- New data devices will be encrypted with the existing key


**Request body** (`application/json`)

```json
{
  "replacements": [
    {
      "slot": "2",
      "newDevice": "/dev/sdg"
    },
    {
      "slot": "3",
      "newDevice": "/dev/sdh"
    }
  ],
  "format": true,
  "passphrase": "my_secure_password"
}
```

| Field | Type | Required |
|-------|------|----------|
| replacements | array[object] — Array of device replacements (slot and new device path) | **Yes** |
| format | boolean — Must be true (devices will be formatted) | **Yes** |
| passphrase | string — Encryption passphrase (required for encrypted pools with data replacements) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Devices replaced successfully, parity reconstruction started | object |
| 400 | Bad request | Error |
| 403 | Admin permission required | Error |
| 404 | NonRAID pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully replaced 2 device(s) in NonRAID pool 'media'. Parity reconstruction started.",
  "pool": {},
  "replacements": {
    "data": 1,
    "parity": 1
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/nonraid/replace" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"replacements":[{"slot":"2","newDevice":"/dev/sdg"},{"slot":"3","newDevice":"/dev/sdh"}],"format":true,"passphrase":"my_secure_password"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/nonraid/replace", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"replacements":[{"slot":"2","newDevice":"/dev/sdg"},{"slot":"3","newDevice":"/dev/sdh"}],"format":true,"passphrase":"my_secure_password"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/nonraid/adddevice` {#post-pools-nonraid-adddevice}

**Add data device to NonRAID pool**

Add a new data device to the NonRAID pool (admin only).
Device will be assigned the next available slot (1-28) automatically.

**Modes:**
- format: true - Create partition and format device with specified filesystem
- format: false - Import existing partition/filesystem (device must have usable filesystem)

**Important:**
- Pool must be unmounted before adding device
- Not possible while a parity operation (check, clear, rebuild) is running
- Pool is mounted automatically after the device was added
- With parity and format: true the disk is cleared (zeroed) in the background first, then formatted
  and added to the pool. The array stays usable; notifications are sent on start and when the disk is ready
- format: false runs a parity check unless parity_valid is true
- parity_valid: true skips clearing/check (disk must already be zeroed)
- Passphrase required for encrypted pools without keyfile
- Adding, replacing or adding parity is rejected until a new disk is cleared, formatted and ready

**Size Requirements:**
- New data device must be \<= smallest parity device


**Request body** (`application/json`)

```json
{
  "device": "/dev/sdg",
  "format": true,
  "filesystem": "xfs",
  "passphrase": "my_secure_password",
  "parity_valid": false
}
```

| Field | Type | Required |
|-------|------|----------|
| device | string — Path to new data device | **Yes** |
| format | boolean — Format mode - true to create partition and format, false to import existing filesystem | No |
| filesystem | string ["xfs","ext4","btrfs"] — Filesystem type (defaults to pool's existing filesystem) | No |
| passphrase | string — Encryption passphrase (required for encrypted pools without keyfile) | No |
| parity_valid | boolean — If true, skip clearing and parity check (disk is already zeroed / parity is valid) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device added successfully | object |
| 400 | Bad request | - |
| 404 | NonRAID pool not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully added data device to NonRAID pool 'media' at slot 5. Parity check started.",
  "pool": {},
  "slot": 5
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/nonraid/adddevice" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"device":"/dev/sdg","format":true,"filesystem":"xfs","passphrase":"my_secure_password","parity_valid":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/nonraid/adddevice", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"device":"/dev/sdg","format":true,"filesystem":"xfs","passphrase":"my_secure_password","parity_valid":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/nonraid/addparity` {#post-pools-nonraid-addparity}

**Add parity device to NonRAID pool**

Add a new parity device to the NonRAID pool (admin only).
Device will be assigned the next available parity slot (1 or 2) automatically.

**Important:**
- Pool must be unmounted before adding parity
- Not possible while a parity operation (check, clear, rebuild) is running
- Pool is mounted automatically after the parity was added
- Maximum 2 parity devices allowed
- Parity check ALWAYS runs when adding parity
- Parity device is NOT formatted

**Size Requirements:**
- Parity device must be \>= largest data device


**Request body** (`application/json`)

```json
{
  "device": "/dev/sdg",
  "passphrase": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| device | string — Path to new parity device (whole disk, not partition) | **Yes** |
| passphrase | string — Passphrase for encrypted pools without keyfile (needed for the mount) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Parity device added successfully | object |
| 400 | Bad request | - |
| 404 | NonRAID pool not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully added parity device to NonRAID pool 'media' at slot 2. Parity check started.",
  "pool": {},
  "slot": 2
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/nonraid/addparity" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"device":"/dev/sdg","passphrase":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/nonraid/addparity", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"device":"/dev/sdg","passphrase":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/mount` {#post-pools-id-mount}

**Mount pool by ID**

Mount a storage pool

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "passphrase": "my_secure_password",
  "mountOptions": "noatime",
  "mount_missing": false
}
```

| Field | Type | Required |
|-------|------|----------|
| passphrase | string — Encryption passphrase (if required) | No |
| mountOptions | string — Additional mount options | No |
| mount_missing | boolean — Allow mounting NonRAID pools in degraded mode with missing devices (requires sufficient parity) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Pool mounted successfully | object |
| 404 | Pool not found | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Pool 'data_pool' mounted successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/mount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"passphrase":"my_secure_password","mountOptions":"noatime","mount_missing":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/mount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"passphrase":"my_secure_password","mountOptions":"noatime","mount_missing":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/unmount` {#post-pools-id-unmount}

**Unmount pool by ID**

Unmount a storage pool

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "force": false
}
```

| Field | Type | Required |
|-------|------|----------|
| force | boolean — Force unmount | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Pool unmounted successfully | object |
| 404 | Pool not found | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Pool 'data_pool' unmounted successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/unmount" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/unmount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"force":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/devices` {#post-pools-id-devices}

**Add devices to pool**

Add new devices to an existing pool

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "devices": [
    "/dev/sdd",
    "/dev/sde"
  ],
  "format": true,
  "group": "hdd"
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — Array of device paths to add | **Yes** |
| format | boolean — Whether to format the devices. Must be true for bcachefs pools | No |
| group | string ["hdd","ssd"] — bcachefs only - device group, hdd adds data capacity, ssd adds cache | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Devices added successfully | object |
| 404 | Pool not found | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully added 2 device(s) to pool"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/devices" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["/dev/sdd","/dev/sde"],"format":true,"group":"hdd"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/devices", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["/dev/sdd","/dev/sde"],"format":true,"group":"hdd"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/parity/add` {#post-pools-id-parity-add}

**Add parity devices to a MergerFS pool**

Add one or more parity devices to an existing MergerFS pool for SnapRAID protection (admin only). Devices will be formatted if needed and SnapRAID configuration will be updated.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "devices": [
    "/dev/sdd",
    "/dev/sde"
  ],
  "format": false,
  "skip_size_check": false
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — List of parity device paths to add | **Yes** |
| format | boolean — Whether to force format the devices before adding | No |
| skip_size_check | boolean — Skip the parity device size validation (SnapRAID normally requires parity \>= largest data device) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Parity devices added successfully | object |
| 400 | Bad request | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully added 2 parity device(s) to pool 'media'",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/parity/add" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["/dev/sdd","/dev/sde"],"format":false,"skip_size_check":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/parity/add", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["/dev/sdd","/dev/sde"],"format":false,"skip_size_check":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/parity/replace` {#post-pools-id-parity-replace}

**Replace a parity device in a MergerFS pool**

Replace an existing parity device with a new one in a MergerFS pool (admin only).
The old device will be unmounted and the new device will take over its parity slot.
SnapRAID configuration will be updated automatically.

**Size Requirements (default):**
- New parity device must be \>= largest data device
- Use skip_size_check to bypass this validation

**Encryption:**
- For encrypted pools, the new device will be encrypted with the existing key
- Passphrase is required for encrypted pools


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "oldDevice": "/dev/sdd1",
  "newDevice": "/dev/sde",
  "format": true,
  "passphrase": "my_secure_password",
  "skip_size_check": false
}
```

| Field | Type | Required |
|-------|------|----------|
| oldDevice | string — Path to the current parity device to replace | **Yes** |
| newDevice | string — Path to the new parity device | **Yes** |
| format | boolean — Whether to format the new device before adding | No |
| passphrase | string — Encryption passphrase (required for encrypted pools) | No |
| skip_size_check | boolean — Skip the parity device size validation (SnapRAID normally requires parity \>= largest data device) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Parity device replaced successfully | object |
| 400 | Bad request | Error |
| 404 | Pool or device not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully replaced parity device /dev/sdd1 with /dev/sde in pool 'media'",
  "pool": {}
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/parity/replace" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"oldDevice":"/dev/sdd1","newDevice":"/dev/sde","format":true,"passphrase":"my_secure_password","skip_size_check":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/parity/replace", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"oldDevice":"/dev/sdd1","newDevice":"/dev/sde","format":true,"passphrase":"my_secure_password","skip_size_check":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/parity/remove` {#post-pools-id-parity-remove}

**Remove parity devices from a MergerFS pool**

Remove one or more parity devices from an existing MergerFS pool (admin only). If all parity devices are removed, SnapRAID configuration will be cleaned up.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "devices": [
    "/dev/sdd"
  ],
  "unmount": true
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — List of parity device paths to remove | **Yes** |
| unmount | boolean — Whether to unmount the devices after removing them | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Parity devices removed successfully | object |
| 400 | Invalid request parameters | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully removed 1 parity device(s) from pool 'data_mergerfs'. SnapRAID configuration removed.",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  },
  "snapraidDisabled": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/parity/remove" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["/dev/sdd"],"unmount":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/parity/remove", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["/dev/sdd"],"unmount":true})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/devices/remove` {#post-pools-id-devices-remove}

**Remove devices from an existing pool**

Remove one or more devices from an existing MergerFS, BTRFS or bcachefs pool (admin only).
Will update SnapRAID config if pool has SnapRAID configured.

**bcachefs:** The pool must be mounted. Data is evacuated onto the remaining devices before
removal, which can take hours on large devices, so it runs in the background and notifications
are sent on start and completion. The remaining devices must still satisfy data_replicas/erasure
coding, and the last cache device cannot be removed while a cache mode is configured.
Only one device operation per bcachefs pool can run at a time.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "devices": [
    "/dev/sdd",
    "/dev/sde"
  ],
  "unmount": true
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — List of device paths to remove | **Yes** |
| unmount | boolean — Whether to unmount the devices after removing them | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Devices removed successfully | object |
| 400 | Invalid request parameters or device requirements not met | Error |
| 401 | Unauthorized | Error |
| 403 | Admin permission required | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully removed 2 device(s) from MergerFS pool 'data_mergerfs'",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/devices/remove" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["/dev/sdd","/dev/sde"],"unmount":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/devices/remove", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["/dev/sdd","/dev/sde"],"unmount":true})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/devices/add` {#post-pools-id-devices-add}

**Add devices to an existing pool**

Add one or more devices to an existing pool (admin only).

**BTRFS Pools:**
- Single-device pools (type 'btrfs') will automatically be converted to multi-device with raid1 configuration
- Uses native BTRFS device addition functionality
- Pool must be mounted for the operation

**MergerFS Pools:**
- Devices will be mounted individually and added to the MergerFS union
- Will format devices if needed and update SnapRAID config if pool has SnapRAID configured
- Pool will be remounted automatically after device addition

**bcachefs Pools:**
- Devices join the mounted filesystem online, `format` must be true
- `group` selects data (hdd) or cache (ssd), cache durability follows the pool's cache mode


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "devices": [
    "/dev/sdd",
    "/dev/sde"
  ],
  "format": false,
  "passphrase": "string",
  "group": "hdd"
}
```

| Field | Type | Required |
|-------|------|----------|
| devices | array[string] — List of device paths to add | **Yes** |
| format | boolean — Whether to force format the devices before adding. Must be true for bcachefs pools | No |
| passphrase | string — Passphrase for encrypted pools | No |
| group | string ["hdd","ssd"] — bcachefs only - device group, hdd adds data capacity, ssd adds cache | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Devices added successfully | object |
| 400 | Invalid request parameters or device requirements not met | Error |
| 401 | Unauthorized | Error |
| 403 | Admin permission required | Error |
| 404 | Pool not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully added 2 device(s) to pool 'data_mergerfs'",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/devices/add" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"devices":["/dev/sdd","/dev/sde"],"format":false,"passphrase":"string","group":"hdd"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/devices/add", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"devices":["/dev/sdd","/dev/sde"],"format":false,"passphrase":"string","group":"hdd"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/devices/replace` {#post-pools-id-devices-replace}

**Replace a device in a pool**

Replace a data device of a BTRFS, MergerFS or bcachefs pool (admin only).

**bcachefs Pools:**
- The pool must be mounted and `format` must be true
- The new device joins first in the group of the old one, then the old device is evacuated and removed,
  so redundancy never drops during the replacement
- The old device must still be reachable, evacuation can take hours on large devices and runs in
  the background, notifications are sent on start and completion


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "oldDevice": "/dev/sdb1",
  "newDevice": "/dev/sdd",
  "format": true,
  "passphrase": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| oldDevice | string — Device path of the member to replace | **Yes** |
| newDevice | string — Device path of the replacement | **Yes** |
| format | boolean — Whether to format the new device. Must be true for bcachefs pools | No |
| passphrase | string — Passphrase for encrypted pools | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device replaced successfully | object |
| 404 | Pool not found | Error |
| 500 | Replacement failed | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "/dev/sdd was added to bcachefs pool 'data', /dev/sdb1 is evacuated and removed in the background",
  "pool": {
    "id": "1234567890",
    "name": "data_pool",
    "type": "btrfs",
    "automount": true,
    "comment": "My data pool",
    "raid_level": "raid1",
    "data_devices": [
      {
        "device": "/dev/sdj1",
        "powerStatus": "active",
        "performance": {
          "readSpeed": 0,
          "writeSpeed": 0,
          "readSpeed_human": "string",
          "writeSpeed_human": "string"
        },
        "temperature": 0,
        "smartWarning": false,
        "temperatureStatus": null
      }
    ],
    "parity_devices": [
      {}
    ],
    "performance": {
      "readSpeed": 0,
      "writeSpeed": 0,
      "readSpeed_human": "string",
      "writeSpeed_human": "string"
    },
    "config": {
      "encrypted": false,
      "shared": false
    },
    "status": {
      "parity_operation": true,
      "parity_valid": true,
      "parity_progress": {
        "operation": "check P Q",
        "description": "Checking both parities",
        "status": "running",
        "percent": 52,
        "height": "27.5 GB",
        "speed": "519 MB/s",
        "eta": "11:04",
        "correction_enabled": false,
        "start_time": 1732099200,
        "end_time": 1732102800,
        "last_exit_code": 0,
        "parity_errors": 0,
        "stripes": "495 stripe/s"
      }
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/devices/replace" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"oldDevice":"/dev/sdb1","newDevice":"/dev/sdd","format":true,"passphrase":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/devices/replace", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"oldDevice":"/dev/sdb1","newDevice":"/dev/sdd","format":true,"passphrase":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/parity` {#post-pools-id-parity}

**Execute parity operation on a MergerFS or NonRAID pool**

Execute parity operations on pools with parity devices (admin only).

**MergerFS Pools (SnapRAID):**
- Operations: sync, check, scrub, fix, status, force_stop

**NonRAID Pools:**
- Operations: check, pause, resume, cancel, auto
- For 'check': use 'option' parameter (CORRECT or NOCORRECT)
- 'auto': Automatically starts check (NOCORRECT) if not running, or cancels if running


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "operation": "check",
  "option": "NOCORRECT",
  "fixDisks": [
    "/var/mergerfs/media/disk1",
    "/var/mergerfs/media/disk3"
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| operation | string ["sync","check","scrub","fix","status","force_stop","pause","resume","cancel","auto"] — Operation to execute | **Yes** |
| option | string ["CORRECT","NOCORRECT"] — Check option for NonRAID pools (CORRECT or NOCORRECT) | No |
| fixDisks | array[string] — Mount points of disks to fix (optional for SnapRAID 'fix' operation on MergerFS pools). If provided, only the specified disks will be fixed. If omitted, all disks will be fixed. These are the mount points from the pool's data_devices (e.g., "/var/mergerfs/media/disk1"). The API will automatically map these to SnapRAID disk identifiers (d1, d2, etc.).  | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SnapRAID operation executed successfully | object |
| 400 | Invalid request parameters or operation requirements not met | object |
| 404 | Pool not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Parity check without correction started",
  "operation": "check",
  "option": "NOCORRECT",
  "poolName": "media",
  "fixDisks": "d2,d4",
  "timestamp": "2025-11-20T12:34:56.789Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/parity" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"check","option":"NOCORRECT","fixDisks":["/var/mergerfs/media/disk1","/var/mergerfs/media/disk3"]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/parity", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"operation":"check","option":"NOCORRECT","fixDisks":["/var/mergerfs/media/disk1","/var/mergerfs/media/disk3"]})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/btrfs/scrub` {#post-pools-id-btrfs-scrub}

**Execute BTRFS scrub operation**

Scrub operations for BTRFS pools only.

**Operations:**
- `start`: Start a new scrub (fails if one is already running)
- `status`: Get current scrub status and progress
- `pause`: Pause a running scrub (via cancel in BTRFS)
- `cancel`: Cancel a running scrub


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "operation": "start"
}
```

| Field | Type | Required |
|-------|------|----------|
| operation | string ["start","status","pause","cancel"] — Operation to execute | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | BTRFS scrub operation executed successfully | object |
| 400 | Invalid request parameters or operation requirements not met | object |
| 404 | Pool not found | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "BTRFS scrub started",
  "operation": "start",
  "poolName": "data",
  "running": true,
  "progress": {
    "status": "running",
    "percent": 45.5,
    "processed": "1.5 TB",
    "speed": "150 MB/s",
    "errors": 0
  },
  "timestamp": "2025-06-04T12:34:56.789Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/btrfs/scrub" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"start"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/btrfs/scrub", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"operation":"start"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/btrfs/balance` {#post-pools-id-btrfs-balance}

**Execute BTRFS balance operation**

Balance operations for BTRFS pools only.

**Operations:**
- `start`: Start a new balance (optionally with RAID conversion)
- `status`: Get current balance status and progress
- `pause`: Pause a running balance
- `cancel`: Cancel a running or paused balance


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "operation": "start",
  "raidLevel": "raid1"
}
```

| Field | Type | Required |
|-------|------|----------|
| operation | string ["start","status","pause","cancel"] — Operation to execute | **Yes** |
| raidLevel | string ["raid0","raid1","raid10"] — RAID level for balance conversion (optional) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | BTRFS balance operation executed successfully | object |
| 400 | Invalid request parameters or operation requirements not met | object |
| 404 | Pool not found | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "BTRFS balance started",
  "operation": "start",
  "poolName": "data",
  "running": true,
  "progress": {
    "status": "running",
    "percent": 45.5
  },
  "timestamp": "2025-06-04T12:34:56.789Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/btrfs/balance" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"start","raidLevel":"raid1"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/btrfs/balance", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"operation":"start","raidLevel":"raid1"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/pools/{id}/bcachefs/scrub` {#post-pools-id-bcachefs-scrub}

**Execute bcachefs scrub operation**

Scrub operations for bcachefs pools only. A scrub verifies all data checksums and repairs
from redundant copies where possible; affected paths are logged to dmesg.

**Operations:**
- `start`: Start a new scrub (fails if one is already running)
- `status`: Get current scrub status and progress
- `cancel`: Stop a running scrub (bcachefs has no pause)


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Pool ID |

**Request body** (`application/json`)

```json
{
  "operation": "start"
}
```

| Field | Type | Required |
|-------|------|----------|
| operation | string ["start","status","cancel"] — Operation to execute | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | bcachefs scrub operation executed successfully | object |
| 400 | Invalid request parameters or operation requirements not met | object |
| 404 | Pool not found | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "bcachefs scrub started",
  "operation": "start",
  "poolName": "data",
  "running": true,
  "progress": {
    "status": "running",
    "percent": 45.5
  },
  "timestamp": "2026-09-30T12:34:56.789Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/pools/{id}/bcachefs/scrub" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"start"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/{id}/bcachefs/scrub", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"operation":"start"})
});
const data = await res.json();
console.log(data);
```
## Pools WebSocket {#pools-websocket}

Real-time pool monitoring via WebSocket.


#### `GET` `/pools/websocket/stats` {#get-pools-websocket-stats}

**Get WebSocket monitoring statistics**

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket monitoring statistics | object |
| 401 | Unauthorized | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": false,
  "data": {
    "activeSubscriptions": 2,
    "cachedPools": 3,
    "subscriptions": [
      {
        "filters": {
          "type": "mergerfs"
        },
        "clientCount": 1,
        "interval": 30000,
        "uptime": 120000
      }
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/pools/websocket/events` {#get-pools-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time pool monitoring.

**Connection:** Connect to WebSocket at `/api/v1/pools` namespace

**Events to emit (client → server):**

- `subscribe-pools`: Subscribe to pool updates with filters
- `unsubscribe-pools`: Unsubscribe from pool updates
- `get-pools`: Get immediate pool data (one-time)

**Events to listen for (server → client):**

- `pools-update`: Real-time pool data updates
- `pools-performance-update`: Real-time I/O throughput (if includePerformance=true, every 2s)
- `pools-error`: Error messages
- `pools-subscription-confirmed`: Subscription confirmation
- `pools-unsubscription-confirmed`: Unsubscription confirmation
- `error`: General error messages

**Example Usage:**

Connect to WebSocket:
```
const socket = io('http://localhost:3000/api/v1/pools', {
  path: '/socket.io/'
});
```

Subscribe to all MergerFS pools:
```
socket.emit('subscribe-pools', {
  token: 'your-jwt-token',
  interval: 30000,
  filters: { type: 'mergerfs' }
});
```

Listen for updates:
```
socket.on('pools-update', (data) => {
  console.log('Pools updated:', data.pools);
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "events": {
    "client_to_server": [
      {
        "event": "string",
        "description": "string",
        "payload": {
          "interval": 30000,
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "includePerformance": true,
          "filters": {
            "id": "1746318722394",
            "type": "mergerfs",
            "exclude_type": "btrfs"
          }
        }
      }
    ],
    "server_to_client": [
      {
        "event": "string",
        "description": "string",
        "payload": [
          {
            "id": "1234567890",
            "name": "data_pool",
            "type": "btrfs",
            "automount": true,
            "comment": "My data pool",
            "raid_level": "raid1",
            "data_devices": [
              {
                "device": "/dev/sdj1",
                "powerStatus": "active",
                "performance": {
                  "readSpeed": 0,
                  "writeSpeed": 0,
                  "readSpeed_human": "string",
                  "writeSpeed_human": "string"
                },
                "temperature": 0,
                "smartWarning": false,
                "temperatureStatus": null
              }
            ],
            "parity_devices": [
              {}
            ],
            "performance": {
              "readSpeed": 0,
              "writeSpeed": 0,
              "readSpeed_human": "string",
              "writeSpeed_human": "string"
            },
            "config": {
              "encrypted": false,
              "shared": false
            },
            "status": {
              "parity_operation": true,
              "parity_valid": true,
              "parity_progress": {
                "operation": "check P Q",
                "description": "Checking both parities",
                "status": "running",
                "percent": 52,
                "height": "27.5 GB",
                "speed": "519 MB/s",
                "eta": "11:04",
                "correction_enabled": false,
                "start_time": 1732099200,
                "end_time": 1732102800,
                "last_exit_code": 0,
                "parity_errors": 0,
                "stripes": "495 stripe/s"
              }
            }
          }
        ]
      }
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/pools/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/pools/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## iSCSI Targets {#iscsi-targets}

iSCSI Target Management.


#### `GET` `/iscsi/targets` {#get-iscsi-targets}

**Get all iSCSI targets**

Retrieve all configured iSCSI targets (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All iSCSI targets retrieved successfully | array[IscsiTarget] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": 1,
    "name": "Test Server 2",
    "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "portal": "0.0.0.0:3260",
    "authentication": {
      "method": "none"
    },
    "luns": [
      {
        "id": 1,
        "path": "/mnt/misc_cache/iSCSI/test2_array.img",
        "backing_store": "rdwr",
        "mode": "logicalunit",
        "size": "1G"
      }
    ],
    "initiators": [
      {
        "iqn": "iqn.2025-08.why-mos:mos",
        "authentication": {
          "method": "none"
        }
      }
    ],
    "isActive": true
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/iscsi/targets" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/targets` {#post-iscsi-targets}

**Create new iSCSI target**

Create a new iSCSI target (admin only)

**Request body** (`application/json`)

```json
{
  "id": 1,
  "name": "Test Server 2",
  "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
  "portal": "0.0.0.0:3260",
  "authentication": {
    "method": "none"
  },
  "luns": [
    {
      "id": 1,
      "path": "/mnt/misc_cache/iSCSI/test2_array.img",
      "backing_store": "rdwr",
      "mode": "logicalunit"
    }
  ],
  "initiators": [
    {
      "iqn": "iqn.2025-08.why-mos:mos",
      "authentication": {
        "method": "none"
      }
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| id | integer — Unique target ID | **Yes** |
| name | string — Target name | No |
| iqn | string — Target IQN | **Yes** |
| portal | string — Target portal | No |
| authentication | object | No |
| luns | array[IscsiLun] | No |
| initiators | array[IscsiInitiator] | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | iSCSI target created successfully | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "iSCSI target 'Test Server 2' created successfully",
  "data": {
    "id": 1,
    "name": "Test Server 2",
    "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "portal": "0.0.0.0:3260",
    "authentication": {
      "method": "none"
    },
    "luns": [
      {
        "id": 1,
        "path": "/mnt/misc_cache/iSCSI/test2_array.img",
        "backing_store": "rdwr",
        "mode": "logicalunit",
        "size": "1G"
      }
    ],
    "initiators": [
      {
        "iqn": "iqn.2025-08.why-mos:mos",
        "authentication": {
          "method": "none"
        }
      }
    ],
    "isActive": true
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/targets" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Test Server 2","iqn":"iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos","portal":"0.0.0.0:3260","authentication":{"method":"none"},"luns":[{"id":1,"path":"/mnt/misc_cache/iSCSI/test2_array.img","backing_store":"rdwr","mode":"logicalunit"}],"initiators":[{"iqn":"iqn.2025-08.why-mos:mos","authentication":{"method":"none"}}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"id":1,"name":"Test Server 2","iqn":"iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos","portal":"0.0.0.0:3260","authentication":{"method":"none"},"luns":[{"id":1,"path":"/mnt/misc_cache/iSCSI/test2_array.img","backing_store":"rdwr","mode":"logicalunit"}],"initiators":[{"iqn":"iqn.2025-08.why-mos:mos","authentication":{"method":"none"}}]})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/iscsi/targets/info` {#get-iscsi-targets-info}

**Get iSCSI targets statistics**

Retrieve statistical information about iSCSI targets (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | iSCSI targets statistics retrieved successfully | IscsiTargetsStatistics |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "data": {
    "totalTargets": 3,
    "activeTargets": 2,
    "totalLuns": 8,
    "totalInitiators": 5
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/iscsi/targets/info" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/info", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/iscsi/targets/{targetId}` {#get-iscsi-targets-targetid}

**Get a specific iSCSI target**

Retrieve detailed information about a specific iSCSI target by ID (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | iSCSI target retrieved successfully | object |
| 400 | Invalid target ID | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Test Server 2",
    "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "portal": "0.0.0.0:3260",
    "authentication": {
      "method": "none"
    },
    "luns": [
      {
        "id": 1,
        "path": "/mnt/misc_cache/iSCSI/test2_array.img",
        "backing_store": "rdwr",
        "mode": "logicalunit",
        "size": "1G"
      }
    ],
    "initiators": [
      {
        "iqn": "iqn.2025-08.why-mos:mos",
        "authentication": {
          "method": "none"
        }
      }
    ],
    "isActive": true
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/iscsi/targets/{targetId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/{targetId}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/iscsi/targets/{targetId}` {#put-iscsi-targets-targetid}

**Update an iSCSI target**

Update configuration of an existing iSCSI target (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID to update |

**Request body** (`application/json`)

```json
{
  "name": "Updated Test Server",
  "luns": [
    {
      "id": 1,
      "path": "/mnt/misc_cache/iSCSI/updated_array.img",
      "backing_store": "rdwr",
      "mode": "logicalunit"
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Target name | No |
| portal | string — Target portal | No |
| authentication | object | No |
| luns | array[IscsiLun] | No |
| initiators | array[IscsiInitiator] | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | iSCSI target updated successfully | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "iSCSI target 'Updated Test Server' updated successfully",
  "data": {
    "id": 1,
    "name": "Test Server 2",
    "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "portal": "0.0.0.0:3260",
    "authentication": {
      "method": "none"
    },
    "luns": [
      {
        "id": 1,
        "path": "/mnt/misc_cache/iSCSI/test2_array.img",
        "backing_store": "rdwr",
        "mode": "logicalunit",
        "size": "1G"
      }
    ],
    "initiators": [
      {
        "iqn": "iqn.2025-08.why-mos:mos",
        "authentication": {
          "method": "none"
        }
      }
    ],
    "isActive": true
  },
  "wasActive": true
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/iscsi/targets/{targetId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Test Server","luns":[{"id":1,"path":"/mnt/misc_cache/iSCSI/updated_array.img","backing_store":"rdwr","mode":"logicalunit"}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/{targetId}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"Updated Test Server","luns":[{"id":1,"path":"/mnt/misc_cache/iSCSI/updated_array.img","backing_store":"rdwr","mode":"logicalunit"}]})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/iscsi/targets/{targetId}` {#delete-iscsi-targets-targetid}

**Delete an iSCSI target**

Delete an existing iSCSI target (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID to delete |
| deleteImages | query | boolean | No | If true, delete all backing image files (.img) associated with this target |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | iSCSI target deleted successfully | object |
| 400 | Invalid target ID | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "iSCSI target 'Test Server 2' deleted successfully",
  "data": {
    "target": {
      "id": 1,
      "name": "Test Server 2",
      "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": "0.0.0.0:3260",
      "authentication": {
        "method": "none"
      },
      "luns": [
        {
          "id": 1,
          "path": "/mnt/misc_cache/iSCSI/test2_array.img",
          "backing_store": "rdwr",
          "mode": "logicalunit",
          "size": "1G"
        }
      ],
      "initiators": [
        {
          "iqn": "iqn.2025-08.why-mos:mos",
          "authentication": {
            "method": "none"
          }
        }
      ],
      "isActive": true
    },
    "deletedImageFiles": [
      "/mnt/storage/disk1.img",
      "/mnt/storage/disk2.img"
    ]
  },
  "wasActive": true
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/iscsi/targets/{targetId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/{targetId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/targets/restart` {#post-iscsi-targets-restart}

**Restart all iSCSI targets**

Restart/reload all configured iSCSI targets (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All targets restarted successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "All targets restarted",
  "data": {
    "totalTargets": 3,
    "results": [
      {
        "id": 1,
        "status": "success",
        "error": "string"
      }
    ]
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/targets/restart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/restart", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/targets/{targetId}/luns` {#post-iscsi-targets-targetid-luns}

**Add a LUN to an iSCSI target**

Add a new LUN to an existing iSCSI target (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID |

**Request body** (`application/json`)

```json
{
  "id": 2,
  "path": "/mnt/misc_cache/iSCSI/new_lun.img",
  "backing_store": "rdwr",
  "mode": "logicalunit",
  "size": "2G"
}
```

| Field | Type | Required |
|-------|------|----------|
| id | integer — LUN ID | **Yes** |
| path | string — Path to the LUN backing store | **Yes** |
| backing_store | string ["rdwr","ro"] — Backing store mode | No |
| mode | string — LUN mode | No |
| size | string — Size for image files (e.g., '1G', '500M', '2048K'). Only used when creating new .img files. | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | LUN added successfully | - |
| 400 | Bad request - validation failed | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Target not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/targets/{targetId}/luns" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id":2,"path":"/mnt/misc_cache/iSCSI/new_lun.img","backing_store":"rdwr","mode":"logicalunit","size":"2G"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/{targetId}/luns", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"id":2,"path":"/mnt/misc_cache/iSCSI/new_lun.img","backing_store":"rdwr","mode":"logicalunit","size":"2G"})
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/iscsi/targets/{targetId}/luns/{lunId}` {#put-iscsi-targets-targetid-luns-lunid}

**Update a LUN in an iSCSI target**

Update configuration of an existing LUN in an iSCSI target (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID |
| lunId | path | integer | **Yes** | LUN ID to update |

**Request body** (`application/json`)

```json
{
  "path": "/mnt/misc_cache/iSCSI/updated_lun.img",
  "backing_store": "rdwr",
  "mode": "logicalunit",
  "size": "2G"
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Path to the LUN backing store | No |
| backing_store | string ["rdwr","ro"] — Backing store mode | No |
| mode | string — LUN mode | No |
| size | string — Size for image files (e.g., '1G', '500M', '2048K'). Only used when creating new .img files. | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | LUN updated successfully | - |
| 400 | Bad request - validation failed | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Target or LUN not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/iscsi/targets/{targetId}/luns/{lunId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/misc_cache/iSCSI/updated_lun.img","backing_store":"rdwr","mode":"logicalunit","size":"2G"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/{targetId}/luns/{lunId}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/misc_cache/iSCSI/updated_lun.img","backing_store":"rdwr","mode":"logicalunit","size":"2G"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/iscsi/targets/{targetId}/luns/{lunId}` {#delete-iscsi-targets-targetid-luns-lunid}

**Remove a LUN from an iSCSI target**

Remove an existing LUN from an iSCSI target (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID |
| lunId | path | integer | **Yes** | LUN ID to remove |
| deleteImages | query | boolean | No | If true, delete the backing image file (.img) for this LUN |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | LUN removed successfully | object |
| 400 | Invalid target or LUN ID | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Target or LUN not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "LUN 2 removed from target 'Test Server 1' successfully",
  "data": {
    "target": {
      "id": 1,
      "name": "Test Server 2",
      "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": "0.0.0.0:3260",
      "authentication": {
        "method": "none"
      },
      "luns": [
        {
          "id": 1,
          "path": "/mnt/misc_cache/iSCSI/test2_array.img",
          "backing_store": "rdwr",
          "mode": "logicalunit",
          "size": "1G"
        }
      ],
      "initiators": [
        {
          "iqn": "iqn.2025-08.why-mos:mos",
          "authentication": {
            "method": "none"
          }
        }
      ],
      "isActive": true
    },
    "removedLun": {
      "id": 1,
      "path": "/mnt/misc_cache/iSCSI/test2_array.img",
      "backing_store": "rdwr",
      "mode": "logicalunit",
      "size": "1G"
    },
    "imageFileDeleted": true
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/iscsi/targets/{targetId}/luns/{lunId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/targets/{targetId}/luns/{lunId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## iSCSI Initiators {#iscsi-initiators}

iSCSI Initiator Management.


#### `GET` `/iscsi/initiator` {#get-iscsi-initiator}

**Get iSCSI initiator configuration**

Retrieve the complete iSCSI initiator configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Initiator configuration retrieved successfully | IscsiInitiatorConfig |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "initiator": {
    "name": "iqn.2025-08.why-mos:why"
  },
  "targets": [
    {
      "id": 1647875123456,
      "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": {
        "address": "10.0.0.1",
        "port": "3260"
      },
      "connection": {
        "automount": false
      }
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/iscsi/initiator" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/iscsi/initiator/name` {#put-iscsi-initiator-name}

**Update initiator name**

Update the IQN name of the iSCSI initiator (admin only)

**Request body** (`application/json`)

```json
{
  "name": "iqn.2025-08.why-mos:updated-why"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — New initiator IQN | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Initiator name updated successfully | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Initiator name updated to 'iqn.2025-08.why-mos:updated-why' successfully",
  "data": {
    "initiator": {
      "name": "iqn.2025-08.why-mos:why"
    },
    "targets": [
      {
        "id": 1647875123456,
        "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
        "portal": {
          "address": "10.0.0.1",
          "port": "3260"
        },
        "connection": {
          "automount": false
        }
      }
    ]
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/iscsi/initiator/name" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"iqn.2025-08.why-mos:updated-why"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/name", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"iqn.2025-08.why-mos:updated-why"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/initiator/targets` {#post-iscsi-initiator-targets}

**Add a new target**

Add a new iSCSI target to the initiator configuration (admin only)

**Request body** (`application/json`)

```json
{
  "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
  "portal": {
    "address": "10.0.0.1",
    "port": "3260"
  },
  "connection": {
    "automount": false
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Target IQN | **Yes** |
| portal | object | **Yes** |
| connection | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Target added successfully | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos' added successfully",
  "data": {
    "config": {
      "initiator": {
        "name": "iqn.2025-08.why-mos:why"
      },
      "targets": [
        {
          "id": 1647875123456,
          "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
          "portal": {
            "address": "10.0.0.1",
            "port": "3260"
          },
          "connection": {
            "automount": false
          }
        }
      ]
    },
    "addedTarget": {
      "id": 1647875123456,
      "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": {
        "address": "10.0.0.1",
        "port": "3260"
      },
      "connection": {
        "automount": false
      }
    },
    "autoLogin": {
      "success": true,
      "message": "Successfully logged in to target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos'",
      "error": "string"
    }
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/initiator/targets" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos","portal":{"address":"10.0.0.1","port":"3260"},"connection":{"automount":false}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/targets", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos","portal":{"address":"10.0.0.1","port":"3260"},"connection":{"automount":false}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/iscsi/initiator/targets/{targetId}` {#get-iscsi-initiator-targets-targetid}

**Get a specific target**

Retrieve detailed information about a specific target by ID (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target retrieved successfully | object |
| 400 | Invalid target ID | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "data": {
    "id": 1647875123456,
    "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "portal": {
      "address": "10.0.0.1",
      "port": "3260"
    },
    "connection": {
      "automount": false
    }
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/iscsi/initiator/targets/{targetId}` {#put-iscsi-initiator-targets-targetid}

**Update a target**

Update configuration of an existing target (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID to update |

**Request body** (`application/json`)

```json
{
  "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos-updated",
  "portal": {
    "address": "10.0.0.2",
    "port": "3260"
  },
  "connection": {
    "automount": true
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Target IQN | No |
| portal | IscsiInitiatorPortal | No |
| connection | IscsiInitiatorConnection | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target updated successfully | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos-updated' updated successfully",
  "data": {
    "config": {
      "initiator": {
        "name": "iqn.2025-08.why-mos:why"
      },
      "targets": [
        {
          "id": 1647875123456,
          "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
          "portal": {
            "address": "10.0.0.1",
            "port": "3260"
          },
          "connection": {
            "automount": false
          }
        }
      ]
    },
    "updatedTarget": {
      "id": 1647875123456,
      "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": {
        "address": "10.0.0.1",
        "port": "3260"
      },
      "connection": {
        "automount": false
      }
    },
    "oldTarget": {
      "id": 1647875123456,
      "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": {
        "address": "10.0.0.1",
        "port": "3260"
      },
      "connection": {
        "automount": false
      }
    },
    "autoLogin": {
      "success": true,
      "message": "Successfully logged in to target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos'",
      "error": "string"
    }
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos-updated","portal":{"address":"10.0.0.2","port":"3260"},"connection":{"automount":true}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos-updated","portal":{"address":"10.0.0.2","port":"3260"},"connection":{"automount":true}})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/iscsi/initiator/targets/{targetId}` {#delete-iscsi-initiator-targets-targetid}

**Remove a target**

Remove an existing target from the initiator configuration (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID to remove |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target removed successfully | object |
| 400 | Invalid target ID | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos' removed successfully",
  "data": {
    "config": {
      "initiator": {
        "name": "iqn.2025-08.why-mos:why"
      },
      "targets": [
        {
          "id": 1647875123456,
          "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
          "portal": {
            "address": "10.0.0.1",
            "port": "3260"
          },
          "connection": {
            "automount": false
          }
        }
      ]
    },
    "removedTarget": {
      "id": 1647875123456,
      "name": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
      "portal": {
        "address": "10.0.0.1",
        "port": "3260"
      },
      "connection": {
        "automount": false
      }
    }
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/initiator/test-connection` {#post-iscsi-initiator-test-connection}

**Test connection to a target**

Test connectivity to an iSCSI target using discovery (admin only)

**Request body** (`application/json`)

```json
{
  "targetIp": "10.0.0.1",
  "targetPort": "3260"
}
```

| Field | Type | Required |
|-------|------|----------|
| targetIp | string — Target IP address to test | **Yes** |
| targetPort | string — Target port to test | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Connection test completed (check success field for result) | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Connection test to 10.0.0.1:3260 successful",
  "data": {
    "targetIp": "10.0.0.1",
    "targetPort": "3260",
    "connected": true,
    "discoveredTargets": [
      {
        "portal": "10.0.0.1:3260,1",
        "iqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos"
      }
    ],
    "error": "string"
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/initiator/test-connection" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"targetIp":"10.0.0.1","targetPort":"3260"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/test-connection", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"targetIp":"10.0.0.1","targetPort":"3260"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/initiator/targets/{targetId}/logout` {#post-iscsi-initiator-targets-targetid-logout}

**Logout from a target**

Logout from an iSCSI target session (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID to logout from |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Logout completed successfully | object |
| 400 | Invalid target ID | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully logged out from target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos'",
  "data": {
    "targetIqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "output": "string",
    "wasLoggedIn": false
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}/logout" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}/logout", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/iscsi/initiator/targets/{targetId}/login` {#post-iscsi-initiator-targets-targetid-login}

**Login to a target**

Login to an iSCSI target session (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| targetId | path | integer | **Yes** | Target ID to login to |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Login completed successfully | object |
| 400 | Invalid target ID | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Target not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully logged in to target 'iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos'",
  "data": {
    "targetIqn": "iqn.2003-01.org.linux-iscsi.chipsserver.x8664:mos",
    "targetPortal": "10.0.0.1:3260",
    "output": "string"
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}/login" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/iscsi/initiator/targets/{targetId}/login", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Docker {#docker}

Docker Container Management.


#### `POST` `/docker/mos/create` {#post-docker-mos-create}

**Create new container from template**

Create a new Docker container from a provided template (admin only)

**Request body** (`application/json`)

```json
{
  "name": "my-nginx",
  "image": "nginx:latest",
  "ports": [
    "80:80",
    "443:443"
  ],
  "volumes": [
    "/host/data:/var/www/html"
  ],
  "environment": [
    "NGINX_HOST=localhost"
  ],
  "restart": "unless-stopped"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Container name | No |
| image | string — Docker image | No |
| ports | array[string] — Port mappings | No |
| volumes | array[string] — Volume mappings | No |
| environment | array[string] — Environment variables | No |
| restart | string — Restart policy | No |
| no_autoupdate | boolean — Whether automatic updates are disabled for this container | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container created successfully | OperationResult |
| 400 | Invalid container template | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container 'my-nginx' created successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/create" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-nginx","image":"nginx:latest","ports":["80:80","443:443"],"volumes":["/host/data:/var/www/html"],"environment":["NGINX_HOST=localhost"],"restart":"unless-stopped"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/create", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"my-nginx","image":"nginx:latest","ports":["80:80","443:443"],"volumes":["/host/data:/var/www/html"],"environment":["NGINX_HOST=localhost"],"restart":"unless-stopped"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/docker/mos/remove` {#delete-docker-mos-remove}

**Remove container and its template**

Remove a Docker container and its associated template (admin only)

**Request body** (`application/json`)

```json
{
  "name": "my-nginx"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Container name to remove | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container removed successfully | OperationResult |
| 400 | Container name is required | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Container not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container 'my-nginx' and template removed successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/docker/mos/remove" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-nginx"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/remove", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"my-nginx"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/containers` {#get-docker-mos-containers}

**Get Docker images with update status**

Retrieve all Docker images/containers with their update availability status (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| performance | query | string [true,false] | No | Include CPU and memory usage (only running containers) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker images retrieved successfully | array[DockerImage] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Containers file not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "nginx",
    "local": "1.20.2",
    "remote": "1.21.0",
    "update_available": true,
    "repository": "library/nginx",
    "index": 1
  },
  {
    "name": "mysql",
    "local": "8.0.28",
    "remote": "8.0.28",
    "update_available": false,
    "repository": "library/mysql",
    "index": 2
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/containers" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/containers", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/containers` {#post-docker-mos-containers}

**Update Docker container indices**

Update the ordering indices for Docker containers (admin only)

**Request body** (`application/json`)

```json
[
  {
    "name": "nginx",
    "index": 2
  },
  {
    "name": "mysql",
    "index": 1
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container indices updated successfully | array[DockerImage] |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Containers file not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "nginx",
    "local": "1.20.2",
    "remote": "1.21.0",
    "update_available": true,
    "repository": "library/nginx",
    "index": 1,
    "performance": {
      "cpu": {
        "usage": 12.5,
        "unit": "%"
      },
      "memory": {
        "bytes": 536870912,
        "formatted": "512 MiB"
      }
    }
  }
]
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/containers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"name":"nginx","index":2},{"name":"mysql","index":1}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/containers", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"name":"nginx","index":2},{"name":"mysql","index":1}])
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/containers/calc` {#get-docker-mos-containers-calc}

**Get container image sizes**

Get a list of all Docker containers with their image names and sizes, sorted by size descending (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container image sizes retrieved successfully | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "Debian-Builder-Bullseye",
    "repository": "git.minenet.at/ich777/debian-builder:bullseye",
    "size": 2295826356,
    "size_human": "2.1 GiB"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/containers/calc" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/containers/calc", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/containers/{name}/calc` {#get-docker-mos-containers-name-calc}

**Get a single container image size**

Get a Docker container with its image name and size (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container image size retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Container not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "name": "Debian-Builder-Bullseye",
  "repository": "git.minenet.at/ich777/debian-builder:bullseye",
  "size": 2295826356,
  "size_human": "2.1 GiB"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/containers/{name}/calc" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/containers/{name}/calc", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/ports` {#get-docker-mos-ports}

**Get Docker container port bindings**

Retrieve all host port bindings from all Docker containers with container name, protocol and status (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Port bindings retrieved successfully | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "port": 80,
    "proto": "tcp",
    "name": "nginx",
    "status": "running"
  },
  {
    "port": 3306,
    "proto": "tcp",
    "name": "mysql",
    "status": "running"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/ports" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/ports", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/update_check` {#post-docker-mos-update-check}

**Check for Docker updates**

Check for available updates for Docker containers (admin only)

**Request body** (`application/json`)

```json
{
  "name": "nginx"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Container name (null for all containers) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Update check completed successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Update check completed for nginx"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/update_check" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/update_check", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"nginx"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/upgrade` {#post-docker-mos-upgrade}

**Upgrade containers**

Upgrade Docker containers to their latest versions (admin only)

**Request body** (`application/json`)

```json
{
  "name": "nginx",
  "force_update": false
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Container name (null for all containers) | No |
| force_update | boolean — Force update even if no new version available | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container upgrade completed successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container nginx upgraded successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/upgrade" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx","force_update":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/upgrade", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"nginx","force_update":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/xml_convert` {#post-docker-mos-xml-convert}

**Convert XML using URL**

Convert XML template from URL to Docker container configuration (admin only)

**Request body** (`application/json`)

```json
{
  "url": "https://raw.githubusercontent.com/user/repo/main/template.xml"
}
```

| Field | Type | Required |
|-------|------|----------|
| url | string — URL to XML template to convert | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | XML converted successfully | XmlConvertResult |
| 400 | URL is required or XML conversion failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "name": "converted-app",
  "message": "XML template converted successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/xml_convert" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://raw.githubusercontent.com/user/repo/main/template.xml"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/xml_convert", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"url":"https://raw.githubusercontent.com/user/repo/main/template.xml"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/templates` {#get-docker-mos-templates}

**Get all container templates (installed and removed)**

Retrieve all Docker container templates with status flags (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All templates retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "installed": [
    "nginx",
    "mysql",
    "redis"
  ],
  "removed": [
    "apache",
    "postgres"
  ],
  "total": 3,
  "installed_count": 2,
  "removed_count": 1,
  "templates": [
    {
      "name": "nginx",
      "filename": "nginx.json",
      "status": "installed",
      "template": {
        "name": "nginx",
        "image": "nginx:latest"
      },
      "created_at": "2024-01-15T10:30:00.000Z",
      "modified_at": "2024-01-15T11:30:00.000Z",
      "file_size": 1024
    },
    {
      "name": "mysql",
      "filename": "mysql.json",
      "status": "removed",
      "template": {
        "name": "mysql",
        "image": "mysql:8.0"
      },
      "removed_at": "2024-01-14T15:45:00.000Z",
      "file_size": 2048
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/templates" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/templates", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/templates/{name}` {#get-docker-mos-templates-name}

**Get specific container template**

Retrieve a specific Docker container template, preferring installed over removed if both exist (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Name of the container template |
| edit | query | boolean | No | If false (default), appends '_new' to the template name in the response. If true, returns original name. |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Template retrieved successfully | object |
| 400 | Template name is required | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Template not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "name": "nginx_new",
  "image": "nginx:latest",
  "ports": [
    "80:80"
  ],
  "restart": "unless-stopped"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/templates/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/templates/{name}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/groups` {#get-docker-mos-groups}

**Get all container groups**

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of container groups | array[ContainerGroup] |
| 401 | Unauthorized | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
[
  {
    "id": "1695384000123",
    "name": "Web Services",
    "index": 1,
    "containers": [
      "nginx",
      "apache"
    ],
    "icon": "web",
    "count": 2,
    "runningCount": 2,
    "update_available": true
  },
  {
    "id": "1695384000456",
    "name": "Database Services",
    "index": 2,
    "containers": [
      "mysql",
      "redis"
    ],
    "icon": "database",
    "count": 2,
    "runningCount": 1,
    "update_available": false
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/groups" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/groups` {#post-docker-mos-groups}

**Create a new container group**

**Request body** (`application/json`)

```json
{
  "name": "Web Services",
  "containers": [
    "nginx",
    "apache"
  ],
  "icon": "https://example.com/logo.png"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Group name | **Yes** |
| containers | array[string] — Array of container names to add to group | No |
| icon | string — Icon identifier (e.g. an MDI name) or an http(s) URL to a PNG. When a URL is provided the PNG is downloaded synchronously (max 5s) to /var/lib/docker/mos/icons/groups/\<groupName\>.png and validated to be a real, non-empty PNG.  | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Group created successfully | ContainerGroup |
| 400 | Bad request | Error |
| 401 | Unauthorized | Error |
| 500 | Internal server error | Error |

Example `201` response:

```json
{
  "id": "1695384000123456789",
  "name": "Web Services",
  "index": 1,
  "containers": [
    "nginx",
    "apache",
    "traefik"
  ],
  "icon": "string",
  "count": 3,
  "runningCount": 2,
  "update_available": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/groups" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Web Services","containers":["nginx","apache"],"icon":"https://example.com/logo.png"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"Web Services","containers":["nginx","apache"],"icon":"https://example.com/logo.png"})
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/docker/mos/groups/{groupId}` {#put-docker-mos-groups-groupid}

**Update container group (name, icon, containers)**

Update any combination of group properties in a single request

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| groupId | path | string | **Yes** | Group ID |

**Request body** (`application/json`)

```json
{
  "name": "Web Servers",
  "icon": "https://example.com/logo.png",
  "containers": [
    "nginx",
    "apache"
  ],
  "addContainers": [
    "redis"
  ],
  "removeContainers": [
    "old-container"
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — New group name | No |
| icon | string — Icon identifier (e.g. an MDI name) or an http(s) URL to a PNG (null to remove icon). When the URL changes the PNG is re-downloaded synchronously (max 5s) to /var/lib/docker/mos/icons/groups/\<groupName\>.png and validated to be a real, non-empty PNG.  | No |
| containers | array[string] — Complete list of containers (replaces existing) | No |
| addContainers | array[string] — Containers to add to existing list | No |
| removeContainers | array[string] — Containers to remove from existing list | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group updated successfully | ContainerGroup |
| 400 | Bad request | Error |
| 404 | Group not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "id": "1695384000123456789",
  "name": "Web Services",
  "index": 1,
  "containers": [
    "nginx",
    "apache",
    "traefik"
  ],
  "icon": "string",
  "count": 3,
  "runningCount": 2,
  "update_available": true
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Web Servers","icon":"https://example.com/logo.png","containers":["nginx","apache"],"addContainers":["redis"],"removeContainers":["old-container"]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"Web Servers","icon":"https://example.com/logo.png","containers":["nginx","apache"],"addContainers":["redis"],"removeContainers":["old-container"]})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/docker/mos/groups/{groupId}` {#delete-docker-mos-groups-groupid}

**Delete a container group**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| groupId | path | string | **Yes** | Group ID to delete |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group deleted successfully | object |
| 401 | Unauthorized | Error |
| 404 | Group not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "message": "Group deleted successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/docker/mos/groups/order` {#put-docker-mos-groups-order}

**Update group order/index**

**Request body** (`application/json`)

```json
[
  {
    "id": "1695384000123456789",
    "index": 1
  },
  {
    "id": "1695384000987654321",
    "index": 2
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group order updated successfully | array[ContainerGroup] |
| 400 | Bad request | Error |
| 401 | Unauthorized | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
[
  {
    "id": "1695384000123456789",
    "name": "Web Services",
    "index": 1,
    "containers": [
      "nginx",
      "apache",
      "traefik"
    ],
    "icon": "string",
    "count": 3,
    "runningCount": 2,
    "update_available": true
  }
]
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/docker/mos/groups/order" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"id":"1695384000123456789","index":1},{"id":"1695384000987654321","index":2}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/order", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"id":"1695384000123456789","index":1},{"id":"1695384000987654321","index":2}])
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/groups/{groupId}/start` {#post-docker-mos-groups-groupid-start}

**Start all containers in a group**

Start all containers that belong to the specified group.
Note: Docker Compose groups are not supported - use the compose API endpoints instead.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| groupId | path | string | **Yes** | Group ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group start operation completed | object |
| 400 | Group is a Docker Compose stack | Error |
| 404 | Group not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "groupId": "1695384000123456789",
  "groupName": "Web Services",
  "totalContainers": 3,
  "successCount": 2,
  "failureCount": 1,
  "results": [
    {
      "container": "nginx",
      "status": "success",
      "message": "Container started successfully"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/start" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/start", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/groups/{groupId}/stop` {#post-docker-mos-groups-groupid-stop}

**Stop all containers in a group**

Stop all containers that belong to the specified group.
Note: Docker Compose groups are not supported - use the compose API endpoints instead.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| groupId | path | string | **Yes** | Group ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group stop operation completed | object |
| 400 | Group is a Docker Compose stack | Error |
| 404 | Group not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "groupId": "1695384000123456789",
  "groupName": "Web Services",
  "totalContainers": 3,
  "successCount": 3,
  "failureCount": 0,
  "results": [
    {
      "container": "nginx",
      "status": "success",
      "message": "Container stopped successfully"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/stop" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/stop", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/groups/{groupId}/restart` {#post-docker-mos-groups-groupid-restart}

**Restart all containers in a group**

Restart all containers that belong to the specified group (stop and start sequentially).
Note: Docker Compose groups are not supported - use the compose API endpoints instead.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| groupId | path | string | **Yes** | Group ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group restart operation completed | object |
| 400 | Group is a Docker Compose stack | Error |
| 404 | Group not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "groupId": "1695384000123456789",
  "groupName": "Web Services",
  "totalContainers": 3,
  "successCount": 3,
  "failureCount": 0,
  "results": [
    {
      "container": "nginx",
      "status": "success",
      "message": "Container restarted successfully"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/restart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/restart", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/groups/{groupId}/upgrade` {#post-docker-mos-groups-groupid-upgrade}

**Upgrade all containers in a group**

Upgrade all containers that belong to the specified group to their latest versions (sequential execution).

**Note:** This endpoint waits for all upgrades to complete before returning. For live streaming output
during the upgrade process, use the WebSocket API with operation: 'upgrade-group'.

**WebSocket Alternative:**
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'upgrade-group',
  params: { groupId: '123', force_update: false }
});
```

**Docker Compose:** Compose groups are not supported - use the compose API endpoints instead.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| groupId | path | string | **Yes** | Group ID |

**Request body** (`application/json`)

```json
{
  "force_update": false
}
```

| Field | Type | Required |
|-------|------|----------|
| force_update | boolean — Force update even if no new version available | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Group upgrade operation completed | object |
| 400 | Group is a Docker Compose stack | Error |
| 404 | Group not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "groupId": "1695384000123456789",
  "groupName": "Web Services",
  "totalContainers": 3,
  "successCount": 2,
  "failureCount": 1,
  "results": [
    {
      "container": "nginx",
      "status": "success",
      "message": "Container upgraded successfully",
      "details": {}
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/upgrade" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force_update":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/groups/{groupId}/upgrade", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"force_update":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/unusedimages` {#get-docker-mos-unusedimages}

**Get unused Docker images**

Get list of Docker images that are not used by any container (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of unused images | array[object] |
| 401 | Unauthorized | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
[
  {
    "repository": "nginx",
    "tag": "1.20.2",
    "id": "a1b2c3d4e5f6",
    "size": "133MB"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/unusedimages" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/unusedimages", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/docker/mos/unusedimages` {#delete-docker-mos-unusedimages}

**Delete unused Docker images**

Delete unused Docker images - all or specific ones by ID (admin only)

**Request body** (`application/json`)

```json
[
  "a1b2c3d4e5f6",
  "b2c3d4e5f6g7"
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Deletion result | object |
| 400 | Bad request | Error |
| 401 | Unauthorized | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Deleted 3 image(s), 0 failed",
  "deleted": [
    {
      "repository": "string",
      "tag": "string",
      "id": "string",
      "size": "string"
    }
  ],
  "failed": [
    {
      "repository": "string",
      "tag": "string",
      "id": "string",
      "size": "string",
      "error": "string"
    }
  ]
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/docker/mos/unusedimages" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '["a1b2c3d4e5f6","b2c3d4e5f6g7"]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/unusedimages", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify(["a1b2c3d4e5f6","b2c3d4e5f6g7"])
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/{path}` {#get-docker-path}

**Docker REST API Proxy (GET)**

Proxy requests to the Docker REST API via Unix socket (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | path | string | **Yes** | Docker API endpoint path |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker API response | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Docker API or proxy error | Error |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/{path}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/{path}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/{path}` {#post-docker-path}

**Docker REST API Proxy (POST)**

Proxy POST requests to the Docker REST API via Unix socket (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | path | string | **Yes** | Docker API endpoint path |

**Request body** (`application/json`)

```json
{}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker API response | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Docker API or proxy error | Error |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/{path}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/{path}", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({})
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/docker/{path}` {#put-docker-path}

**Docker REST API Proxy (PUT)**

Proxy PUT requests to the Docker REST API via Unix socket (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | path | string | **Yes** | Docker API endpoint path |

**Request body** (`application/json`)

```json
{}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker API response | - |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Docker API or proxy error | Error |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/docker/{path}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/{path}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/docker/{path}` {#delete-docker-path}

**Docker REST API Proxy (DELETE)**

Proxy DELETE requests to the Docker REST API via Unix socket (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | path | string | **Yes** | Docker API endpoint path |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker API response | - |
| 204 | Docker API no content response | - |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Docker API or proxy error | Error |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/docker/{path}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/{path}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Docker Compose {#docker-compose}

Docker Compose Stack Management.


#### `GET` `/docker/mos/compose/stacks` {#get-docker-mos-compose-stacks}

**Get all compose stacks**

Retrieve all Docker Compose stacks (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| performance | query | string [true,false] | No | Include CPU and memory usage aggregated per stack (only running containers) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of stacks | array[ComposeStack] |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "name": "wordpress",
    "services": [
      "web",
      "db"
    ],
    "containers": [
      "wordpress_web_1",
      "wordpress_db_1"
    ],
    "iconUrl": "https://example.com/icon.png",
    "running": true
  },
  {
    "name": "nextcloud",
    "services": [
      "app",
      "db",
      "redis"
    ],
    "containers": [
      "nextcloud_app_1",
      "nextcloud_db_1",
      "nextcloud_redis_1"
    ],
    "iconUrl": null,
    "running": false
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/compose/stacks" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks` {#post-docker-mos-compose-stacks}

**Create a new compose stack**

Create and deploy a new Docker Compose stack (admin only)

**Request body** (`application/json`)

```json
{
  "name": "wordpress",
  "yaml": "version: '3.8'\nservices:\n  web:\n    image: wordpress\n  db:\n    image: mysql:8.0\n",
  "env": "MYSQL_ROOT_PASSWORD=secret\nMYSQL_DATABASE=wordpress",
  "icon": "https://example.com/wordpress.png",
  "autostart": false,
  "webui": "http://10.0.0.1:3001",
  "web_ui_url": "http://[IP]:3001"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Stack name (alphanumeric, hyphens, underscores only) | **Yes** |
| yaml | string — compose.yaml content | **Yes** |
| env | string — .env file content (optional) | No |
| icon | string — Icon URL (PNG only, optional) | No |
| autostart | boolean — Whether stack should autostart on system boot (default false) | No |
| webui | string — WebUI URL for the stack (also accepts web_ui_url) | No |
| web_ui_url | string — Alias for webui (webui takes priority if both are provided) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Stack created successfully | object |
| 400 | Invalid request | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `201` response:

```json
{
  "success": true,
  "stack": "wordpress",
  "services": [
    "web",
    "db"
  ],
  "containers": [
    "wordpress_web_1",
    "wordpress_db_1"
  ],
  "iconPath": "/var/lib/docker/mos/icons/compose/wordpress.png"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"wordpress","yaml":"version: '3.8'\nservices:\n  web:\n    image: wordpress\n  db:\n    image: mysql:8.0\n","env":"MYSQL_ROOT_PASSWORD=secret\nMYSQL_DATABASE=wordpress","icon":"https://example.com/wordpress.png","autostart":false,"webui":"http://10.0.0.1:3001","web_ui_url":"http://[IP]:3001"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"wordpress","yaml":"version: '3.8'\nservices:\n  web:\n    image: wordpress\n  db:\n    image: mysql:8.0\n","env":"MYSQL_ROOT_PASSWORD=secret\nMYSQL_DATABASE=wordpress","icon":"https://example.com/wordpress.png","autostart":false,"webui":"http://10.0.0.1:3001","web_ui_url":"http://[IP]:3001"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/compose/stacks/{name}` {#get-docker-mos-compose-stacks-name}

**Get a specific compose stack**

Retrieve details of a specific Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack details | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "name": "string",
  "yaml": "string",
  "env": "string",
  "services": [
    "string"
  ],
  "containers": [
    "string"
  ],
  "iconUrl": "string",
  "running": false
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/docker/mos/compose/stacks/{name}` {#put-docker-mos-compose-stacks-name}

**Update a compose stack**

Update an existing Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Request body** (`application/json`)

```json
{
  "yaml": "version: '3.8'\nservices:\n  web:\n    image: wordpress:latest\n  db:\n    image: mysql:8.0\n",
  "env": "MYSQL_ROOT_PASSWORD=newsecret\nMYSQL_DATABASE=wordpress",
  "icon": "https://example.com/wordpress-new.png",
  "autostart": true,
  "webui": "http://10.0.0.1:3001",
  "web_ui_url": "http://[IP]:3001"
}
```

| Field | Type | Required |
|-------|------|----------|
| yaml | string — New compose.yaml content | **Yes** |
| env | string — New .env file content (optional) | No |
| icon | string — New icon URL (PNG only, optional) | No |
| autostart | boolean — Whether stack should autostart on system boot | No |
| webui | string — WebUI URL for the stack (null to clear, also accepts web_ui_url) | No |
| web_ui_url | string — Alias for webui (webui takes priority if both are provided) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack updated successfully | object |
| 400 | Invalid request | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "stack": "string",
  "services": [
    "string"
  ],
  "containers": [
    "string"
  ],
  "iconPath": "string",
  "autostart": false,
  "webui": "string"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"yaml":"version: '3.8'\nservices:\n  web:\n    image: wordpress:latest\n  db:\n    image: mysql:8.0\n","env":"MYSQL_ROOT_PASSWORD=newsecret\nMYSQL_DATABASE=wordpress","icon":"https://example.com/wordpress-new.png","autostart":true,"webui":"http://10.0.0.1:3001","web_ui_url":"http://[IP]:3001"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"yaml":"version: '3.8'\nservices:\n  web:\n    image: wordpress:latest\n  db:\n    image: mysql:8.0\n","env":"MYSQL_ROOT_PASSWORD=newsecret\nMYSQL_DATABASE=wordpress","icon":"https://example.com/wordpress-new.png","autostart":true,"webui":"http://10.0.0.1:3001","web_ui_url":"http://[IP]:3001"})
});
const data = await res.json();
console.log(data);
```

#### `PATCH` `/docker/mos/compose/stacks/{name}` {#patch-docker-mos-compose-stacks-name}

**Update stack settings**

Update stack settings (like autostart, webui) without redeploying (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Request body** (`application/json`)

```json
{
  "autostart": true,
  "webui": "http://10.0.0.1:3001",
  "web_ui_url": "http://[IP]:3001"
}
```

| Field | Type | Required |
|-------|------|----------|
| autostart | boolean — Whether stack should autostart on system boot | No |
| webui | string — WebUI URL for the stack (null to clear, also accepts web_ui_url) | No |
| web_ui_url | string — Alias for webui (webui takes priority if both are provided) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Settings updated successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "stack": "string",
  "autostart": false,
  "webui": "string"
}
```

**Example request**

```bash
curl -X PATCH "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"autostart":true,"webui":"http://10.0.0.1:3001","web_ui_url":"http://[IP]:3001"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}", {
  method: 'PATCH',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"autostart":true,"webui":"http://10.0.0.1:3001","web_ui_url":"http://[IP]:3001"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/docker/mos/compose/stacks/{name}` {#delete-docker-mos-compose-stacks-name}

**Delete a compose stack**

Stop and delete a Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack deleted successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks/{name}/start` {#post-docker-mos-compose-stacks-name-start}

**Start a compose stack**

Start all services in a Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack started successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "stack": "string",
  "containers": [
    "string"
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/start" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/start", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks/{name}/stop` {#post-docker-mos-compose-stacks-name-stop}

**Stop a compose stack**

Stop all services in a Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack stopped successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "stack": "string",
  "message": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/stop" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/stop", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks/{name}/restart` {#post-docker-mos-compose-stacks-name-restart}

**Restart a compose stack**

Restart all services in a Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack restarted successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "stack": "string",
  "containers": [
    "string"
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/restart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/restart", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks/{name}/pull` {#post-docker-mos-compose-stacks-name-pull}

**Pull images for a compose stack**

Pull latest images for all services in a Docker Compose stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Images pulled successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "stack": "string",
  "output": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/pull" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/pull", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks/{name}/sync-shas` {#post-docker-mos-compose-stacks-name-sync-shas}

**Sync local SHAs to remote SHAs for a compose stack**

Updates the compose-containers file with current local image SHAs after a pull (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SHAs synced successfully | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/sync-shas" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/sync-shas", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/docker/mos/compose/stacks/{name}/upgrade` {#post-docker-mos-compose-stacks-name-upgrade}

**Upgrade a compose stack to latest images**

Pulls latest images and redeploys the stack (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Stack name |

**Request body** (`application/json`)

```json
{
  "force_update": false
}
```

| Field | Type | Required |
|-------|------|----------|
| force_update | boolean — Force update even if no new version available | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Stack upgraded successfully | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Stack not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/upgrade" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force_update":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/stacks/{name}/upgrade", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"force_update":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/compose/templates` {#get-docker-mos-compose-templates}

**Get all compose template names**

Retrieve all Docker Compose template names grouped by installed and removed (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Template names retrieved successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "installed": [
    "wordpress",
    "nextcloud"
  ],
  "removed": [
    "gitea",
    "vaultwarden"
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/compose/templates" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/templates", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/mos/compose/templates/{name}` {#get-docker-mos-compose-templates-name}

**Get specific compose template**

Retrieve a specific Docker Compose template, preferring installed over removed if both exist (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Name of the compose stack template |
| edit | query | boolean | No | If false (default), appends '_new' to the name for installed stacks. If true, returns original name. |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Template retrieved successfully | object |
| 400 | Template name is required | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Template not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "name": "wordpress_new",
  "yaml": "version: '3'\nservices:\n  web:\n    image: wordpress:latest",
  "env": "DB_HOST=db",
  "iconUrl": "https://example.com/icon.png",
  "autostart": false,
  "webui": null,
  "source": "installed"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/mos/compose/templates/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/mos/compose/templates/{name}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Docker WebSocket {#docker-websocket}

Real-time Docker operations via WebSocket.


#### `GET` `/docker/websocket/events` {#get-docker-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time Docker operations.

**Connection:** Connect to WebSocket at `/api/v1/docker` namespace

**Simplified Event System:**

**Events to emit (client → server):**
- `docker` - Start a Docker operation (pull, upgrade, upgrade-group, create, check-updates, compose-create, compose-update, compose-pull, compose-delete, compose-upgrade)
- `docker-cancel` - Cancel an ongoing operation
- `docker-get-operations` - Get list of active operations
- `docker-stats-subscribe` - Subscribe to live container statistics stream
- `docker-stats-unsubscribe` - Unsubscribe from container statistics stream

**Event to listen for (server → client):**
- `docker-update` - **ONE** event for ALL updates (status-based)

**Status values in docker-update:**
- `started` - Operation has started
- `running` - Operation is running (contains `output` field with live data)
- `completed` - Operation completed (contains `success` and `duration`)
- `cancelled` - Operation was cancelled
- `error` - Error occurred (contains `message`)
- `operations-list` - Response to docker-get-operations (contains `operations[]`)

**Example Usage:**

Connect to WebSocket:
```javascript
const socket = io('http://localhost:3000/api/v1/docker', {
  path: '/api/v1/socket.io/'
});
```

Pull a Docker image (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'pull',
  params: { image: 'nginx:latest' }
});
```
Note: Pull is only available via WebSocket (no REST alternative)

Listen for ALL updates with ONE event:
```javascript
socket.on('docker-update', (data) => {
  const { status, operationId, output, message } = data;

  switch(status) {
    case 'started':
      console.log(`Started: ${operationId}`);
      break;
    case 'running':
      console.log('Output:', output); // Live output
      break;
    case 'completed':
      console.log(data.success ? '✓ Success' : '✗ Failed');
      break;
    case 'cancelled':
      console.log('Operation cancelled');
      break;
    case 'error':
      console.error('Error:', message);
      break;
  }
});
```

Upgrade all containers in a group (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'upgrade-group',
  params: {
    groupId: '1695384000123',
    force_update: false
  }
});
```
REST Alternative: `POST /api/v1/docker/mos/groups/{groupId}/upgrade`
(waits for completion, no streaming)

Upgrade a single container (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'upgrade',
  params: { name: 'nginx', force_update: false }
});
```
REST Alternative: `POST /api/v1/docker/mos/upgrade`
(waits for completion, no streaming)

Create a container (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'create',
  params: {
    template: {
      name: 'my-nginx',
      repo: 'nginx:latest',
      ports: [{ host: '8080', container: '80' }],
      // ... full template like REST endpoint
    }
  }
});
```
REST Alternative: `POST /api/v1/docker/mos/create`
(waits for completion, no streaming)

Check for updates (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'check-updates',
  params: { name: 'nginx' } // or omit for all containers
});
```
REST Alternative: `POST /api/v1/docker/mos/update_check`
(waits for completion, no streaming)

**Docker Compose Operations:**

Create a compose stack (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'compose-create',
  params: {
    name: 'my-stack',
    yaml: 'version: "3"\\nservices:\\n  ...',
    env: 'ENV_VAR=value', // optional
    icon: 'https://example.com/icon.png' // optional
  }
});
```
REST Alternative: `POST /api/v1/docker/mos/compose/stacks`
(waits for completion, no streaming)

Update a compose stack (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'compose-update',
  params: {
    name: 'my-stack',
    yaml: 'version: "3"\\nservices:\\n  ...',
    env: 'ENV_VAR=new_value', // optional
    icon: 'https://example.com/new-icon.png' // optional
  }
});
```
REST Alternative: `PUT /api/v1/docker/mos/compose/stacks/{name}`
(waits for completion, no streaming)

Pull images for a compose stack (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'compose-pull',
  params: { name: 'my-stack' }
});
```
REST Alternative: `POST /api/v1/docker/mos/compose/stacks/{name}/pull`
(waits for completion, no streaming)

Delete a compose stack (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'compose-delete',
  params: { name: 'my-stack' }
});
```
REST Alternative: `DELETE /api/v1/docker/mos/compose/stacks/{name}`
(waits for completion, no streaming)

Upgrade a compose stack (with live streaming):
```javascript
socket.emit('docker', {
  token: 'your-jwt-token',
  operation: 'compose-upgrade',
  params: { name: 'my-stack', force_update: false }
});
```
REST Alternative: `POST /api/v1/docker/mos/compose/stacks/{name}/upgrade`
(waits for completion, no streaming)

Subscribe to live container stats (continuous streaming):
```javascript
socket.emit('docker-stats-subscribe', {
  token: 'your-jwt-token',
  params: { name: 'nginx' }
});
```
Note: Stream runs continuously until unsubscribe or disconnect

Listen for stats updates:
```javascript
socket.on('docker-update', (data) => {
  if (data.status === 'running' && data.stats) {
    const { stats } = data;
    // Pre-calculated stats with _human formatting
    console.log('CPU:', stats.cpu_percent + '%');
    console.log('Memory:', stats.memory_usage_human, '/', stats.memory_limit_human, `(${stats.memory_percent}%)`);
    console.log('Network:', stats.network_rx_human, '↓', stats.network_tx_human, '↑', `(${stats.network_total_human} total)`);
    console.log('Block I/O:', stats.block_read_human, 'read', stats.block_write_human, 'write', `(${stats.block_total_human} total)`);
    console.log('PIDs:', stats.pids);
    // Raw byte values: memory_usage, network_rx, block_read, etc.
    // Memory always binary (GiB/MiB), network/block uses user's byte_format preference
    // Stats update every ~1 second
  }
});
```

Unsubscribe from stats stream:
```javascript
socket.emit('docker-stats-unsubscribe', {
  token: 'your-jwt-token',
  operationId: 'stats-nginx-1234567890-abc123'
});
```
Note: All stats streams are automatically stopped on disconnect

Get active operations after reconnect:
```javascript
socket.emit('docker-get-operations', { token: 'your-jwt-token' });

socket.on('docker-update', (data) => {
  if (data.status === 'operations-list') {
    console.log('Active operations:', data.operations);
    // Client is automatically joined to operation rooms
  }
});
```

Cancel an operation:
```javascript
socket.emit('docker-cancel', {
  token: 'your-jwt-token',
  operationId: 'pull-1234567890-abc123'
});
```

**Key Features:**
- Operations run in background (disconnect doesn't kill process)
- Only explicit `docker-cancel` stops the operation
- Multiple clients can watch same operation via rooms
- Reconnect and resume with `docker-get-operations`
- Container stats streams continuously until unsubscribe/disconnect
- Multiple clients can monitor the same container simultaneously


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "events": {}
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/docker/websocket/stats` {#get-docker-websocket-stats}

**Get WebSocket operation statistics**

Get statistics about active Docker operations via WebSocket (Admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket operation statistics | object |
| 401 | Unauthorized | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": false,
  "data": {
    "activeOperations": 0,
    "operations": [
      {
        "operationId": "string",
        "type": "string",
        "operation": "string",
        "duration": 0
      }
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/docker/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/docker/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## LXC {#lxc}

LXC Container Management.


#### `GET` `/lxc/containers` {#get-lxc-containers}

**List all LXC Containers**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| performance | query | string [true,false] | No | Include CPU and memory usage (only running containers, adds ~1s measurement delay) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of all containers | array[Container] |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "web-server",
    "state": "running",
    "autostart": true,
    "ipv4": [
      "192.168.1.100"
    ],
    "ipv6": [
      "::1"
    ]
  },
  {
    "name": "database",
    "state": "stopped",
    "autostart": false,
    "ipv4": [],
    "ipv6": []
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/containers" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/start` {#post-lxc-containers-name-start}

**Start a container**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully started | OperationResult |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error starting container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container web-server successfully started"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/start" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/start", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/stop` {#post-lxc-containers-name-stop}

**Stop a container**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully stopped | OperationResult |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error stopping container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container web-server successfully stopped"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/stop" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/stop", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/restart` {#post-lxc-containers-name-restart}

**Restart a container**

Stops the container, waits 1 second, then starts it again

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully restarted | OperationResult |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error restarting container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container web-server restarted successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/restart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/restart", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/kill` {#post-lxc-containers-name-kill}

**Forcefully stop a container (kill)**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully stopped | OperationResult |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error stopping container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container web-server erfolgreich beendet"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/kill" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/kill", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/freeze` {#post-lxc-containers-name-freeze}

**Freeze (pause) a container**

Pauses all processes in the container. The container must be running.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully frozen | OperationResult |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error freezing container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container web-server frozen successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/freeze" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/freeze", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/unfreeze` {#post-lxc-containers-name-unfreeze}

**Unfreeze (resume) a container**

Resumes all processes in a frozen container.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully unfrozen | OperationResult |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error unfreezing container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container web-server unfrozen successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/unfreeze" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/unfreeze", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/create` {#post-lxc-containers-create}

**Create a new LXC container**

**Request body** (`application/json`)

```json
{
  "name": "my-ubuntu-container",
  "distribution": "ubuntu",
  "release": "xenial",
  "arch": "amd64",
  "autostart": true,
  "description": "My production web server",
  "start_after_creation": true
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully created | OperationResult |
| 400 | Invalid request or container already exists | Error |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error creating container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container my-ubuntu-container created successfully with ubuntu xenial (amd64) and started successfully",
  "autostart": true,
  "description": "My production web server",
  "started": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/create" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-ubuntu-container","distribution":"ubuntu","release":"xenial","arch":"amd64","autostart":true,"description":"My production web server","start_after_creation":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/create", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"my-ubuntu-container","distribution":"ubuntu","release":"xenial","arch":"amd64","autostart":true,"description":"My production web server","start_after_creation":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/images` {#get-lxc-images}

**Get available container images/distributions**

Lists all available distributions, their releases and supported architectures. Data is cached for 1 hour.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Available container images | AvailableImagesResponse |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error fetching available images | Error |

Example `200` response:

```json
{
  "success": true,
  "cached": false,
  "lastUpdated": "2024-01-20T10:30:00.000Z",
  "distributions": {
    "ubuntu": {
      "jammy": {
        "architectures": [
          "amd64"
        ],
        "variants": [
          "cloud",
          "default",
          "desktop"
        ]
      },
      "noble": {
        "architectures": [
          "amd64"
        ],
        "variants": [
          "cloud",
          "default",
          "desktop"
        ]
      }
    },
    "debian": {
      "bookworm": {
        "architectures": [
          "amd64"
        ],
        "variants": [
          "cloud",
          "default"
        ]
      },
      "bullseye": {
        "architectures": [
          "amd64"
        ],
        "variants": [
          "cloud",
          "default"
        ]
      }
    },
    "alpine": {
      "3.20": {
        "architectures": [
          "amd64"
        ],
        "variants": [
          "cloud",
          "default",
          "tinycloud"
        ]
      }
    }
  },
  "filtered": [
    {
      "distribution": "ubuntu",
      "release": "jammy",
      "architecture": "arm64",
      "variant": "cloud"
    },
    {
      "distribution": "ubuntu",
      "release": "jammy",
      "architecture": "armhf",
      "variant": "default"
    },
    {
      "distribution": "debian",
      "release": "bookworm",
      "architecture": "arm64",
      "variant": "cloud"
    },
    {
      "distribution": "alpine",
      "release": "3.20",
      "architecture": "riscv64",
      "variant": null
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/images" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/images", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/containers/{name}/mounts` {#get-lxc-containers-name-mounts}

**List host bind mounts of a container**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of mounts | array[MountEntry] |

Example `200` response:

```json
[
  null
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/mounts` {#post-lxc-containers-name-mounts}

**Add host bind mount(s) to a container**

Appends mounts (single object or array), deduping by source+destination. Applied on next container start.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Request body** (`application/json`)

```json
[
  {
    "source": "/mnt/pool/data",
    "destination": "/mnt/data"
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Resulting list of mounts | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"source":"/mnt/pool/data","destination":"/mnt/data"}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"source":"/mnt/pool/data","destination":"/mnt/data"}])
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/lxc/containers/{name}/mounts` {#put-lxc-containers-name-mounts}

**Replace all host bind mounts of a container**

Replaces the full set of mounts with the provided array. Applied on next container start.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Request body** (`application/json`)

```json
[
  {
    "source": "/mnt/pool/data",
    "destination": "/mnt/data"
  },
  {
    "source": "/mnt/pool/media",
    "destination": "/mnt/media",
    "readonly": true
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Resulting list of mounts | - |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"source":"/mnt/pool/data","destination":"/mnt/data"},{"source":"/mnt/pool/media","destination":"/mnt/media","readonly":true}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"source":"/mnt/pool/data","destination":"/mnt/data"},{"source":"/mnt/pool/media","destination":"/mnt/media","readonly":true}])
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/lxc/containers/{name}/mounts` {#delete-lxc-containers-name-mounts}

**Remove specific host bind mount(s) from a container**

Removes mounts matched by source+destination (single object or array). Applied on next container start.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Request body** (`application/json`)

```json
[
  {
    "source": "/mnt/pool/data",
    "destination": "/mnt/data"
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remaining list of mounts | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"source":"/mnt/pool/data","destination":"/mnt/data"}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/mounts", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"source":"/mnt/pool/data","destination":"/mnt/data"}])
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/lxc/containers/{name}` {#delete-lxc-containers-name}

**Destroy (delete) a container**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |
| force | query | boolean | No | Also delete all snapshots of the container |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container successfully destroyed | OperationResult |
| 400 | Container does not exist or has snapshots (use force=true to delete with snapshots) | Error |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error destroying container | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Container my-ubuntu-container destroyed successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/lxc/containers/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/containers/usage` {#get-lxc-containers-usage}

**Get resource usage for all containers**

Returns detailed resource usage information including CPU percentage, memory usage, and IP addresses for all containers. Data is sorted by container name. CPU and memory data is only collected for running containers.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container resource usage information | array[object] |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error getting container resource usage | Error |

Example `200` response:

```json
[
  {
    "name": "database",
    "state": "running",
    "autostart": true,
    "unprivileged": false,
    "cpu": {
      "usage": 25.5,
      "unit": "%"
    },
    "memory": {
      "bytes": 1073741824,
      "formatted": "1.00 GiB"
    },
    "network": {
      "ipv4": [
        "192.168.1.100"
      ],
      "ipv6": [
        "2001:db8::1"
      ],
      "docker": [
        "172.17.0.2"
      ],
      "all": [
        "192.168.1.100",
        "172.17.0.2",
        "2001:db8::1"
      ]
    }
  },
  {
    "name": "webserver",
    "state": "stopped",
    "autostart": false,
    "unprivileged": true,
    "cpu": {
      "usage": 0,
      "unit": "%"
    },
    "memory": {
      "bytes": 0,
      "formatted": "0 Bytes"
    },
    "network": {
      "ipv4": [],
      "ipv6": [],
      "docker": [],
      "all": []
    }
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/containers/usage" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/usage", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/mos/containers` {#get-lxc-mos-containers}

**Get container startup order**

Retrieves the current startup order, autostart setting, and description for all LXC containers. Containers are sorted by their index value.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container information successfully retrieved | array[object] |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error getting container information | Error |

Example `200` response:

```json
[
  {
    "name": "database",
    "index": 1,
    "autostart": true,
    "description": "MySQL database server"
  },
  {
    "name": "webserver",
    "index": 2,
    "autostart": true,
    "description": "Apache web server"
  },
  {
    "name": "proxy",
    "index": 3,
    "autostart": false,
    "description": null
  },
  {
    "name": "unordered-container",
    "index": null,
    "autostart": false,
    "description": "Test container"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/mos/containers" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/mos/containers", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/mos/containers` {#post-lxc-mos-containers}

**Update container startup order**

Updates the startup order, autostart setting, and/or description for multiple LXC containers. Modifies

**Request body** (`application/json`)

```json
[
  {
    "name": "database",
    "index": 1,
    "autostart": true,
    "description": "MySQL database server"
  },
  {
    "name": "webserver",
    "index": 2,
    "autostart": true,
    "description": "Apache web server"
  },
  {
    "name": "proxy",
    "autostart": false
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container information successfully updated | array[object] |
| 400 | Invalid request data | Error |
| 401 | Not authorized | Error |
| 403 | No admin permission | Error |
| 500 | Error updating container information | Error |

Example `200` response:

```json
[
  {
    "name": "database",
    "index": 1,
    "autostart": true,
    "description": "MySQL database server"
  },
  {
    "name": "webserver",
    "index": 2,
    "autostart": true,
    "description": "Apache web server"
  },
  {
    "name": "proxy",
    "autostart": false
  }
]
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/mos/containers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"name":"database","index":1,"autostart":true,"description":"MySQL database server"},{"name":"webserver","index":2,"autostart":true,"description":"Apache web server"},{"name":"proxy","autostart":false}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/mos/containers", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"name":"database","index":1,"autostart":true,"description":"MySQL database server"},{"name":"webserver","index":2,"autostart":true,"description":"Apache web server"},{"name":"proxy","autostart":false}])
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/backups` {#get-lxc-backups}

**List all containers with their backups**

Returns all containers with their backups. Includes orphaned backups (containers that no longer exist). Containers without backups have an empty backups array.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of containers with their backups | array[object] |

Example `200` response:

```json
[
  {
    "container": "string",
    "orphan": false,
    "backups": [
      {
        "filename": "string",
        "size": 0,
        "size_human": "string",
        "created": "string"
      }
    ]
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/backups" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/backups", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/containers/{name}/backups` {#get-lxc-containers-name-backups}

**List backups for a specific container**

Returns backups for a specific container. Returns empty array if no backups exist.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of backups for the container (empty array if no backups) | array[object] |

Example `200` response:

```json
[
  {
    "filename": "string",
    "size": 0,
    "size_human": "string",
    "created": "string"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/containers/{name}/backups" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/backups", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/backups` {#post-lxc-containers-name-backups}

**Create a backup of a container**

Starts an async backup operation. Container will be stopped during backup (unless use_snapshot is enabled).

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Request body** (`application/json`)

```json
{
  "use_snapshot": false,
  "compression": 0,
  "threads": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| use_snapshot | boolean — Use snapshot for faster container restart | No |
| compression | integer — Compression level (7-9 requires 12GB+ RAM) | No |
| threads | integer — Number of threads (0 = auto) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Backup started | object |
| 400 | Backup already in progress or container not found | - |
| 500 | Error starting backup | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string",
  "backup_file": "string",
  "use_snapshot": false,
  "was_running": false
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/backups" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"use_snapshot":false,"compression":0,"threads":0}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/backups", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"use_snapshot":false,"compression":0,"threads":0})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/backups/abort` {#post-lxc-containers-name-backups-abort}

**Abort an active backup operation**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Abort signal sent | - |
| 400 | No active operation for container | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/backups/abort" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/backups/abort", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/lxc/containers/{name}/backups/{filename}` {#delete-lxc-containers-name-backups-filename}

**Delete a specific backup file**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |
| filename | path | string | **Yes** | Backup filename |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Backup deleted | - |
| 400 | Backup not found | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/lxc/containers/{name}/backups/{filename}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/backups/{filename}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/backups/restore` {#post-lxc-containers-name-backups-restore}

**Restore a container from backup**

Starts an async restore operation. If new_name matches existing container, it will be replaced.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Source container name (for backup lookup) |

**Request body** (`application/json`)

```json
{
  "backup_file": "string",
  "new_name": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| backup_file | string — Backup filename to restore | **Yes** |
| new_name | string — Name for the restored container | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Restore started | - |
| 400 | Invalid parameters or backup not found | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/backups/restore" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"backup_file":"string","new_name":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/backups/restore", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"backup_file":"string","new_name":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/convert-btrfs` {#post-lxc-containers-name-convert-btrfs}

**Convert container rootfs to BTRFS subvolume**

Converts a dir-based container to use a BTRFS subvolume. LXC directory must be on BTRFS filesystem.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Conversion started | - |
| 400 | Already BTRFS or not on BTRFS filesystem | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/convert-btrfs" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/convert-btrfs", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/snapshots` {#get-lxc-snapshots}

**List all containers with their snapshots**

Returns all containers with their snapshots. Containers without snapshots have an empty snapshots array.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of containers with their snapshots | array[object] |

Example `200` response:

```json
[
  {
    "container": "string",
    "snapshots": [
      {
        "name": "string",
        "timestamp": "string",
        "size": 0,
        "size_human": "string"
      }
    ]
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/snapshots" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/snapshots", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/containers/{name}/snapshots` {#get-lxc-containers-name-snapshots}

**List all snapshots for a container**

Returns snapshots for a specific container. Returns empty array if no snapshots exist.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of snapshots for the container (empty array if no snapshots) | array[object] |

Example `200` response:

```json
[
  {
    "name": "string",
    "timestamp": "string",
    "size": 0,
    "size_human": "string"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/snapshots` {#post-lxc-containers-name-snapshots}

**Create a snapshot of a container**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Snapshot created | - |
| 400 | Container not found or operation in progress | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/lxc/containers/{name}/snapshots/{snapshot}` {#delete-lxc-containers-name-snapshots-snapshot}

**Delete a snapshot**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |
| snapshot | path | string | **Yes** | Snapshot name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Snapshot deleted | - |
| 400 | Snapshot not found or operation in progress | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots/{snapshot}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots/{snapshot}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/snapshots/{snapshot}/restore` {#post-lxc-containers-name-snapshots-snapshot-restore}

**Restore container from a snapshot**

Restores the container to the state of the specified snapshot. Container will be stopped during restore.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container name |
| snapshot | path | string | **Yes** | Snapshot name to restore |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Restore started | - |
| 400 | Snapshot not found or operation in progress | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots/{snapshot}/restore" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots/{snapshot}/restore", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/lxc/containers/{name}/snapshots/{snapshot}/clone` {#post-lxc-containers-name-snapshots-snapshot-clone}

**Create a new container from a snapshot**

Creates a new container based on the specified snapshot.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Source container name |
| snapshot | path | string | **Yes** | Snapshot name to clone from |

**Request body** (`application/json`)

```json
{
  "new_name": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| new_name | string — Name for the new container | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Clone started | - |
| 400 | Invalid parameters or operation in progress | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots/{snapshot}/clone" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"new_name":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/snapshots/{snapshot}/clone", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"new_name":"string"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/containers/{name}/calc` {#get-lxc-containers-name-calc}

**Calculate container rootfs size**

Recursively calculates the total size of a container's rootfs and returns it in human-readable format based on user byte_format preference (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Container Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Container rootfs size calculated successfully | object |
| 400 | Container does not exist or path is invalid | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "path": "/var/lib/lxc/my-ubuntu-container/rootfs",
  "size": 1073741824,
  "size_human": "1.0 GiB"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/containers/{name}/calc" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/containers/{name}/calc", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## LXC WebSocket {#lxc-websocket}

Real-time LXC container monitoring via WebSocket.


#### `GET` `/lxc/websocket/events` {#get-lxc-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time LXC container usage monitoring.

**Connection:** Connect to WebSocket at `/api/v1/lxc` namespace

**Events to emit (client → server):**

- `subscribe-container-usage`: Subscribe to container usage updates (all or single via `name` param)
- `unsubscribe-container-usage`: Unsubscribe from container usage updates
- `get-container-usage`: Get immediate container usage data (one-time)
- `get-lxc-containers`: Get all containers with full details (one-time, like GET /lxc/containers)

**Events to listen for (server → client):**

- `container-usage-update`: Real-time container usage data (every ~2s)
- `lxc-containers-update`: Full container details (response to get-lxc-containers)
- `container-usage-subscription-confirmed`: Subscription confirmation
- `container-usage-unsubscription-confirmed`: Unsubscription confirmation
- `error`: General error messages

**Example Usage:**

Connect to WebSocket:
```javascript
const socket = io('http://localhost:3000/api/v1/lxc', {
  path: '/api/v1/socket.io/'
});
```

Subscribe to all containers:
```javascript
socket.emit('subscribe-container-usage', { token: 'your-jwt-token' });
```

Subscribe to single container:
```javascript
socket.emit('subscribe-container-usage', { token: 'your-jwt-token', name: 'webserver' });
```

Listen for updates:
```javascript
socket.on('container-usage-update', (data) => {
  console.log('Container usage:', data.containers);
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "namespace": "/api/v1/lxc",
  "events": {}
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/lxc/websocket/stats` {#get-lxc-websocket-stats}

**Get LXC WebSocket statistics**

Returns current statistics for the LXC container usage WebSocket

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket statistics | object |
| 503 | LXC WebSocket manager not initialized | - |

Example `200` response:

```json
{
  "activeSubscriptions": 3,
  "clientCount": 5,
  "subscription": {
    "interval": 2000,
    "isActive": true
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/lxc/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/lxc/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## VM {#vm}

Virtual Machine Management with libvirt/QEMU.


#### `GET` `/vm/machines` {#get-vm-machines}

**List all virtual machines**

Retrieve a list of all virtual machines with their status, disk information and VNC ports (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| performance | query | string [true,false] | No | Include CPU and memory usage (only running VMs, adds ~1s measurement delay) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of all virtual machines retrieved successfully | array[VirtualMachine] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "ubuntu-server",
    "state": "running",
    "disks": [
      {
        "target": "vda",
        "source": "/var/lib/libvirt/images/ubuntu-server.qcow2"
      }
    ],
    "vncPort": 5900,
    "autostart": true
  },
  {
    "name": "windows-10",
    "state": "stopped",
    "disks": [
      {
        "target": "vda",
        "source": "/var/lib/libvirt/images/windows.qcow2"
      },
      {
        "target": "vdb",
        "source": "/var/lib/libvirt/images/data.qcow2"
      }
    ],
    "vncPort": null,
    "autostart": false
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machines" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/machines` {#post-vm-machines}

**Create a new virtual machine**

Create a new VM with the specified configuration. Disks are automatically created if they don't exist and a size is specified.

**Request body** (`application/json`)

```json
{
  "name": "string",
  "icon": "windows10",
  "description": "Gaming VM",
  "memory": "4G",
  "cpus": 1,
  "cpuPins": [
    0,
    10,
    2,
    12
  ],
  "hugepages": false,
  "platform": "q35",
  "bios": "ovmf",
  "disks": [
    {
      "type": "virtio",
      "source": "string",
      "size": "string",
      "format": "qcow2",
      "boot_order": 0
    }
  ],
  "cdroms": [
    {
      "source": "string",
      "bus": "sata",
      "boot_order": 0
    }
  ],
  "networks": [
    {
      "type": "bridge",
      "source": "string",
      "model": "virtio",
      "mac": "string"
    }
  ],
  "graphics": {
    "type": "vnc",
    "port": null,
    "listen": "0.0.0.0"
  },
  "hostdevices": [
    {
      "address": "0000:01:00.0"
    }
  ],
  "usbdevices": [
    {
      "vendor": "0x8564",
      "product": "0x1000"
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — VM name (letters, numbers, underscores, hyphens only) | **Yes** |
| icon | string — Icon name (without .png extension) from /var/lib/os_icons | No |
| description | string — Optional description for the VM | No |
| memory | string — Memory size. Supports units like "4G", "4GB", "4GiB", "512M", "512MB" or plain number in MiB | No |
| cpus | integer — Number of vCPUs | No |
| cpuPins | array[integer] — Host CPU cores to pin each vCPU to (e.g., [0, 10, 2, 12] pins vCPU0-\>core0, vCPU1-\>core10, etc.) | No |
| hugepages | boolean — Use hugepages for this VM's memory. Requires hugepages to be enabled and allocated in VM system settings. | No |
| platform | string — Machine type - use 'i440fx' or 'q35' for latest version, or specific like 'pc-q35-9.2'. Note - q35 is recommended for modern systems. | No |
| bios | string ["seabios","ovmf","ovmf-tpm"] — BIOS type. Note - q35 platform should use 'ovmf' or 'ovmf-tpm', not seabios. Use seabios only with i440fx. | No |
| disks | array[object] — Disks are auto-created if source doesn't exist and size is provided | No |
| cdroms | array[object] — CD-ROM/ISO drives | No |
| networks | array[object] | No |
| graphics | object | No |
| hostdevices | array[object] — PCI passthrough devices | No |
| usbdevices | array[object] — USB passthrough devices | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM created successfully | - |
| 400 | Invalid configuration | - |
| 500 | Failed to create VM | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/machines" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","icon":"windows10","description":"Gaming VM","memory":"4G","cpus":1,"cpuPins":[0,10,2,12],"hugepages":false,"platform":"q35","bios":"ovmf","disks":[{"type":"virtio","source":"string","size":"string","format":"qcow2","boot_order":0}],"cdroms":[{"source":"string","bus":"sata","boot_order":0}],"networks":[{"type":"bridge","source":"string","model":"virtio","mac":"string"}],"graphics":{"type":"vnc","port":null,"listen":"0.0.0.0"},"hostdevices":[{"address":"0000:01:00.0"}],"usbdevices":[{"vendor":"0x8564","product":"0x1000"}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"string","icon":"windows10","description":"Gaming VM","memory":"4G","cpus":1,"cpuPins":[0,10,2,12],"hugepages":false,"platform":"q35","bios":"ovmf","disks":[{"type":"virtio","source":"string","size":"string","format":"qcow2","boot_order":0}],"cdroms":[{"source":"string","bus":"sata","boot_order":0}],"networks":[{"type":"bridge","source":"string","model":"virtio","mac":"string"}],"graphics":{"type":"vnc","port":null,"listen":"0.0.0.0"},"hostdevices":[{"address":"0000:01:00.0"}],"usbdevices":[{"vendor":"0x8564","product":"0x1000"}]})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/machines/usage` {#get-vm-machines-usage}

**Get resource usage for all VMs**

Returns CPU usage (%) and memory usage (GiB) for all VMs. Running VMs show actual usage from cgroup2, stopped VMs show 0 values. Takes ~1 second to measure CPU if any VM is running.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM resource usage for all VMs | array[object] |
| 500 | Failed to get VM usage | - |

Example `200` response:

```json
[
  {
    "name": "windows-10",
    "state": "running",
    "cpu": {
      "usage": 25.3,
      "unit": "%"
    },
    "memory": {
      "bytes": 4294967296,
      "formatted": "4.00 GiB"
    }
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machines/usage" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/usage", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/machines/{name}/start` {#post-vm-machines-name-start}

**Start a virtual machine**

Start a stopped virtual machine by name (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Virtual machine started successfully | VmOperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error starting virtual machine | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "VM ubuntu-server started successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/machines/{name}/start" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/start", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/machines/{name}/stop` {#post-vm-machines-name-stop}

**Stop a virtual machine (graceful shutdown)**

Gracefully shutdown a running virtual machine by sending ACPI shutdown signal (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Virtual machine shutdown initiated successfully | VmOperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error stopping virtual machine | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "VM ubuntu-server shutdown initiated"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/machines/{name}/stop" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/stop", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/machines/{name}/kill` {#post-vm-machines-name-kill}

**Kill a virtual machine (force stop)**

Forcefully terminate a running virtual machine without graceful shutdown (admin only). Use this when normal stop doesn't work.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Virtual machine killed successfully | VmOperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error killing virtual machine | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "VM ubuntu-server killed successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/machines/{name}/kill" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/kill", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/machines/{name}/restart` {#post-vm-machines-name-restart}

**Restart a virtual machine (graceful reboot)**

Gracefully reboot a running virtual machine by sending ACPI reboot signal (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Virtual machine restart initiated successfully | VmOperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error restarting virtual machine | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "VM ubuntu-server restart initiated"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/machines/{name}/restart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/restart", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/machines/{name}/reset` {#post-vm-machines-name-reset}

**Reset a virtual machine (hard reset)**

Forcefully reset a running virtual machine without graceful shutdown, like pressing the reset button (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Virtual machine reset successfully | VmOperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error resetting virtual machine | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "VM ubuntu-server reset successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/machines/{name}/reset" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/reset", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/machines/{name}/autostart` {#get-vm-machines-name-autostart}

**Get autostart status of a virtual machine**

Retrieve whether a virtual machine is configured to start automatically on system boot (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Autostart status retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error retrieving autostart status | Error |

Example `200` response:

```json
{
  "vmName": "ubuntu-server",
  "autostart": true
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machines/{name}/autostart" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/autostart", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/vm/machines/{name}/autostart` {#put-vm-machines-name-autostart}

**Set autostart status for a virtual machine**

Enable or disable automatic startup of a virtual machine on system boot (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Virtual machine name |

**Request body** (`application/json`)

```json
{
  "enabled": true
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean — Enable or disable autostart | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Autostart status updated successfully | object |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Error setting autostart status | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Autostart enabled for VM ubuntu-server",
  "autostart": true
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/vm/machines/{name}/autostart" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/autostart", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/machinetypes` {#get-vm-machinetypes}

**Get available QEMU machine types**

Returns list of available machine types (pc-i440fx and pc-q35 only).
Sorted with i440fx alias first, then i440fx versions descending, then q35 alias, then q35 versions descending.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available QEMU machine types | array[object] |

Example `200` response:

```json
[
  {
    "name": "i440fx",
    "description": "Standard PC (i440FX + PIIX, 1996) (alias of pc-i440fx-10.1)"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machinetypes" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machinetypes", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/capabilities` {#get-vm-capabilities}

**Get VM capabilities**

Returns available BIOS types, disk options, network options, and machine types

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM capabilities and available resources | object |

Example `200` response:

```json
{
  "hugepages": true,
  "qemuPath": "/usr/bin/qemu-system-x86_64",
  "libvirtPath": "/etc/libvirt/qemu",
  "biosTypes": [
    "seabios",
    "ovmf",
    "ovmf-tpm"
  ],
  "biosFiles": {},
  "diskBuses": [
    "virtio",
    "sata",
    "usb",
    "scsi",
    "ide"
  ],
  "diskFormats": [
    "qcow2",
    "raw"
  ],
  "networkTypes": [
    "bridge",
    "macvtap",
    "network"
  ],
  "networkModels": [
    "virtio",
    "e1000",
    "rtl8139"
  ],
  "graphicsTypes": [
    "vnc",
    "spice",
    "none"
  ],
  "machines": [
    null
  ],
  "networks": {
    "bridges": [
      "br0",
      "docker0"
    ],
    "libvirtNetworks": [
      "default"
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/capabilities" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/capabilities", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/binfmt_architectures` {#get-vm-binfmt-architectures}

**Get available binfmt architectures**

Returns a list of available architectures for binfmt_misc emulation.
These are determined by installed qemu-*-static binaries in /usr/bin.
Use these values in the binfmt_architectures field when updating system settings.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available binfmt architectures | array[string] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  "aarch64",
  "arm",
  "riscv64",
  "x86_64"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/binfmt_architectures" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/binfmt_architectures", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/vm/machines/{name}` {#delete-vm-machines-name}

**Delete a virtual machine**

Delete a VM and optionally remove its disk files. NVRAM is kept by default to preserve TPM/UEFI state.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |
| removeDisks | query | boolean | No | Whether to remove associated disk files |
| removeNvram | query | boolean | No | Whether to remove NVRAM (default false - keeps NVRAM for TPM/UEFI VMs) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM deleted successfully | - |
| 500 | Failed to delete VM | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/vm/machines/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/index` {#get-vm-index}

**Get VM index**

Returns the synchronized VM index with name, index, icon and description for each VM

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM index retrieved successfully | array[object] |
| 500 | Failed to get VM index | - |

Example `200` response:

```json
[
  {
    "name": "windows-10",
    "index": 1,
    "icon": "windows10",
    "description": "Gaming VM"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/index" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/index", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/vm/index` {#put-vm-index}

**Update VM index**

Update index, icon and/or description for one or more VMs

**Request body** (`application/json`)

```json
[
  {
    "name": "windows-10",
    "index": 2,
    "icon": "windows10"
  },
  {
    "name": "ubuntu-server",
    "index": 1,
    "description": "Web Server"
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM index updated successfully | array[object] |
| 400 | Invalid request body | - |
| 500 | Failed to update VM index | - |

Example `200` response:

```json
[
  {
    "name": "string",
    "index": 0,
    "icon": "string",
    "description": "string"
  }
]
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/vm/index" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"name":"windows-10","index":2,"icon":"windows10"},{"name":"ubuntu-server","index":1,"description":"Web Server"}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/index", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"name":"windows-10","index":2,"icon":"windows10"},{"name":"ubuntu-server","index":1,"description":"Web Server"}])
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/machines/{name}/xml` {#get-vm-machines-name-xml}

**Get raw VM XML**

Returns the libvirt XML configuration for a VM wrapped in JSON

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM XML wrapped in JSON | object |

Example `200` response:

```json
{
  "xml": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machines/{name}/xml" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/xml", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/vm/machines/{name}/xml` {#put-vm-machines-name-xml}

**Update VM XML directly**

Replace the VM's XML configuration. VM must be stopped.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |
| validate | query | boolean | No | Whether to validate XML before applying |

**Request body** (`application/json`)

```json
{
  "xml": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| xml | string — The VM XML configuration | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | XML updated successfully | - |
| 400 | VM is running or XML is invalid | - |
| 500 | Failed to update XML | - |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/vm/machines/{name}/xml" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"xml":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/xml", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"xml":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/xml/validate` {#post-vm-xml-validate}

**Validate VM XML**

Validate XML without applying it

**Request body** (`application/json`)

```json
{
  "xml": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| xml | string — The VM XML to validate | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Validation result | object |

Example `200` response:

```json
{
  "valid": false,
  "message": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/xml/validate" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"xml":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/xml/validate", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"xml":"string"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/machines/{name}/config` {#get-vm-machines-name-config}

**Get simplified VM configuration**

Returns parsed VM configuration in a simplified format

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Simplified VM configuration | - |

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machines/{name}/config" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/config", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/vm/machines/{name}/config` {#put-vm-machines-name-config}

**Update VM with simplified configuration**

Update VM configuration using simplified format. VM must be stopped.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** |  |

**Request body** (`application/json`)

```json
{
  "memory": 0,
  "cpus": 0,
  "hugepages": false,
  "platform": "string",
  "bios": "string",
  "disks": [
    null
  ],
  "networks": [
    null
  ],
  "graphics": {}
}
```

| Field | Type | Required |
|-------|------|----------|
| memory | integer | No |
| cpus | integer | No |
| hugepages | boolean — Use hugepages for this VM's memory | No |
| platform | string | No |
| bios | string | No |
| disks | array[-] | No |
| networks | array[-] | No |
| graphics | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration updated successfully | - |
| 500 | Failed to update configuration | - |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/vm/machines/{name}/config" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"memory":0,"cpus":0,"hugepages":false,"platform":"string","bios":"string","disks":[null],"networks":[null],"graphics":{}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/config", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"memory":0,"cpus":0,"hugepages":false,"platform":"string","bios":"string","disks":[null],"networks":[null],"graphics":{}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/machines/{name}/calc` {#get-vm-machines-name-calc}

**Calculate VM disk sizes**

Calculates the total disk usage for a VM, including all attached disks (file-based and block devices). File-based disks use actual (sparse-aware) size. CD-ROMs are excluded.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | VM Name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM disk sizes calculated successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | VM does not exist | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "disks": [
    {
      "path": "/var/lib/libvirt/images/my-vm-disk1.qcow2",
      "size": 1073741824,
      "size_human": "1.0 GiB",
      "type": "file",
      "format": "qcow2",
      "target": "vda"
    }
  ],
  "total_size": 1073741824,
  "total_size_human": "1.0 GiB"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/machines/{name}/calc" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/machines/{name}/calc", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/virtioiso/versions` {#get-vm-virtioiso-versions}

**Get available VirtIO ISO versions**

Fetches the list of all available VirtIO driver versions from the Fedora archive

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available VirtIO versions | array[string] |
| 500 | Failed to fetch versions | - |

Example `200` response:

```json
[
  "0.1.285-1",
  "0.1.271-1",
  "0.1.266-1"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/virtioiso/versions" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/virtioiso/versions", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/virtioiso/installed` {#get-vm-virtioiso-installed}

**Get installed VirtIO ISOs**

Lists all VirtIO driver ISOs that are currently installed

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of installed VirtIO versions | array[string] |
| 500 | Failed to get installed versions | - |

Example `200` response:

```json
[
  "0.1.271-1",
  "0.1.266-1"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/virtioiso/installed" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/virtioiso/installed", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/virtioiso/download` {#post-vm-virtioiso-download}

**Download a VirtIO ISO**

Starts a background download of the specified VirtIO driver version. A notification is sent when complete.

**Request body** (`application/json`)

```json
{
  "version": "0.1.271-1"
}
```

| Field | Type | Required |
|-------|------|----------|
| version | string — VirtIO version to download | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Download started | object |
| 400 | Invalid version or already installed | - |
| 500 | Failed to start download | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string",
  "version": "string",
  "path": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/virtioiso/download" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"version":"0.1.271-1"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/virtioiso/download", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"version":"0.1.271-1"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/virtioiso/cleanup` {#post-vm-virtioiso-cleanup}

**Cleanup old VirtIO ISOs**

Deletes all installed VirtIO ISOs except the newest version

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cleanup completed | object |
| 500 | Failed to cleanup | - |

Example `200` response:

```json
{
  "success": false,
  "message": "string",
  "kept": "string",
  "deleted": [
    "string"
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/virtioiso/cleanup" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/virtioiso/cleanup", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/vm/vnc/token` {#post-vm-vnc-token}

**Generate VNC access token**

Generates a short-lived token for WebSocket VNC connection to a running VM

**Request body** (`application/json`)

```json
{
  "vmName": "ubuntu-server"
}
```

| Field | Type | Required |
|-------|------|----------|
| vmName | string — Name of the running VM | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VNC token generated successfully | object |
| 400 | VM name required or VM not running | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "token": "a1b2c3d4e5f6...",
  "wsPath": "/api/v1/vm/vnc/ws/a1b2c3d4e5f6..."
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/vm/vnc/token" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"vmName":"ubuntu-server"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/vnc/token", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"vmName":"ubuntu-server"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/vnc/sessions` {#get-vm-vnc-sessions}

**Get active VNC sessions**

Returns all active VNC sessions (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Active VNC sessions | object |

Example `200` response:

```json
{
  "success": false,
  "sessions": [
    {
      "tokenPrefix": "a1b2c3d4...",
      "vmName": "string",
      "userId": "string",
      "connected": false,
      "createdAt": 0,
      "connectedAt": 0
    }
  ],
  "counts": {}
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/vnc/sessions" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/vnc/sessions", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## VM WebSocket {#vm-websocket}

Real-time VM monitoring via WebSocket.


#### `GET` `/vm/websocket/stats` {#get-vm-websocket-stats}

**Get VM WebSocket statistics**

Returns current statistics for the VM usage WebSocket

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket statistics | object |
| 401 | Unauthorized | - |
| 500 | VM WebSocket manager not initialized or error | - |

Example `200` response:

```json
{
  "success": true,
  "data": {
    "activeSubscriptions": 3,
    "clientCount": 5,
    "subscription": {
      "interval": 2000,
      "isActive": true
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/vm/websocket/events` {#get-vm-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time VM usage monitoring.

**Connection:** Connect to WebSocket at `/api/v1/vm` namespace

**Events to emit (client → server):**

- `subscribe-vm-usage`: Subscribe to VM usage updates (all VMs or single VM via `name` param)
- `unsubscribe-vm-usage`: Unsubscribe from VM usage updates
- `get-vm-usage`: Get immediate VM usage data (one-time)
- `get-vm-machines`: Get all VMs with full details (one-time, like GET /vm/machines)

**Events to listen for (server → client):**

- `vm-usage-update`: Real-time VM usage data (every ~2s, includes 1s CPU measurement)
- `vm-machines-update`: Full VM details (response to get-vm-machines)
- `vm-usage-subscription-confirmed`: Subscription confirmation
- `vm-usage-unsubscription-confirmed`: Unsubscription confirmation
- `error`: General error messages

**Example Usage:**

Connect to WebSocket:
```javascript
const socket = io('http://localhost:3000/api/v1/vm', {
  path: '/api/v1/socket.io/'
});
```

Subscribe to VM usage updates:
```javascript
socket.emit('subscribe-vm-usage', {
  token: 'your-jwt-token'
});
```

Listen for updates:
```javascript
socket.on('vm-usage-update', (data) => {
  data.vms.forEach(vm => {
    console.log(`${vm.name}: ${vm.state}`);
    if (vm.state === 'running') {
      console.log(`  CPU: ${vm.cpu.usage}%`);
      console.log(`  RAM: ${vm.memory.formatted}`);
    }
  });
});
```

Unsubscribe:
```javascript
socket.emit('unsubscribe-vm-usage', {
  token: 'your-jwt-token'
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "events": {
    "client_to_server": [
      {}
    ],
    "server_to_client": [
      {}
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/vm/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/vm/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Users {#users}

SMB Users and System User Management.


#### `PUT` `/users/root` {#put-users-root}

**Change root password**

Change the password for the system root user (admin only)

**Request body** (`application/json`)

```json
{
  "password": "newrootpassword123"
}
```

| Field | Type | Required |
|-------|------|----------|
| password | string — New password (minimum 4 characters) | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Root password changed successfully | OperationResult |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Root password changed successfully"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/users/root" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"password":"newrootpassword123"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users/root", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"password":"newrootpassword123"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/users` {#get-users}

**Get users (admin sees all, user sees only themselves)**

Retrieve users - admins can see all users, normal users only see their own profile (both return arrays)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | User data retrieved successfully | array[User] |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": "123",
    "username": "admin",
    "role": "admin",
    "language": "en",
    "primary_color": "#607d8b",
    "darkmode": false,
    "byte_format": "binary",
    "samba_user": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/users" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/users/me` {#get-users-me}

**Get own user profile**

Retrieve the authenticated user's own profile information

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Own user profile retrieved successfully | User |
| 401 | Not authenticated | Error |
| 404 | User not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "id": "1",
  "username": "testuser",
  "role": "user",
  "language": "en",
  "primary_color": "#607d8b",
  "darkmode": false,
  "hide_inactive_menus": true,
  "group_menus": false
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/users/me" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users/me", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/users/me` {#put-users-me}

**Update own user profile**

Update the authenticated user's own profile (limited fields for normal users)

**Request body** (`application/json`)

```json
{
  "language": "de",
  "primary_color": "#2196f3",
  "darkmode": true,
  "byte_format": "binary",
  "hide_inactive_menus": true,
  "group_menus": false,
  "password": "newpassword123"
}
```

| Field | Type | Required |
|-------|------|----------|
| language | string — User language preference | No |
| primary_color | string — Primary color theme | No |
| darkmode | boolean — Dark mode preference | No |
| byte_format | string ["binary","decimal"] — Byte format preference for displaying file sizes | No |
| hide_inactive_menus | boolean — Hide inactive menus | No |
| group_menus | boolean — Group menus | No |
| password | string — New password (minimum 4 characters) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Profile updated successfully | User |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 404 | User not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "id": "123",
  "username": "admin",
  "role": "admin",
  "language": "en",
  "primary_color": "#607d8b",
  "darkmode": false,
  "byte_format": "binary",
  "samba_user": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/users/me" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"language":"de","primary_color":"#2196f3","darkmode":true,"byte_format":"binary","hide_inactive_menus":true,"group_menus":false,"password":"newpassword123"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users/me", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"language":"de","primary_color":"#2196f3","darkmode":true,"byte_format":"binary","hide_inactive_menus":true,"group_menus":false,"password":"newpassword123"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/users/{id}` {#get-users-id}

**Get specific user (admin only)**

Retrieve information about a specific user by ID (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | User ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | User information retrieved successfully | User |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | User not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "id": "123",
  "username": "admin",
  "role": "admin",
  "language": "en",
  "primary_color": "#607d8b",
  "darkmode": false,
  "byte_format": "binary",
  "samba_user": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/users/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users/{id}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/users/{id}` {#put-users-id}

**Update user (admin only for other users)**

Update user information - admins can update any user, normal users redirected to /users/me

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | User ID |

**Request body** (`application/json`)

```json
{
  "username": "string",
  "role": "admin",
  "language": "string",
  "primary_color": "string",
  "darkmode": false,
  "byte_format": "binary",
  "password": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| username | string — Username (admin only) | No |
| role | string ["admin","user"] — User role (admin only) | No |
| language | string — User language preference | No |
| primary_color | string — Primary color theme | No |
| darkmode | boolean — Dark mode preference | No |
| byte_format | string ["binary","decimal"] — Byte format preference for displaying file sizes | No |
| password | string — New password (minimum 4 characters) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | User updated successfully | User |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | No permission to update this user | Error |
| 404 | User not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "id": "123",
  "username": "admin",
  "role": "admin",
  "language": "en",
  "primary_color": "#607d8b",
  "darkmode": false,
  "byte_format": "binary",
  "samba_user": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/users/{id}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"string","role":"admin","language":"string","primary_color":"string","darkmode":false,"byte_format":"binary","password":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users/{id}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"username":"string","role":"admin","language":"string","primary_color":"string","darkmode":false,"byte_format":"binary","password":"string"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/users/{id}` {#delete-users-id}

**Delete user (admin only)**

Delete a specific user from the system (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | User ID to delete |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | User deleted successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | User not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/users/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/users/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Shares {#shares}

Network Shares Management (SMB/CIFS).


#### `GET` `/shares` {#get-shares}

**Get all shares configuration**

Retrieve all network shares configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All shares configuration retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "smb": [
    {
      "id": "1640995200000",
      "name": "media",
      "path": "/mnt/storage-pool/movies",
      "enabled": true,
      "read_only": false
    }
  ],
  "nfs": []
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/smb` {#get-shares-smb}

**Get SMB shares only**

Retrieve only SMB/CIFS shares configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SMB shares retrieved successfully | array[SmbShare] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": "1640995200000abc123",
    "name": "media",
    "path": "/mnt/storage-pool/movies",
    "enabled": true,
    "read_only": false,
    "guest_ok": false,
    "browseable": true,
    "write_list": [
      "user1",
      "user2"
    ],
    "valid_users": [
      "user1",
      "user2",
      "user3"
    ],
    "comment": "Media files storage"
  },
  {
    "id": "1640995200000def456",
    "name": "documents",
    "path": "/mnt/storage-pool/docs",
    "enabled": true,
    "read_only": true,
    "guest_ok": false,
    "browseable": true,
    "write_list": [],
    "valid_users": [
      "admin"
    ],
    "comment": "Document storage"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/smb" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/shares/smb` {#post-shares-smb}

**Create new SMB share**

Create a new SMB/CIFS network share (admin only).

**Pool-based shares**: Provide poolName and a relative subPath. The directory will be created if it doesn't exist, and ownership/permissions will be set.

**Absolute path shares**: Set poolName to null and provide an absolute path in subPath. The directory must already exist, and ownership/permissions will NOT be modified.

**For MergerFS pools**: You can specify targetDevices to control which disk slots store the data.
Use GET /pools to get available disk slots from pool.data_devices[].slot.


**Request body** (`application/json`)

```json
{
  "shareName": "media",
  "poolName": "storage-pool",
  "subPath": "movies",
  "automount": false,
  "enabled": true,
  "read_only": false,
  "guest_ok": false,
  "browseable": true,
  "write_list": [
    "user1",
    "user2"
  ],
  "valid_users": [
    "user1",
    "user2"
  ],
  "force_root": false,
  "create_mask": "0664",
  "directory_mask": "0775",
  "inherit_permissions": true,
  "hide_dot_files": false,
  "preserve_case": true,
  "case_sensitive": true,
  "allow_execute_always": false,
  "comment": "Media files storage"
}
```

| Field | Type | Required |
|-------|------|----------|
| shareName | string — Name of the SMB share (alphanumeric, underscore, hyphen only) | **Yes** |
| poolName | string — Pool name to use for the share. If null or empty, subPath must be an absolute path to an existing directory. | No |
| subPath | string — If poolName is provided: Subdirectory path within the pool (relative path). If poolName is null/empty: Absolute path to an existing directory (e.g., "/data/myshare"). The directory must exist and permissions will NOT be modified.  | No |
| automount | boolean — Auto-mount on startup | No |
| enabled | boolean — Enable the share | No |
| read_only | boolean — Read-only access | No |
| guest_ok | boolean — Allow guest access | No |
| browseable | boolean — Show in network browse list | No |
| write_list | array[string] — List of users with write access | No |
| valid_users | array[string] — List of valid users | No |
| force_root | boolean — Force root ownership | No |
| create_mask | string — File creation mask | No |
| directory_mask | string — Directory creation mask | No |
| inherit_permissions | boolean — Inherit permissions from parent | No |
| hide_dot_files | boolean — Hide files starting with dot | No |
| preserve_case | boolean — Preserve filename case | No |
| case_sensitive | boolean — Case sensitive filenames | No |
| allow_execute_always | boolean — Allow execute permission on all files (acl_allow_execute_always) | No |
| comment | string — Share description | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | SMB share created successfully | object |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "SMB share 'filme' created successfully and SMB restarted",
  "data": {
    "shareName": "filme",
    "sharePath": "/mnt/media/Filme",
    "poolName": "media",
    "config": {},
    "mergerfsDetails": {
      "poolType": "mergerfs",
      "targetDevices": [
        1,
        2
      ],
      "diskDirectories": {},
      "pathRuleCreated": true,
      "createdPaths": [
        "/var/mergerfs/media/disk1/Filme",
        "/var/mergerfs/media/disk2/Filme"
      ]
    }
  },
  "smbRestarted": true,
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/shares/smb" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"shareName":"media","poolName":"storage-pool","subPath":"movies","automount":false,"enabled":true,"read_only":false,"guest_ok":false,"browseable":true,"write_list":["user1","user2"],"valid_users":["user1","user2"],"force_root":false,"create_mask":"0664","directory_mask":"0775","inherit_permissions":true,"hide_dot_files":false,"preserve_case":true,"case_sensitive":true,"allow_execute_always":false,"comment":"Media files storage"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"shareName":"media","poolName":"storage-pool","subPath":"movies","automount":false,"enabled":true,"read_only":false,"guest_ok":false,"browseable":true,"write_list":["user1","user2"],"valid_users":["user1","user2"],"force_root":false,"create_mask":"0664","directory_mask":"0775","inherit_permissions":true,"hide_dot_files":false,"preserve_case":true,"case_sensitive":true,"allow_execute_always":false,"comment":"Media files storage"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/nfs` {#get-shares-nfs}

**Get NFS shares only**

Retrieve only NFS shares configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | NFS shares retrieved successfully | array[NfsShare] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": "1640995200000abc123",
    "name": "media",
    "path": "/mnt/storage-pool/movies",
    "source": "10.0.0.0/24",
    "enabled": true,
    "read_only": false,
    "anonuid": null,
    "anongid": null,
    "write_operations": "sync",
    "mapping": "root_squash",
    "secure": true
  },
  {
    "id": "1640995200000def456",
    "name": "documents",
    "path": "/mnt/storage-pool/docs",
    "source": "192.168.1.0/24",
    "enabled": true,
    "read_only": true,
    "anonuid": 65534,
    "anongid": 65534,
    "write_operations": "sync",
    "mapping": "all_squash",
    "secure": true
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/nfs" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/shares/nfs` {#post-shares-nfs}

**Create new NFS share**

Create a new NFS network share (admin only).

**Pool-based shares**: Provide poolName and a relative subPath. The directory will be created if it doesn't exist, and ownership/permissions will be set.

**Absolute path shares**: Set poolName to null and provide an absolute path in subPath. The directory must already exist, and ownership/permissions will NOT be modified.

**For MergerFS pools**: You can specify targetDevices to control which disk slots store the data.
Use GET /pools to get available disk slots from pool.data_devices[].slot.


**Request body** (`application/json`)

```json
{
  "shareName": "media",
  "poolName": "storage-pool",
  "subPath": "movies",
  "source": "10.0.0.0/24",
  "enabled": true,
  "read_only": false,
  "anonuid": 65534,
  "anongid": 65534,
  "write_operations": "sync",
  "mapping": "root_squash",
  "secure": true,
  "createDirectory": true,
  "targetDevices": [
    1,
    2
  ],
  "createDirectories": true,
  "managePathRules": true
}
```

| Field | Type | Required |
|-------|------|----------|
| shareName | string — Name of the NFS share (alphanumeric, underscore, hyphen only) | **Yes** |
| poolName | string — Pool name to use for the share. If null or empty, subPath must be an absolute path to an existing directory. | No |
| subPath | string — If poolName is provided: Subdirectory path within the pool (relative path). If poolName is null/empty: Absolute path to an existing directory (e.g., "/data/myshare"). The directory must exist and permissions will NOT be modified.  | No |
| source | string — Network address/range or host allowed to access the share (* for all hosts) | No |
| enabled | boolean — Enable the share | No |
| read_only | boolean — Read-only access | No |
| anonuid | integer — Anonymous UID mapping for squashed users | No |
| anongid | integer — Anonymous GID mapping for squashed users | No |
| write_operations | string ["sync","async"] — Write operation synchronization mode | No |
| mapping | string ["root_squash","no_root_squash","all_squash"] — User ID mapping mode | No |
| secure | boolean — Use secure ports (1024 and below) | No |
| createDirectory | boolean — Create share directory if it doesn't exist | No |
| targetDevices | array[integer] — Array of disk slot numbers for MergerFS pools (optional). Use GET /pools to retrieve available slots from pool.data_devices[].slot | No |
| createDirectories | boolean — Create directories on specified disk slots for MergerFS pools | No |
| managePathRules | boolean — Automatically create/update path rules in pool configuration | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | NFS share created successfully | - |
| 400 | Bad request - validation failed | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/shares/nfs" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"shareName":"media","poolName":"storage-pool","subPath":"movies","source":"10.0.0.0/24","enabled":true,"read_only":false,"anonuid":65534,"anongid":65534,"write_operations":"sync","mapping":"root_squash","secure":true,"createDirectory":true,"targetDevices":[1,2],"createDirectories":true,"managePathRules":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"shareName":"media","poolName":"storage-pool","subPath":"movies","source":"10.0.0.0/24","enabled":true,"read_only":false,"anonuid":65534,"anongid":65534,"write_operations":"sync","mapping":"root_squash","secure":true,"createDirectory":true,"targetDevices":[1,2],"createDirectories":true,"managePathRules":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/info` {#get-shares-info}

**Get shares information/statistics**

Retrieve statistical information about all network shares (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Shares statistics retrieved successfully | SharesStatistics |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "data": {
    "total": 5,
    "enabled": 3,
    "disabled": 2,
    "types": {
      "smb": 5
    }
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/info" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/info", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/pools` {#get-shares-pools}

**Get available pools for share creation**

Retrieve a list of storage pools available for creating network shares (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Available pools retrieved successfully | array[AvailablePool] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "storage-pool",
    "type": "mergerfs",
    "mountpoint": "/mnt/storage-pool",
    "available": true
  },
  {
    "name": "backup-pool",
    "type": "single",
    "mountpoint": "/mnt/backup-pool",
    "available": true
  },
  {
    "name": "temp-pool",
    "type": "single",
    "mountpoint": "/mnt/temp-pool",
    "available": false
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/pools" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/pools", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/smb/{shareId}` {#get-shares-smb-shareid}

**Get a specific SMB share**

Retrieve detailed information about a specific SMB share by ID (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the SMB share |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SMB share retrieved successfully | ShareOperationResult |
| 400 | Share name is required | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Share retrieved successfully",
  "share": {
    "shareName": "media",
    "poolName": "storage-pool",
    "subPath": "movies",
    "enabled": true,
    "read_only": false,
    "guest_ok": false,
    "browseable": true,
    "write_list": [
      "user1",
      "user2"
    ],
    "valid_users": [
      "user1",
      "user2",
      "user3"
    ],
    "comment": "Media files storage"
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/smb/{shareId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb/{shareId}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/shares/smb/{shareId}` {#put-shares-smb-shareid}

**Update a SMB share**

Update configuration of an existing SMB share (admin only).

**Note**: When updating targetDevices, the corresponding path rules in the pool configuration are automatically updated.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the SMB share to update |

**Request body** (`application/json`)

```json
{
  "enabled": false,
  "read_only": true,
  "guest_ok": false,
  "browseable": true,
  "write_list": [
    "user1"
  ],
  "valid_users": [
    "user1",
    "user2"
  ],
  "comment": "Updated media files storage - read only"
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean — Enable/disable the share | No |
| read_only | boolean — Read-only access | No |
| guest_ok | boolean — Allow guest access | No |
| browseable | boolean — Show in network browse list | No |
| write_list | array[string] — List of users with write access | No |
| valid_users | array[string] — List of valid users | No |
| allow_execute_always | boolean — Allow execute permission on all files (acl_allow_execute_always) | No |
| comment | string — Share description | No |
| targetDevices | array[integer] — Array of disk slot numbers for MergerFS pools (automatically updates path rules) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SMB share updated successfully | ShareOperationResult |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Share updated successfully",
  "share": {
    "shareName": "media",
    "poolName": "storage-pool",
    "subPath": "movies",
    "enabled": false,
    "read_only": true,
    "guest_ok": false,
    "browseable": true,
    "write_list": [
      "user1"
    ],
    "valid_users": [
      "user1",
      "user2"
    ],
    "comment": "Updated media files storage - read only"
  }
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/shares/smb/{shareId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false,"read_only":true,"guest_ok":false,"browseable":true,"write_list":["user1"],"valid_users":["user1","user2"],"comment":"Updated media files storage - read only"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb/{shareId}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":false,"read_only":true,"guest_ok":false,"browseable":true,"write_list":["user1"],"valid_users":["user1","user2"],"comment":"Updated media files storage - read only"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/shares/smb/{shareId}` {#delete-shares-smb-shareid}

**Delete a SMB share**

Delete an existing SMB share and optionally its directory (admin only).

**Pool-based shares**: Directory can be deleted if deleteDirectory is true.

**Absolute path shares**: Directory will NEVER be deleted, even if deleteDirectory is true (to protect external directories).

**Note**: Associated path rules in the pool configuration are automatically removed when removePathRule is true (default).


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the SMB share to delete |

**Request body** (`application/json`)

```json
{
  "deleteDirectory": false
}
```

| Field | Type | Required |
|-------|------|----------|
| deleteDirectory | boolean — Also delete the share directory (only for pool-based shares). For absolute path shares (without pool), the directory will NEVER be deleted, even if this is set to true.  | No |
| removePathRule | boolean — Also remove the corresponding path rule from pool configuration (only applies to pool-based shares) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | SMB share deleted successfully | ShareOperationResult |
| 400 | Share name is required | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "SMB share 'media' deleted successfully",
  "share": {
    "shareName": "media",
    "poolName": "storage-pool",
    "subPath": "movies",
    "enabled": true,
    "read_only": false,
    "guest_ok": false,
    "browseable": true,
    "write_list": [
      "user1",
      "user2"
    ],
    "valid_users": [
      "user1",
      "user2",
      "user3"
    ],
    "comment": "Media files storage"
  }
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/shares/smb/{shareId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"deleteDirectory":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb/{shareId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"deleteDirectory":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/smb/{shareId}/target-devices` {#get-shares-smb-shareid-target-devices}

**Get target devices for a specific share**

Retrieve the current target devices (disk slots) configuration for a share. Only applies to MergerFS pools.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the SMB share |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target devices retrieved successfully | object |
| 404 | Share not found | Error |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "data": {
    "shareId": "1640995200000abc123",
    "shareName": "filme",
    "poolName": "media",
    "poolType": "mergerfs",
    "isValidForPathRules": true,
    "pathRule": {
      "path": "/Filme",
      "targetDevices": [
        1,
        2
      ]
    }
  },
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/smb/{shareId}/target-devices" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb/{shareId}/target-devices", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/shares/smb/{shareId}/target-devices` {#put-shares-smb-shareid-target-devices}

**Update target devices for a share**

Update the target devices (disk slots) for a specific share.
This automatically manages the path rules in the pool configuration.
Only works with MergerFS pools.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the SMB share |

**Request body** (`application/json`)

```json
{
  "targetDevices": [
    3,
    4
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| targetDevices | array[integer] — Array of disk slot numbers. Use GET /pools to get available slots. | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target devices updated successfully | object |
| 400 | Bad request - validation failed | - |
| 404 | Share not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Share 'filme' (ID: 1640995200000abc123) updated successfully and SMB restarted",
  "data": {
    "shareId": "1640995200000abc123",
    "shareName": "filme",
    "config": {}
  },
  "smbRestarted": true,
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/shares/smb/{shareId}/target-devices" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"targetDevices":[3,4]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb/{shareId}/target-devices", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"targetDevices":[3,4]})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/shares/smb/{shareId}/target-devices` {#delete-shares-smb-shareid-target-devices}

**Remove target devices from a share**

Remove target devices configuration from a share.
This removes the path rule from both the share and pool configuration.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the SMB share |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target devices removed successfully | object |
| 404 | Share not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Share 'filme' (ID: 1640995200000abc123) updated successfully and SMB restarted",
  "data": {
    "shareId": "1640995200000abc123",
    "shareName": "filme",
    "config": {}
  },
  "nfsReloaded": true,
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/shares/smb/{shareId}/target-devices" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/smb/{shareId}/target-devices", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/nfs/{shareId}` {#get-shares-nfs-shareid}

**Get a specific NFS share**

Retrieve detailed information about a specific NFS share by ID (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the NFS share |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | NFS share retrieved successfully | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Share not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/nfs/{shareId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs/{shareId}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/shares/nfs/{shareId}` {#put-shares-nfs-shareid}

**Update a NFS share**

Update configuration of an existing NFS share (admin only).

**Note**: When updating targetDevices, the corresponding path rules in the pool configuration are automatically updated.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the NFS share to update |

**Request body** (`application/json`)

```json
{
  "source": "192.168.1.0/24",
  "enabled": false,
  "read_only": true,
  "mapping": "all_squash",
  "anonuid": 65534,
  "anongid": 65534
}
```

| Field | Type | Required |
|-------|------|----------|
| source | string — Network address/range or host allowed to access the share (* for all hosts) | No |
| enabled | boolean — Enable/disable the share | No |
| read_only | boolean — Read-only access | No |
| anonuid | integer — Anonymous UID mapping for squashed users | No |
| anongid | integer — Anonymous GID mapping for squashed users | No |
| write_operations | string ["sync","async"] — Write operation synchronization mode | No |
| mapping | string ["root_squash","no_root_squash","all_squash"] — User ID mapping mode | No |
| secure | boolean — Use secure ports (1024 and below) | No |
| targetDevices | array[integer] — Array of disk slot numbers for MergerFS pools (automatically updates path rules) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | NFS share updated successfully | - |
| 400 | Bad request - validation failed | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Share not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/shares/nfs/{shareId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source":"192.168.1.0/24","enabled":false,"read_only":true,"mapping":"all_squash","anonuid":65534,"anongid":65534}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs/{shareId}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"source":"192.168.1.0/24","enabled":false,"read_only":true,"mapping":"all_squash","anonuid":65534,"anongid":65534})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/shares/nfs/{shareId}` {#delete-shares-nfs-shareid}

**Delete a NFS share**

Delete an existing NFS share and optionally its directory (admin only).

**Pool-based shares**: Directory can be deleted if deleteDirectory is true.

**Absolute path shares**: Directory will NEVER be deleted, even if deleteDirectory is true (to protect external directories).

**Note**: Associated path rules in the pool configuration are automatically removed when removePathRule is true (default).


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the NFS share to delete |

**Request body** (`application/json`)

```json
{
  "deleteDirectory": false,
  "removePathRule": true
}
```

| Field | Type | Required |
|-------|------|----------|
| deleteDirectory | boolean — Also delete the share directory (only for pool-based shares). For absolute path shares (without pool), the directory will NEVER be deleted, even if this is set to true.  | No |
| removePathRule | boolean — Also remove the corresponding path rule from pool configuration (only applies to pool-based shares) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | NFS share deleted successfully | - |
| 400 | Share ID is required | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Share not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/shares/nfs/{shareId}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"deleteDirectory":false,"removePathRule":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs/{shareId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"deleteDirectory":false,"removePathRule":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/shares/nfs/{shareId}/target-devices` {#get-shares-nfs-shareid-target-devices}

**Get target devices for a specific NFS share**

Retrieve the current target devices (disk slots) configuration for an NFS share. Only applies to MergerFS pools.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the NFS share |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target devices retrieved successfully | - |
| 404 | Share not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/shares/nfs/{shareId}/target-devices" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs/{shareId}/target-devices", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/shares/nfs/{shareId}/target-devices` {#put-shares-nfs-shareid-target-devices}

**Update target devices for a NFS share**

Update the target devices (disk slots) for a specific NFS share.
This automatically manages the path rules in the pool configuration.
Only works with MergerFS pools.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the NFS share |

**Request body** (`application/json`)

```json
{
  "targetDevices": [
    3,
    4
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| targetDevices | array[integer] — Array of disk slot numbers. Use GET /pools to get available slots. | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target devices updated successfully | - |
| 400 | Bad request - validation failed | - |
| 404 | Share not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/shares/nfs/{shareId}/target-devices" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"targetDevices":[3,4]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs/{shareId}/target-devices", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"targetDevices":[3,4]})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/shares/nfs/{shareId}/target-devices` {#delete-shares-nfs-shareid-target-devices}

**Remove target devices from a NFS share**

Remove target devices configuration from an NFS share.
This removes the path rule from both the share and pool configuration.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| shareId | path | string | **Yes** | ID of the NFS share |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Target devices removed successfully | - |
| 404 | Share not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/shares/nfs/{shareId}/target-devices" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/shares/nfs/{shareId}/target-devices", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Remotes {#remotes}

Remote Shares Management (SMB/NFS Mount).


#### `GET` `/remotes` {#get-remotes}

**List all remote shares**

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of remote shares | array[Remote] |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 500 | Internal server error | - |

Example `200` response:

```json
[
  {
    "id": "1695123456789",
    "name": "NAS Media Share",
    "type": "smb",
    "server": "192.168.1.100",
    "share": "media",
    "username": "nasuser",
    "password": "SECRET",
    "domain": "WORKGROUP",
    "version": "3.0",
    "uid": 500,
    "gid": 500,
    "auto_mount": true,
    "status": "mounted"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/remotes" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/remotes` {#post-remotes}

**Create new remote share**

**Request body** (`application/json`)

```json
{
  "name": "NAS Media Share",
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "nasuser",
  "password": "mypassword",
  "domain": "WORKGROUP",
  "version": "3.0",
  "uid": 500,
  "gid": 500,
  "auto_mount": true
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — User-friendly name for the remote | **Yes** |
| type | string ["smb","nfs"] — Type of remote share | **Yes** |
| server | string — Server IP address or hostname | **Yes** |
| share | string — Share name | **Yes** |
| username | string — Username for authentication (optional for SMB guest access, not used for NFS) | No |
| password | string — Plain text password (will be encrypted, optional for SMB guest access, not used for NFS) | No |
| domain | string — SMB domain (optional) | No |
| version | string — SMB version | No |
| uid | integer — User ID for mount (null means root) | No |
| gid | integer — Group ID for mount (null means root) | No |
| auto_mount | boolean — Whether to auto-mount on boot | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Remote share created successfully | Remote |
| 400 | Bad request - Invalid input data | - |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 409 | Conflict - Remote with same name already exists | - |
| 500 | Internal server error | - |

Example `201` response:

```json
{
  "id": "1695123456789",
  "name": "NAS Media Share",
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "nasuser",
  "password": "SECRET",
  "domain": "WORKGROUP",
  "version": "3.0",
  "uid": 500,
  "gid": 500,
  "auto_mount": true,
  "status": "mounted"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/remotes" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"NAS Media Share","type":"smb","server":"192.168.1.100","share":"media","username":"nasuser","password":"mypassword","domain":"WORKGROUP","version":"3.0","uid":500,"gid":500,"auto_mount":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"NAS Media Share","type":"smb","server":"192.168.1.100","share":"media","username":"nasuser","password":"mypassword","domain":"WORKGROUP","version":"3.0","uid":500,"gid":500,"auto_mount":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/remotes/{id}` {#get-remotes-id}

**Get remote share by ID**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Remote ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remote share details | Remote |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 404 | Remote not found | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "id": "1695123456789",
  "name": "NAS Media Share",
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "nasuser",
  "password": "SECRET",
  "domain": "WORKGROUP",
  "version": "3.0",
  "uid": 500,
  "gid": 500,
  "auto_mount": true,
  "status": "mounted"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/remotes/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/{id}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/remotes/{id}` {#put-remotes-id}

**Update remote share**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Remote ID |

**Request body** (`application/json`)

```json
{
  "name": "NAS Media Share",
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "nasuser",
  "password": "mypassword",
  "domain": "WORKGROUP",
  "version": "3.0",
  "uid": 500,
  "gid": 500,
  "auto_mount": true
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — User-friendly name for the remote | **Yes** |
| type | string ["smb","nfs"] — Type of remote share | **Yes** |
| server | string — Server IP address or hostname | **Yes** |
| share | string — Share name | **Yes** |
| username | string — Username for authentication (optional for SMB guest access, not used for NFS) | No |
| password | string — Plain text password (will be encrypted, optional for SMB guest access, not used for NFS) | No |
| domain | string — SMB domain (optional) | No |
| version | string — SMB version | No |
| uid | integer — User ID for mount (null means root) | No |
| gid | integer — Group ID for mount (null means root) | No |
| auto_mount | boolean — Whether to auto-mount on boot | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remote share updated successfully | Remote |
| 400 | Bad request - Invalid input data | - |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 404 | Remote not found | - |
| 409 | Conflict - Cannot update mounted remote or duplicate name | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "id": "1695123456789",
  "name": "NAS Media Share",
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "nasuser",
  "password": "SECRET",
  "domain": "WORKGROUP",
  "version": "3.0",
  "uid": 500,
  "gid": 500,
  "auto_mount": true,
  "status": "mounted"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/remotes/{id}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"NAS Media Share","type":"smb","server":"192.168.1.100","share":"media","username":"nasuser","password":"mypassword","domain":"WORKGROUP","version":"3.0","uid":500,"gid":500,"auto_mount":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/{id}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"NAS Media Share","type":"smb","server":"192.168.1.100","share":"media","username":"nasuser","password":"mypassword","domain":"WORKGROUP","version":"3.0","uid":500,"gid":500,"auto_mount":true})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/remotes/{id}` {#delete-remotes-id}

**Delete remote share**

Delete a remote share. If the remote is currently mounted, it will be automatically unmounted before deletion.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Remote ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remote share deleted successfully (automatically unmounted if it was mounted) | Remote |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 404 | Remote not found | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "id": "1695123456789",
  "name": "NAS Media Share",
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "nasuser",
  "password": "SECRET",
  "domain": "WORKGROUP",
  "version": "3.0",
  "uid": 500,
  "gid": 500,
  "auto_mount": true,
  "status": "mounted"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/remotes/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/remotes/{id}/mount` {#post-remotes-id-mount}

**Mount remote share**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Remote ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remote share mounted successfully | MountResult |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 404 | Remote not found | - |
| 409 | Conflict - Remote already mounted | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Remote 'NAS Media Share' mounted successfully",
  "mountPath": "/mnt/remotes/192.168.1.100/media"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/remotes/{id}/mount" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/{id}/mount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/remotes/{id}/unmount` {#post-remotes-id-unmount}

**Unmount remote share**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Remote ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remote share unmounted successfully | MountResult |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 404 | Remote not found | - |
| 409 | Conflict - Remote not mounted | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Remote 'NAS Media Share' mounted successfully",
  "mountPath": "/mnt/remotes/192.168.1.100/media"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/remotes/{id}/unmount" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/{id}/unmount", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/remotes/{id}/status` {#get-remotes-id-status}

**Get remote share mount status**

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Remote ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Remote share status | object |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 404 | Remote not found | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "id": "1695123456789",
  "name": "NAS Media Share",
  "status": "mounted",
  "mountPath": "/mnt/remotes/192.168.1.100/media"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/remotes/{id}/status" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/{id}/status", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/remotes/listshares` {#post-remotes-listshares}

**List all available shares from a server**

Discover all available shares from a remote server without saving credentials. For SMB, username and password are optional (uses guest access if not provided). For NFS, only server address is needed.

**Request body** (`application/json`)

```json
{
  "server": "192.168.1.100",
  "type": "smb",
  "username": "nasuser",
  "password": "mypassword",
  "domain": "WORKGROUP"
}
```

| Field | Type | Required |
|-------|------|----------|
| server | string — Server IP address or hostname | **Yes** |
| type | string ["smb","nfs"] — Type of remote share | **Yes** |
| username | string — Username for authentication (optional for SMB, uses guest if not provided) | No |
| password | string — Password for authentication (optional for SMB, uses guest if not provided) | No |
| domain | string — SMB domain (optional) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available shares | array[string] |
| 400 | Bad request - Invalid input data | - |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 500 | Internal server error | - |

Example `200` response:

```json
[
  "media",
  "backup",
  "documents",
  "photos"
]
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/remotes/listshares" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"server":"192.168.1.100","type":"smb","username":"nasuser","password":"mypassword","domain":"WORKGROUP"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/listshares", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"server":"192.168.1.100","type":"smb","username":"nasuser","password":"mypassword","domain":"WORKGROUP"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/remotes/connectiontest` {#post-remotes-connectiontest}

**Test connection to remote share without saving**

Test connection to a remote share.

**Request body** (`application/json`)

```json
{
  "type": "smb",
  "server": "192.168.1.100",
  "share": "media",
  "username": "testuser",
  "password": "testpass",
  "domain": "WORKGROUP"
}
```

| Field | Type | Required |
|-------|------|----------|
| type | string ["smb","nfs"] — Type of remote share | **Yes** |
| server | string — Server IP address or hostname | **Yes** |
| share | string — Share name | **Yes** |
| username | string — Username for authentication (optional for SMB guest access, not used for NFS) | No |
| password | string — Plain text password (optional for SMB guest access, not used for NFS) | No |
| domain | string — SMB domain (optional) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Connection test result | ConnectionTestResult |
| 400 | Bad request - Invalid input data | - |
| 401 | Unauthorized | - |
| 403 | Forbidden - Admin access required | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Successfully connected to SMB share //192.168.1.100/media",
  "type": "smb"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/remotes/connectiontest" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"type":"smb","server":"192.168.1.100","share":"media","username":"testuser","password":"testpass","domain":"WORKGROUP"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/remotes/connectiontest", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"type":"smb","server":"192.168.1.100","share":"media","username":"testuser","password":"testpass","domain":"WORKGROUP"})
});
const data = await res.json();
console.log(data);
```
## Cron {#cron}

Cron Jobs Management.


#### `GET` `/cron` {#get-cron}

**Get all cron jobs**

Retrieve a list of all cron jobs in the system (available to all authenticated users)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron jobs retrieved successfully | CronJobsListResponse |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "cronJobs": [
    {
      "id": "job-123",
      "name": "backup-database",
      "schedule": "0 2 * * *",
      "command": "/usr/local/bin/backup-db.sh",
      "enabled": true,
      "status": "stopped",
      "created": "2024-01-20T10:30:00.000Z",
      "lastRun": "2024-01-21T02:00:00.000Z",
      "nextRun": "2024-01-22T02:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/cron" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/cron` {#post-cron}

**Create new cron job**

Create a new scheduled cron job (admin only)

**Request body** (`application/json`)

```json
{
  "name": "backup-database",
  "schedule": "0 2 * * *",
  "command": "/usr/local/bin/backup-db.sh",
  "script": "#!/bin/bash\necho 'Starting database backup...'\n/usr/bin/backup-tool --database\necho 'Backup completed'",
  "convert_to_unix": true
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Unique cron job name | **Yes** |
| schedule | string — Cron schedule expression (minute hour day month weekday) | **Yes** |
| command | string — Shell command to execute (required if script or scriptPath not provided) | No |
| enabled | boolean — Whether cron job should be enabled (defaults to true) | No |
| script | string — Optional script content to create in /boot/optional/scripts/cron (mutually exclusive with scriptPath, auto-generates command) | No |
| scriptPath | string — Optional path to existing script file (mutually exclusive with script, auto-generates command) | No |
| convert_to_unix | boolean — Optional flag to convert script to Unix format using dos2unix (default false) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Cron job created successfully | CronJobResponse |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `201` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": true,
    "scriptPath": "/boot/optional/scripts/cron/backup_database.sh",
    "status": "stopped",
    "created": "2024-01-20T10:30:00.000Z",
    "lastRun": "2024-01-21T02:00:00.000Z",
    "nextRun": "2024-01-22T02:00:00.000Z"
  },
  "message": "Cron job created successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/cron" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"backup-database","schedule":"0 2 * * *","command":"/usr/local/bin/backup-db.sh","script":"#!/bin/bash\necho 'Starting database backup...'\n/usr/bin/backup-tool --database\necho 'Backup completed'","convert_to_unix":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"backup-database","schedule":"0 2 * * *","command":"/usr/local/bin/backup-db.sh","script":"#!/bin/bash\necho 'Starting database backup...'\n/usr/bin/backup-tool --database\necho 'Backup completed'","convert_to_unix":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/cron/scripts` {#get-cron-scripts}

**List all cron scripts**

Retrieve a list of all available scripts in /boot/optional/scripts/cron (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Scripts retrieved successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "scripts": [
    {
      "name": "backup_database.sh",
      "path": "/boot/optional/scripts/cron/backup_database.sh",
      "size": 1024,
      "created": "string",
      "modified": "string"
    }
  ],
  "count": 5
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/cron/scripts" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/scripts", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/cron/scripts/{scriptName}` {#get-cron-scripts-scriptname}

**Get cron script content**

Retrieve the content and metadata of a specific cron script (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| scriptName | path | string | **Yes** | Script name (with or without .sh extension) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Script retrieved successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Script not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "script": {
    "name": "backup_database.sh",
    "path": "/boot/optional/scripts/cron/backup_database.sh",
    "size": 1024,
    "created": "string",
    "modified": "string",
    "content": "#!/bin/bash\necho 'Starting backup...'"
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/cron/scripts/{scriptName}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/scripts/{scriptName}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/cron/scripts/{scriptName}` {#put-cron-scripts-scriptname}

**Update cron script content**

Update the content of an existing cron script (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| scriptName | path | string | **Yes** | Script name (with or without .sh extension) |

**Request body** (`application/json`)

```json
{
  "content": "#!/bin/bash\necho 'Updated backup script'\n/usr/bin/backup-tool"
}
```

| Field | Type | Required |
|-------|------|----------|
| content | string — New script content | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Script updated successfully | object |
| 400 | Bad request | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Script not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "script": null,
  "message": "Script 'backup_database.sh' updated successfully"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/cron/scripts/{scriptName}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content":"#!/bin/bash\necho 'Updated backup script'\n/usr/bin/backup-tool"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/scripts/{scriptName}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"content":"#!/bin/bash\necho 'Updated backup script'\n/usr/bin/backup-tool"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/cron/scripts/{scriptName}` {#delete-cron-scripts-scriptname}

**Delete cron script**

Delete a cron script (admin only, only if not used by any cron job)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| scriptName | path | string | **Yes** | Script name (with or without .sh extension) |
| deleteDependentJobs | query | boolean | No | Whether to also delete dependent cron jobs (default false) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Script deleted successfully | object |
| 400 | Bad request - script is in use | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Script not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "script": null,
  "message": "Script 'backup_database.sh' deleted successfully",
  "deletedJobs": [
    {
      "id": "job-123",
      "name": "backup-database",
      "schedule": "0 2 * * *",
      "command": "/usr/local/bin/backup-db.sh",
      "enabled": true,
      "scriptPath": "/boot/optional/scripts/cron/backup_database.sh",
      "status": "stopped",
      "created": "2024-01-20T10:30:00.000Z",
      "lastRun": "2024-01-21T02:00:00.000Z",
      "nextRun": "2024-01-22T02:00:00.000Z"
    }
  ],
  "dependentJobsCount": 2
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/cron/scripts/{scriptName}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/scripts/{scriptName}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/cron/system` {#get-cron-system}

**Get system cron jobs**

Retrieve all system cron jobs from crontab that are marked with "# MOS" comments (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | System cron jobs retrieved successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "systemCronJobs": [
    {
      "name": "Update Check Interval",
      "schedule": "15 9 * * *",
      "command": "/usr/local/bin/mos-update_check > /dev/null 2>&1"
    }
  ],
  "count": 7
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/cron/system" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/system", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/cron/{identifier}` {#get-cron-identifier}

**Get specific cron job**

Retrieve a specific cron job by ID or name (available to all authenticated users)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job retrieved successfully | CronJobResponse |
| 401 | Not authenticated | Error |
| 404 | Cron job not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": true,
    "status": "stopped",
    "created": "2024-01-20T10:30:00.000Z",
    "lastRun": "2024-01-21T02:00:00.000Z",
    "nextRun": "2024-01-22T02:00:00.000Z"
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/cron/{identifier}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/cron/{identifier}` {#put-cron-identifier}

**Update cron job**

Update an existing cron job by ID or name (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name to update |

**Request body** (`application/json`)

```json
{
  "name": "backup-database-v2",
  "schedule": "0 3 * * *",
  "command": "/usr/local/bin/backup-db-v2.sh"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — New cron job name | No |
| schedule | string — New cron schedule expression | No |
| command | string — New command to execute | No |
| enabled | boolean — Whether cron job should be enabled | No |
| script | string — New script content to create (mutually exclusive with scriptPath) | No |
| scriptPath | string — New path to existing script file (mutually exclusive with script) | No |
| convert_to_unix | boolean — Optional flag to convert script to Unix format using dos2unix (default false) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job updated successfully | CronJobResponse |
| 400 | Bad request - validation failed | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Cron job not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database-v2",
    "schedule": "0 3 * * *",
    "command": "/usr/local/bin/backup-db-v2.sh",
    "enabled": true,
    "status": "stopped",
    "created": "2024-01-20T10:30:00.000Z",
    "lastRun": "2024-01-21T02:00:00.000Z",
    "nextRun": "2024-01-22T03:00:00.000Z"
  },
  "message": "Cron job 'backup-database-v2' updated successfully"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/cron/{identifier}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"backup-database-v2","schedule":"0 3 * * *","command":"/usr/local/bin/backup-db-v2.sh"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"backup-database-v2","schedule":"0 3 * * *","command":"/usr/local/bin/backup-db-v2.sh"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/cron/{identifier}` {#delete-cron-identifier}

**Delete cron job**

Delete an existing cron job by ID or name (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name to delete |
| delete_script | query | boolean | No | Whether to also delete the associated script file (default false) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job deleted successfully | CronJobResponse |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Cron job not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": true,
    "status": "stopped",
    "created": "2024-01-20T10:30:00.000Z",
    "lastRun": "2024-01-21T02:00:00.000Z",
    "nextRun": "2024-01-22T02:00:00.000Z"
  },
  "message": "Cron job 'backup-database' deleted successfully"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/cron/{identifier}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/cron/{identifier}/enable` {#post-cron-identifier-enable}

**Enable cron job**

Enable a disabled cron job (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name to enable |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job enabled successfully | CronJobResponse |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Cron job not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": true,
    "status": "stopped",
    "created": "2024-01-20T10:30:00.000Z",
    "lastRun": "2024-01-21T02:00:00.000Z",
    "nextRun": "2024-01-22T02:00:00.000Z"
  },
  "message": "Cron job 'backup-database' enabled successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/cron/{identifier}/enable" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}/enable", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/cron/{identifier}/disable` {#post-cron-identifier-disable}

**Disable cron job**

Disable an enabled cron job (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name to disable |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job disabled successfully | CronJobResponse |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Cron job not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": false,
    "status": "stopped",
    "created": "2024-01-20T10:30:00.000Z",
    "lastRun": "2024-01-21T02:00:00.000Z",
    "nextRun": "2024-01-22T02:00:00.000Z"
  },
  "message": "Cron job 'backup-database' disabled successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/cron/{identifier}/disable" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}/disable", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/cron/{identifier}/start` {#post-cron-identifier-start}

**Start cron job manually**

Start a cron job manually in the background (admin only, checks if already running)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name to start |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job started successfully | object |
| 400 | Job is already running | Error |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Cron job not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": true,
    "status": "running"
  },
  "message": "Cron-Job 'backup-database' started successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/cron/{identifier}/start" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}/start", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/cron/{identifier}/stop` {#post-cron-identifier-stop}

**Stop running cron job**

Stop a currently running cron job (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| identifier | path | string | **Yes** | Cron job ID or name to stop |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Cron job stopped successfully | object |
| 400 | Job is not running | Error |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Cron job not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "cronJob": {
    "id": "job-123",
    "name": "backup-database",
    "schedule": "0 2 * * *",
    "command": "/usr/local/bin/backup-db.sh",
    "enabled": true,
    "status": "stopped"
  },
  "message": "Cron-Job 'backup-database' stopped successfully"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/cron/{identifier}/stop" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/cron/{identifier}/stop", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## System {#system}

System Information, Monitoring and Power Management.


#### `GET` `/system/memory` {#get-system-memory}

**Get detailed memory information**

Retrieve detailed memory information with separate dirty cache tracking (available to all authenticated users)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Detailed memory information retrieved successfully | DetailedMemoryInfo |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "memory": {
    "total": 17179869184,
    "free": 2147483648,
    "available": 8589934592,
    "used": {
      "total": 8589934592,
      "actuallyUsed": 4294967296,
      "dirtyCaches": 4294967296
    },
    "percentage": {
      "used": 50,
      "actuallyUsed": 25,
      "dirtyCaches": 25
    }
  },
  "swap": {
    "total": 2147483648,
    "total_human": "2.0 GiB",
    "available": 2147483648,
    "available_human": "2.0 GiB",
    "used": 0,
    "used_human": "0 B",
    "percentage": 0
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/memory" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/memory", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/detailed` {#get-system-detailed}

**Get detailed system information**

Retrieve comprehensive system information including OS, CPU, memory, disks, network and processes (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Detailed system information retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "os": {
    "platform": "linux",
    "distro": "Ubuntu 22.04.3 LTS",
    "hostname": "server1",
    "kernel": "6.14.11-mos"
  },
  "cpu": {
    "manufacturer": "Intel",
    "brand": "Intel(R) Core(TM) i7-12700K",
    "cores": 12,
    "physicalCores": 8,
    "speed": 3.6
  },
  "memory": {
    "total": 17179869184,
    "used": 8589934592,
    "actuallyUsed": 4294967296,
    "percentage": {
      "used": 50,
      "actuallyUsed": 25
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/detailed" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/detailed", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/load` {#get-system-load}

**Get system load, temperature, memory and network utilization**

Retrieve current system load, temperature information including per-core metrics, detailed memory usage with installed/reserved memory and services breakdown (Docker/LXC/VMs/ZRAM), and network utilization for all interfaces (available to all authenticated users)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | System load, temperature, memory and network information retrieved successfully | object |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "cpu": {
    "load": 42.35,
    "info": {
      "brand": "Intel(R) Core(TM) i7-12700K",
      "manufacturer": "Intel",
      "totalCores": 20,
      "physicalCores": 12,
      "logicalCores": 20,
      "hyperThreadingEnabled": true,
      "architecture": "Family 6, Model 151"
    },
    "cores": [
      {
        "number": 0,
        "load": {
          "total": 45.67
        },
        "temperature": 65.5,
        "isPhysical": true,
        "isHyperThreaded": false,
        "physicalCoreNumber": 0,
        "coreArchitecture": "Performance"
      },
      {
        "number": 1,
        "load": {
          "total": 38.92
        },
        "temperature": 67.2,
        "isPhysical": true,
        "isHyperThreaded": false,
        "physicalCoreNumber": 1,
        "coreArchitecture": "Performance"
      },
      {
        "number": 12,
        "load": {
          "total": 22.15
        },
        "temperature": 63.1,
        "isPhysical": false,
        "isHyperThreaded": true,
        "physicalCoreNumber": 0,
        "coreArchitecture": "Performance"
      }
    ]
  },
  "temperature": {
    "main": 68.2,
    "max": 72.1,
    "min": 61.3,
    "cores": [
      65.5,
      67.2,
      72.1,
      61.3,
      69.8,
      63.4,
      70.1,
      64.9
    ]
  },
  "memory": {
    "installed": 137438953472,
    "installed_human": "128.0 GiB",
    "reserved": 2583560192,
    "reserved_human": "2.4 GiB",
    "total": 134855393280,
    "total_human": "125.6 GiB",
    "free": 101748690944,
    "free_human": "94.8 GiB",
    "used": 33106702336,
    "used_human": "30.8 GiB",
    "breakdown": {
      "system": {
        "bytes": 4000000000,
        "bytes_human": "3.7 GiB",
        "percentage": 3
      },
      "docker": {
        "bytes": 15000000000,
        "bytes_human": "14.0 GiB",
        "percentage": 11
      },
      "lxc": {
        "bytes": 14000000000,
        "bytes_human": "13.0 GiB",
        "percentage": 10
      },
      "vms": {
        "bytes": 0,
        "bytes_human": "0 B",
        "percentage": 0
      }
    },
    "dirty": {
      "free": 3138637824,
      "used": 131716755456,
      "dirtyCaches": 98610053120
    },
    "percentage": {
      "used": 98,
      "actuallyUsed": 25,
      "dirtyCaches": 73
    }
  },
  "swap": {
    "total": 8589934592,
    "total_human": "8.0 GiB",
    "available": 8589934592,
    "available_human": "8.0 GiB",
    "used": 0,
    "used_human": "0 B",
    "percentage": 0
  },
  "network": {
    "interfaces": [
      {
        "interface": "eth0",
        "type": "wired",
        "state": "up",
        "speed": 1000,
        "ip4": "192.168.1.100",
        "mac": "00:11:22:33:44:55",
        "statistics": {
          "rx": {
            "bytes": 1073741824,
            "bytes_human": "1.00 GiB",
            "packets": 1048576,
            "speed_bps": 1048576,
            "speed_human": "1.00 MiB/s"
          },
          "tx": {
            "bytes": 536870912,
            "bytes_human": "512.00 MiB",
            "packets": 524288,
            "speed_bps": 524288,
            "speed_human": "512.00 KiB/s"
          },
          "total": {
            "bytes": 1610612736,
            "bytes_human": "1.50 GiB",
            "packets": 1572864,
            "speed_bps": 1572864,
            "speed_human": "1.50 MiB/s"
          }
        }
      }
    ],
    "summary": {
      "total_interfaces": 2,
      "active_interfaces": 1,
      "totals": {
        "rx": {
          "bytes": 1073741824,
          "bytes_human": "1.00 GiB",
          "packets": 1048576,
          "speed_bps": 1048576,
          "speed_human": "1.00 MiB/s"
        },
        "tx": {
          "bytes": 536870912,
          "bytes_human": "512.00 MiB",
          "packets": 524288,
          "speed_bps": 524288,
          "speed_human": "512.00 KiB/s"
        },
        "combined": {
          "bytes": 1610612736,
          "bytes_human": "1.50 GiB",
          "packets": 1572864,
          "speed_bps": 1572864,
          "speed_human": "1.50 MiB/s"
        }
      }
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/load" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/load", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/system/power/reboot` {#post-system-power-reboot}

**Reboot system**

Perform a system reboot (admin only). The system will shutdown and restart.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Reboot initiated successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Reboot failed | Error |

Example `200` response:

```json
{
  "message": "System reboot initiated"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/system/power/reboot" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/power/reboot", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/system/power/shutdown` {#post-system-power-shutdown}

**Shutdown system**

Perform a graceful system shutdown (admin only). The system will halt after shutting down all services.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Shutdown initiated successfully | OperationResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Shutdown failed | Error |

Example `200` response:

```json
{
  "message": "System shutdown initiated"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/system/power/shutdown" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/power/shutdown", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/proxy` {#get-system-proxy}

**Get proxy settings**

Retrieve current proxy configuration from /boot/config/system/proxy.json (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Proxy settings retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "http_proxy": "http://proxy-server:8080",
  "https_proxy": "http://proxy-server:8080",
  "ftp_proxy": "http://proxy-server:8080",
  "no_proxy": "localhost,127.0.0.1,localaddress,.localdomain.com"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/proxy" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/proxy", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/system/proxy` {#put-system-proxy}

**Update proxy settings**

Update proxy configuration in /boot/config/system/proxy.json. Supports partial updates - you can update individual fields or all at once (admin only)

**Request body** (`application/json`)

```json
{
  "http_proxy": "http://proxy-server:8080",
  "https_proxy": "http://proxy-server:8080",
  "ftp_proxy": "http://proxy-server:8080",
  "no_proxy": "localhost,127.0.0.1,localaddress,.localdomain.com"
}
```

| Field | Type | Required |
|-------|------|----------|
| http_proxy | string — HTTP proxy URL | No |
| https_proxy | string — HTTPS proxy URL | No |
| ftp_proxy | string — FTP proxy URL | No |
| no_proxy | string — Comma-separated list of hosts to bypass proxy | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Proxy settings updated successfully | object |
| 400 | Invalid proxy field provided | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "http_proxy": "http://proxy-server:8080",
  "https_proxy": "http://proxy-server:8080",
  "ftp_proxy": "http://proxy-server:8080",
  "no_proxy": "localhost,127.0.0.1,localaddress,.localdomain.com"
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/system/proxy" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"http_proxy":"http://proxy-server:8080","https_proxy":"http://proxy-server:8080","ftp_proxy":"http://proxy-server:8080","no_proxy":"localhost,127.0.0.1,localaddress,.localdomain.com"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/proxy", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"http_proxy":"http://proxy-server:8080","https_proxy":"http://proxy-server:8080","ftp_proxy":"http://proxy-server:8080","no_proxy":"localhost,127.0.0.1,localaddress,.localdomain.com"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/keymaps` {#get-system-keymaps}

**List available keymaps**

Retrieve a list of all available keyboard layouts/keymaps (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Keymaps retrieved successfully | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "us",
    "description": "US English"
  },
  {
    "name": "de",
    "description": "German"
  },
  {
    "name": "fr",
    "description": "French"
  },
  {
    "name": "es",
    "description": "Spanish"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/keymaps" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/keymaps", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/timezones` {#get-system-timezones}

**List available timezones**

Retrieve a list of all available system timezones (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Timezones retrieved successfully | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "Europe/Berlin",
    "description": "Central European Time"
  },
  {
    "name": "America/New_York",
    "description": "Eastern Standard Time"
  },
  {
    "name": "Asia/Tokyo",
    "description": "Japan Standard Time"
  },
  {
    "name": "UTC",
    "description": "Coordinated Universal Time"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/timezones" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/timezones", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/governors` {#get-system-governors}

**Get available CPU governors**

Get list of available CPU frequency governors from the system (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available CPU governors | array[string] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  "ondemand",
  "performance",
  "powersave",
  "conservative",
  "userspace"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/governors" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/governors", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/logs` {#get-system-logs}

**List all log files**

Retrieve a simple array of log file paths in /var/log recursively. Excludes empty files (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Log files list retrieved successfully | array[string] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  "alternatives.log",
  "apt/history.log",
  "apt/term.log",
  "auth.log",
  "dpkg.log",
  "kern.log",
  "nginx/access.log",
  "nginx/error.log",
  "syslog"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/logs" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/logs", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/logs/content` {#get-system-logs-content}

**Read log file content**

Read content of a specific log file from /var/log. Supports reading from start or end of file (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | query | string | **Yes** | Relative path to log file from /var/log |
| lines | query | integer | No | Number of lines to read (max 1000000) |
| tail | query | boolean | No | Read from end of file (true) or start (false) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Log file content retrieved successfully | object |
| 400 | Invalid parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Log file not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "path": "syslog",
  "full_path": "/var/log/syslog",
  "size": 1048576,
  "size_human": "1.0 MiB",
  "modified": "2025-10-06T10:30:00.000Z",
  "lines_requested": 100,
  "lines_returned": 100,
  "content": [
    "Oct  6 10:30:01 server systemd[1]: Started Session 123.",
    "Oct  6 10:30:15 server kernel: [12345.678] USB disconnect"
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/logs/content" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/logs/content", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/devices/pci` {#get-system-devices-pci}

**Get PCI devices information**

Retrieve detailed information about all PCI devices by parsing lspci output.

**Data Structure:**
- Basic device info comes from `lspci -vmm -nn` (structured, reliable)
- Detailed hierarchical data comes from `lspci -vvv -nn` (parsed by indentation)

**Details Object:**
The `details` object contains a hierarchical structure where:
- Keys from lspci output become object properties
- Values are either strings, objects with nested properties, or arrays (for duplicate keys)
- Lines without keys are stored in `_raw` arrays
- Structure follows the indentation hierarchy of lspci output

This format is fully generic and automatically adapts to any changes in lspci output.

(Admin only)


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | PCI devices information retrieved successfully | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "slot": "06:00.0",
    "class": "SATA controller",
    "class_id": "0106",
    "vendor": "Marvell Technology Group Ltd.",
    "vendor_id": "1b4b",
    "name": "88SE9215 PCIe 2.0 x1 4-port SATA 6 Gb/s Controller",
    "device_id": "9215",
    "revision": "11",
    "subsystem_vendor": "Marvell Technology Group Ltd.",
    "subsystem_vendor_id": "1b4b",
    "subsystem": "88SE9215 PCIe 2.0 x1 4-port SATA 6 Gb/s Controller",
    "subsystem_device_id": "9215",
    "subsystem_id": "1b4b:9215",
    "prog_if": "01",
    "details": {
      "Subsystem": "Marvell Technology Group Ltd. 88SE9215 PCIe 2.0 x1 4-port SATA 6 Gb/s Controller",
      "Flags": "bus master, fast devsel, latency 0, IRQ 37",
      "I/O ports at": [
        "c050 [size=8]",
        "c040 [size=4]",
        "c030 [size=8]",
        "c020 [size=4]",
        "c000 [size=32]"
      ],
      "Memory at": [
        "f7a10000 (32-bit, non-prefetchable) [size=2K]"
      ],
      "Expansion ROM at": "f7a00000 [disabled] [size=64K]",
      "Capabilities": [
        "[40] Power Management version 3",
        "[50] MSI: Enable+ Count=1/1 Maskable- 64bit-",
        "[70] Express Legacy Endpoint, MSI 00",
        "[e0] SATA HBA v0.0",
        "[100] Advanced Error Reporting"
      ],
      "Kernel driver in use": "ahci"
    }
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/devices/pci" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/devices/pci", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/devices/usb` {#get-system-devices-usb}

**Get USB devices information**

Retrieve detailed information about all USB devices by parsing lsusb output.

**Data Structure:**
- Basic device info comes from `lsusb` (bus, device, vendor_id, product_id, description)
- Detailed hierarchical data comes from `lsusb -v` (parsed by indentation)

**Details Object:**
The `details` object contains a hierarchical structure where:
- Keys from lsusb output become object properties
- Values are either strings, objects with nested properties, or arrays (for duplicate keys)
- Structure follows the indentation hierarchy of lsusb output
- Elements with children have a `value` property containing the header line

This format is fully generic and automatically adapts to any changes in lsusb output.

(Admin only)


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | USB devices information retrieved successfully | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "bus": "002",
    "device": "001",
    "vendor_id": "1d6b",
    "product_id": "0002",
    "description": "Linux Foundation 2.0 root hub",
    "details": {
      "Device Descriptor": {
        "bLength": "18",
        "bDescriptorType": "1",
        "bcdUSB": "2.00",
        "bDeviceClass": "9 Hub",
        "bMaxPacketSize0": "64",
        "idVendor": "0x1d6b Linux Foundation",
        "idProduct": "0x0002 2.0 root hub",
        "iManufacturer": "3 Linux 6.17.4-mos xhci-hcd",
        "bNumConfigurations": "1"
      },
      "Configuration Descriptor": {
        "value": "",
        "bLength": "9",
        "bDescriptorType": "2",
        "wTotalLength": "0x0019",
        "bNumInterfaces": "1",
        "bmAttributes": "0xe0\nSelf Powered\nRemote Wakeup",
        "Interface Descriptor": {
          "value": "",
          "bLength": "9",
          "bInterfaceNumber": "0",
          "bInterfaceClass": "9 Hub"
        }
      },
      "Hub Descriptor": {
        "bLength": "11",
        "bDescriptorType": "41",
        "nNbrPorts": "14",
        "wHubCharacteristic": "0x000a\nNo power switching (usb 1.0)\nPer-port overcurrent protection"
      },
      "Device Status": "0x0001\nSelf Powered"
    }
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/devices/usb" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/devices/usb", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/gpus` {#get-system-gpus}

**Get GPU information**

Returns information about all GPUs in the system grouped by vendor (Intel, AMD, NVIDIA)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | GPU information by vendor | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "Intel": [
    {
      "vendor": "Intel",
      "name": "Intel Corporation Xeon E3-1200 v3/4th Gen Core Processor Integrated Graphics Controller(rev 06)",
      "vendor_id": "8086",
      "device_id": "0412",
      "pci": "00:02.0",
      "card": "/dev/dri/card0",
      "render": "/dev/dri/renderD128"
    }
  ],
  "AMD": [
    {}
  ],
  "NVIDIA": [
    {
      "vendor": "NVIDIA",
      "name": "NVIDIA Corporation TU117GLM [Quadro T400 Mobile](rev a1)",
      "vendor_id": "10de",
      "device_id": "1fb2",
      "pci": "01:00.0",
      "uuid": "GPU-09e16239-57bc-2ca8-39ca-c72ed08bac48"
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/gpus" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/gpus", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/sensors` {#get-system-sensors}

**Get hardware sensor data**

Retrieve hardware sensor data from lm-sensors (temperatures, voltages, fan speeds, etc.)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sensor data retrieved successfully | object |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "coretemp-isa-0000": {
    "Adapter": "ISA adapter",
    "Core 0": {
      "temp2_input": 45,
      "temp2_max": 100,
      "temp2_crit": 100
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/sensors" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/sensors", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/timedate` {#get-system-timedate}

**Get current system date and time**

Retrieve the current system date and time

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Current date and time retrieved successfully | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "date": "2026-01-06",
  "time": "12:01:00"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/timedate" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/timedate", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/system/timedate` {#put-system-timedate}

**Set system date and/or time**

Set the system date and/or time. At least one of date or time must be provided. Requires admin privileges.

**Request body** (`application/json`)

```json
{
  "date": "2026-01-06",
  "time": "12:30:00"
}
```

| Field | Type | Required |
|-------|------|----------|
| date | string — Date in YYYY-MM-DD format | No |
| time | string — Time in HH:MM or HH:MM:SS format | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Date/time set successfully | object |
| 400 | Invalid request (missing or invalid date/time format) | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/system/timedate" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-01-06","time":"12:30:00"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/timedate", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"date":"2026-01-06","time":"12:30:00"})
});
const data = await res.json();
console.log(data);
```
## System Load WebSocket {#system-load-websocket}

Real-time system load monitoring via WebSocket.


#### `GET` `/system/websocket/stats` {#get-system-websocket-stats}

**Get WebSocket monitoring statistics**

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket monitoring statistics | object |
| 401 | Unauthorized | - |
| 500 | Internal server error | - |

Example `200` response:

```json
{
  "success": false,
  "data": {
    "activeSubscriptions": 1,
    "cachedData": 2,
    "clientCount": 3,
    "subscription": {
      "interval": 10000,
      "uptime": 120000,
      "isActive": true
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/system/websocket/events` {#get-system-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time system load monitoring.

**Connection:** Connect to WebSocket at `/api/v1/system` namespace

**Events to emit (client → server):**

- `subscribe-load`: Subscribe to system load updates
- `unsubscribe-load`: Unsubscribe from system load updates
- `get-load`: Get immediate system load data (one-time)

**Events to listen for (server → client):**

- `load-update`: Real-time system data updates with different keys at different intervals:
  - `cpu`: CPU load data (every 1s)
  - `memory`: Memory and uptime data (every 8s)
  - `network`: Network interface statistics (every 2s)
  - `pools`: Pools with performance data per disk (initial + every 2s)
  - `poolsTemperatures`: Disk temperatures only (every 10s)
- `load-subscription-confirmed`: Subscription confirmation with intervals
- `load-unsubscription-confirmed`: Unsubscription confirmation
- `error`: General error messages

**Example Usage:**

Connect to WebSocket:
```
const socket = io('http://localhost:3000/api/v1/system', {
  path: '/socket.io/'
});
```

Subscribe to system load updates (pools always included):
```
socket.emit('subscribe-load', {
  token: 'your-jwt-token'
});
```

Listen for updates and merge by key:
```
socket.on('load-update', (data) => {
  if (data.cpu) updateCpu(data.cpu);
  if (data.memory) updateMemory(data.memory);
  if (data.network) updateNetwork(data.network);
  if (data.pools) updatePools(data.pools);
  if (data.poolsTemperatures) updatePoolTemperatures(data.poolsTemperatures);
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "events": {
    "client_to_server": [
      {
        "event": "string",
        "description": "string",
        "payload": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    ],
    "server_to_client": [
      {
        "event": "string",
        "description": "string",
        "payload": {
          "cpu": {
            "load": 25.5,
            "info": {
              "brand": "Intel(R) Core(TM) i7-12700K",
              "manufacturer": "Intel",
              "totalCores": 20,
              "physicalCores": 12
            },
            "cores": [
              {
                "number": 1,
                "load": {
                  "total": 15.5
                },
                "temperature": 45.2
              }
            ]
          },
          "temperature": {
            "main": 42,
            "max": 48.5,
            "min": 38.2
          },
          "memory": {
            "total": 34359738368,
            "total_human": "32.00 GiB",
            "used": 8589934592,
            "used_human": "8.00 GiB",
            "percentage": {
              "actuallyUsed": 25
            }
          },
          "network": {
            "interfaces": [
              {
                "interface": "eth0",
                "type": "wired",
                "state": "up",
                "statistics": {
                  "rx": {
                    "speed_bps": 1048576,
                    "speed_human": "1.00 MiB/s"
                  },
                  "tx": {
                    "speed_bps": 524288,
                    "speed_human": "512.00 KiB/s"
                  }
                }
              }
            ]
          },
          "pools": [
            {
              "id": "1746318722394",
              "name": "media",
              "type": "mergerfs",
              "data_devices": [
                {
                  "device": "/dev/sdj1",
                  "powerStatus": "active",
                  "performance": {
                    "readSpeed": 1048576,
                    "writeSpeed": 524288,
                    "readSpeed_human": "1.0 MB/s",
                    "writeSpeed_human": "512 KB/s"
                  },
                  "temperature": 35
                }
              ],
              "performance": {
                "readSpeed": 0,
                "writeSpeed": 0,
                "readSpeed_human": "string",
                "writeSpeed_human": "string"
              }
            }
          ],
          "poolsTemperatures": [
            {
              "id": "string",
              "name": "string",
              "temperatures": [
                {
                  "device": "sdj",
                  "temperature": 35,
                  "status": "active"
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/system/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/system/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## MOS {#mos}

MOS System Configuration and Settings Management.


#### `GET` `/mos/settings/docker` {#get-mos-settings-docker}

**Get Docker settings**

Retrieve current Docker service configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker settings retrieved successfully | DockerSettings |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Docker settings not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/docker",
  "appdata": "/mnt/pool1/appdata",
  "docker_net": {
    "mode": "ipvlan",
    "config": [
      {
        "subnet": "10.0.0.0/24",
        "gateway": "10.0.0.5"
      }
    ]
  },
  "filesystem": "btrfs",
  "start_wait": "0",
  "docker_options": "--log-level=info --storage-opt=overlay2.size=10G",
  "update_check": {
    "enabled": true,
    "update_check_schedule": "0 1 * * *",
    "auto_update": {
      "enabled": true,
      "auto_update_schedule": "0 2 * * SAT"
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/docker" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/docker", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/docker` {#post-mos-settings-docker}

**Update Docker settings**

Update Docker service configuration (admin only)

**Request body** (`application/json`)

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/docker",
  "appdata": "/mnt/pool1/appdata",
  "docker_net": {
    "mode": "ipvlan",
    "config": [
      {
        "subnet": "10.0.0.0/24",
        "gateway": "10.0.0.5"
      }
    ]
  },
  "filesystem": "btrfs",
  "start_wait": "0",
  "docker_options": "--log-level=info --storage-opt=overlay2.size=10G",
  "update_check": {
    "enabled": true,
    "update_check_schedule": "0 1 * * *",
    "auto_update": {
      "enabled": true,
      "auto_update_schedule": "0 2 * * SAT"
    }
  }
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Docker settings updated successfully | DockerSettings |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/docker",
  "appdata": "/mnt/pool1/appdata",
  "docker_net": {
    "mode": "ipvlan",
    "config": [
      {
        "subnet": "10.0.0.0/24",
        "gateway": "10.0.0.5"
      }
    ]
  },
  "filesystem": "btrfs",
  "start_wait": "0",
  "docker_options": "--log-level=info --storage-opt=overlay2.size=10G",
  "update_check": {
    "enabled": true,
    "update_check_schedule": "0 1 * * *",
    "auto_update": {
      "enabled": true,
      "auto_update_schedule": "0 2 * * SAT"
    }
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/docker" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"directory":"/mnt/pool1/docker","appdata":"/mnt/pool1/appdata","docker_net":{"mode":"ipvlan","config":[{"subnet":"10.0.0.0/24","gateway":"10.0.0.5"}]},"filesystem":"btrfs","start_wait":"0","docker_options":"--log-level=info --storage-opt=overlay2.size=10G","update_check":{"enabled":true,"update_check_schedule":"0 1 * * *","auto_update":{"enabled":true,"auto_update_schedule":"0 2 * * SAT"}}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/docker", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true,"directory":"/mnt/pool1/docker","appdata":"/mnt/pool1/appdata","docker_net":{"mode":"ipvlan","config":[{"subnet":"10.0.0.0/24","gateway":"10.0.0.5"}]},"filesystem":"btrfs","start_wait":"0","docker_options":"--log-level=info --storage-opt=overlay2.size=10G","update_check":{"enabled":true,"update_check_schedule":"0 1 * * *","auto_update":{"enabled":true,"auto_update_schedule":"0 2 * * SAT"}}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/lxc` {#get-mos-settings-lxc}

**Get LXC settings**

Retrieve current LXC service configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | LXC settings retrieved successfully | LxcSettings |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | LXC settings not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/lxc"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/lxc" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/lxc", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/lxc` {#post-mos-settings-lxc}

**Update LXC settings**

Update LXC service configuration (admin only)

**Request body** (`application/json`)

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/lxc",
  "lxc_registry": "images.linuxcontainers.org"
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | LXC settings updated successfully | LxcSettings |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/lxc",
  "lxc_registry": "images.linuxcontainers.org"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/lxc" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"directory":"/mnt/pool1/lxc","lxc_registry":"images.linuxcontainers.org"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/lxc", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true,"directory":"/mnt/pool1/lxc","lxc_registry":"images.linuxcontainers.org"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/vm` {#get-mos-settings-vm}

**Get VM settings**

Retrieve current VM service configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM settings retrieved successfully | VmSettings |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | VM settings not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": true,
  "iommu_active": false,
  "directory": "/mnt/pool1/vm",
  "vdisk_directory": "/mnt/pool1/vdisk",
  "start_wait": 30,
  "hugepages": {
    "enabled": true,
    "total": 1024,
    "size_mb": 2,
    "free": 512
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/vm" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/vm", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/vm` {#post-mos-settings-vm}

**Update VM settings**

Update VM service configuration (admin only)

**Request body** (`application/json`)

```json
{
  "enabled": true,
  "directory": "/mnt/pool1/docker",
  "docker_options": "--log-level=info"
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VM settings updated successfully | VmSettings |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": true,
  "iommu_active": false,
  "directory": "/mnt/pool1/vm",
  "vdisk_directory": "/mnt/pool1/vdisk",
  "start_wait": 30,
  "hugepages": {
    "enabled": true,
    "total": 1024,
    "size_mb": 2,
    "free": 512
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/vm" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"directory":"/mnt/pool1/docker","docker_options":"--log-level=info"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/vm", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true,"directory":"/mnt/pool1/docker","docker_options":"--log-level=info"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/system/network/interfaces` {#get-mos-system-network-interfaces}

**Detect physical network interfaces**

Scans the system for all physical network interfaces and returns their MAC addresses, link state, and speed. With include=tun, tun/wireguard interfaces (Tailscale, Netbird, WireGuard) are appended. This is a read-only system endpoint without reconciliation (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| include | query | string ["tun"] | No | Also list tun/wireguard interfaces |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Physical interfaces detected successfully | array[object] |
| 401 | Not authenticated | - |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "eth0",
    "mac": "aa:bb:cc:dd:ee:ff",
    "link_state": "up",
    "speed": 1000,
    "adapter": "Ethernet controller: Intel Corporation I225-V",
    "type": "tun",
    "provider": "tailscale"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/system/network/interfaces" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/system/network/interfaces", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/interfaces/reconcile` {#post-mos-settings-network-interfaces-reconcile}

**Reconcile network interfaces**

Matches detected physical interfaces against stored config by MAC address. Updates kernel names, marks orphaned interfaces, and adds new interfaces with DHCP (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Reconciliation completed | object |
| 401 | Not authenticated | - |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "interfaces": [
    {}
  ],
  "changes": [
    {
      "type": "mac_assigned",
      "name": "string",
      "mac": "string"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/interfaces/reconcile" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/interfaces/reconcile", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/network/interfaces` {#get-mos-settings-network-interfaces}

**Get network interfaces**

Retrieve current network interfaces configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Network interfaces retrieved successfully. IPv6 entries always carry dhcp, address, cidr, gateway, dns and a read-only runtime_address field with the address currently active on the interface (SLAAC, DHCPv6 lease or applied static; null if none obtained yet). | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "interfaces": [
    {
      "mac": "aa:bb:cc:dd:ee:ff",
      "name": "eth0",
      "label": null,
      "type": "ethernet",
      "mode": null,
      "interfaces": [],
      "ipv4": [
        {
          "dhcp": true
        }
      ],
      "ipv6": [
        {
          "dhcp": false,
          "address": null,
          "cidr": null,
          "gateway": null,
          "dns": [],
          "runtime_address": "2a02:8071:b8a:fa00:4e52:62ff:feb9:4434"
        }
      ],
      "vlans": [],
      "mtu": null,
      "hw_addr": null,
      "status": "enabled",
      "link_state": "up",
      "speed": 1000,
      "adapter": "Ethernet controller: Intel Corporation I225-V"
    }
  ],
  "pending_changes": false,
  "remaining_seconds": null
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/network/interfaces" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/interfaces", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/interfaces` {#post-mos-settings-network-interfaces}

**Update network interfaces**

Update network interfaces configuration (admin only). Supports ethernet, bridge, bond types with MAC identification, MTU, and MAC spoofing.

**Request body** (`application/json`)

```json
[
  {}
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Network interfaces updated successfully | array[object] |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {}
]
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/interfaces" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/interfaces", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{}])
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/apply` {#post-mos-settings-network-apply}

**Confirm pending network changes**

Confirms pending network changes within the 60-second timeout window. If not called in time, changes are automatically rolled back to the previous configuration. Must be called after any network interface change (update interfaces, add/delete VLAN).

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Network changes confirmed successfully | object |
| 400 | No pending network changes to confirm | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "confirmed": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/apply" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/apply", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/revert` {#post-mos-settings-network-revert}

**Revert pending network changes**

Immediately reverts pending network changes to the previous configuration and restarts networking. Can be used instead of waiting for the automatic rollback timeout.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Network changes reverted successfully | object |
| 400 | No pending network changes to revert | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "reverted": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/revert" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/revert", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/interfaces/{interfaceName}/vlans` {#post-mos-settings-network-interfaces-interfacename-vlans}

**Add VLAN to interface**

Add a new VLAN to a network interface (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| interfaceName | path | string | **Yes** | Name of the interface (e.g., eth0) |

**Request body** (`application/json`)

```json
{
  "vlan_id": 100,
  "ipv4": [
    {
      "dhcp": true
    }
  ],
  "ipv6": [],
  "mtu": null
}
```

| Field | Type | Required |
|-------|------|----------|
| vlan_id | integer — VLAN ID (1-4094) | **Yes** |
| ipv4 | array[object] — IPv4 configuration | No |
| ipv6 | array[object] — IPv6 configuration (max. one entry, empty array disables IPv6) | No |
| mtu | integer — MTU for this VLAN (null inherits from parent interface, 68-9000) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VLAN added successfully | object |
| 400 | Invalid request | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "vlan_id": 0,
  "ipv4": [
    null
  ],
  "ipv6": [
    null
  ],
  "mtu": 0
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/interfaces/{interfaceName}/vlans" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"vlan_id":100,"ipv4":[{"dhcp":true}],"ipv6":[],"mtu":null}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/interfaces/{interfaceName}/vlans", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"vlan_id":100,"ipv4":[{"dhcp":true}],"ipv6":[],"mtu":null})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/settings/network/interfaces/{interfaceName}/vlans/{vlanId}` {#delete-mos-settings-network-interfaces-interfacename-vlans-vlanid}

**Delete VLAN from interface**

Delete a VLAN from a network interface (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| interfaceName | path | string | **Yes** | Name of the interface (e.g., eth0) |
| vlanId | path | integer | **Yes** | VLAN ID to delete |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VLAN deleted successfully | object |
| 400 | Invalid request or VLAN not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/settings/network/interfaces/{interfaceName}/vlans/{vlanId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/interfaces/{interfaceName}/vlans/{vlanId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/network/services` {#get-mos-settings-network-services}

**Get network services**

Retrieve current network services configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Network services retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "ssh": {
    "enabled": true
  },
  "samba": {
    "enabled": true
  },
  "nfs": {
    "enabled": false
  },
  "nut": {
    "enabled": false
  },
  "tailscale": {
    "enabled": true,
    "update_check": false,
    "tailscaled_params": "",
    "web": {
      "enabled": false,
      "address": "0.0.0.0",
      "port": 8088
    },
    "online": true
  },
  "netbird": {
    "enabled": false,
    "update_check": false,
    "netbird_service_params": ""
  },
  "rsync_daemon": {
    "enabled": false
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/network/services" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/services", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/services` {#post-mos-settings-network-services}

**Update network services**

Update network services configuration (admin only)

**Request body** (`application/json`)

```json
{
  "samba": {
    "enabled": true
  },
  "nfs": {
    "enabled": true
  },
  "nut": {
    "enabled": false
  },
  "rsync_daemon": {
    "enabled": false
  }
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Network services updated successfully | object |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/services" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"samba":{"enabled":true},"nfs":{"enabled":true},"nut":{"enabled":false},"rsync_daemon":{"enabled":false}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/services", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"samba":{"enabled":true},"nfs":{"enabled":true},"nut":{"enabled":false},"rsync_daemon":{"enabled":false}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/network/services/rsync/config` {#get-mos-settings-network-services-rsync-config}

**Get rsync daemon configuration**

Read the rsyncd.conf stored in /boot/config/system/rsync/rsyncd.conf (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Configuration file does not exist yet | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "path": "/boot/config/system/rsync/rsyncd.conf",
  "content": "[data]\n  path = /mnt/pool/data\n  read only = no\n",
  "size": 512
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/network/services/rsync/config" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/services/rsync/config", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/services/rsync/config` {#post-mos-settings-network-services-rsync-config}

**Update rsync daemon configuration**

Writes the rsyncd.conf to /boot/config/system/rsync/rsyncd.conf, creating the
directory and the file if they do not exist yet. When the content actually changed
and the rsync_daemon service is enabled, the daemon is stopped and started again.


**Request body** (`application/json`)

```json
{
  "content": "[data]\n  path = /mnt/pool/data\n  read only = no\n",
  "create_backup": false
}
```

| Field | Type | Required |
|-------|------|----------|
| content | string — New rsyncd.conf content | **Yes** |
| create_backup | boolean — Whether to create a backup file with .backup extension | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration updated successfully | object |
| 400 | Bad request - missing or invalid content | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "File edited successfully",
  "path": "/boot/config/system/rsync/rsyncd.conf",
  "backupPath": null,
  "changed": true,
  "restarted": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/services/rsync/config" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content":"[data]\n  path = /mnt/pool/data\n  read only = no\n","create_backup":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/services/rsync/config", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"content":"[data]\n  path = /mnt/pool/data\n  read only = no\n","create_backup":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/network/services/samba/config` {#get-mos-settings-network-services-samba-config}

**Get Samba extra configuration**

Read the Samba extra configuration files stored in /boot/config/system/samba/ (admin only). Returns global_extra.conf and shares_extra.conf content.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "global": "server min protocol = SMB2\n",
  "shares": "[custom]\n  path = /mnt/pool/custom\n  read only = no\n"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/network/services/samba/config" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/services/samba/config", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/network/services/samba/config` {#post-mos-settings-network-services-samba-config}

**Update Samba extra configuration**

Writes the Samba extra configuration files to /boot/config/system/samba/, creating
the directory and files if they do not exist yet. Only provided fields are written.
When any content actually changed and the samba service is enabled, the smbd daemon
is restarted. If samba_discovery is also enabled, nmbd and wsddn are restarted as well.
Null values are treated as empty strings.


**Request body** (`application/json`)

```json
{
  "global": "server min protocol = SMB2\n",
  "shares": "[custom]\n  path = /mnt/pool/custom\n  read only = no\n",
  "create_backup": false
}
```

| Field | Type | Required |
|-------|------|----------|
| global | string — New global_extra.conf content | No |
| shares | string — New shares_extra.conf content | No |
| create_backup | boolean — Whether to create backup files with .backup extension | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Configuration updated successfully | object |
| 400 | Bad request - missing or invalid content | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "changed": true,
  "restarted": true,
  "backupPaths": [
    "/boot/config/system/samba/global_extra.conf.backup"
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/network/services/samba/config" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"global":"server min protocol = SMB2\n","shares":"[custom]\n  path = /mnt/pool/custom\n  read only = no\n","create_backup":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/network/services/samba/config", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"global":"server min protocol = SMB2\n","shares":"[custom]\n  path = /mnt/pool/custom\n  read only = no\n","create_backup":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/system` {#get-mos-settings-system}

**Get system settings**

Retrieve current system configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | System settings retrieved successfully | SystemSettings |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | System settings not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "hostname": "mos-server",
  "global_spindown": true,
  "timezone": "Europe/Berlin",
  "display": {
    "timeout": 30,
    "powersave": "on",
    "powerdown": 60
  },
  "persist_history": false,
  "webui": {
    "ports": {
      "http": 80
    },
    "listen_interfaces": [
      "eth0"
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/system" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/system", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/system` {#post-mos-settings-system}

**Update system settings**

Update system configuration including hostname, global_spindown, keymap, timezone, NTP, notification sounds, and CPU frequency settings (admin only)

**Request body** (`application/json`)

```json
{
  "hostname": "new-mos-server",
  "global_spindown": false,
  "timezone": "Europe/Berlin",
  "display": {
    "timeout": 60,
    "powersave": "off",
    "powerdown": 120
  },
  "persist_history": true,
  "notification_sound": {
    "startup": true,
    "reboot": false,
    "shutdown": true
  }
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | System settings updated successfully | SystemSettings |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "hostname": "mos-server",
  "global_spindown": true,
  "timezone": "Europe/Berlin",
  "display": {
    "timeout": 30,
    "powersave": "on",
    "powerdown": 60
  },
  "persist_history": false,
  "notification_sound": {
    "startup": true,
    "reboot": true,
    "shutdown": true
  },
  "swapfile": {
    "enabled": false,
    "path": "/mnt/pool1",
    "size": "10G",
    "priority": -2,
    "config": {
      "zswap": false,
      "shrinker": true,
      "max_pool_percent": 20,
      "compressor": "zstd",
      "accept_threshold_percent": 90
    }
  },
  "webui": {
    "ports": {
      "http": 80
    }
  },
  "update_check": {
    "enabled": false,
    "update_check_schedule": "0 1 * * *"
  },
  "logsize": 200
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/system" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"hostname":"new-mos-server","global_spindown":false,"timezone":"Europe/Berlin","display":{"timeout":60,"powersave":"off","powerdown":120},"persist_history":true,"notification_sound":{"startup":true,"reboot":false,"shutdown":true}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/system", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"hostname":"new-mos-server","global_spindown":false,"timezone":"Europe/Berlin","display":{"timeout":60,"powersave":"off","powerdown":120},"persist_history":true,"notification_sound":{"startup":true,"reboot":false,"shutdown":true}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/notifications/providers` {#get-mos-settings-notifications-providers}

**Get all notification providers**

Retrieve all notification provider configurations (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All providers retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "<key>": null
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/notifications/providers" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/providers", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/notifications/providers` {#post-mos-settings-notifications-providers}

**Create a new notification provider**

Create a new notification provider configuration (admin only). The name "email" is reserved.

**Request body** (`application/json`)

```json
{
  "name": "discord",
  "enabled": false,
  "user": false,
  "token": false,
  "url": "string",
  "method": "GET",
  "headers": {},
  "body": {},
  "alert_mapping": {},
  "color_prio": {}
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | **Yes** |
| enabled | boolean | No |
| user | - | No |
| token | - | No |
| url | string | No |
| method | string ["GET","POST","PUT","PATCH","DELETE"] | No |
| headers | object | No |
| body | object | No |
| alert_mapping | object | No |
| color_prio | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Provider created successfully | NotificationProvider |
| 400 | Invalid request (bad name, reserved name, or invalid fields) | Error |
| 409 | Provider already exists | Error |
| 500 | Server error | Error |

Example `201` response:

```json

```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/notifications/providers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"discord","enabled":false,"user":false,"token":false,"url":"string","method":"GET","headers":{},"body":{},"alert_mapping":{},"color_prio":{}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/providers", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"discord","enabled":false,"user":false,"token":false,"url":"string","method":"GET","headers":{},"body":{},"alert_mapping":{},"color_prio":{}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/notifications/providers/{name}` {#get-mos-settings-notifications-providers-name}

**Get a single notification provider**

Retrieve a specific notification provider configuration by name (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Provider name (e.g. "discord", "gotify") |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Provider retrieved successfully | NotificationProvider |
| 400 | Invalid provider name | Error |
| 404 | Provider not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json

```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/notifications/providers/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/providers/{name}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PATCH` `/mos/settings/notifications/providers/{name}` {#patch-mos-settings-notifications-providers-name}

**Update a notification provider**

Partially update a notification provider configuration (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Provider name |

**Request body** (`application/json`)

```json
{
  "enabled": false,
  "user": false,
  "token": false,
  "url": "string",
  "method": "GET",
  "headers": {},
  "body": {},
  "alert_mapping": {},
  "color_prio": {}
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean | No |
| user | - | No |
| token | - | No |
| url | string | No |
| method | string ["GET","POST","PUT","PATCH","DELETE"] | No |
| headers | object | No |
| body | object | No |
| alert_mapping | object | No |
| color_prio | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Provider updated successfully | NotificationProvider |
| 400 | Invalid request | Error |
| 404 | Provider not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json

```

**Example request**

```bash
curl -X PATCH "http://<MOS-IP>/api/v1/mos/settings/notifications/providers/{name}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false,"user":false,"token":false,"url":"string","method":"GET","headers":{},"body":{},"alert_mapping":{},"color_prio":{}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/providers/{name}", {
  method: 'PATCH',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":false,"user":false,"token":false,"url":"string","method":"GET","headers":{},"body":{},"alert_mapping":{},"color_prio":{}})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/settings/notifications/providers/{name}` {#delete-mos-settings-notifications-providers-name}

**Delete a notification provider**

Delete a notification provider configuration (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| name | path | string | **Yes** | Provider name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Provider deleted successfully | object |
| 400 | Invalid provider name | Error |
| 404 | Provider not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "message": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/settings/notifications/providers/{name}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/providers/{name}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/settings/notifications/email` {#get-mos-settings-notifications-email}

**Get email notification provider config**

Retrieve the email notification provider configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Email config retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "enabled": false,
  "smtp_host": "string",
  "smtp_port": 0,
  "smtp_tls": false,
  "smtp_user": "string",
  "smtp_password": "string",
  "from": "string",
  "to": [
    "string"
  ],
  "subject": "string",
  "body": "string",
  "alert_mapping": {}
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/settings/notifications/email" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/email", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/settings/notifications/email` {#post-mos-settings-notifications-email}

**Update email notification provider config**

Create or update the email notification provider configuration (admin only)

**Request body** (`application/json`)

```json
{
  "enabled": false,
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_tls": true,
  "smtp_user": "string",
  "smtp_password": "string",
  "from": "server@example.com",
  "to": [
    "admin@example.com"
  ],
  "subject": "{{.Title}}",
  "body": "{{.Message}}",
  "alert_mapping": {}
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean | No |
| smtp_host | string | No |
| smtp_port | integer | No |
| smtp_tls | boolean | No |
| smtp_user | string | No |
| smtp_password | string | No |
| from | string | No |
| to | array[string] | No |
| subject | string | No |
| body | string | No |
| alert_mapping | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Email config updated successfully | object |
| 400 | Invalid request (validation error) | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/settings/notifications/email" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false,"smtp_host":"smtp.gmail.com","smtp_port":587,"smtp_tls":true,"smtp_user":"string","smtp_password":"string","from":"server@example.com","to":["admin@example.com"],"subject":"{{.Title}}","body":"{{.Message}}","alert_mapping":{}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/settings/notifications/email", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":false,"smtp_host":"smtp.gmail.com","smtp_port":587,"smtp_tls":true,"smtp_user":"string","smtp_password":"string","from":"server@example.com","to":["admin@example.com"],"subject":"{{.Title}}","body":"{{.Message}}","alert_mapping":{}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/update_api` {#post-mos-update-api}

**Update the API service**

Update the API service immediately - useful after API updates (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | API update initiated successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "API update initiated",
  "service": "api",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/update_api" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/update_api", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/update_ui` {#post-mos-update-ui}

**Update the UI service (nginx)**

Update the UI service (nginx) immediately (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | UI update initiated successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "UI update initiated",
  "service": "nginx",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/update_ui" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/update_ui", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/recreatecerts` {#post-mos-recreatecerts}

**Recreate SSL certificates**

Recreates SSL certificates via nginx recreatecerts and restarts nginx (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Certificate recreation result | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "recreatecerts": "success",
  "nginx_restart": "success",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/recreatecerts" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/recreatecerts", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/certificates` {#get-mos-certificates}

**Get SSL certificate information**

Returns validity, subject, issuer, fingerprint and expiry information for the nginx and root CA certificates (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Certificate information retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "nginx": {
    "subject": "CN = MOS",
    "issuer": "CN = MOS Root CA",
    "not_before": "Jan 15 10:30:00 2024 GMT",
    "not_after": "Jan 15 10:30:00 2025 GMT",
    "serial": "1000",
    "fingerprint_sha256": "AA:BB:CC:...",
    "days_remaining": 365,
    "expired": false,
    "file": "/boot/config/system/ssl/nginx.crt"
  },
  "root_ca": {
    "subject": "string",
    "issuer": "string",
    "not_before": "string",
    "not_after": "string",
    "serial": "string",
    "fingerprint_sha256": "string",
    "days_remaining": 0,
    "expired": false,
    "file": "/boot/config/system/ssl/root/ca.crt"
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/certificates" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/certificates", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/services` {#get-mos-services}

**Get all service status**

Retrieve current status of all MOS services including Docker, LXC, VM and network services in flat structure (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Service status retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "docker": {
    "enabled": true,
    "running": true
  },
  "lxc": {
    "enabled": false
  },
  "vm": {
    "enabled": true,
    "running": true
  },
  "ssh": {
    "enabled": true
  },
  "samba": {
    "enabled": true
  },
  "samba_discovery": {
    "enabled": false
  },
  "nfs": {
    "enabled": false
  },
  "nut": {
    "enabled": true
  },
  "iscsi_target": {
    "enabled": true
  },
  "iscsi_initiator": {
    "enabled": false
  },
  "tailscale": {
    "enabled": false,
    "web": {
      "enabled": false,
      "address": "0.0.0.0",
      "port": 8088
    }
  },
  "netbird": {
    "enabled": false
  },
  "llm": {
    "enabled": true
  },
  "mos": {
    "supporter": false
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/services" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/services", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/restart/service` {#post-mos-restart-service}

**Restart generic service**

Restart generic service immediately - supports 'api' and 'nginx' (admin only)

**Request body** (`application/json`)

```json
{
  "service": "api"
}
```

| Field | Type | Required |
|-------|------|----------|
| service | string ["api","nginx"] — Service to restart | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Service restart scheduled successfully | object |
| 400 | Invalid request body or service name | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "api restart initiated",
  "service": "api",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/restart/service" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"service":"api"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/restart/service", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"service":"api"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/updateos` {#post-mos-updateos}

**Update MOS**

Initiate OS update using mos-os_update script (admin only)

**Request body** (`application/json`)

```json
{
  "version": "latest",
  "channel": "stable",
  "update_kernel": true,
  "update_plugins": true
}
```

| Field | Type | Required |
|-------|------|----------|
| version | string — Version to update to - either "latest" or version number (e.g., 0.0.0, 1.223.1) | **Yes** |
| channel | string ["alpha","beta","stable"] — Update channel | **Yes** |
| update_kernel | boolean — Whether to update kernel (default true, omit from script if false) | No |
| update_plugins | boolean — Update all plugins before OS update (checks for updates, updates if available, sends notifications) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | OS update initiated successfully | object |
| 400 | Invalid request parameters | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "OS update initiated successfully",
  "version": "latest",
  "channel": "stable",
  "updateKernel": true,
  "command": "/usr/local/bin/mos-os_update latest stable update_kernel",
  "output": "Update process started...",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/updateos" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"version":"latest","channel":"stable","update_kernel":true,"update_plugins":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/updateos", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"version":"latest","channel":"stable","update_kernel":true,"update_plugins":true})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/rollbackos` {#post-mos-rollbackos}

**Rollback MOS**

Initiate OS rollback using mos-os_update rollback_mos script (admin only)

**Request body** (`application/json`)

```json
{
  "kernel_rollback": true
}
```

| Field | Type | Required |
|-------|------|----------|
| kernel_rollback | boolean — Whether to rollback kernel (default true, adds 'not_kernel' argument if false) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | OS rollback initiated successfully | object |
| 400 | Invalid request or rollback failed | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "OS rollback initiated successfully",
  "kernelRollback": true,
  "command": "/usr/local/bin/mos-os_update rollback_mos",
  "output": "Rollback process started...",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/rollbackos" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"kernel_rollback":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/rollbackos", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"kernel_rollback":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/getreleases` {#get-mos-getreleases}

**Get available MOS releases**

Retrieve available releases grouped by channel (alpha, beta, stable) using mos-os_get_releases script (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Releases grouped by channel | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error or script execution failed | Error |

Example `200` response:

```json
{
  "alpha": [
    {
      "tag_name": "0.0.1-alpha.2",
      "html_url": "https://github.com/mos-nas/mos-releases/releases/tag/0.0.1-alpha.2"
    },
    {
      "tag_name": "0.0.1-alpha.1",
      "html_url": "https://github.com/mos-nas/mos-releases/releases/tag/0.0.1-alpha.1"
    }
  ],
  "beta": [],
  "stable": []
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/getreleases" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/getreleases", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/osinfo` {#get-mos-osinfo}

**Get current MOS and CPU information**

Retrieve current OS release information from /etc/mos-release.json combined with CPU details and hostname (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Current OS and CPU information | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error or file read failed | Error |

Example `200` response:

```json
{
  "hostname": "mos-server",
  "cpu": {
    "manufacturer": "Intel",
    "brand": "Intel(R) Core(TM) i7-12700K",
    "cores": 12,
    "physicalCores": 8
  },
  "uptime": {
    "pretty": "2 hours, 34 minutes",
    "since": "2025-10-26 10:30:00"
  },
  "mos": {
    "version": "0.0.1-alpha.4",
    "channel": "alpha",
    "running_kernel": "5.15.0-generic",
    "arch": "x86_64"
  },
  "build_date": "2025-08-24"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/osinfo" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/osinfo", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/getkernel` {#get-mos-getkernel}

**Get available kernel releases**

Retrieve available kernel releases sorted by version (newest first) using mos-kernel_getreleases script (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sorted array of kernel releases (newest first) | array[object] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error or script execution failed | Error |

Example `200` response:

```json
[
  {
    "tag_name": "6.17.1-mos",
    "html_url": "https://github.com/mos-nas/kernel-releases/releases/tag/6.17.1-mos"
  },
  {
    "tag_name": "6.17.0-mos",
    "html_url": "https://github.com/mos-nas/kernel-releases/releases/tag/6.17.0-mos"
  },
  {
    "tag_name": "6.1.0",
    "html_url": "https://github.com/mos-nas/kernel-releases/releases/tag/6.1.0"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/getkernel" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/getkernel", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/getdrivers` {#get-mos-getdrivers}

**Get available driver releases**

Retrieve available driver releases grouped by category using mos-drivers_get_releases script (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| kernelVersion | query | string | No | Optional kernel version/uname. If not provided, uses current system kernel (uname -r) |
| excludeinstalled | query | boolean | No | Optional. If true, filters out already installed drivers. If not provided, returns all available drivers |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Driver releases grouped by category | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error or script execution failed | Error |

Example `200` response:

```json
{
  "dvb": {
    "dvb-digital-devices": [
      "20250910-1",
      "20250911-1"
    ],
    "dvb-libreelec": [
      "1231-1"
    ]
  },
  "coral": {
    "coral": [
      "20240425-1"
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/getdrivers" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/getdrivers", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/installeddrivers` {#get-mos-installeddrivers}

**Get installed drivers**

Retrieve installed drivers from /boot/optional/drivers/ for the current running kernel grouped by category (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Installed drivers grouped by category | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "dvb": {
    "dvb-digital-devices": [
      "20250910-1"
    ]
  },
  "coral": {
    "coral": [
      "20240425-1"
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/installeddrivers" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/installeddrivers", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/drivers` {#post-mos-drivers}

**Download or upgrade drivers**

Download a specific driver (using complete packagename OR drivername+driverversion) or check for driver updates using mos-driver_download script (admin only)

**Request body** (`application/json`)

```json
{
  "packagename": "dvb-digital-devices_20250910-1+mos_amd64.deb",
  "kernelVersion": "6.17.1-mos"
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Driver download/upgrade initiated successfully | object |
| 400 | Invalid request parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error or script execution failed | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Driver download initiated successfully",
  "upgrade": false,
  "packagename": "dvb-digital-devices_20250910-1+mos_amd64.deb",
  "drivername": "dvb-digital-devices",
  "driverversion": "20250910-1",
  "kernelVersion": "6.17.1-mos",
  "command": "/usr/local/bin/mos-driver_download \"dvb-digital-devices_20250910-1+mos_amd64.deb\" \"6.17.1-mos\"",
  "output": "string",
  "error": "string",
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/drivers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"packagename":"dvb-digital-devices_20250910-1+mos_amd64.deb","kernelVersion":"6.17.1-mos"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/drivers", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"packagename":"dvb-digital-devices_20250910-1+mos_amd64.deb","kernelVersion":"6.17.1-mos"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/drivers` {#delete-mos-drivers}

**Delete a driver**

Delete a specific driver package from /boot/optional/drivers/ (admin only)

**Request body** (`application/json`)

```json
{
  "packagename": "dvb-digital-devices_20250910-1+mos_amd64.deb"
}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Driver deleted successfully | object |
| 400 | Invalid request parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Driver package not found | Error |
| 500 | Server error or deletion failed | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Driver deleted successfully",
  "packagename": "dvb-digital-devices_20250910-1+mos_amd64.deb",
  "drivername": "dvb-digital-devices",
  "driverversion": "20250910-1",
  "category": "dvb",
  "kernelVersion": "6.17.1-mos",
  "path": "/boot/optional/drivers/dvb/6.17.1-mos/dvb-digital-devices_20250910-1+mos_amd64.deb",
  "timestamp": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/drivers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"packagename":"dvb-digital-devices_20250910-1+mos_amd64.deb"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/drivers", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"packagename":"dvb-digital-devices_20250910-1+mos_amd64.deb"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/updatekernel` {#post-mos-updatekernel}

**Update kernel**

Initiate kernel update using mos-kernel_update script (admin only)

**Request body** (`application/json`)

```json
{
  "version": "recommended"
}
```

| Field | Type | Required |
|-------|------|----------|
| version | string — Version to update to - either "recommended" or version number (e.g., 6.1.0, 6.17.1-mos) | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Kernel update initiated successfully | object |
| 400 | Invalid request parameters | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Kernel update initiated successfully",
  "version": "recommended",
  "command": "/usr/local/bin/mos-kernel_update recommended",
  "output": "Kernel update process started...",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/updatekernel" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"version":"recommended"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/updatekernel", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"version":"recommended"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/rollbackkernel` {#post-mos-rollbackkernel}

**Rollback kernel**

Initiate kernel rollback using mos-kernel_update rollback script (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Kernel rollback initiated successfully | object |
| 400 | Invalid request or rollback failed | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Kernel rollback initiated successfully",
  "command": "/usr/local/bin/mos-kernel_update rollback",
  "output": "Kernel rollback process started...",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/rollbackkernel" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/rollbackkernel", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/bootbackupfiles` {#get-mos-bootbackupfiles}

**Get boot backup files**

Retrieve array of .tar and .tar.gz backup files from the boot backup destination (admin only). Returns empty array if backup plugin not installed or no backup path configured

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Boot backup files retrieved successfully | array[string] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  "/mnt/cache/backup/boot/backup-2024-01-15.tar.gz"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/bootbackupfiles" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/bootbackupfiles", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/installtodisk` {#post-mos-installtodisk}

**Install MOS to disk**

Install MOS to a specified disk with the specified filesystem using mos-install script (admin only)

**Request body** (`application/json`)

```json
{
  "disk": "/dev/sda",
  "filesystem": "ext4",
  "extra_partition": false,
  "tar_file": "/mnt/cache/backup/boot/backup-2026-05-31_05-00-09.tar",
  "backup_label": false
}
```

| Field | Type | Required |
|-------|------|----------|
| disk | string — Disk device path (e.g., /dev/sda, /dev/nvme0n1) | **Yes** |
| filesystem | string ["vfat","ext4","btrfs","xfs"] — Filesystem type for the installation | **Yes** |
| extra_partition | boolean — Whether to create an extra partition | No |
| tar_file | string — Optional path to tar backup file for restoration | No |
| backup_label | boolean — Whether to add backup label | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | MOS installation to disk initiated successfully | object |
| 400 | Invalid request parameters | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "MOS installation to disk initiated successfully",
  "disk": "/dev/sda",
  "filesystem": "ext4",
  "extra_partition": false,
  "tar_file": "/mnt/cache/backup/boot/backup-2026-05-31_05-00-09.tar",
  "command": "bash /usr/local/bin/mos-install /dev/sda ext4 quiet false",
  "output": "Installation process started...",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/installtodisk" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"disk":"/dev/sda","filesystem":"ext4","extra_partition":false,"tar_file":"/mnt/cache/backup/boot/backup-2026-05-31_05-00-09.tar","backup_label":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/installtodisk", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"disk":"/dev/sda","filesystem":"ext4","extra_partition":false,"tar_file":"/mnt/cache/backup/boot/backup-2026-05-31_05-00-09.tar","backup_label":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/dashboard` {#get-mos-dashboard}

**Get dashboard layout**

Retrieve current dashboard card layout configuration (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Dashboard layout retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "left": [
    {
      "id": "C1",
      "name": "Card1"
    }
  ],
  "right": [
    {
      "id": "C2",
      "name": "Card2"
    }
  ],
  "visibility": {
    "Card1": true,
    "Card2": false
  },
  "interface": "eth0"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/dashboard" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/dashboard", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/dashboard` {#post-mos-dashboard}

**Update dashboard layout**

Update dashboard card layout configuration (admin only)

**Request body** (`application/json`)

```json
{
  "left": [
    {
      "id": "C1",
      "name": "Card1"
    }
  ],
  "right": [
    {
      "id": "C2",
      "name": "Card2"
    }
  ],
  "visibility": {
    "Card1": true,
    "Card2": false
  },
  "interface": "eth0"
}
```

| Field | Type | Required |
|-------|------|----------|
| left | array[object] — Cards in the left column | **Yes** |
| right | array[object] — Cards in the right column | **Yes** |
| visibility | object — Visibility state for each card (key is card name, value is boolean) | **Yes** |
| interface | string — Network interface to monitor on dashboard (default eth0) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Dashboard layout updated successfully | object |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "left": [
    {
      "id": "string",
      "name": "string"
    }
  ],
  "right": [
    {
      "id": "string",
      "name": "string"
    }
  ],
  "visibility": {
    "<key>": false
  },
  "interface": "eth0"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/dashboard" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"left":[{"id":"C1","name":"Card1"}],"right":[{"id":"C2","name":"Card2"}],"visibility":{"Card1":true,"Card2":false},"interface":"eth0"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/dashboard", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"left":[{"id":"C1","name":"Card1"}],"right":[{"id":"C2","name":"Card2"}],"visibility":{"Card1":true,"Card2":false},"interface":"eth0"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/readfile` {#get-mos-readfile}

**Read a file from the filesystem**

Read the content of any file on the filesystem

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | query | string | **Yes** | Absolute path to the file to read |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | File content retrieved successfully | object |
| 400 | Bad request - missing path parameter | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | File not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "path": "/etc/config.txt",
  "content": "file content here",
  "size": 1024
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/readfile" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/readfile", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/editfile` {#post-mos-editfile}

**Edit a file on the filesystem**

Edit any file on the filesystem. Creates a backup with .backup extension if create_backup is true

**Request body** (`application/json`)

```json
{
  "path": "/etc/config.txt",
  "content": "new file content",
  "create_backup": true
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the file to edit | **Yes** |
| content | string — New content for the file | **Yes** |
| create_backup | boolean — Whether to create a backup file with .backup extension | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | File edited successfully | object |
| 400 | Bad request - missing required parameters | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | File not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "File edited successfully",
  "backupPath": "/etc/config.txt.backup"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/editfile" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/etc/config.txt","content":"new file content","create_backup":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/editfile", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/etc/config.txt","content":"new file content","create_backup":true})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/rename` {#post-mos-rename}

**Rename a file or directory**

Renames a file or directory by changing only its name within the same parent directory.
This is a synchronous operation and returns immediately.

**Validation:**
- `new_name` must not contain forbidden characters: `\ / : * ? " < > |` or control characters
- `new_name` must not have leading/trailing whitespace
- `new_name` must not be identical to the current name
- Case-only changes (e.g., `Movies` → `movies`) are allowed (Linux is case-sensitive)
- An error is thrown if a file/directory with `new_name` already exists in the same directory


**Request body** (`application/json`)

```json
{
  "destination": "/mnt/Pool1/media/old-folder",
  "new_name": "new-folder"
}
```

| Field | Type | Required |
|-------|------|----------|
| destination | string — Full path to the file or directory to rename | **Yes** |
| new_name | string — New name (filename only, no path separators or invalid characters) | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Rename successful | object |
| 400 | Invalid parameters or name already exists | Error |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "source": "/mnt/Pool1/media/old-folder",
  "destination": "/mnt/Pool1/media/new-folder",
  "new_name": "new-folder"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/rename" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"destination":"/mnt/Pool1/media/old-folder","new_name":"new-folder"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/rename", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"destination":"/mnt/Pool1/media/old-folder","new_name":"new-folder"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/createfile` {#post-mos-createfile}

**Create a new file on the filesystem**

Create a new file with optional content and ownership/permission settings

**Request body** (`application/json`)

```json
{
  "path": "/mnt/pool1/newfile.txt",
  "content": "file content here",
  "user": "500",
  "group": "500",
  "permissions": "777"
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the file to create | **Yes** |
| content | string — Content for the new file (default empty) | No |
| user | string — User ID or username for file ownership | No |
| group | string — Group ID or group name for file ownership | No |
| permissions | string — File permissions in octal format | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | File created successfully | object |
| 400 | Bad request - missing path or file already exists | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "File created successfully",
  "path": "/mnt/pool1/newfile.txt",
  "user": "500",
  "group": "500",
  "permissions": "777"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/createfile" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/pool1/newfile.txt","content":"file content here","user":"500","group":"500","permissions":"777"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/createfile", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/pool1/newfile.txt","content":"file content here","user":"500","group":"500","permissions":"777"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/createfolder` {#post-mos-createfolder}

**Create a new folder on the filesystem**

Create a new folder with optional ownership/permission settings

**Request body** (`application/json`)

```json
{
  "path": "/mnt/pool1/newfolder",
  "user": "500",
  "group": "500",
  "permissions": "777"
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the folder to create | **Yes** |
| user | string — User ID or username for folder ownership | No |
| group | string — Group ID or group name for folder ownership | No |
| permissions | string — Folder permissions in octal format | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Folder created successfully | object |
| 400 | Bad request - missing path or folder already exists | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Folder created successfully",
  "path": "/mnt/pool1/newfolder",
  "user": "500",
  "group": "500",
  "permissions": "777"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/createfolder" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/pool1/newfolder","user":"500","group":"500","permissions":"777"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/createfolder", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/pool1/newfolder","user":"500","group":"500","permissions":"777"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/delete` {#post-mos-delete}

**Delete a file or folder from the filesystem**

Delete a file or folder with optional force and recursive flags.
- For files: deletes the file directly
- For empty folders: deletes without recursive flag
- For non-empty folders: requires recursive=true


**Request body** (`application/json`)

```json
{
  "path": "/mnt/pool1/oldfile.txt",
  "force": true,
  "recursive": false
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the file or folder to delete | **Yes** |
| force | boolean — Force deletion (ignore nonexistent files) | No |
| recursive | boolean — Recursively delete directories (required for non-empty folders) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Item deleted successfully | object |
| 400 | Bad request - missing path or directory not empty | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Path not found (when force=false) | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "File deleted successfully",
  "path": "/mnt/pool1/oldfile.txt",
  "type": "file",
  "recursive": false,
  "force": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/delete" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/pool1/oldfile.txt","force":true,"recursive":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/delete", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/pool1/oldfile.txt","force":true,"recursive":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/chown` {#post-mos-chown}

**Change ownership of a file or folder**

Change the user and group ownership of a file or folder, optionally recursive

**Request body** (`application/json`)

```json
{
  "path": "/mnt/pool1/myfile.txt",
  "user": "500",
  "group": "500",
  "recursive": false
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the file or folder | **Yes** |
| user | string — User ID or username for ownership | No |
| group | string — Group ID or group name for ownership | No |
| recursive | boolean — Apply ownership change recursively | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Ownership changed successfully | object |
| 400 | Bad request - missing path | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Path not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Ownership changed successfully",
  "path": "/mnt/pool1/myfile.txt",
  "user": "500",
  "group": "500",
  "recursive": false
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/chown" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/pool1/myfile.txt","user":"500","group":"500","recursive":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/chown", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/pool1/myfile.txt","user":"500","group":"500","recursive":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/chmod` {#post-mos-chmod}

**Change permissions of a file or folder**

Change the permissions of a file or folder, optionally recursive

**Request body** (`application/json`)

```json
{
  "path": "/mnt/pool1/myfile.txt",
  "permissions": "777",
  "recursive": false
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the file or folder | **Yes** |
| permissions | string — Permissions in octal format | No |
| recursive | boolean — Apply permission change recursively | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Permissions changed successfully | object |
| 400 | Bad request - missing path | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Path not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Permissions changed successfully",
  "path": "/mnt/pool1/myfile.txt",
  "permissions": "777",
  "recursive": false
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/chmod" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/pool1/myfile.txt","permissions":"777","recursive":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/chmod", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/pool1/myfile.txt","permissions":"777","recursive":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/dashboard/interface` {#get-mos-dashboard-interface}

**Get dashboard network interface setting**

Retrieve which network interface is monitored on the dashboard. Returns 'eth0' by default if not configured.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Dashboard interface retrieved successfully | object |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "interface": "eth0"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/dashboard/interface" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/dashboard/interface", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/dashboard/interface` {#post-mos-dashboard-interface}

**Update dashboard network interface setting**

Set which network interface is monitored on the dashboard (system load websocket and /system/load endpoint).
Valid interface names include eth0, eth1, br0, bond0, eth0.100 (VLAN), etc.
If set to empty or invalid, defaults back to eth0.


**Request body** (`application/json`)

```json
{
  "interface": "br0"
}
```

| Field | Type | Required |
|-------|------|----------|
| interface | string — Network interface name to monitor | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Dashboard interface updated successfully | object |
| 400 | Invalid interface name | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "interface": "br0"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/dashboard/interface" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"interface":"br0"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/dashboard/interface", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"interface":"br0"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/fsnavigator` {#get-mos-fsnavigator}

**Browse filesystem with directory/file picker**

Navigate directories and files with optional virtual root.
- Without `roots` parameter: Full filesystem access (real `/` with all directories)
- With `roots` parameter: Virtual root showing only specified directories


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | query | string | No | Path to browse |
| type | query | string ["directories","all"] | No | Type of items to return - "directories" shows only folders, "all" shows folders and files |
| roots | query | string | No | Optional comma-separated list of allowed root directories for virtual root. When specified with path="/", creates a virtual root showing only these directories. Without this parameter, full filesystem access is granted.  |
| includeHidden | query | string [true,false] | No | Whether to include hidden files and folders (starting with .) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Directory listing with navigation info | object |
| 400 | Invalid type parameter | Error |
| 401 | Not authenticated | Error |
| 403 | Path outside allowed directories | Error |
| 404 | Path does not exist | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "isVirtualRoot": false,
  "currentPath": "/mnt/nvme",
  "parentPath": "/mnt",
  "canGoUp": true,
  "items": [
    {
      "name": "appdata",
      "path": "/mnt/nvme/appdata",
      "type": "directory",
      "size": null,
      "size_human": null,
      "modified": "2024-11-25T14:30:00.000Z",
      "isSymlink": false,
      "symlinkTarget": null,
      "permissions": {
        "octal": "755",
        "owner": "root",
        "group": "root"
      }
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/fsnavigator" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fsnavigator", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/fsnavigator/calc` {#post-mos-fsnavigator-calc}

**Calculate directory size**

Recursively calculates the total size of a directory and returns it in human-readable format based on user byte_format preference (admin only)

**Request body** (`application/json`)

```json
{
  "path": "/mnt/nvme/appdata"
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Absolute path to the directory to calculate size for | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Directory size calculated successfully | object |
| 400 | Path is not a directory or invalid request | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Path does not exist | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "path": "/mnt/nvme/appdata",
  "size": 1073741824,
  "size_human": "1.0 GiB"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/fsnavigator/calc" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/nvme/appdata"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fsnavigator/calc", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/nvme/appdata"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/fsnavigator/bookmarks` {#get-mos-fsnavigator-bookmarks}

**List all filesystem bookmarks**

Returns all saved filesystem bookmarks

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Array of bookmarks | array[object] |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "name": "My Videos",
    "path": "/mnt/nvme/media/videos"
  },
  {
    "name": "Backup Target",
    "path": "/mnt/sata/backup"
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/fsnavigator/bookmarks` {#post-mos-fsnavigator-bookmarks}

**Replace all filesystem bookmarks**

Overwrites the entire bookmarks list with the provided array

**Request body** (`application/json`)

```json
[
  {
    "name": "My Videos",
    "path": "/mnt/nvme/media/videos"
  },
  {
    "name": "Backup Target",
    "path": "/mnt/sata/backup"
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Bookmarks saved successfully | object |
| 400 | Invalid request data or duplicate entries | Error |
| 401 | Not authenticated | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "count": 2
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"name":"My Videos","path":"/mnt/nvme/media/videos"},{"name":"Backup Target","path":"/mnt/sata/backup"}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"name":"My Videos","path":"/mnt/nvme/media/videos"},{"name":"Backup Target","path":"/mnt/sata/backup"}])
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/mos/fsnavigator/bookmarks` {#put-mos-fsnavigator-bookmarks}

**Create a new filesystem bookmark**

Add a new bookmark with a display name and path.
Returns 409 if a bookmark with the same name or path already exists.


**Request body** (`application/json`)

```json
{
  "name": "My Videos",
  "path": "/mnt/nvme/media/videos"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string — Display name for the bookmark | **Yes** |
| path | string — Absolute path to bookmark | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Bookmark created successfully | object |
| 400 | Invalid request data | Error |
| 401 | Not authenticated | Error |
| 409 | Bookmark with same name or path already exists | Error |
| 500 | Server error | Error |

Example `201` response:

```json
{
  "success": true,
  "bookmark": {
    "name": "My Videos",
    "path": "/mnt/nvme/media/videos"
  }
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Videos","path":"/mnt/nvme/media/videos"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"My Videos","path":"/mnt/nvme/media/videos"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/fsnavigator/bookmarks` {#delete-mos-fsnavigator-bookmarks}

**Delete one or all filesystem bookmarks**

With body: Delete a single bookmark identified by its path.
Without body: Delete all bookmarks.


**Request body** (`application/json`)

```json
{
  "path": "/mnt/nvme/media/videos"
}
```

| Field | Type | Required |
|-------|------|----------|
| path | string — Path of the bookmark to delete | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Bookmark(s) deleted successfully | - |
| 401 | Not authenticated | Error |
| 404 | Bookmark not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "deleted": {
    "name": "string",
    "path": "string"
  }
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/mnt/nvme/media/videos"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fsnavigator/bookmarks", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"path":"/mnt/nvme/media/videos"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/download` {#get-mos-download}

**Download a file from the filesystem**

Downloads a file as a binary stream. Supports any file type and size.
The file is streamed directly without loading it entirely into memory.
Use the filesystem navigator (`GET /mos/fsnavigator`) to browse available files.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| path | query | string | **Yes** | Absolute path to the file to download |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | File download stream | string |
| 400 | Bad request - missing or invalid path parameter | Error |
| 401 | Not authenticated | Error |
| 404 | File not found | Error |
| 500 | Server error | Error |

Example `200` response:

```json
"string"
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/download" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/download", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/upload` {#post-mos-upload}

**Upload a file to the filesystem**

Uploads a single file to the specified target directory.
The file is sent as multipart/form-data.
Use the filesystem navigator (`GET /mos/fsnavigator`) to browse available directories.


**Request body** (`application/json`)

```json
{
  "file": "string",
  "path": "/mnt/Pool1/backups/"
}
```

| Field | Type | Required |
|-------|------|----------|
| file | string — The file to upload | **Yes** |
| path | string — Absolute path to the target directory | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | File uploaded successfully | object |
| 400 | Bad request (missing file or path) | Error |
| 404 | Target directory not found | Error |
| 500 | Internal server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "name": "backup.tar.gz",
    "size": 1048576,
    "path": "/mnt/Pool1/backups/backup.tar.gz"
  }
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/upload" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"file":"string","path":"/mnt/Pool1/backups/"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/upload", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"file":"string","path":"/mnt/Pool1/backups/"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/fileoperations` {#get-mos-fileoperations}

**List all file operations**

Returns all running and recently completed file operations (completed operations
are retained for 5 minutes). Sorted by status (running first) then by start time.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of file operations | array[FileOperationUpdate] |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "id": "1742742123456",
    "operation": "copy",
    "source": "/mnt/Pool1/media/movies",
    "destination": "/mnt/ssd1/backup",
    "destinationFull": "/mnt/ssd1/backup/movies",
    "status": "running",
    "instantMove": false,
    "onConflict": "fail",
    "progress": 45.2,
    "speed": 129345678,
    "speed_human": "123.4 MiB/s",
    "eta": "0:01:23",
    "bytesTransferred": 1234567890,
    "bytesTransferred_human": "1.1 GiB",
    "bytesTotal": 2740000000,
    "bytesTotal_human": "2.6 GiB",
    "startedAt": "2025-03-23T14:30:00.000Z",
    "completedAt": null,
    "error": null
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/fileoperations" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fileoperations", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/fileoperations` {#post-mos-fileoperations}

**Start a file copy or move operation**

Starts a background file copy or move operation with progress tracking.
The operation runs asynchronously - use the WebSocket namespace `/fileoperations`
or poll `GET /mos/fileoperations` for progress updates.

**MergerFS Protection:**
Copy operations within the same MergerFS pool are blocked to prevent data corruption.
This includes paths under `/mnt/POOLNAME` and `/var/mergerfs/POOLNAME/`.
Move operations are always allowed.

**Same-Filesystem Moves:**
If source and destination are on the same filesystem, the move is instant (rename).
The response will have `instantMove: true` in this case.

**Disk Space Check:**
Before starting the transfer, available disk space at the destination is checked.
The operation will fail if insufficient space is detected.


**Request body** (`application/json`)

```json
{
  "operation": "copy",
  "source": "/mnt/Pool1/media/movies",
  "destination": "/mnt/ssd1/backup",
  "onConflict": "fail"
}
```

| Field | Type | Required |
|-------|------|----------|
| operation | string ["copy","move"] — Type of file operation | **Yes** |
| source | string — Source file or directory path | **Yes** |
| destination | string — Destination directory path | **Yes** |
| onConflict | string ["fail","overwrite","skip"] — How to handle conflicts when destination already exists: - `fail` - Abort the operation (default) - `overwrite` - Overwrite existing files - `skip` - Skip existing files  | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Operation started successfully | FileOperationUpdate |
| 400 | Invalid parameters or MergerFS copy blocked | Error |
| 401 | Not authenticated | - |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "id": "1742742123456",
  "operation": "copy",
  "source": "/mnt/Pool1/media/movies",
  "destination": "/mnt/ssd1/backup",
  "destinationFull": "/mnt/ssd1/backup/movies",
  "status": "preparing",
  "instantMove": false,
  "onConflict": "fail",
  "progress": 0,
  "speed": 0,
  "speed_human": "0 B/s",
  "eta": null,
  "bytesTransferred": 0,
  "bytesTransferred_human": "0 B",
  "bytesTotal": 0,
  "bytesTotal_human": "0 B",
  "startedAt": "2025-03-23T14:30:00.000Z",
  "completedAt": null,
  "error": null
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/fileoperations" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"copy","source":"/mnt/Pool1/media/movies","destination":"/mnt/ssd1/backup","onConflict":"fail"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fileoperations", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"operation":"copy","source":"/mnt/Pool1/media/movies","destination":"/mnt/ssd1/backup","onConflict":"fail"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/fileoperations/{id}` {#delete-mos-fileoperations-id}

**Cancel a running file operation**

Cancels a running copy or move operation by sending SIGINT to the rsync process.
Partially transferred files may remain at the destination.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Operation ID to cancel |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Operation cancelled successfully | FileOperationUpdate |
| 400 | Operation already completed/cancelled | Error |
| 401 | Not authenticated | - |
| 404 | Operation not found | Error |
| 500 | Server error | - |

Example `200` response:

```json
{
  "id": "1742742123456",
  "operation": "copy",
  "source": "/mnt/Pool1/media/movies",
  "destination": "/mnt/ssd1/backup",
  "destinationFull": "/mnt/ssd1/backup/movies",
  "status": "running",
  "instantMove": false,
  "onConflict": "fail",
  "progress": 45.2,
  "speed": 129345678,
  "speed_human": "123.4 MiB/s",
  "eta": "0:01:23",
  "bytesTransferred": 1234567890,
  "bytesTransferred_human": "1.1 GiB",
  "bytesTotal": 2740000000,
  "bytesTotal_human": "2.6 GiB",
  "startedAt": "2025-03-23T14:30:00.000Z",
  "completedAt": null,
  "error": null
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/fileoperations/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fileoperations/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/runningfsoperations` {#get-mos-runningfsoperations}

**Get count of running file operations**

Returns the number of currently running (preparing + running) file operations as an integer.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Running operations count | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "count": 2
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/runningfsoperations" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/runningfsoperations", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/sensors` {#get-mos-sensors}

**Get mapped sensor values**

Returns sensor values grouped by type (fan, temperature, power, voltage, psu, other)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Grouped sensor values | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "fan": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "value": 30.5,
      "unit": "%"
    }
  ],
  "temperature": [
    {
      "id": "1735303801456",
      "index": 0,
      "name": "CPU Temperature",
      "value": 45.2,
      "unit": "°C"
    }
  ],
  "power": [],
  "voltage": [],
  "psu": [],
  "other": []
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/sensors" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/sensors` {#post-mos-sensors}

**Create sensor mapping(s)**

Create one or multiple sensor mappings. Request body must be an array of sensor objects.

**Request body** (`application/json`)

```json
[
  {
    "name": "string",
    "manufacturer": "string",
    "model": "string",
    "subtype": "voltage",
    "type": "fan",
    "source": "string",
    "unit": "string",
    "multiplier": 0,
    "divisor": 0,
    "value_range": {
      "min": 0,
      "max": 0
    },
    "transform": "percentage",
    "enabled": true
  }
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | All sensors created successfully | object |
| 207 | Partial success - some sensors created, some failed | object |
| 400 | All sensors failed to create | - |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `201` response:

```json
{
  "created": [
    {
      "id": "1735403800123",
      "index": 0,
      "name": "PSU Input Voltage",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "type": "psu",
      "source": "corsairpsu-hid-3-2.v_in.in0_input",
      "unit": "V"
    }
  ],
  "errors": []
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/sensors" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{"name":"string","manufacturer":"string","model":"string","subtype":"voltage","type":"fan","source":"string","unit":"string","multiplier":0,"divisor":0,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([{"name":"string","manufacturer":"string","model":"string","subtype":"voltage","type":"fan","source":"string","unit":"string","multiplier":0,"divisor":0,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}])
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/mos/sensors` {#put-mos-sensors}

**Replace all sensor mappings**

Replace the entire sensor configuration. Useful for bulk reordering or replacing all sensors at once. Existing sensors not in the new config will be deleted.

**Request body** (`application/json`)

```json
{
  "fan": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "multiplier": 6,
      "divisor": 1000,
      "value_range": {
        "min": 0,
        "max": 0
      },
      "transform": "percentage",
      "enabled": true
    }
  ],
  "temperature": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "multiplier": 6,
      "divisor": 1000,
      "value_range": {
        "min": 0,
        "max": 0
      },
      "transform": "percentage",
      "enabled": true
    }
  ],
  "power": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "multiplier": 6,
      "divisor": 1000,
      "value_range": {
        "min": 0,
        "max": 0
      },
      "transform": "percentage",
      "enabled": true
    }
  ],
  "voltage": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "multiplier": 6,
      "divisor": 1000,
      "value_range": {
        "min": 0,
        "max": 0
      },
      "transform": "percentage",
      "enabled": true
    }
  ],
  "psu": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "multiplier": 6,
      "divisor": 1000,
      "value_range": {
        "min": 0,
        "max": 0
      },
      "transform": "percentage",
      "enabled": true
    }
  ],
  "other": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "manufacturer": "Corsair",
      "model": "HX750i",
      "subtype": "voltage",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "multiplier": 6,
      "divisor": 1000,
      "value_range": {
        "min": 0,
        "max": 0
      },
      "transform": "percentage",
      "enabled": true
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| fan | array[SensorConfig] | No |
| temperature | array[SensorConfig] | No |
| power | array[SensorConfig] | No |
| voltage | array[SensorConfig] | No |
| psu | array[SensorConfig] | No |
| other | array[SensorConfig] | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sensor configuration replaced successfully | object |
| 400 | Invalid input | - |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/mos/sensors" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fan":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"temperature":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"power":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"voltage":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"psu":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"other":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"fan":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"temperature":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"power":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"voltage":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"psu":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}],"other":[{"id":"1735303800123","index":0,"name":"Front Fan","manufacturer":"Corsair","model":"HX750i","subtype":"voltage","source":"nct6798-isa-0290.pwm1.pwm1","unit":"%","multiplier":6,"divisor":1000,"value_range":{"min":0,"max":0},"transform":"percentage","enabled":true}]})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/sensors/unmapped` {#get-mos-sensors-unmapped}

**Get unmapped sensors**

Returns sensor data in the same structure as /system/sensors, but with already mapped sources removed. Empty adapters (with no remaining sensors) are also removed.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sensor data structure with mapped entries removed | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "coretemp-isa-0000": {
    "Adapter": "ISA adapter",
    "Package id 0": {
      "temp1_input": 32,
      "temp1_max": 80
    }
  },
  "nct6798-isa-0290": {
    "Adapter": "ISA adapter",
    "fan1": {
      "fan1_input": 1200,
      "fan1_min": 0
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/sensors/unmapped" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors/unmapped", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/sensors/config` {#get-mos-sensors-config}

**Get sensor mapping configuration**

Returns full configuration for all sensor mappings grouped by type

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Grouped sensor configuration | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "fan": [
    {
      "id": "1735303800123",
      "index": 0,
      "name": "Front Fan",
      "source": "nct6798-isa-0290.pwm1.pwm1",
      "unit": "%",
      "value_range": {
        "min": 0,
        "max": 255
      },
      "transform": "percentage",
      "enabled": true
    }
  ],
  "temperature": [
    {
      "id": "1735303801456",
      "index": 0,
      "name": "CPU Temperature",
      "source": "nct6798-isa-0290.CPUTIN.temp2_input",
      "unit": "°C",
      "value_range": null,
      "transform": null,
      "enabled": true
    }
  ],
  "power": [],
  "voltage": [],
  "psu": [],
  "other": []
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/sensors/config" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors/config", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/sensors/view` {#get-mos-sensors-view}

**Get sensors view settings**

Returns UI visibility settings for sensor columns

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | View settings | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "index": true,
  "name": true,
  "type": true,
  "subtype": true,
  "manufacturer": true,
  "model": true,
  "value": true,
  "unit": true,
  "actions": true
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/sensors/view" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors/view", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/sensors/view` {#post-mos-sensors-view}

**Update sensors view settings**

Update UI visibility settings for sensor columns

**Request body** (`application/json`)

```json
{
  "index": false,
  "name": true,
  "manufacturer": true,
  "model": true,
  "value": true,
  "unit": true,
  "actions": true
}
```

| Field | Type | Required |
|-------|------|----------|
| index | boolean | No |
| name | boolean | No |
| type | boolean | No |
| subtype | boolean | No |
| manufacturer | boolean | No |
| model | boolean | No |
| value | boolean | No |
| unit | boolean | No |
| actions | boolean | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Updated view settings | object |
| 400 | Invalid input | - |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/sensors/view" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"index":false,"name":true,"manufacturer":true,"model":true,"value":true,"unit":true,"actions":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors/view", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"index":false,"name":true,"manufacturer":true,"model":true,"value":true,"unit":true,"actions":true})
});
const data = await res.json();
console.log(data);
```

#### `PATCH` `/mos/sensors/{id}` {#patch-mos-sensors-id}

**Update an existing sensor mapping**

Partially update fields of an existing sensor mapping. Changing type will move sensor to new group.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Sensor ID |

**Request body** (`application/json`)

```json
{
  "name": "string",
  "manufacturer": "string",
  "model": "string",
  "subtype": "voltage",
  "type": "fan",
  "source": "string",
  "unit": "string",
  "multiplier": 0,
  "divisor": 0,
  "value_range": {},
  "transform": "string",
  "enabled": false,
  "index": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | No |
| manufacturer | string | No |
| model | string | No |
| subtype | string ["voltage","wattage","amperage","speed","flow","temperature","rpm","percentage"] | No |
| type | string ["fan","temperature","power","voltage","psu","other"] — Changing type moves sensor to new group | No |
| source | string | No |
| unit | string | No |
| multiplier | number — Multiplier for voltage dividers. Cannot be used with divisor. | No |
| divisor | number — Divisor for scaled values. Cannot be used with multiplier. | No |
| value_range | object | No |
| transform | string | No |
| enabled | boolean | No |
| index | integer — New position index within group | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sensor mapping updated successfully | - |
| 400 | Invalid input or source already defined | - |
| 401 | Not authenticated | - |
| 404 | Sensor not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X PATCH "http://<MOS-IP>/api/v1/mos/sensors/{id}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","manufacturer":"string","model":"string","subtype":"voltage","type":"fan","source":"string","unit":"string","multiplier":0,"divisor":0,"value_range":{},"transform":"string","enabled":false,"index":0}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors/{id}", {
  method: 'PATCH',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"string","manufacturer":"string","model":"string","subtype":"voltage","type":"fan","source":"string","unit":"string","multiplier":0,"divisor":0,"value_range":{},"transform":"string","enabled":false,"index":0})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/sensors/{id}` {#delete-mos-sensors-id}

**Delete a sensor mapping**

Delete a sensor mapping and reindex remaining sensors

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Sensor ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Sensor mapping deleted successfully | - |
| 401 | Not authenticated | - |
| 404 | Sensor not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/sensors/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/sensors/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/tokens` {#get-mos-tokens}

**Get all tokens**

Retrieve all tokens (github, dockerhub, etc.) decrypted from /boot/config/system/tokens.json (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Tokens retrieved successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "github": "ghp_1234567890abcdef",
  "dockerhub": "myuser:dckr_pat_xyz123"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/tokens" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/tokens", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/tokens` {#post-mos-tokens}

**Update tokens (partial updates supported)**

Update one or more tokens (encrypted with JWT_SECRET) in /boot/config/system/tokens.json. Only provided tokens will be updated. (admin only)

**Request body** (`application/json`)

```json
{
  "github": "string",
  "dockerhub": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| github | string — GitHub token to save (will be encrypted) | No |
| dockerhub | string — Docker Hub credentials (format username:token) to save (will be encrypted). Used for pulling private images from Docker Hub. | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Tokens updated successfully | object |
| 400 | Invalid request body | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": true,
  "message": "Tokens updated successfully",
  "updated": [
    "github"
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/tokens" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"github":"string","dockerhub":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/tokens", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"github":"string","dockerhub":"string"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/validatetokens` {#get-mos-validatetokens}

**Validate configured tokens**

Validates GitHub and DockerHub tokens and returns their status.
- GitHub: Returns rate limit info (limit, remaining, reset, used, resource)
- DockerHub: Returns validation status and rate limit info if available
If both tokens are empty, returns an error.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Token validation results | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "github": {
    "configured": false,
    "valid": false,
    "rate": {
      "limit": 5000,
      "remaining": 4999,
      "reset": 1768734414,
      "used": 1,
      "resource": "core"
    },
    "error": "string"
  },
  "dockerhub": {
    "configured": false,
    "valid": false,
    "username": "string",
    "rate": {
      "limit": 200,
      "remaining": 199
    },
    "error": "string"
  },
  "error": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/validatetokens" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/validatetokens", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/zram` {#get-mos-zram}

**Get ZRAM configuration and status**

Retrieve current ZRAM configuration including module status (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | ZRAM configuration retrieved successfully | object |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "enabled": false,
  "zram_devices": 0,
  "module_loaded": false,
  "devices": [
    {
      "id": "string",
      "name": "string",
      "enabled": false,
      "index": 0,
      "algorithm": "zstd",
      "size": "string",
      "type": "swap",
      "config": {
        "priority": 0,
        "uuid": "string",
        "filesystem": "ext4"
      }
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/zram" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/zram` {#post-mos-zram}

**Update ZRAM configuration**

Update ZRAM settings. Changing enabled from false to true loads the module and activates devices. Changing from true to false checks for mounted ramdisks and unloads the module (admin only)

**Request body** (`application/json`)

```json
{
  "enabled": true,
  "zram_devices": 2,
  "devices": [
    {
      "name": "ZRAM Swap",
      "enabled": true,
      "index": 0,
      "algorithm": "zstd",
      "size": "5G",
      "type": "swap",
      "config": {
        "priority": -2,
        "uuid": null,
        "filesystem": null
      }
    },
    {
      "name": "Temp Ramdisk",
      "enabled": false,
      "index": 1,
      "algorithm": "lz4",
      "size": "2G",
      "type": "ramdisk",
      "config": {
        "priority": null,
        "uuid": null,
        "filesystem": "ext4"
      }
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean | No |
| zram_devices | integer — Number of ZRAM devices (must match devices array length) | No |
| devices | array[ZramDevice] | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | ZRAM configuration updated successfully | - |
| 400 | Invalid configuration or mounted ramdisks prevent disable | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/zram" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"zram_devices":2,"devices":[{"name":"ZRAM Swap","enabled":true,"index":0,"algorithm":"zstd","size":"5G","type":"swap","config":{"priority":-2,"uuid":null,"filesystem":null}},{"name":"Temp Ramdisk","enabled":false,"index":1,"algorithm":"lz4","size":"2G","type":"ramdisk","config":{"priority":null,"uuid":null,"filesystem":"ext4"}}]}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true,"zram_devices":2,"devices":[{"name":"ZRAM Swap","enabled":true,"index":0,"algorithm":"zstd","size":"5G","type":"swap","config":{"priority":-2,"uuid":null,"filesystem":null}},{"name":"Temp Ramdisk","enabled":false,"index":1,"algorithm":"lz4","size":"2G","type":"ramdisk","config":{"priority":null,"uuid":null,"filesystem":"ext4"}}]})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/zram/algorithms` {#get-mos-zram-algorithms}

**Get available compression algorithms**

Returns list of compression algorithms supported by the kernel for ZRAM

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available algorithms | array[string] |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  "lzo",
  "lzo-rle",
  "lz4",
  "lz4hc",
  "zstd",
  "deflate",
  "842"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/zram/algorithms" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram/algorithms", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/zram/status` {#get-mos-zram-status}

**Get ZRAM device status**

Get detailed status of all ZRAM devices including compression stats (admin only)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | ZRAM status retrieved successfully | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/zram/status" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram/status", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/zram/devices` {#post-mos-zram-devices}

**Add a new ZRAM device**

Add a new ZRAM device configuration. For swap type, config.priority is required. For ramdisk type, config.filesystem is required and config.uuid will be auto-generated if not provided (admin only)

**Request body** (`application/json`)

```json
{
  "name": "string",
  "enabled": false,
  "algorithm": "zstd",
  "size": "string",
  "type": "swap",
  "config": {}
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | **Yes** |
| enabled | boolean | No |
| algorithm | string | No |
| size | string | No |
| type | string ["swap","ramdisk"] | **Yes** |
| config | object | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device created successfully | - |
| 400 | Invalid device configuration | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/zram/devices" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","enabled":false,"algorithm":"zstd","size":"string","type":"swap","config":{}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram/devices", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"name":"string","enabled":false,"algorithm":"zstd","size":"string","type":"swap","config":{}})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/zram/devices/{id}` {#post-mos-zram-devices-id}

**Update a ZRAM device**

Update an existing ZRAM device configuration. Disabling a device will reset it (swap will be disabled, ramdisk must not be mounted) (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Device ID |

**Request body** (`application/json`)

```json
{}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device updated successfully | - |
| 400 | Invalid update or device is mounted | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Device not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/zram/devices/{id}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram/devices/{id}", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/zram/devices/{id}` {#delete-mos-zram-devices-id}

**Delete a ZRAM device**

Delete a ZRAM device configuration. Device will be deactivated first (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | Device ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Device deleted successfully | - |
| 400 | Device is mounted and cannot be deleted | - |
| 401 | Not authenticated | - |
| 403 | Admin permission required | - |
| 404 | Device not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/zram/devices/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zram/devices/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/zswap/algorithms` {#get-mos-zswap-algorithms}

**Get available zswap compression algorithms**

Returns list of compression algorithms supported by the kernel for zswap

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available algorithms | array[string] |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  "lzo",
  "lz4",
  "lz4hc",
  "zstd",
  "deflate",
  "842"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/zswap/algorithms" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zswap/algorithms", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/zswap/status` {#get-mos-zswap-status}

**Get swap and zswap status**

Returns current swap status including active swaps, zswap configuration, and any pending operations

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Swap status retrieved successfully | object |
| 401 | Not authenticated | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "swaps": [
    {
      "filename": "string",
      "type": "string",
      "size": 0,
      "used": 0,
      "priority": 0
    }
  ],
  "zswap": {
    "enabled": false,
    "compressor": "string",
    "max_pool_percent": 0
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/zswap/status" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/zswap/status", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/diag` {#get-mos-diag}

**Download diagnostics tar.gz bundle**

Collects system config files, command outputs, and API service data
into a tar.gz archive. The archive contains raw config files, processed
API responses, system info, and network details.
If individual collectors fail, their errors are logged in errors.txt.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | tar.gz file download | string |
| 500 | Failed to create diagnostics bundle | object |

Example `200` response:

```json
"string"
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/diag" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/diag", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## File Operations WebSocket {#file-operations-websocket}

File Operations WebSocket.


#### `GET` `/mos/fileoperations/websocket/events` {#get-mos-fileoperations-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time file operation monitoring.

**Connection:** Connect to WebSocket at `/api/v1/fileoperations` namespace

**Events to emit (client → server):**
- `subscribe-operation` - Subscribe to a specific operation by ID
- `subscribe-all` - Subscribe to all file operations
- `unsubscribe-operation` - Unsubscribe from a specific operation
- `unsubscribe-all` - Unsubscribe from all file operations
- `update-preferences` - Update byte_format preference

**Events to listen for (server → client):**
- `fileoperations-update` - Progress update for a single operation
- `fileoperations-list` - All operations (sent on subscribe-all)
- `fileoperations-subscription-confirmed` - Subscription confirmed
- `fileoperations-unsubscription-confirmed` - Unsubscription confirmed
- `preferences-updated` - Preferences updated confirmation
- `error` - Error occurred

**Update Interval:** Progress updates are broadcast every 2 seconds.
State changes (completed, failed, cancelled) are sent immediately.

**Important:** Operations continue running in the background even when
no WebSocket clients are connected. The WebSocket is only for monitoring.
Operations are started and cancelled via REST endpoints.

**Example Usage:**

Connect to WebSocket:
```javascript
const socket = io('http://localhost:998/api/v1/fileoperations', {
  path: '/api/v1/socket.io/'
});
```

Subscribe to a specific operation:
```javascript
socket.emit('subscribe-operation', {
  token: 'your-jwt-token',
  operationId: '1742742123456'
});
```

Subscribe to all operations:
```javascript
socket.emit('subscribe-all', {
  token: 'your-jwt-token'
});
```

Listen for updates:
```javascript
// Single operation update (progress, status changes)
socket.on('fileoperations-update', (data) => {
  console.log(`[${data.id}] ${data.operation} ${data.status}`);
  console.log(`  Progress: ${data.progress}%`);
  console.log(`  Speed: ${data.speed_human}`);
  console.log(`  ETA: ${data.eta}`);
  console.log(`  ${data.bytesTransferred_human} / ${data.bytesTotal_human}`);

  if (data.instantMove) {
    console.log('  Instant move (same filesystem)');
  }

  if (data.status === 'completed') {
    console.log('  Completed at:', data.completedAt);
  }
  if (data.status === 'failed') {
    console.error('  Error:', data.error);
  }
});

// All operations list (sent on subscribe-all)
socket.on('fileoperations-list', (operations) => {
  console.log(`${operations.length} operations`);
  operations.forEach(op => {
    console.log(`  ${op.id}: ${op.operation} ${op.status} ${op.progress}%`);
  });
});
```

Update byte format preference:
```javascript
socket.emit('update-preferences', { byte_format: 'decimal' });
```

Unsubscribe:
```javascript
socket.emit('unsubscribe-operation', { operationId: '1742742123456' });
socket.emit('unsubscribe-all');
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "message": "File Operations WebSocket documentation. Connect via Socket.IO to /api/v1/fileoperations namespace.",
  "events": {
    "client_to_server": [
      "subscribe-operation",
      "subscribe-all",
      "unsubscribe-operation",
      "unsubscribe-all",
      "update-preferences"
    ],
    "server_to_client": [
      "fileoperations-update",
      "fileoperations-list",
      "fileoperations-subscription-confirmed",
      "fileoperations-unsubscription-confirmed",
      "preferences-updated",
      "error"
    ]
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/fileoperations/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/fileoperations/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## MOS Hub {#mos-hub}

MOS Hub Repository Management.


#### `GET` `/mos/hub/settings` {#get-mos-hub-settings}

**Get hub settings**

Retrieves hub configuration (enabled, initial_update, schedule, update_check)

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Hub settings | object |
| 500 | Server error | - |

Example `200` response:

```json
{
  "enabled": false,
  "initial_update": false,
  "schedule": "string",
  "page_entries": 0,
  "update_check": {
    "enabled": false,
    "update_check_schedule": "string",
    "auto_update": {
      "enabled": false,
      "auto_update_schedule": "string"
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/hub/settings" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/settings", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/hub/settings` {#post-mos-hub-settings}

**Update hub settings**

Updates hub configuration (enabled, initial_update, schedule, update_check)

**Request body** (`application/json`)

```json
{
  "enabled": true,
  "initial_update": false,
  "schedule": "0 3 * * *",
  "page_entries": 24,
  "update_check": {
    "enabled": true,
    "update_check_schedule": "0 1 * * *",
    "auto_update": {
      "enabled": false,
      "auto_update_schedule": "0 2 * * SAT"
    }
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| enabled | boolean | No |
| initial_update | boolean | No |
| schedule | string — Cron schedule for hub repository updates | No |
| page_entries | integer — Number of entries per page | No |
| update_check | object — Plugin update check settings | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Updated settings | - |
| 400 | Invalid request | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/hub/settings" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"initial_update":false,"schedule":"0 3 * * *","page_entries":24,"update_check":{"enabled":true,"update_check_schedule":"0 1 * * *","auto_update":{"enabled":false,"auto_update_schedule":"0 2 * * SAT"}}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/settings", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"enabled":true,"initial_update":false,"schedule":"0 3 * * *","page_entries":24,"update_check":{"enabled":true,"update_check_schedule":"0 1 * * *","auto_update":{"enabled":false,"auto_update_schedule":"0 2 * * SAT"}}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/hub/repositories` {#get-mos-hub-repositories}

**Get all repository URLs**

Retrieves list of configured repository URLs

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of repository URLs | array[string] |
| 500 | Server error | - |

Example `200` response:

```json
[
  "https://github.com/user/repo1",
  "https://github.com/user/repo2"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/hub/repositories" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/repositories", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/hub/repositories` {#post-mos-hub-repositories}

**Set repository URLs**

Replaces all repository URLs with the provided list

**Request body** (`application/json`)

```json
[
  "https://github.com/user/repo1",
  "https://github.com/user/repo2"
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Repositories saved successfully | array[string] |
| 400 | Invalid input | - |
| 500 | Server error | - |

Example `200` response:

```json
[
  "string"
]
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/hub/repositories" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '["https://github.com/user/repo1","https://github.com/user/repo2"]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/repositories", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify(["https://github.com/user/repo1","https://github.com/user/repo2"])
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/hub/knownrepositories` {#get-mos-hub-knownrepositories}

**Get known repository URLs**

Returns the cached list of known repository URLs (empty array if none).

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of known repository URLs | array[string] |
| 500 | Server error | - |

Example `200` response:

```json
[
  "https://github.com/s3ppo/docker_json_templates",
  "https://github.com/mos-nas/mos-templates"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/hub/knownrepositories" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/knownrepositories", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/hub/update` {#post-mos-hub-update}

**Update repositories**

Refreshes the known repositories list and downloads all configured and known repositories via git clone

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Update completed | object |
| 400 | No repositories configured | - |
| 500 | All downloads failed or server error | - |

Example `200` response:

```json
{
  "success": [
    {
      "url": "string",
      "name": "string"
    }
  ],
  "failed": [
    {
      "url": "string",
      "name": "string",
      "error": "string"
    }
  ],
  "total": 0
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/hub/update" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/update", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/hub/index` {#get-mos-hub-index}

**Get template index**

Returns all templates from all repositories with maintainer info

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| search | query | string | No | Search in name, maintainer, description |
| category | query | string | No | Filter by category |
| type | query | string ["docker","compose","plugin","driver"] | No | Filter by type |
| sort | query | string ["name","created","updated"] | No | Sort by field - name alphabetically, created/updated by timestamp |
| order | query | string ["asc","desc"] | No | Sort order - for timestamps desc means newest first |
| limit | query | integer | No | Max number of results to return |
| skip | query | integer | No | Number of results to skip for pagination |
| arch_filter | query | boolean | No | Filter templates by system architecture (enabled by default). Set to false to show all architectures. |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Template index with results and count | object |
| 400 | No repositories downloaded | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "results": [
    {
      "name": "string",
      "maintainer": "string",
      "maintainer_donate": "string",
      "type": "docker",
      "category": [
        null
      ],
      "description": "string",
      "website": "string",
      "icon": "string",
      "repository": "string",
      "installed": false,
      "created_at": 0,
      "updated_at": 0,
      "stack_images": [
        null
      ]
    }
  ],
  "page_entries": 0,
  "count": 0
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/hub/index" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/index", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/hub/types` {#get-mos-hub-types}

**Get available template types**

Returns available template types (docker, compose, lxc, plugin, vm) that exist in repositories

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available types | array[string] |
| 500 | Server error | - |

Example `200` response:

```json
[
  "docker",
  "compose",
  "plugin"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/hub/types" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/types", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/hub/categories` {#get-mos-hub-categories}

**Get available template categories**

Returns available categories (AI, Backup, Media, etc.). Use ?all=true to return all allowed categories, not only those in use.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| all | query | boolean | No | If true, returns all allowed categories instead of only those currently in use |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of available categories | array[string] |
| 500 | Server error | - |

Example `200` response:

```json
[
  "AI",
  "Backup",
  "Media",
  "Network"
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/hub/categories" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/categories", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/hub/docker/template` {#post-mos-hub-docker-template}

**Get docker template content**

Returns the raw content of a docker template JSON

**Request body** (`application/json`)

```json
{
  "template": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| template | string — Absolute path to template JSON | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Template content | - |
| 400 | Invalid or missing path | - |
| 404 | Template not found | - |
| 500 | Server error | - |

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/hub/docker/template" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"template":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/docker/template", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"template":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/hub/compose/template` {#post-mos-hub-compose-template}

**Get compose files content**

Returns name, yaml, env, icon and web_ui_url from compose template

**Request body** (`application/json`)

```json
{
  "template": "string",
  "yaml": "string",
  "env": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| template | string — Absolute path to template.json | **Yes** |
| yaml | string — Absolute path to compose.yaml | **Yes** |
| env | string — Optional absolute path to .env | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | File contents | object |
| 400 | Invalid or missing path | - |
| 404 | File not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "name": "string",
  "yaml": "string",
  "env": "string",
  "icon": "string",
  "web_ui_url": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/hub/compose/template" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"template":"string","yaml":"string","env":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/compose/template", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"template":"string","yaml":"string","env":"string"})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/hub/plugin/template` {#post-mos-hub-plugin-template}

**Get plugin template content**

Returns the raw content of a plugin template JSON

**Request body** (`application/json`)

```json
{
  "template": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| template | string — Absolute path to plugin template JSON | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Plugin template content | object |
| 400 | Invalid or missing path | - |
| 404 | Template not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "name": "string",
  "description": "string",
  "repository": "string",
  "settings": false,
  "driver": false,
  "icon": "string",
  "author": "string",
  "homepage": "string",
  "support": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/hub/plugin/template" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"template":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/hub/plugin/template", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"template":"string"})
});
const data = await res.json();
console.log(data);
```
## MOS Plugins {#mos-plugins}

MOS Plugin Management.


#### `GET` `/mos/plugins` {#get-mos-plugins}

**List all installed plugins**

Returns a list of all installed plugins with their manifest data

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of plugins | PluginsResponse |
| 500 | Server error | object |

Example `200` response:

```json
{
  "results": [
    {
      "name": "example-plugin",
      "displayName": "Example Plugin",
      "description": "An example plugin for MOS",
      "version": "1.0.0",
      "icon": "mdi-puzzle",
      "author": "",
      "homepage": ""
    }
  ],
  "count": 0
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/plugins" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/query` {#post-mos-plugins-query}

**Query a plugin command**

Executes a command from /usr/bin/plugins and returns output. Symlinks are allowed but their targets are validated. Dangerous commands like rm, mkdir, bash, sh, etc. are blocked both by name and as symlink targets.

**Request body** (`application/json`)

```json
{
  "command": "nvidia-smi",
  "args": [
    "--query-gpu=temperature.gpu",
    "--format=csv"
  ],
  "timeout": 5,
  "parse_json": false
}
```

| Field | Type | Required |
|-------|------|----------|
| command | string — Command name (must exist in /usr/bin/plugins) | **Yes** |
| args | array[string] — Command arguments | No |
| timeout | number — Timeout in seconds (0.1-60, default 10) | No |
| parse_json | boolean — Parse output as JSON | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Query execution result | object |
| 400 | Invalid request or command not allowed | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "output": "string",
  "exit_code": 0,
  "duration_ms": 0
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/query" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"command":"nvidia-smi","args":["--query-gpu=temperature.gpu","--format=csv"],"timeout":5,"parse_json":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/query", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"command":"nvidia-smi","args":["--query-gpu=temperature.gpu","--format=csv"],"timeout":5,"parse_json":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/releases` {#post-mos-plugins-releases}

**Get GitHub releases for a plugin repository**

Fetches and caches up to 50 releases from a GitHub repository

**Request body** (`application/json`)

```json
{
  "repository": "https://github.com/mos-nas/mos-intel-gpu-top",
  "refresh": false
}
```

| Field | Type | Required |
|-------|------|----------|
| repository | string — GitHub repository URL | **Yes** |
| refresh | boolean — Force refresh cache | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Releases data | object |
| 400 | Invalid repository URL | - |
| 404 | Repository not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "repository": "string",
  "owner": "string",
  "repo": "string",
  "timestamp": 0,
  "releases": [
    {
      "tag": "string",
      "name": "string",
      "published_at": "string",
      "prerelease": false,
      "latest": false,
      "assets": [
        {
          "name": "string",
          "size": 0,
          "download_url": "string"
        }
      ]
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/releases" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"repository":"https://github.com/mos-nas/mos-intel-gpu-top","refresh":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/releases", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"repository":"https://github.com/mos-nas/mos-intel-gpu-top","refresh":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/install` {#post-mos-plugins-install}

**Install a plugin from Hub template**

Downloads and installs a plugin using a Hub template path and release tag

**Request body** (`application/json`)

```json
{
  "template": "/var/mos/hub/repositories/owner/repo/plugins/intel-gpu-top.json",
  "tag": "v1.0.0"
}
```

| Field | Type | Required |
|-------|------|----------|
| template | string — Absolute path to Hub plugin template JSON | **Yes** |
| tag | string — Release tag to install | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Installation started | object |
| 400 | Invalid request or template not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "status": "string",
  "message": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/install" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"template":"/var/mos/hub/repositories/owner/repo/plugins/intel-gpu-top.json","tag":"v1.0.0"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/install", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"template":"/var/mos/hub/repositories/owner/repo/plugins/intel-gpu-top.json","tag":"v1.0.0"})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/plugins/settings/{pluginName}` {#get-mos-plugins-settings-pluginname}

**Get plugin settings**

Retrieves settings.json for a specific plugin

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| pluginName | path | string | **Yes** | Plugin name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Plugin settings | object |
| 400 | Invalid plugin name | - |
| 404 | Settings not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/plugins/settings/{pluginName}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/settings/{pluginName}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/settings/{pluginName}` {#post-mos-plugins-settings-pluginname}

**Update plugin settings**

Writes settings.json for a specific plugin

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| pluginName | path | string | **Yes** | Plugin name |

**Request body** (`application/json`)

```json
{}
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Saved settings | object |
| 400 | Invalid request | - |
| 404 | Plugin not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/settings/{pluginName}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/settings/{pluginName}", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/updatecheck` {#post-mos-plugins-updatecheck}

**Check for plugin updates**

Compares installed plugin versions with latest available on GitHub

**Request body** (`application/json`)

```json
{
  "notify": false
}
```

| Field | Type | Required |
|-------|------|----------|
| notify | boolean — Send notification if updates are found | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Update check results | array[object] |
| 500 | Server error | - |

Example `200` response:

```json
[
  {
    "plugin": "string",
    "installed": "string",
    "available": "string",
    "repository": "string",
    "update_available": false
  }
]
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/updatecheck" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"notify":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/updatecheck", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"notify":false})
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/update` {#post-mos-plugins-update}

**Update plugins**

Updates one or all plugins with available updates

**Request body** (`application/json`)

```json
{
  "plugin": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| plugin | string — Plugin name to update (optional, if empty updates all) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Update results | object |
| 400 | No update check performed or plugin not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "updated": [
    {
      "plugin": "string",
      "from": "string",
      "to": "string",
      "success": false,
      "error": "string"
    }
  ]
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/update" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"plugin":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/update", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"plugin":"string"})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/mos/plugins/delete/{pluginName}` {#delete-mos-plugins-delete-pluginname}

**Delete a plugin**

Removes a plugin including dpkg package and all related files

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| pluginName | path | string | **Yes** | Plugin name to delete |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Plugin deleted successfully | object |
| 400 | Plugin not found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "success": false,
  "plugin": "string",
  "removed": {
    "config": "string",
    "web": "string"
  }
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/mos/plugins/delete/{pluginName}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/delete/{pluginName}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/mos/plugins/executefunction` {#post-mos-plugins-executefunction}

**Execute a function from a plugin**

Executes a specified function from the plugin's functions file. Some functions are blocked for security.

**Request body** (`application/json`)

```json
{
  "plugin": "string",
  "function": "string",
  "name": "string",
  "restart": false
}
```

| Field | Type | Required |
|-------|------|----------|
| plugin | string — Plugin name | **Yes** |
| function | string — Function name to execute | **Yes** |
| name | string — Optional display name for notifications | No |
| restart | boolean — Show reboot message on success | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Function execution started | object |
| 400 | Invalid request, blocked function, or no functions file | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "status": "string",
  "message": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/mos/plugins/executefunction" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"plugin":"string","function":"string","name":"string","restart":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/executefunction", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"plugin":"string","function":"string","name":"string","restart":false})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/mos/plugins/driver/{pluginName}` {#get-mos-plugins-driver-pluginname}

**Get driver package info for a driver plugin**

Returns the installed driver package path and name for the current kernel. Only works for driver plugins.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| pluginName | path | string | **Yes** | Plugin name |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Driver package info | object |
| 400 | Plugin not found, not a driver, or no package found | - |
| 500 | Server error | - |

Example `200` response:

```json
{
  "plugin": "string",
  "kernel": "string",
  "package": "string",
  "path": "string",
  "directory": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/mos/plugins/driver/{pluginName}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/mos/plugins/driver/{pluginName}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Terminal {#terminal}

Terminal Management.


#### `GET` `/terminal/sessions` {#get-terminal-sessions}

**List all terminal sessions**

Shows all active terminal sessions with details (admin only)

Useful for monitoring and session management.


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | List of terminal sessions | object |
| 401 |  | - |
| 403 |  | - |

Example `200` response:

```json
{
  "sessions": [
    {
      "sessionId": "terminal-1704123456789-x8f9g2k3l",
      "command": "docker",
      "args": [
        "exec",
        "-it",
        "nginx",
        "/bin/sh"
      ],
      "readOnly": false,
      "startTime": "2024-01-01T12:00:00.000Z",
      "cols": 120,
      "rows": 40,
      "cwd": "/"
    },
    {
      "sessionId": "terminal-1704123456790-y7h8j3m2p",
      "command": "tail",
      "args": [
        "-f",
        "/var/log/syslog"
      ],
      "readOnly": true,
      "startTime": "2024-01-01T11:30:00.000Z",
      "cols": 80,
      "rows": 24,
      "cwd": "/"
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/terminal/sessions" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/terminal/sessions", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/terminal/create` {#post-terminal-create}

**Create new terminal session**

Creates a new terminal session with flexible options (admin only)

**Usage Examples:**

**Root Shell (with Pixel Dimensions - recommended):**
```json
{
  "shell": "/bin/bash",
  "cwd": "/",
  "width": 1024,
  "height": 768
}
```

**Root Shell (with Cols/Rows - legacy):**
```json
{
  "shell": "/bin/bash",
  "cwd": "/",
  "cols": 120,
  "rows": 40
}
```

**Docker Container:**
```json
{
  "command": "docker",
  "args": ["exec", "-it", "nginx", "/bin/sh"]
}
```

**LXC Container:**
```json
{
  "command": "lxc-attach",
  "args": ["-n", "ubuntu", "--", "/bin/bash"]
}
```

**Log Viewing (Read-Only):**
```json
{
  "command": "tail",
  "args": ["-f", "-n", "200", "/var/log/syslog"],
  "readOnly": true
}
```

**Docker Logs:**
```json
{
  "command": "docker",
  "args": ["logs", "-f", "--tail", "100", "nginx"],
  "readOnly": true
}
```

**System Monitoring:**
```json
{
  "command": "htop"
}
```

After creation, connect via WebSocket using the session ID.


**Request body** (`application/json`)

```json
{
  "command": "docker",
  "args": [
    "exec",
    "-it",
    "nginx",
    "/bin/sh"
  ],
  "shell": "/bin/bash",
  "width": 800,
  "height": 600,
  "cols": 80,
  "rows": 24,
  "cwd": "/home/user",
  "readOnly": true
}
```

| Field | Type | Required |
|-------|------|----------|
| command | string — Command to execute (optional, if omitted shell is used)  Examples: - "docker" for container access - "tail" for log viewing - "lxc-attach" for LXC containers - "watch" for monitoring  | No |
| args | array[string] — Command arguments  Examples: - ["exec", "-it", "nginx", "/bin/sh"] for Docker - ["-f", "-n", "100", "/var/log/syslog"] for tail - ["-n", "ubuntu"] for lxc-attach  | No |
| shell | string — Default shell (only if no command is specified) | No |
| width | integer — Terminal width in pixels (recommended, easier for frontend) Automatically converted to cols (~9px per character) Alternative to 'cols'  | No |
| height | integer — Terminal height in pixels (recommended, easier for frontend) Automatically converted to rows (~20px per line) Alternative to 'rows'  | No |
| cols | integer — Terminal width in columns Alternative to 'width' (legacy)  | No |
| rows | integer — Terminal height in rows Alternative to 'height' (legacy)  | No |
| cwd | string — Working directory for the command | No |
| readOnly | boolean — Terminal is read-only (recommended for logs/monitoring)  When readOnly=true, no input can be made  | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Terminal session created successfully | TerminalSession |
| 400 | Invalid configuration or command not available | Error |
| 401 |  | - |
| 403 |  | - |
| 500 |  | - |

Example `201` response:

```json
{
  "sessionId": "terminal-1704123456789-x8f9g2k3l",
  "command": "docker",
  "args": [
    "exec",
    "-it",
    "nginx",
    "/bin/sh"
  ],
  "readOnly": false,
  "cols": 80,
  "rows": 24,
  "cwd": "/",
  "created": "2024-01-01T12:00:00.000Z"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/terminal/create" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"command":"docker","args":["exec","-it","nginx","/bin/sh"],"shell":"/bin/bash","width":800,"height":600,"cols":80,"rows":24,"cwd":"/home/user","readOnly":true}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/terminal/create", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"command":"docker","args":["exec","-it","nginx","/bin/sh"],"shell":"/bin/bash","width":800,"height":600,"cols":80,"rows":24,"cwd":"/home/user","readOnly":true})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/terminal/{sessionId}` {#get-terminal-sessionid}

**Terminal session info**

Shows information about a specific terminal session (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| sessionId | path | string | **Yes** | Terminal Session ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Session information | TerminalSession |
| 401 |  | - |
| 403 |  | - |
| 404 | Session not found | Error |

Example `200` response:

```json
{
  "sessionId": "terminal_1694123456789_abc123def",
  "command": "/bin/bash",
  "args": [
    "exec",
    "-it",
    "nginx",
    "/bin/sh"
  ],
  "readOnly": false,
  "cols": 80,
  "rows": 24,
  "cwd": "/home/user",
  "created": "string",
  "startTime": "2024-01-20T10:30:00.000Z",
  "lastActivity": "2024-01-20T10:35:00.000Z",
  "isActive": true
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/terminal/{sessionId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/terminal/{sessionId}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/terminal/{sessionId}` {#delete-terminal-sessionid}

**Terminate terminal session**

Terminates a terminal session (admin only)

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| sessionId | path | string | **Yes** | Terminal Session ID |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Session terminated successfully | object |
| 401 |  | - |
| 403 |  | - |
| 404 | Session not found | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "string"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/terminal/{sessionId}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/terminal/{sessionId}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/terminal/{sessionId}/resize` {#post-terminal-sessionid-resize}

**Resize terminal**

Changes the terminal size for a session (admin only)

Supports two modes:
- **Pixel-based (recommended)**: `width` and `height` in pixels
- **Legacy**: `cols` and `rows` in characters/lines


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| sessionId | path | string | **Yes** | Terminal Session ID |

**Request body** (`application/json`)

```json

```

| Field | Type | Required |
|-------|------|----------|
| width | integer — Terminal width in pixels (recommended) | No |
| height | integer — Terminal height in pixels (recommended) | No |
| cols | integer — Terminal width in columns (legacy) | No |
| rows | integer — Terminal height in rows (legacy) | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Terminal size changed successfully | object |
| 400 | Invalid parameters - Neither (width, height) nor (cols, rows) provided - Values outside allowed ranges  | Error |
| 401 |  | - |
| 403 |  | - |
| 404 | Session not found | Error |

Example `200` response:

```json
{
  "success": false,
  "cols": 0,
  "rows": 0,
  "width": 0,
  "height": 0
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/terminal/{sessionId}/resize" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d 'null'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/terminal/{sessionId}/resize", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify(null)
});
const data = await res.json();
console.log(data);
```
## Terminal WebSocket {#terminal-websocket}

Terminal WebSocket management and documentation.


#### `GET` `/api/v1/terminal/websocket/events` {#get-api-v1-terminal-websocket-events}

**Terminal WebSocket Events Documentation**

Get comprehensive documentation for Terminal WebSocket events and usage.

## Connection
Connect to the Terminal WebSocket namespace:
```javascript
const socket = io('http://localhost:3000/api/v1/terminal', {
  path: '/socket.io/',
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Authentication
All terminal operations require admin-level authentication. Include your JWT token in event data.

## Basic Usage

### 1. Create a new terminal session:
```javascript
socket.emit('create-session', {
  token: 'your-jwt-token',
  options: {
    cols: 80,
    rows: 24,
    cwd: '/home/user'
  }
});
```

### 2. Join an existing session:
```javascript
socket.emit('join-session', {
  sessionId: 'terminal_1694123456789_abc123def',
  token: 'your-jwt-token'
});
```

### 3. Send input to terminal:
```javascript
socket.emit('terminal-input', 'ls -la\n');
```

### 4. Listen for output:
```javascript
socket.on('terminal-output', (data) => {
  console.log(data);
});
```

### 5. Resize terminal:
```javascript
socket.emit('terminal-resize', { cols: 120, rows: 30 });
```

## Session Management

### List all sessions:
```javascript
socket.emit('list-sessions', { token: 'your-jwt-token' });
socket.on('sessions-list', (sessions) => {
  console.log(sessions);
});
```

### Kill a session:
```javascript
socket.emit('kill-session', {
  sessionId: 'terminal_1694123456789_abc123def',
  token: 'your-jwt-token'
});
```

### Get statistics:
```javascript
socket.emit('get-stats', { token: 'your-jwt-token' });
socket.on('terminal-stats', (stats) => {
  console.log(stats);
});
```

## Error Handling
Always listen for error events:
```javascript
socket.on('error', (error) => {
  console.error('Terminal error:', error.message);
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Terminal WebSocket events documentation | TerminalWebSocketEvents |
| 401 | Unauthorized - Admin access required | object |

Example `200` response:

```json
{
  "clientEvents": {
    "join-session": {
      "sessionId": "string",
      "token": "string"
    },
    "create-session": {
      "token": "string",
      "options": {
        "command": "string",
        "args": [
          "string"
        ],
        "cols": 80,
        "rows": 24,
        "cwd": "/",
        "readOnly": false
      }
    },
    "terminal-input": "string",
    "terminal-resize": {
      "cols": 0,
      "rows": 0
    },
    "list-sessions": {
      "token": "string"
    },
    "kill-session": {
      "sessionId": "string",
      "token": "string"
    },
    "leave-session": {},
    "get-stats": {
      "token": "string"
    }
  },
  "serverEvents": {
    "session-joined": {
      "sessionId": "string",
      "command": "string",
      "args": [
        "string"
      ],
      "readOnly": false,
      "cols": 0,
      "rows": 0,
      "cwd": "string"
    },
    "session-created": {
      "sessionId": "terminal_1694123456789_abc123def",
      "command": "/bin/bash",
      "args": [
        "exec",
        "-it",
        "nginx",
        "/bin/sh"
      ],
      "readOnly": false,
      "cols": 80,
      "rows": 24,
      "cwd": "/home/user",
      "created": "string",
      "startTime": "2024-01-20T10:30:00.000Z",
      "lastActivity": "2024-01-20T10:35:00.000Z",
      "isActive": true
    },
    "terminal-output": "string",
    "terminal-exit": {
      "code": 0
    },
    "terminal-resized": {
      "cols": 0,
      "rows": 0
    },
    "sessions-list": [
      {
        "sessionId": "terminal_1694123456789_abc123def",
        "command": "/bin/bash",
        "args": [
          "exec",
          "-it",
          "nginx",
          "/bin/sh"
        ],
        "readOnly": false,
        "cols": 80,
        "rows": 24,
        "cwd": "/home/user",
        "created": "string",
        "startTime": "2024-01-20T10:30:00.000Z",
        "lastActivity": "2024-01-20T10:35:00.000Z",
        "isActive": true
      }
    ],
    "session-killed": {
      "sessionId": "string"
    },
    "session-kill-result": {
      "sessionId": "string",
      "killed": false
    },
    "session-left": {
      "sessionId": "string"
    },
    "terminal-stats": {
      "totalSessions": 3,
      "activeSessions": 2,
      "connectedClients": 1,
      "sessions": [
        {
          "sessionId": "terminal_1694123456789_abc123def",
          "command": "/bin/bash",
          "args": [
            "exec",
            "-it",
            "nginx",
            "/bin/sh"
          ],
          "readOnly": false,
          "cols": 80,
          "rows": 24,
          "cwd": "/home/user",
          "created": "string",
          "startTime": "2024-01-20T10:30:00.000Z",
          "lastActivity": "2024-01-20T10:35:00.000Z",
          "isActive": true
        }
      ]
    },
    "error": {
      "message": "string"
    }
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/api/v1/terminal/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/api/v1/terminal/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/api/v1/terminal/websocket/stats` {#get-api-v1-terminal-websocket-stats}

**Get Terminal WebSocket Statistics**

Get real-time statistics about terminal WebSocket connections and sessions.

This endpoint provides information about:
- Total number of terminal sessions
- Number of active sessions with WebSocket connections
- Number of connected WebSocket clients
- Detailed information about each session


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Terminal WebSocket statistics | TerminalStats |
| 401 | Unauthorized - Admin access required | object |
| 500 | Internal server error | object |

Example `200` response:

```json
{
  "totalSessions": 3,
  "activeSessions": 2,
  "connectedClients": 1,
  "sessions": [
    {
      "sessionId": "terminal_1694123456789_abc123def",
      "command": "/bin/bash",
      "args": [],
      "readOnly": false,
      "startTime": "2024-01-20T10:30:00.000Z",
      "lastActivity": "2024-01-20T10:35:00.000Z",
      "cols": 80,
      "rows": 24,
      "cwd": "/home/user",
      "isActive": true
    }
  ]
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/api/v1/terminal/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/api/v1/terminal/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## NUT {#nut}

Network UPS Tools configuration and status.


#### `GET` `/nut/settings` {#get-nut-settings}

**Get NUT settings**

Returns the full NUT configuration model, filled with defaults for missing fields (admin only).

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | NUT settings | NutSettingsResponse |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "mode": "standalone",
  "spindown_disks": false,
  "server": {
    "listen": [
      {
        "address": "string",
        "port": 0
      }
    ],
    "ups": {
      "name": "string",
      "driver": "string",
      "port": "string",
      "desc": "string",
      "extra": {
        "<key>": "string"
      }
    },
    "users": [
      {
        "username": "string",
        "password": "string",
        "actions": [
          "string"
        ],
        "instcmds": [
          "string"
        ],
        "upsmon": "primary"
      }
    ]
  },
  "monitor": {
    "upsname": "string",
    "host": "string",
    "port": 0,
    "powervalue": 0,
    "username": "string",
    "password": "string",
    "role": "primary"
  },
  "shutdown": {
    "command": "string",
    "mode": "lowbattery",
    "timer_seconds": 0,
    "finaldelay": 0,
    "minsupplies": 0,
    "powerdownflag": "string"
  },
  "timers": {
    "pollfreq": 0,
    "pollfreqalert": 0,
    "hostsync": 0,
    "deadtime": 0,
    "rbwarntime": 0,
    "nocommwarntime": 0
  },
  "stop_services": {
    "docker": [
      {
        "name": "string",
        "enabled": false
      }
    ],
    "lxc": [
      {
        "name": "string",
        "enabled": false
      }
    ],
    "vms": [
      {
        "name": "string",
        "enabled": false
      }
    ]
  },
  "enabled": false
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/nut/settings" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/settings", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/nut/settings` {#post-nut-settings}

**Update NUT settings**

Deep-merges the given fields into the model and restarts the NUT services only when an essential (non stop_services) setting changed. Numeric fields accept numbers or strings (comma decimals allowed). The enabled flag is managed via the network services endpoint and is ignored here.

**Request body** (`application/json`)

```json
{
  "mode": "netclient",
  "monitor": {
    "upsname": "ups",
    "host": "192.168.1.10",
    "username": "monuser",
    "password": "monpass",
    "role": "secondary"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| mode | string ["standalone","netserver","netclient","none"] | No |
| spindown_disks | boolean — Put all spin-capable disks into standby on ONBATT. | No |
| server | object | No |
| monitor | object | No |
| shutdown | object | No |
| timers | object | No |
| stop_services | object — Workloads to stop on ONBATT and restart on ONLINE (if they were running). | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Updated NUT settings | NutSettingsResponse |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "mode": "standalone",
  "spindown_disks": false,
  "server": {
    "listen": [
      {
        "address": "string",
        "port": 0
      }
    ],
    "ups": {
      "name": "string",
      "driver": "string",
      "port": "string",
      "desc": "string",
      "extra": {
        "<key>": "string"
      }
    },
    "users": [
      {
        "username": "string",
        "password": "string",
        "actions": [
          "string"
        ],
        "instcmds": [
          "string"
        ],
        "upsmon": "primary"
      }
    ]
  },
  "monitor": {
    "upsname": "string",
    "host": "string",
    "port": 0,
    "powervalue": 0,
    "username": "string",
    "password": "string",
    "role": "primary"
  },
  "shutdown": {
    "command": "string",
    "mode": "lowbattery",
    "timer_seconds": 0,
    "finaldelay": 0,
    "minsupplies": 0,
    "powerdownflag": "string"
  },
  "timers": {
    "pollfreq": 0,
    "pollfreqalert": 0,
    "hostsync": 0,
    "deadtime": 0,
    "rbwarntime": 0,
    "nocommwarntime": 0
  },
  "stop_services": {
    "docker": [
      {
        "name": "string",
        "enabled": false
      }
    ],
    "lxc": [
      {
        "name": "string",
        "enabled": false
      }
    ],
    "vms": [
      {
        "name": "string",
        "enabled": false
      }
    ]
  },
  "enabled": false
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/nut/settings" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mode":"netclient","monitor":{"upsname":"ups","host":"192.168.1.10","username":"monuser","password":"monpass","role":"secondary"}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/settings", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"mode":"netclient","monitor":{"upsname":"ups","host":"192.168.1.10","username":"monuser","password":"monpass","role":"secondary"}})
});
const data = await res.json();
console.log(data);
```

#### `GET` `/nut/status` {#get-nut-status}

**Get UPS status**

Returns live UPS status via upsc. reachable=false when NUT is disabled or upsd cannot be queried.

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | UPS status | NutStatus |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "reachable": false,
  "name": "string",
  "status": "string",
  "data": {
    "model": "string",
    "manufacturer": "string",
    "serial": "string",
    "load": 0,
    "realpowerNominal": 0,
    "battery": {
      "charge": 0,
      "chargeLow": 0,
      "runtime": 0,
      "voltage": 0,
      "type": "string"
    },
    "input": {
      "voltage": 0,
      "frequency": 0
    },
    "output": {
      "voltage": 0,
      "frequency": 0
    }
  },
  "vars": {
    "<key>": "string"
  },
  "error": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/nut/status" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/status", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/nut/scripts/{event}` {#get-nut-scripts-event}

**Get the script for a NUT event**

Reads the event script from /boot/config/system/nut/\{event\}.sh (admin only).

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| event | path | string ["ONLINE","ONBATT","SHUTDOWN","LOWBATT","FSD","COMMBAD","NOCOMM","NOPARENT","REPLBATT"] | **Yes** | NUT NOTIFYTYPE, case insensitive |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Script content | object |
| 400 | Unknown event | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | No script stored for this event yet | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "event": "ONBATT",
  "path": "/boot/config/system/nut/onbatt.sh",
  "content": "#!/bin/sh\necho on battery\n",
  "size": 27
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/nut/scripts/{event}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/scripts/{event}", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/nut/scripts/{event}` {#post-nut-scripts-event}

**Update the script for a NUT event**

Writes the event script to /boot/config/system/nut/\{event\}.sh, creating the directory
and the file if they do not exist yet. NUT is not restarted: upsmon runs the script
straight from the boot stick when the event fires, so changes take effect immediately.


**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| event | path | string ["ONLINE","ONBATT","SHUTDOWN","LOWBATT","FSD","COMMBAD","NOCOMM","NOPARENT","REPLBATT"] | **Yes** | NUT NOTIFYTYPE, case insensitive |

**Request body** (`application/json`)

```json
{
  "content": "#!/bin/sh\necho on battery\n",
  "create_backup": false
}
```

| Field | Type | Required |
|-------|------|----------|
| content | string — New script content | **Yes** |
| create_backup | boolean — Whether to create a backup file with .backup extension | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Script updated successfully | object |
| 400 | Unknown event or invalid content | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "File edited successfully",
  "event": "ONBATT",
  "path": "/boot/config/system/nut/onbatt.sh",
  "backupPath": null,
  "changed": true
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/nut/scripts/{event}" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content":"#!/bin/sh\necho on battery\n","create_backup":false}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/scripts/{event}", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"content":"#!/bin/sh\necho on battery\n","create_backup":false})
});
const data = await res.json();
console.log(data);
```
## NUT WebSocket {#nut-websocket}

Real-time UPS status monitoring via WebSocket.


#### `GET` `/nut/websocket/events` {#get-nut-websocket-events}

**WebSocket Events Documentation**

This endpoint documents the WebSocket events for real-time NUT/UPS status monitoring.

**Connection:** Connect to WebSocket at `/api/v1/nut` namespace

**Authorization:** Admin only. Non-admin users are rejected; admin API tokens
additionally need `read` permission for the `nut` resource.

**Events to emit (client → server):**

- `subscribe-nut-status`: Subscribe to UPS status updates
- `unsubscribe-nut-status`: Unsubscribe from UPS status updates
- `get-nut-status`: Get immediate UPS status (one-time)

**Events to listen for (server → client):**

- `nut-status-update`: Real-time UPS status (every 5s)
- `nut-status-subscription-confirmed`: Subscription confirmation
- `nut-status-unsubscription-confirmed`: Unsubscription confirmation
- `error`: General error messages

**Example Usage:**

Connect to WebSocket:
```javascript
const socket = io('http://localhost:3000/api/v1/nut', {
  path: '/api/v1/socket.io/'
});
```

Subscribe to UPS status:
```javascript
socket.emit('subscribe-nut-status', { token: 'your-jwt-token' });
```

Listen for updates:
```javascript
socket.on('nut-status-update', (data) => {
  console.log('UPS status:', data.status, data.data);
});
```


**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket events documentation | object |

Example `200` response:

```json
{
  "namespace": "/api/v1/nut",
  "events": {}
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/nut/websocket/events" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/websocket/events", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/nut/websocket/stats` {#get-nut-websocket-stats}

**Get NUT WebSocket statistics**

Returns current statistics for the NUT status WebSocket

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | WebSocket statistics | object |
| 503 | NUT WebSocket manager not initialized | - |

Example `200` response:

```json
{
  "activeSubscriptions": 2,
  "clientCount": 3,
  "subscription": {
    "interval": 5000,
    "isActive": true
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/nut/websocket/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/nut/websocket/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```
## Notifications {#notifications}

Notifications Management.


#### `GET` `/notifications` {#get-notifications}

**Get all notifications**

Retrieve all system notifications with optional filtering by read status, limit, and sort order - admin only

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| read | query | boolean | No | Filter by read status (true for read, false for unread) |
| limit | query | integer | No | Limit the number of notifications returned |
| order | query | string ["asc","desc"] | No | Sort order by timestamp (asc = oldest first, desc = newest first) |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Notifications retrieved successfully | array[Notification] |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
[
  {
    "id": "1727725946123",
    "title": "chipsServer - test",
    "message": "hallo2",
    "priority": "normal",
    "timestamp": "2025-09-07T19:16:35.939580764+02:00",
    "read": false
  },
  {
    "id": "1727725946122",
    "title": "chipsServer - test",
    "message": "hallo",
    "priority": "normal",
    "timestamp": "2025-09-07T19:16:34.620280755+02:00",
    "read": true
  }
]
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/notifications" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/notifications` {#delete-notifications}

**Delete all notifications**

Delete all system notifications - admin only

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All notifications deleted successfully | DeleteResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "Notification deleted successfully",
  "remainingCount": 4
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/notifications" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/notifications/{id}` {#delete-notifications-id}

**Delete notification by ID**

Delete a specific notification using its ID - admin only

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | The ID of the notification to delete |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Notification deleted successfully | DeleteResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Notification not found | DeleteResult |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "Notification deleted successfully",
  "remainingCount": 4
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/notifications/{id}" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/{id}", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/notifications/stats` {#get-notifications-stats}

**Get notification statistics**

Get statistics about notifications including read/unread counts and priority breakdown - admin only

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Statistics retrieved successfully | NotificationStats |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "total": 10,
  "read": 3,
  "unread": 7,
  "priorities": {
    "high": 2,
    "normal": 6,
    "low": 2
  }
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/notifications/stats" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/stats", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/notifications/{id}/read` {#put-notifications-id-read}

**Mark notification as read**

Mark a specific notification as read using its ID - admin only

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id | path | string | **Yes** | The ID of the notification to mark as read |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Notification marked as read successfully | ReadResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Notification not found | ReadResult |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "Notification marked as read",
  "markedCount": 1,
  "totalCount": 5
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/notifications/{id}/read" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/{id}/read", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/notifications/read/multiple` {#put-notifications-read-multiple}

**Mark multiple notifications as read**

Mark multiple notifications as read using their IDs - admin only

**Request body** (`application/json`)

```json
[
  1727725946123,
  1727725946122
]
```

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Notifications marked as read successfully | ReadResult |
| 400 | Invalid request body | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | No matching notifications found | ReadResult |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "Notification marked as read",
  "markedCount": 1,
  "totalCount": 5
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/notifications/read/multiple" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[1727725946123,1727725946122]'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/read/multiple", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify([1727725946123,1727725946122])
});
const data = await res.json();
console.log(data);
```

#### `PUT` `/notifications/read/all` {#put-notifications-read-all}

**Mark all notifications as read**

Mark all notifications as read - admin only

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | All notifications marked as read successfully | ReadResult |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": false,
  "message": "Notification marked as read",
  "markedCount": 1,
  "totalCount": 5
}
```

**Example request**

```bash
curl -X PUT "http://<MOS-IP>/api/v1/notifications/read/all" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/read/all", {
  method: 'PUT',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `GET` `/notifications/push/vapid-key` {#get-notifications-push-vapid-key}

**Get VAPID public key**

Returns the VAPID public key needed by the frontend to create a push subscription - admin only

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | VAPID public key retrieved successfully | object |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "publicKey": "BNbxGYNMhEIi..."
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/notifications/push/vapid-key" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/push/vapid-key", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/notifications/push/subscribe` {#post-notifications-push-subscribe}

**Subscribe to push notifications**

Register a browser push subscription for the authenticated user. The subscription object is provided by the browser Push API - admin only

**Request body** (`application/json`)

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "string",
    "auth": "string"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| endpoint | string — Push service endpoint URL (provided by browser) | **Yes** |
| keys | object | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 201 | Push subscription registered | object |
| 400 | Invalid subscription object | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 500 | Server error | Error |

Example `201` response:

```json
{
  "success": true,
  "message": "Push subscription registered"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/notifications/push/subscribe" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"https://fcm.googleapis.com/fcm/send/...","keys":{"p256dh":"string","auth":"string"}}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/push/subscribe", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"endpoint":"https://fcm.googleapis.com/fcm/send/...","keys":{"p256dh":"string","auth":"string"}})
});
const data = await res.json();
console.log(data);
```

#### `DELETE` `/notifications/push/subscribe` {#delete-notifications-push-subscribe}

**Unsubscribe from push notifications**

Remove a browser push subscription. The endpoint URL identifies the subscription to remove - admin only

**Request body** (`application/json`)

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

| Field | Type | Required |
|-------|------|----------|
| endpoint | string — Push service endpoint URL to unsubscribe | **Yes** |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | Push subscription removed | object |
| 400 | Endpoint is required | Error |
| 401 | Not authenticated | Error |
| 403 | Admin permission required | Error |
| 404 | Subscription not found | object |
| 500 | Server error | Error |

Example `200` response:

```json
{
  "success": true,
  "message": "Push subscription removed"
}
```

**Example request**

```bash
curl -X DELETE "http://<MOS-IP>/api/v1/notifications/push/subscribe" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"https://fcm.googleapis.com/fcm/send/..."}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/notifications/push/subscribe", {
  method: 'DELETE',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"endpoint":"https://fcm.googleapis.com/fcm/send/..."})
});
const data = await res.json();
console.log(data);
```
## LLM {#llm}

LLM Integration and Chat.


#### `GET` `/llm/status` {#get-llm-status}

**Get LLM container status**

Returns the current status of the LLM interconnect container

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | LLM container status | LLMStatus |
| 401 | Unauthorized | - |

Example `200` response:

```json
{
  "active": true,
  "model": "qwen3.5-9b",
  "lastHeartbeat": "string"
}
```

**Example request**

```bash
curl -X GET "http://<MOS-IP>/api/v1/llm/status" \
  -H "Authorization: Bearer <TOKEN>"
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/llm/status", {
  method: 'GET',
  headers: {"Authorization":"Bearer <TOKEN>"}
});
const data = await res.json();
console.log(data);
```

#### `POST` `/llm/chat` {#post-llm-chat}

**Send a message to the LLM**

Sends a chat message to the LLM via the interconnect container

**Request body** (`application/json`)

```json
{
  "message": "which disks are free?",
  "context": "string"
}
```

| Field | Type | Required |
|-------|------|----------|
| message | string — User message for the LLM | **Yes** |
| context | string — Optional conversation context | No |

**Responses**

| Status | Description | Schema |
|--------|-------------|--------|
| 200 | LLM response | LLMChatResponse |
| 401 | Unauthorized | - |
| 503 | LLM not available | - |

Example `200` response:

```json
{
  "response": "Following disks are available: /dev/sda (1TB)...",
  "requestId": "string",
  "error": "string"
}
```

**Example request**

```bash
curl -X POST "http://<MOS-IP>/api/v1/llm/chat" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message":"which disks are free?","context":"string"}'
```

```javascript
const res = await fetch("http://<MOS-IP>/api/v1/llm/chat", {
  method: 'POST',
  headers: {"Authorization":"Bearer <TOKEN>","Content-Type":"application/json"},
  body: JSON.stringify({"message":"which disks are free?","context":"string"})
});
const data = await res.json();
console.log(data);
```