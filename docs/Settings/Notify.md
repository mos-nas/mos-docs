---
sidebar_label: 🔔 Notify
sidebar_position: 5
---

# 🔔 Notify

**Notify** is a small **Go-based notification service** used by MOS to deliver system and service notifications.

Notifications can be displayed directly within MOS and optionally forwarded to external notification providers.

---

## 📡 Supported Providers

MOS Notify currently supports the following notification targets:

- **MOS (internal notifications)**
- **Discord**
- **Gotify**
- **Pushover**
- **PushBits**

Multiple providers can be enabled at the same time.

If **no provider is configured**, notifications will still be shown **inside MOS only**.

---

## ⚙️ Configuration

Provider configuration is currently done **manually** via:
`/boot/config/notify/providers/`

Each provider has its own configuration file.  
After changing any provider configuration, the service must be restarted:

```
/etc/init.d/notify restart
```

Logs are available at: `/var/log/notify` or via the MOS Frontend under **Settings → Logs**

### 🧩 Custom Providers

Custom providers can be added as long as they are compatible with MOS Notify.

If you have implemented a new provider and would like to share it, please open a Pull Request at:

[https://github.com/ich777/mos-boot-files](https://github.com/ich777/mos-boot-files)

---

## 🖥️ Frontend Integration

Configuration via the MOS frontend is planned, but not yet implemented.

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
