---
sidebar_label: 📁 Mounted Script
sidebar_position: 2
description: "MOS Mounted Script (mounted.sh): execute commands after storage pools are mounted but before services start."
---

# 📁 System Startup

MOS provides dedicated hooks that are executed during system startup.
These hooks allow controlled customization of the boot process.

---

## 📝 Mounted Script (mounted.sh)

The **Mounted Script** is executed **after all storage is mounted but before services are started**.

It runs **after disks, Samba, NFS, and iSCSI are mounted/connected** and **before Docker, LXC, VM, and other services are started**.
This makes it suitable for tasks that need storage to be available but should run before services start.

---

## 📍 Script Location

```text
/boot/optional/scripts/mounted.sh
```

If this file exists, MOS will automatically execute it during every system boot.

---

## ⏱️ Execution Order

The Mounted Script is executed in the following phase:

1. Storage pools are mounted
2. Samba, NFS, and iSCSI connections are established
3. **Mounted Script is executed**
4. Docker, LXC, VMs, and system services are started

At this stage, all storage is available but services have not started yet.

---

## 🔧 Typical Use Cases

- Running scripts that depend on mounted storage pools
- Preparing data directories before services start
- Syncing configuration files from mounted storage
- Running health checks on storage before services start
- Setting up network shares before services access them

---

## 🧭 Recommended Usage

While MOS provides startup scripts for early system customization, it is **strongly recommended** to use **Cron jobs** whenever possible.

Cron jobs:
- Run in a fully initialized system environment
- Are easier to manage and debug
- Reduce the risk of boot-time failures
- Are suitable for most automation tasks

:::warning
Startup scripts should only be used when actions **must** run after storage is mounted but before services start.
:::

---

## 📌 Script Execution Notes

- Startup scripts **do not need to be executable**
- No `chmod +x` is required
- Script execution is handled internally by MOS

As long as the script file exists at the correct path, MOS will execute it automatically.

---

## ⚠️ Important Notes

- Storage pools are available at this stage
- Services are not running yet
- Logging and output are limited
- Errors in this script can affect service startup

:::warning
Use this script carefully and keep it as minimal as possible.
:::

---

## ✅ Summary

- Runs after storage is mounted but before services start
- Executed between Post-Start Script and service startup
- Intended for storage-dependent pre-service tasks
- Cron jobs are preferred whenever possible
- Part of the official MOS startup process

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._