---
sidebar_label: 🔌 Network Services
sidebar_position: 3
---

# 🔌 Network Services

MOS provides various network services for remote access, file sharing, and VPN connectivity. These can be managed through:

**Settings → Network → Network Services**

![Network Services](/img/network/Network_Services.png)

---

## 🔒 SSH

Enable SSH access to remotely manage your MOS system via command line.

When enabled, you can connect using any SSH client:
```bash
ssh root@<MOS-IP-ADDRESS>
```

---

##  NFS

Network File System (NFS) allows Linux/Unix systems to mount shares from MOS.

Enable NFS to share directories with other systems on your network.

---

## 🌍 Dnsmasq

Lightweight DNS forwarder and DHCP server.

Enable Dnsmasq for local DNS resolution and DHCP services.

---

## 🔋 NUT (Network UPS Tools)

Monitor and manage UPS (Uninterruptible Power Supply) devices connected via USB or serial port.

Enable NUT in **Settings → Network → Network Services** to integrate with local UPS devices for power management and automatic shutdown.

### Configuration Files

NUT configuration files are located at: `/boot/config/system/nut/`

#### 1. ups.conf - UPS Device Configuration

Defines the UPS devices to monitor:

```ini
[ups]
driver = usbhid-ups
port = auto
```

**Key settings:**
- `driver` - Driver for your UPS type (e.g., `usbhid-ups` for USB HID devices)
- `port` - Serial port (e.g., `/dev/ttyS0`) or `auto` for USB
- `maxretry` - Number of start attempts (default: 3)
- `retrydelay` - Delay between attempts (default: 5 seconds)
- `pollinterval` - Status refresh interval (default: 2 seconds)

#### 2. nut.conf - NUT Mode

Sets the operating mode:

```ini
MODE=standalone
```

**Modes:**
- `standalone` - Single UPS protecting the local system (most common)
- `netserver` - UPS server accessible over network
- `netclient` - Client monitoring remote UPS servers only
- `none` - NUT disabled

#### 3. upsd.conf - UPS Daemon Configuration

Network settings for the NUT server:

```ini
LISTEN 0.0.0.0 3493
```

**Key settings:**
- `LISTEN` - IP address and port to listen on (default: 3493)
- `MAXAGE` - Mark data stale after X seconds (default: 15)
- `ALLOW_NO_DEVICE` - Allow server to start without UPS devices

#### 4. upsd.users - User Access Control

Defines users and permissions:

```ini
[admin]
password=adminpass
actions=set
actions=fsd
instcmds=all

[slaveuser]
password = slavepass
upsmon slave

[monuser]
password = monpass
upsmon master
```

**Permissions:**
- `actions=SET` - Change UPS variables
- `actions=FSD` - Force shutdown
- `instcmds=ALL` - Execute all commands
- `upsmon primary/secondary/master/slave` - Monitoring role

#### 5. upsmon.conf - UPS Monitoring

Controls system monitoring and shutdown behavior:

```ini
MONITOR ups@127.0.0.1 1 monuser monpass master
MINSUPPLIES 1
SHUTDOWNCMD "/sbin/shutdown -h +0"
NOTIFYCMD /sbin/upssched
POLLFREQ 5
DEADTIME 15
FINALDELAY 5

NOTIFYFLAG ONBATT SYSLOG+EXEC
NOTIFYFLAG ONLINE SYSLOG+EXEC
NOTIFYFLAG LOWBATT SYSLOG+EXEC
```

**Key settings:**
- `MONITOR` - UPS to monitor (format: `upsname@host powervalue username password role`)
- `MINSUPPLIES` - Minimum power supplies needed to stay running
- `SHUTDOWNCMD` - Command to execute on critical power event
- `POLLFREQ` - Check interval in seconds (default: 5)
- `DEADTIME` - Declare UPS dead after X seconds without response
- `FINALDELAY` - Wait time before shutdown (default: 5 seconds)
- `NOTIFYFLAG` - Actions on events (SYSLOG, WALL, EXEC, IGNORE)

#### 6. upssched.conf - Scheduled Events

Defines actions for UPS events:

```ini
CMDSCRIPT /bin/upssched-cmd
# PIPEFN /run/nut/upssched/upssched.pipe
# LOCKFN /run/nut/upssched/upssched.lock

# Example: Start timer when on battery
# AT ONBATT * START-TIMER onbattwarn 30
# AT ONLINE * CANCEL-TIMER onbattwarn
```

**Commands:**
- `CMDSCRIPT` - Script to execute for timer events
- `PIPEFN/LOCKFN` - Required paths for timer mechanism
- `AT <event> <ups> <action>` - Event handlers

### Common UPS Drivers

| Manufacturer | Driver | Notes |
|--------------|--------|-------|
| APC | `usbhid-ups` | Most modern APC units |
| APC (older) | `apcsmart` | Smart-UPS via serial |
| CyberPower | `usbhid-ups` | Most USB models |
| Eaton | `usbhid-ups` | Various models |
| Tripp Lite | `usbhid-ups` | USB HID models |
| Tripp Lite | `tripplite` | Serial models |
| Generic USB | `usbhid-ups` | HID-compliant devices |

### Testing NUT

After enabling NUT and configuring your UPS:

```bash
# Check UPS status
upsc ups@localhost

# List available commands
upscmd -l ups@localhost

# Test battery (if supported)
upscmd ups@localhost test.battery.start

# View NUT logs
tail -f /var/log/nut.log
```

### Troubleshooting

- **UPS not detected:** Check USB connection and driver compatibility
- **Permission denied:** Verify user settings in `upsd.users`
- **No shutdown:** Check `SHUTDOWNCMD` and `NOTIFYFLAG` settings
- **Stale data:** Increase `MAXAGE` or check `pollinterval`

---

## 📀 Remote Mounting

Mount remote storage to your MOS system.

Enable to access storage from other servers or NAS devices.

---

## 🗂️ Samba (SMB/CIFS)

Windows-compatible file sharing.

### Samba
Enable Samba to share folders with Windows, macOS, and Linux systems.

### Samba Discovery
Enable network discovery for automatic detection of MOS shares.

### Workgroup
Configure the workgroup name for your network (default: `WORKGROUP`).

---

## 🌐 Tailscale

[Tailscale](https://tailscale.com/) is a zero-config VPN that creates a secure mesh network between your devices.

### Enabling Tailscale

1. Go to **Settings → Network → Network Services**
2. Toggle **Tailscale** to enable the service

### Setup

After enabling Tailscale, open the **MOS Terminal** and run:

```bash
tailscale up
```

This will generate an authentication URL. Follow the link to authenticate your device with your Tailscale account.

:::tip[CLI Documentation]
For additional options and parameters, refer to the official Tailscale documentation:
[**tailscale up**](https://tailscale.com/docs/reference/tailscale-cli/up)
:::

### Tailscale Update Check

Enable automatic update notifications for Tailscale.

### Tailscale Daemon Parameters

Add custom command-line arguments for the Tailscale daemon (`tailscaled`) if needed.

---

## 🐦 Netbird

[Netbird](https://netbird.io/) is an open-source peer-to-peer VPN solution with zero configuration.

### Enabling Netbird

1. Go to **Settings → Network → Network Services**
2. Toggle **Netbird** to enable the service

### Setup

After enabling Netbird, open the **MOS Terminal** and run:

```bash
netbird up
```

This will generate an authentication URL. Follow the link to register your device with your Netbird management server.

:::tip[CLI Documentation]
For additional options and parameters, refer to the official Netbird documentation:
[**netbird up**](https://docs.netbird.io/get-started/cli#up)
:::

### Netbird Update Check

Enable automatic update notifications for Netbird.

### Netbird Service Parameters

Add custom configuration parameters for the Netbird service if needed.

---

## 🆘 Troubleshooting

### VPN not connecting?
- Ensure the service is enabled in Network Services
- Check that you've run the `up` command in the MOS Terminal
- Verify your device has internet connectivity
- Check firewall settings if behind a restrictive network

### Can't access shares?
- Verify the sharing service (NFS/Samba) is enabled
- Check share permissions in the **Shares** section
- Ensure client devices are on the same network or VPN

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._