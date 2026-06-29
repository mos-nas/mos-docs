---
sidebar_label: 🚀 Early Boot Script
sidebar_position: 3
---

# 🚀 Early Boot Script (boot.sh)

MOS provides an **Early Boot Script** that is executed at the **very beginning of the boot process**.

This script runs **before any drivers are loaded**, **before networking**, **before storage pools**, and **before all services**.
At this stage, **only the root filesystem (rootfs)** is available.

This script is intended for **deep system-level modifications** and should be used with extreme care.

---

## 📍 Script Location

```
/boot/optional/scripts/boot.sh
```

If this file exists, MOS will execute it automatically during early boot.

---

## ⏱️ Execution Order

The Early Boot Script is executed in the following phase:

1. Kernel and init process start
2. **Early Boot Script is executed**
3. Drivers are loaded
4. Network is initialized
5. Storage pools are mounted
6. Services are started

This is the **earliest execution point** available in MOS.

---

## ⚠️ Environment Limitations

At this stage of the boot process:

- No drivers are loaded
- No network is available
- No storage pools are mounted
- No services are running
- Environment variables are minimal or unavailable

Only the **root filesystem** is accessible.

---

## 🔧 Command Usage Requirements

Because the environment is extremely limited:

- **Always use full paths to binaries**
- Do **not** rely on `$PATH`

Examples:

```
/usr/bin/echo "Early boot"
/bin/mount
/sbin/modprobe
```

Using commands without full paths (e.g. `echo`, `mount`) may fail.

---

## 🔧 Typical Use Cases

- Very early system initialization
- Low-level system preparation
- Hardware workarounds required before driver load
- Kernel or init-related adjustments
- System behavior changes that must occur before everything else

---

## 🧭 Recommended Usage

This script should be used **only when absolutely necessary**.

For most use cases, prefer:
- **Pre-Start Scripts** (before pools and services)
- **Pool Mount Scripts** (after a specific pool is mounted)
- **Post-Start Scripts** (after full startup)
- **Cron jobs** (for standard automation)

The Early Boot Script is a **last-resort tool** for deep system intervention.

---

## 📌 Script Execution Notes

- The script **does not need to be executable**
- No `chmod +x` is required
- Script execution is handled internally by MOS

The mere existence of the file at the defined path is sufficient.

---

## 🚨 Critical Warnings

- Errors can prevent the system from booting
- Debugging is difficult at this stage
- Logging is extremely limited
- Incorrect commands may require recovery access

:::warning
Use this script **only if you fully understand the MOS boot process and Linux system initialization**.
:::

---

## ✅ Summary

- Executed at the earliest possible boot stage
- Runs before drivers, networking, pools, and services
- Only rootfs is available
- Requires full paths to all commands
- Intended for deep system-level customization
- Located under **Advanced-Usage** for a reason