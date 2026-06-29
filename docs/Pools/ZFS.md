---
sidebar_label: 💾 ZFS
sidebar_position: 3
---

# 💾 ZFS

MOS provides optional support for ZFS via a plugin.
ZFS is ***currently available CLI only*** and is intended for users who are already familiar with managing ZFS pools manually.

:::info
ZFS support is provided as an optional feature, while further integration remains planned for the future and is not a high priority item.
:::

---

## 🔌 OpenZFS Driver Plugin

ZFS support in MOS is enabled through the OpenZFS Driver plugin.

GitHub repository:

https://github.com/ich777/mos-openzfs-driver


The plugin installs the required OpenZFS kernel modules and CLI tools.

---

## 📦 Installation

- Open the MOS WebUI and navigate to the MOS Hub

- Search for OpenZFS Driver

- Select the desired release version (newest is preferred)

- Install the plugin

Once installed, ZFS tools such as ```zpool``` and ```zfs``` become available on the system.

---

## 🖥️ Usage (CLI)

ZFS is ***(currently)*** CLI only

No graphical management interface is provided in the MOS WebUI

ZFS pools must be created manually by the user

Example:

```zpool create tank /dev/sdX```

---

## 🔁 Boot Behavior

The ZFS is loaded on boot

Existing ZFS pools are automatically imported during boot

The OpenZFS Driver plugin must be installed for this behavior

---

## ℹ️ Notes

ZFS is a powerful and flexible filesystem and is fully usable in MOS via the CLI.