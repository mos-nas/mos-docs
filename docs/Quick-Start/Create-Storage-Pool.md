---
sidebar_label: 🗄️ Create a Storage Pool
sidebar_position: 3
---

# 🗄️ Create a Storage Pool

Storage pools are the foundation of all data storage in MOS.  
They define how disks are grouped, how data is protected, and which filesystems are used.

Pools are required for:
- Shares
- Docker storage
- LXC containers
- Virtual machines
- Media and backup data

:::tip
If you want to use ZFS, please take a look at the following section: [ZFS](/docs/System-Management/ZFS)
:::

Example:

![MOS Storage Pools](/img/MOS_Pools.png)


---

## ⚙️ Pool Configuration Fields

### 🏷️ Name

Defines the name of the storage pool.

**Best practice:**
- ✅ Use short, descriptive names  
- ❌ Avoid spaces and special characters

**Examples:**
- `main`
- `data`
- `media`
- `backup`

---

### 🔄 Type

Defines how disks are organized within the pool.

Available pool types:

- `single`
- `multi`
- `mergerfs`
- `nonraid` *(requires additional driver)*

Each type serves a different use case and offers different levels of redundancy and flexibility.

---

## 🧩 Pool Types Explained

### single

Uses a single disk without redundancy.

**Characteristics:**
- One disk per pool
- Maximum usable capacity
- No data protection

**Use cases:**
- Appdata
- Cache
- Downloads
- Media with external backups

:::warning
If the disk fails, data is lost. Backups are mandatory.
:::

---

### multi

Uses multiple disks combined into a RAID-based pool.

**Characteristics:**
- Multiple disks
- Data protection depending on RAID level
- Managed as a single pool

**Available RAID levels:**
- `raid0`
- `raid1`

---

#### 📊 RAID Levels

##### raid0
**Striping without redundancy**

- Maximum performance and capacity
- No fault tolerance

**Use case:**  
Temporary or non-critical data

---

##### raid1
**Mirroring**

- Data is mirrored across disks
- High data safety
- Reduced usable capacity

**Use case:**  
Critical data, system pools, important shares

---

### 🧩 mergerfs

Creates a pooled filesystem using multiple independent disks combined via mergerfs, optionally protected by SnapRAID.

**Characteristics:**
- Disks remain independent
- Flexible expansion
- Parity handled separately via SnapRAID

**Requirements:**
- One or more data disks
- Optional SnapRAID parity disk

**Use cases:**
- Media storage
- Large data pools with mixed disk sizes
- Home server and NAS setups

**Filesystem recommendation:**
- `xfs` for data disks

---

### nonraid

Uses multiple independent disks without traditional RAID.

**Characteristics:**
- Each disk has its own filesystem
- Optional parity disk
- Flexible and simple disk management

:::tip
The nonraid driver is **not installed by default**.
After installing the driver you have to reboot.
For installation instructions, refer to the [MOS Hub](../System-Management/System-Configuration/MOS-Hub.md) documentation.
:::

It must be installed as a plugin via the MOS Hub.

To install:

1. Open MOS Hub
2. Search for NonRAID Driver
3. Select the desired release

- Click Install

- Reboot the server

**Use cases:**
- Simple parity-based storage
- Easy disk replacement
- Home server setups

---

## 🖥️ Devices

Select the physical disks that will be assigned to the pool.

:::note
- Selected disks may be formatted
- Existing data can be lost if formatting is enabled
:::

Always verify disk selection carefully.

---

## 📦 Filesystem

Defines the filesystem used by the pool.

Available options:
- `xfs`
- `ext4`
- `btrfs`
- `vfat`

### Filesystem Recommendations

- **xfs** – Recommended default for most pools  
- **ext4** – Simple and compatible, but less scalable  
- **btrfs** – Required for advanced features like snapshots  
- **vfat** – Only for removable or temporary storage

:::tip
If you want to use ZFS, please take a look at the following section: [ZFS](/docs/System-Management/ZFS)
:::

---

## 🛠️ Advanced Options

### 🔄 Automount

Automatically mounts the pool during system startup.

✅ **Recommended:** Enabled

---

### 🗑️ Format

Formats the selected disks during pool creation.

:::warning
Enabling this option will permanently delete all data on the selected disks.
:::

---

### 🔐 Encrypt

Enables disk encryption for the pool.

:::warning
- Increases data security
- Slight performance overhead
- Encryption key must be stored securely
:::

---

### 🔍 Skip Size check (Mergerfs + SnapRAID only)

**Warning:** This option requires **5 clicks** to enable. This is intentional to ensure you understand the implications.

When enabled, MOS will skip the size validation check when creating a Mergerfs pool with SnapRAID. This allows you to use disks with different sizes, but may lead to unexpected behavior if not configured correctly.

:::warning
- Only available for **Mergerfs pools with SnapRAID**
- **Not available** for nonraid pools
- Requires **5 clicks** to enable (intentional safety measure)
- May cause issues if disks have significantly different sizes
- Use only if you understand the risks
:::

---

## ⚠️ Usage Warning

:::note
**Note:** The translation for this feature is not yet finalized in the current MOS 0.4.8-beta release. The UI labels may still be in German and will be updated in a future release.
:::

The Usage Warning feature allows you to receive notifications when a storage pool reaches certain capacity thresholds. This helps you proactively manage storage space and avoid unexpected issues.

### How It Works

- The system checks pool usage **every 10 minutes**
- When the pool reaches your configured threshold, you will receive a warning or alarm notification
- Two threshold levels are available: **Warning** and **Alarm**

### Configuration

To configure Usage Warning for a pool:

1. Navigate to **Pools**
2. Select the pool you want to monitor
3. Click the **three dots (•••)** menu
4. Select **Usage Warning**
5. Configure the thresholds:
   - **Warning**: Percentage threshold for warning notifications
   - **Alarm**: Percentage threshold for alarm notifications

![Usage Warning Menu](/img/usage-warning-menu.png)

*Location of the Usage Warning option in the pool menu*

![Usage Warning Settings](/img/usage-warning-settings.png)

*Usage Warning configuration dialog*

### Threshold Recommendations

- **Warning (70%)**: Receive a warning when the pool reaches this level
- **Alarm (90%)**: Receive an alarm when the pool reaches this critical level

### Best Practices

- Set **Warning** at a level that gives you enough time to respond (e.g., 70%)
- Set **Alarm** at a critical level that requires immediate action (e.g., 90%)
- Consider your storage growth rate when setting thresholds
- Monitor notifications and take action before reaching the Alarm level

---

## ✅ Summary

Choosing the correct pool type and filesystem is essential for a stable and reliable system.

**Quick recommendations:**
- `single + xfs` → Appdata, cache, downloads  
- `multi + raid1` → Critical data  
- `mergerfs + SnapRAID` → Media storage  
- `mergerfs + nonraid` → Flexible parity-based storage (driver required)

Plan your pool layout carefully before creating pools.

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
