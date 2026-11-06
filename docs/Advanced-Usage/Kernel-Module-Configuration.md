# 🔧 Kernel Module Configuration (modprobe.d)

MOS supports persistent kernel module configurations via custom `modprobe.d` files. This allows you to apply specific module parameters that survive reboots.

This is especially useful for ARM users who may need to apply board-specific driver parameters or work around hardware compatibility issues.

---

## 📂 Configuration Directory

Place your custom modprobe configuration files in:

```text
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

```text
/boot/optional/modprobe.d/<your-config>.conf
```

**Example:**

```bash
/boot/optional/modprobe.d/ahci-mask.conf
```

### Contents

Each `.conf` file can contain standard modprobe options:

```bash
# Example: Disable a specific feature for the ahci driver
options ahci ahci_mask=0x0
```

```bash
# Example: Set module parameters
options snd-hda-intel power_save=0
```

```bash
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

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
