---
sidebar_label: 🔓 Disable MD5 Verification
sidebar_position: 2
description: "Disable MD5 checksum verification on MOS boot for advanced scenarios. Marker file-based configuration."
---

## 🔓 Disable MD5 Verification

MOS performs MD5 checksum verification on boot to ensure data integrity
from `image`, `rootfs` and `drivers` files in /boot directory during boot.
In advanced scenarios, this verification can be explicitly disabled.

### 🛠️ How to Disable MD5 Checks

- Create the following file on the system:

  ```text
  /boot/config/system/md5check_disabled
  ```

- The file may be empty or contain any content

- The existence of the file alone is sufficient


- Once this file exists, MD5 verification is completely disabled

---

:::warning[Important Notes]
- Disabling MD5 checks is intended for advanced users only
- Use this option only if you fully understand the implications
:::

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
