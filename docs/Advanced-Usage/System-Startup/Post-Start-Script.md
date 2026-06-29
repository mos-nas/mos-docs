---
sidebar_label: 🏁 Post-Start Script
sidebar_position: 3
description: "MOS Post-Start Script (post-start.sh): execute commands after all services are fully started."
---

# 🏁 System Startup

MOS provides dedicated hooks that are executed during system startup.
These hooks allow controlled customization of the boot process.

---

## 📝 Post-Start Script (post-start.sh)

The **Post-Start Script** is executed **after system startup has completed**.

It runs **after all storage pools are mounted** and **after all services have been started**.
This makes it suitable for tasks that require a fully initialized system environment.

---

## 📍 Script Location

```text
/boot/optional/scripts/post-start.sh
```

If this file exists, MOS will automatically execute it during every system startup.

---

## ⏱️ Execution Order

The Post-Start Script is executed in the following phase:

1. Storage pools are mounted
2. Docker, LXC, VMs, and system services are started
3. **Post-Start Script is executed**

At this stage, the full system environment is available.

---

## 🔧 Typical Use Cases

- Starting custom services or applications
- Running system checks after startup
- Applying configurations that depend on mounted storage
- Interacting with containers or virtual machines
- Triggering notifications after system startup
- Custom monitoring or logging tasks

---

## 🧭 Recommended Usage

While MOS provides startup scripts, **Cron jobs are preferred** for most automation tasks.

Cron jobs:
- Are easier to maintain
- Provide better logging and error handling
- Can be scheduled or delayed
- Reduce the risk of startup-related issues

:::warning
Use the Post-Start Script only when an action **must** run immediately after system startup.
:::

---

## 📌 Script Execution Notes

- The script **does not need to be executable**
- No `chmod +x` is required
- Script execution is handled internally by MOS

The script will be executed automatically as long as the file exists at the defined path.

---

## ⚠️ Important Notes

- Long-running commands may delay system readiness
- Errors in this script can affect dependent services
- Keep execution time short and predictable

---

## ✅ Summary

- Runs after all pools and services are available
- Executed once during system startup
- Intended for post-start initialization tasks
- Cron jobs are preferred when possible
- Part of the official MOS startup process

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
