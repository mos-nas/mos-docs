---
sidebar_label: 🧪 Testing MOS in a Virtual Machine
sidebar_position: 2
---

# 🧪 Testing MOS in a Virtual Machine

MOS can be tested easily inside a virtual machine.
This is useful for evaluation, development, or getting familiar with the WebUI before installing MOS on physical hardware.

:::note
MOS supports **UEFI boot only** by default. Legacy BIOS / CSM boot is **not supported**.
:::

---

## 📦 VM Image

```
mos_amd64.img.xz
```

- Intended for **virtual machines**
- Prebuilt disk image
- No manual partitioning required

---

## 🧰 Preparing the VM Image

Extract the image on Linux:

```bash
unxz --decompress mos_amd64.img.xz
```

This will produce:

```
mos_amd64.img
```

---

## 🖥️ Creating the Virtual Machine

MOS works with common hypervisors such as:

- KVM / QEMU
- Proxmox
- VMware
- VirtualBox (UEFI must be enabled)

### Recommended VM Settings

| Setting | Value |
|---|---|
| Firmware | **UEFI** |
| CPU | 4 cores or more |
| Memory | 8 GB recommended |
| Network | Bridged or NAT |

---

## 🔌 Attaching the Image to the VM

The extracted image must be attached as a **USB device** — not as a regular virtual hard disk. MOS expects the image to behave like a bootable USB stick.

| Hypervisor | Method |
|---|---|
| **KVM / QEMU** | Attach the image as a USB storage device |
| **VMware / VirtualBox** | Use USB passthrough or raw image support with UEFI enabled |

:::note
The image already contains everything needed to boot MOS.
:::

---

## 🧱 Proxmox VE Configuration

The following steps describe how to run the MOS test image inside Proxmox VE.

:::warning
MOS requires UEFI boot and Secure Boot must be **disabled**.
:::

---

### 1️⃣ Create the VM

Create a new VM with the following settings:

| Setting | Value |
|---|---|
| BIOS | OVMF (UEFI) |
| Display | VirtIO-GPU |
| Secure Boot | ❌ Disabled |
| Machine | q35 (recommended) |
| Disk | Can be empty |

---

### 2️⃣ Disable Secure Boot

Proxmox enables Secure Boot by default when using OVMF. You must disable it using one of the following methods:

**Option A — Recommended**

During VM creation, make sure **"Pre-enrolled keys"** is **not** checked.

**Option B**

If Secure Boot is still active after creation:

1. Boot the VM
2. Enter the UEFI Setup
3. Disable Secure Boot
4. Save and exit

---

### 3️⃣ Upload the MOS Image

Upload `mos_amd64.img` to the Proxmox ISO storage:

```
/var/lib/vz/template/iso/
```

---

### 4️⃣ Move the Image

From the Proxmox host shell:

```bash
cp /var/lib/vz/template/iso/mos_amd64.img /var/lib/vz/images/mos_amd64.img
```

---

### 5️⃣ Modify the VM Configuration

Edit the VM config file:

```bash
nano /etc/pve/qemu-server/<vmid>.conf
```

Add the following lines:

```
usb0: spice,usb3=1
args: -drive file=/var/lib/vz/images/mos_amd64.img,format=raw,if=none,id=usbdisk -device usb-storage,drive=usbdisk
```

:::note
This attaches the MOS image as a USB storage device.
:::

---

### ▶️ Start the VM

Start the VM — MOS will boot automatically.

---

## 🚀 First Boot

1. Start the virtual machine and ensure it boots via UEFI
2. MOS will boot automatically
3. Obtain the IP address from the VM console or your DHCP server
4. Open the MOS WebUI in your browser:

```
http://<mos-ip-address>
```

---

## 🖥️ Proxmox VE: Install MOS to Disk

After testing MOS in the VM, you can install it to a virtual disk for persistent use on Proxmox VE.

### 1️⃣ Install MOS to Disk

1. In the MOS WebUI, navigate to **System Settings** → **Update System**
2. Click **Install to Disk**
3. Wait for the installation to complete
4. **Wait for the notification** that it is safe to reboot

---

### 2️⃣ Shutdown the VM

1. **Shutdown** the VM from the Proxmox WebUI or via CLI:
   ```bash
   qm shutdown <vmid>
   ```

---

### 3️⃣ Remove USB Configuration

Remove or comment out the USB configuration lines from the VM config file:

```bash
nano /etc/pve/qemu-server/<vmid>.conf
```

Comment out or delete these lines:
```bash
# usb0: spice,usb3=1
# args: -drive file=/var/lib/vz/images/mos_amd64.img,format=raw,if=none,id=usbdisk -device usb-storage,drive=usbdisk
```

---

### 4️⃣ Edit Boot Order

Edit the VM configuration to prioritize the boot disk:

1. In Proxmox WebUI, go to your VM → **Hardware**
2. Click **Hard Disk** and ensure the boot order is set correctly
3. Or edit the config file directly:
   ```bash
   nano /etc/pve/qemu-server/<vmid>.conf
   ```
   Add or modify the `boot` line:
   ```bash
   boot: order=scsi0;ide2;net0
   ```

---

### 5️⃣ Ready to Use

1. Start the VM again
2. MOS will now boot from the installed disk
3. All configurations and data will persist across reboots

---

## ✅ What to Expect

- Full MOS WebUI available
- Pools, Docker, LXC, and VM features can be explored

---

## ⚠️ Limitations in Virtual Machines

- Hardware-specific features may be unavailable
- GPU or PCI passthrough depends on the hypervisor

---

## 🧪 Summary

- Use `mos_amd64.img.xz` to test MOS in a VM
- Extract the image and attach it as a **USB device**
- **UEFI boot is mandatory** — Secure Boot must be disabled

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
