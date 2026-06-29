---
sidebar_label: 📦 LXC Service
sidebar_position: 2
---

# 📦 LXC Service

The **LXC Service** menu controls the global configuration of Linux Containers (LXC).  
It allows you to enable or disable the LXC service, configure container networking, and define storage locations for LXC containers.

The **LXC Service** menu is located under:

**Settings → Virtualization → LXC Service**

Changes in this section affect all LXC containers on the system.

Example:

![LXC Service](/img/virtualization/LXC_Service.png)

---

## ⚙️ LXC Service Configuration

### Enable LXC Service

Enables or disables the LXC service.

**Enabled:**
- LXC containers can be created and started
- LXC management features are available

**Disabled:**
- All LXC containers are stopped
- No LXC-related services are running

:::note
Disabling the LXC service will stop all running LXC containers.
:::

---

### Bridge

Controls whether the LXC network bridge is enabled.

**Options:**
- Enable
- Disable

**Enabled:**
- LXC containers are connected via a virtual bridge
- Containers can communicate with each other
- Provides network connectivity for containers

**Disabled:**
- No bridge-based networking for LXC containers
- Containers may require alternative networking configuration

:::tip
Bridge mode is recommended for most setups.
:::

---

### LXC Directory

Defines the directory used to store LXC container data.

**Purpose:**
- Container root filesystems
- Configuration files
- Snapshots and metadata

:::tip
- Use a fast and reliable storage pool
- Ensure sufficient disk space
- Include this directory in regular backups
:::

---

## 📝 Operational Notes

- Network connectivity depends on bridge configuration
- Changes to the LXC directory may require restarting the LXC service
- Existing containers are not moved automatically if the directory is changed

---

## ✅ Summary

The LXC Service settings define how Linux Containers operate on the system.

**Key points:**
- Enable or disable the LXC service
- Control bridge-based container networking
- Define the storage location for LXC containers

Proper configuration ensures stable and predictable LXC container operation.

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
