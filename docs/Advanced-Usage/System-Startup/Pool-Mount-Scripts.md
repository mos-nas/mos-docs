---
sidebar_label: 💾 Pool Mount Scripts
sidebar_position: 4
description: "MOS Pool Mount Scripts: execute custom scripts when specific storage pools are mounted during boot."
---

# 💾 System Startup

MOS provides dedicated hooks that are executed during system startup.
These hooks allow controlled customization of the boot process.

---

## 📝 Pool Mount Scripts

MOS provides **Pool Mount Scripts** that are executed automatically **after a specific storage pool has been mounted**.

These scripts allow you to run custom logic that depends on a particular pool being available, without waiting for the full system startup to complete.

---

## 📍 Script Location

```text
/boot/optional/scripts/pools/mounted/POOLNAME.sh
```

Replace `POOLNAME` with the exact name of the storage pool.

Example:

```text
/boot/optional/scripts/pools/mounted/media.sh
```

If a script matching the pool name exists, MOS will execute it automatically after that pool is mounted.

---

## ⏱️ Execution Order

Pool Mount Scripts are executed in the following phase:

1. System boot starts
2. Storage pools are mounted individually
3. **Pool-specific mount script is executed**
4. Remaining services continue to start

Each pool script runs **only for its corresponding pool**.

---

## 🔧 Typical Use Cases

- Preparing directory structures on a specific pool
- Setting permissions or ownership on pool data
- Mounting additional filesystems dependent on the pool
- Starting services that depend on a specific pool
- Triggering pool-specific maintenance or checks
- Custom automation tied to one storage pool

---

## 🧭 Recommended Usage

Pool Mount Scripts are preferred over global startup scripts when:

- Logic depends on **one specific pool**
- The action should run **immediately after that pool is available**
- The task should not wait for full system startup

For recurring or time-based automation, **Cron jobs are still the preferred solution**.

---

## 📌 Script Execution Notes

- Pool mount scripts **do not need to be executable**
- No `chmod +x` is required
- Script execution is handled internally by MOS

The script will be executed automatically as long as the file exists at the correct path.

---

## ⚠️ Important Notes

- The script runs only when the corresponding pool is mounted
- Other pools or services may not be available yet
- Errors in a pool script may affect dependent workflows
- Keep scripts focused and pool-specific

---

## ✅ Summary

- Executed after a specific pool is mounted
- One script per pool
- Pool name determines execution
- Ideal for pool-dependent initialization
- Part of the official MOS startup and storage lifecycle

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
