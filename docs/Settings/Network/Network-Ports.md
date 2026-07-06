---
sidebar_label: 📡 Network Ports
sidebar_position: 3
description: "Network ports used by MOS: WebUI (80), API (998), Notify (999), VNC consoles (5900+), and DNS (53). Configure firewalls and reverse proxies correctly."
---

# 🌐 Network Ports Used by MOS

This page lists the network ports currently used by MOS and their purpose.

Understanding which ports are in use is important for:

- 🔐 Firewall configuration
- 🌍 Reverse proxy setups
- 🧩 Network segmentation
- 🛠 Troubleshooting connectivity issues

---

## 📡 Default Ports

| Port | Service | Purpose |
| ----------- | --------------|------------- |
| 80 | WebUI | Access to the MOS Web Interface |
| 998 | API | Internal and external API communication |
| 999 | Notify | System notifications and real-time events |

---

## 🌍 Port 80 — WebUI

- Provides access to the MOS Web Interface
- Default HTTP access
- Intended for local network use only

:::warning Security Notice
The MOS WebUI is not designed to be exposed directly to the public Internet.

Do not forward port 80 on your router or firewall.

If remote access is required use a VPN connection.

Direct public exposure of the WebUI may lead to unauthorized access.
:::

Example:
```bash
http://<mos-ip>
```

---

## 🔗 Port 998 — API

- Used for MOS API communication
- Required for internal services and automation

---

## 🔔 Port 999 — Notify Service

- Handles real-time notifications
- Used for system events and UI updates

---

## 🧭 Optional Ports

---

## 🖥️ Virtual Machine Console Ports (VNC)

When virtual machines are started in MOS, a VNC console is automatically assigned.

MOS uses incremental VNC ports starting at:

| Port | Purpose |
| ----------- | --------------------------- |
| 5900 | First VM VNC console |
| 5901 | Second VM VNC console |
| 5902 | Third VM VNC console |
| ... | +1 per additional running VM |

Each running VM receives the next available port in sequence.

### 🔍 How It Works

- The first started VM uses 5900
- Each additional VM increments the port by +1
- Ports are only active while the VM is running
- If a VM stops, its assigned port becomes available again

:::warning[Security Notice]
VNC ports (5900+) should not be exposed to the public Internet. Use a VPN or SSH tunnel for remote console access.
:::
