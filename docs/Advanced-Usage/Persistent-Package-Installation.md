---
sidebar_label: 📦 Persistent Package Installation
sidebar_position: 4
---

# 📦 Persistent Package Installation

MOS is designed to run from a compressed, read-only root filesystem (rootfs). Any changes made to the system via `apt install` or similar commands will be lost after a reboot, as the root filesystem is rebuilt from the compressed image on every startup.

To install additional packages that persist across reboots, MOS provides a dedicated directory for optional Debian packages.

---

## 📂 Package Directory

Place your `.deb` packages in the following directory:

```
/boot/optional/packages
```

Packages placed here will be automatically installed during system startup before services are started.

:::note
- Only `.deb` packages are supported
- Packages must be compatible with the MOS base system (Devuan Linux)
- Dependencies are not automatically resolved — ensure all required dependencies are either pre-installed on MOS or also placed in this directory
:::

---

## 🔧 How to Add Packages

### Step 1: Download the Package

Use `apt download` to obtain a `.deb` package without installing it:

```bash
apt download <package-name>
```

This will download the `.deb` file to the current directory.

**Example:**

```bash
apt download htop
```

This creates a file like `htop_3.2.2-2_amd64.deb` in the current directory.

:::tip
If the package has dependencies that are not already present on MOS, download them as well:

```bash
apt download <package-name> && apt download <dependency1> <dependency2>
```
:::

---

### Step 2: Copy to `/boot/optional/packages`

Move or copy the downloaded `.deb` file(s) to the persistent package directory:

```bash
cp *.deb /boot/optional/packages/
```

:::warning
- Do not extract or modify the `.deb` files
- Place only valid `.deb` packages in this directory
- The `/boot` partition must have sufficient free space
:::

---

### Step 3: Reboot

After placing the packages in the directory, reboot the system:

```bash
reboot
```

During startup, MOS will automatically install all `.deb` packages found in `/boot/optional/packages`.

---

## ❌ What Does NOT Work

Running `apt install` directly will install the package into the running root filesystem, but these changes will be lost on the next reboot:

```bash
# This will NOT persist after reboot!
apt install htop
```

This is because MOS reconstructs the root filesystem from the compressed base image on every boot. Only packages in `/boot/optional/packages` are reinstalled automatically.

---

## ✅ Best Practices

| Do | Don't |
|---|---|
| Use `apt download` to obtain `.deb` files | Use `apt install` for persistent installations |
| Place `.deb` files in `/boot/optional/packages` | Modify the running root filesystem expecting persistence |
| Verify package compatibility with MOS | Install packages with complex dependency trees without checking |
| Reboot after adding packages | Expect immediate availability without reboot |

---

## ⚠️ Limitations

- **No automatic dependency resolution** — you must ensure all dependencies are available
- **Only `.deb` format** is supported (no `.rpm`, source builds, or other package formats)
- **No package manager tracking** — packages installed this way are not tracked by `dpkg` in the running system; they are reinstalled on every boot

---

## ✅ Summary

- **Persistent packages** go to `/boot/optional/packages`
- Use **`apt download`** to fetch `.deb` files
- **Reboot** to apply installations
- Direct **`apt install`** does **not** persist

---

## ✅ Summary

- **Persistent packages** go to `/boot/optional/packages`
- Use **`apt download`** to fetch `.deb` files
- **Reboot** to apply installations
- Direct **`apt install`** does **not** persist

For system packages and kernel module configurations that must survive reboots, always use the appropriate `/boot/optional/` directory.

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._