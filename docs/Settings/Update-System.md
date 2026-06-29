---
sidebar_label: 🔄 Update System
sidebar_position: 2
---

# 🔄 Update System

The **Update System** menu provides comprehensive firmware and kernel management for MOS. Keep your system up-to-date with the latest features, security patches, and bug fixes.

Access via: **Settings → System Configuration → Update System**

![MOS Settings](/img/MOS_Settings.png)

---

## 📦 System Updates

Update the MOS firmware to the latest version.

### Current Version Info

Displays your current system status:
- **MOS Version** - Currently installed MOS version (e.g., `0.0.78-alpha`)
- **MOS Channel** - Update channel (e.g., `alpha`, `beta`, `stable`)
- **MOS Kernel** - Currently running kernel version (e.g., `6.18.22-mos`)

### Select Target Firmware

Choose the firmware version to install:

#### Channel
Select the update channel:
- **Alpha** - Bleeding-edge features, may contain bugs. **Currently used by the MOS Team for testing - should only be used in consultation with the MOS Team.**
- **Beta** - Pre-release testing versions
- **Stable** - Production-ready releases (recommended for most users)

#### Release
Select the specific firmware release from the chosen channel.

### Update Options

#### Update Kernel
- Enable to update the Linux kernel alongside MOS firmware
- Recommended for security and hardware compatibility improvements

#### Update Plugins
- Enable to update all installed plugins to their latest compatible versions
- Ensures plugins remain functional after MOS updates

![Update System Dialog](/img/system/Update-System-Dialog.png)

:::tip
Enable both **Update Kernel** and **Update Plugins** for a complete system update.
:::

### Update Process

1. Select desired **Channel** and **Release**
2. Enable **Update Kernel** if desired
3. Enable **Update Plugins** to update all plugins
4. Click **OK** to start the update
5. The system will download and install the update
6. A reboot is typically required after updates

---

## 🐧 Update Kernel

Manually update or change the Linux kernel version.

### Select Target Kernel Release

Choose a specific kernel version from available releases.

- Different kernel versions may offer:
  - New hardware support
  - Performance improvements
  - Security patches
  - Bug fixes

![Update Kernel Dialog](/img/system/Update-Kernel-Dialog.png)

:::warning
Kernel updates affect system stability and hardware compatibility. Ensure you have a backup before updating.
:::

---

## ⏪ Rollback Kernel

Revert to the previously installed kernel version.

Useful when:
- The new kernel causes stability issues
- Hardware stops working after a kernel update
- You need to quickly restore a working system

![Rollback Kernel Dialog](/img/system/Rollback-Kernel-Dialog.png)

:::warning[Rollback Limitation]
You can only roll back to the **immediately previous** kernel version. Older kernel versions are not retained.
:::

### How to Rollback

1. Click **Rollback Kernel**
2. Confirm the rollback in the dialog
3. The system will restore the previous kernel
4. Reboot to complete the rollback

---

## 🔄 Automatic Update Checks

Configure automatic update notifications in the main **System** settings:

**Settings → System Configuration → System → Update Settings**

### Update Checks
- Enable automatic checking for available updates

### Update Check Schedule (Cron)
Define when the system checks for updates:
- **Default:** `0 1 * * *` (daily at 1:00 AM)
- **Custom:** Use standard cron syntax

Examples:
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday

---

## 📝 Update Best Practices

### Before Updating
1. **Backup your data** - Critical before any system update
2. **Check release notes** - Review changes and known issues
3. **Schedule downtime** - Updates may require reboots
4. **Ensure stable power** - Don't update during power fluctuations

### After Updating
1. **Verify system functionality** - Check all services and shares
2. **Test critical features** - Ensure your main use cases work
3. **Monitor logs** - Check for any errors after update
4. **Update plugins** if not done automatically

### Troubleshooting Updates

| Issue | Solution |
|-------|----------|
| Update fails to download | Check internet connection and proxy settings |
| System won't boot after update | Use Rollback Kernel to restore previous version |
| Plugins not working | Update plugins or check compatibility with new MOS version |
| Update stuck | Wait 15-30 minutes, then hard reboot if necessary |

---

## 🆘 Getting Help

If you encounter issues with updates:

1. Check the [Release Notes](/docs/Release-Notes/Overview) for known issues
2. Visit our [Discord community](https://discord.com/invite/fcTMbuygTV) for support
3. Report bugs on [GitHub Issues](https://github.com/ich777/mos-docs/issues)

---

:::note[Stay Current]
Regular updates ensure your MOS system remains secure, stable, and feature-complete. We recommend enabling automatic update checks and reviewing available updates weekly.
:::

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._