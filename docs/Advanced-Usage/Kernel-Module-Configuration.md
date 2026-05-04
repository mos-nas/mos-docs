---
sidebar_label: 🔧 Kernel Module Configuration
sidebar_position: 5
---

# 🔧 Kernel Module Configuration (modprobe.d)

MOS supports persistent kernel module configurations via custom `modprobe.d` files. This allows you to apply specific module parameters that survive reboots.

This is especially useful for ARM users who may need to apply board-specific driver parameters or work around hardware compatibility issues.

---

## 📂 Configuration Directory

Place your custom modprobe configuration files in:

```
/boot/optional/modprobe.d/
```

Configuration files placed here will be automatically applied during system startup before drivers are loaded.

:::note
- Only `.conf` files in `/boot/optional/modprobe.d/` are applied
- Multiple configuration files can be placed in this directory
- Configurations are loaded during early boot
:::

---

## 📝 File Format

Files must use the `.conf` extension and follow standard modprobe.d syntax:

```
/boot/optional/modprobe.d/<your-config>.conf
```

**Example:**

```
/boot/optional/modprobe.d/ahci-mask.conf
```

### Contents

Each `.conf` file can contain standard modprobe options:

```
# Example: Disable a specific feature for the ahci driver
options ahci ahci_mask=0x0
```

```
# Example: Set module parameters
options snd-hda-intel power_save=0
```

```
# Example: Blacklist a module
blacklist nouveau
```

---

## 🔄 Applying Changes

After adding or modifying a modprobe configuration file, reboot the system:

```bash
reboot
```

The configuration will be loaded automatically during the next startup before drivers are initialized.

:::tip
You can verify that a configuration is loaded by checking the kernel module parameters after boot:

```bash
systool -v -m <module-name>
```

Or by checking:

```bash
cat /sys/module/<module-name>/parameters/<parameter>
```
:::

---

## 💡 ARM Users

Custom modprobe configurations are commonly needed on ARM boards to:

- Enable or disable specific hardware features
- Apply board-specific driver parameters
- Work around compatibility issues with certain kernels
- Blacklist problematic drivers

---

## ✅ Summary

- **Persistent modprobe configs** go to `/boot/optional/modprobe.d/`
- Files must have the **`.conf`** extension
- **Reboot** to apply configurations
- Configs are loaded **during early boot** before drivers initialize
