---
sidebar_label: 🚀 Pre-Start Script
sidebar_position: 1
---

# 🚀 System Startup

MOS provides dedicated hooks that are executed during system startup.
These hooks allow controlled customization of the boot process.

---

## 📝 Pre-Start Script (pre-start.sh)

The **Pre-Start Script** is executed **very early during system startup**.

It runs **before storage pools are mounted** and **before any services are started**.
This makes it suitable for preparing the system environment before MOS initializes storage, containers, and virtual machines.

---

## 📍 Script Location

```
/boot/optional/scripts/pre-start.sh
```

If this file exists, MOS will automatically execute it during every system boot.

---

## ⏱️ Execution Order

The Pre-Start Script is executed in the following phase:

1. Early system initialization
2. **Before storage pools are mounted**
3. **Before Docker, LXC, VM, and other services are started**

At this stage, only the base system is available.

---

## 🔧 Typical Use Cases

- Early hardware initialization
- Loading kernel modules
- Network preparation required before pool mounting
- Low-level system configuration
- Preparing devices required before services start

---

## 🧭 Recommended Usage

While MOS provides startup scripts for early system customization, it is **strongly recommended** to use **Cron jobs** whenever possible.

Cron jobs:
- Run in a fully initialized system environment
- Are easier to manage and debug
- Reduce the risk of boot-time failures
- Are suitable for most automation tasks

:::warning
Startup scripts should only be used when actions **must** run before pools are mounted or services are started.
:::

---

## 📌 Script Execution Notes

- Startup scripts **do not need to be executable**
- No `chmod +x` is required
- Script execution is handled internally by MOS

As long as the script file exists at the correct path, MOS will execute it automatically.

---

## ⚠️ Important Notes

- Storage pools are not available at this stage
- Services are not running yet
- Logging and output are limited
- Errors in this script can affect system startup

:::warning
Use this script carefully and keep it as minimal as possible.
:::

---

## ✅ Summary

- Runs very early during system startup
- Executed before pools and services
- Intended for early system preparation
- Cron jobs are preferred whenever possible
- Part of the official MOS startup process

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
