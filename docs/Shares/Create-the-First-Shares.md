---
sidebar_label: 📂 Create the First Shares
sidebar_position: 5
description: "Create network shares in MOS with SMB and NFS. Configure share permissions, access control, and storage pool assignment."
---

# 📂 Create the First Shares

Shares define how directories on a storage pool are exposed to users and services.  
They are typically used for:

- File access over the network
- Application data
- Media libraries
- Backups

![MOS Shares](/img/share/MOS_Shares.png)

Navigate to:

> **Shares → Create Share**

---

## ⚙️ Share Configuration Fields

![Share Configuration Fields](/img/share/Share_Configuration_Fields.png)

---

### 🏷️ Share Name

Defines the name of the share as it appears in the system and on the network.

**Best practices:**
- Use short, descriptive names
- Avoid spaces and special characters

**Examples:**

| Name | Use Case |
|------|----------|
| `appdata` | Container configuration data |
| `media` | Movies, music, photos |
| `backup` | Backup storage |
| `downloads` | Download staging area |

---

### 📁 Selected Directory

Defines the directory path of the share.

- The directory is **created automatically** if it does not already exist
- The directory name is derived from the selected path

**Example:**
```text
/mnt/main/media
```

In this example:
- `main` → the selected pool
- `media` → the directory created for the share

---

### 🗄️ Pool

Selects the storage pool where the share will be created.

**Example:** `main`

:::note
The share directory will always be created **inside the selected pool**.
:::

---

### 👁️ Read Rights

Defines which users are allowed to read from the share.

- Multiple users can be selected
- If no user is selected, access may be restricted depending on configuration

---

### ✏️ Write Rights

Defines which users are allowed to write to the share.

- Only selected users can modify files
- Write access **implies read access**

---

### 💬 Comment

Optional description for the share.

:::tip
Useful for documenting the purpose of the share, especially in larger setups.
:::

---

## 🔩 Advanced Options

### 🔘 Enabled

Enables or disables the share.

| State | Effect |
|-------|--------|
| ✅ Enabled | Share is accessible |
| ❌ Disabled | Share is not accessible — data remains untouched |

---

### 🔍 Browseable

Controls whether the share is visible when browsing available shares.

| State | Effect |
|-------|--------|
| ✅ Enabled | Share is visible in network browser |
| ❌ Disabled | Share is hidden but still accessible if the path is known |

---

### 🔒 Read Only

Forces the share into read-only mode.

- Prevents any write operations
- **Overrides** write permissions

---

### 👤 Guest OK

Allows access without authentication.

:::warning
Enable this option **only in trusted networks**.
:::

---

### 🔧 Allow execute always

Allows files in the share to be executed with full execute permissions.

| State | Effect |
|-------|--------|
| ✅ Enabled | Files can be executed with execute permissions |
| ❌ Disabled | Execute permissions are restricted |

This option is useful for shares that need to store and execute executable files (e.g., scripts, binaries).
:::

## 📋 Managing Existing Shares

The Shares overview displays all configured shares.

Each share shows:
- Share name
- Directory path
- Associated pool

![Managing Existing Shares](/img/share/Managing_Existing_Shares.png)

---

### 🎛️ Share Actions

Each share provides a context menu with the following actions:

| Action | Description |
|--------|-------------|
| **Edit** | Modify share configuration and permissions |
| **Delete** | Remove the share |

![Share Actions](/img/share/Share_Actions.png)

When deleting a share, an additional option is available:

| Option | Description |
|--------|-------------|
| **Delete directory** | Permanently removes the share directory and **all its contents** |
| **Remove Path Rule** | Removes the path rule from the configuration |

:::danger This action cannot be undone!
All data in the share directory will be permanently lost.
:::

![Share Delete](/img/share/Share_Delete.png)

---

## ✅ Summary

To create your first share, follow these steps:

1. Choose a clear **share name**
2. Select a **pool**
3. Define the **directory path** *(created automatically if missing)*
4. Assign **read and write permissions**
5. Adjust **advanced options** if required

Shares are the primary way to expose storage to users and applications.

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
