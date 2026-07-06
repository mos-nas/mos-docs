---
sidebar_label: ⏱️ Rate Limits
sidebar_position: 2
description: "MOS API rate limits configuration: general request limits and login brute-force protection via environment variables."
---

# ⏱️ API Rate Limits

The MOS API implements rate limits to protect the system from overload and abuse.

---

## 🌐 Configuration

API rate limits are configured via environment variables in the file `/boot/config/api/env`.

### Variables

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `RATE_LIMIT_WINDOW` | 1 | Time window in seconds |
| `RATE_LIMIT_MAX` | 20 | Maximum number of requests per time window |

### How It Works

- Maximum of `RATE_LIMIT_MAX` requests within `RATE_LIMIT_WINDOW` seconds
- Default: 20 requests per second

:::danger[Do Not Change]
The API rate limits should **not** be changed! These default values are carefully tuned to ensure system stability and security. Modifying these limits may lead to system instability, performance issues, or security vulnerabilities.
:::

:::warning[Important]
Changes to the configuration require a restart of the API or the server to take effect.
:::

---

## ⚙️ Configuration File

Rate limits are configured in the file `/boot/config/api/env`:

```env
PORT=998
JWT_SECRET=your-secret-key
JWT_EXPIRY_DAYS=1
RATE_LIMIT_WINDOW=1
RATE_LIMIT_MAX=20
NODE_ENV=production
```

:::warning[Change JWT_SECRET!]
You may change the `JWT_SECRET` in the configuration. Changing the JWT_SECRET is explicitly allowed and recommended for enhanced security. The default secret should be replaced with your own cryptographically secure value for security reasons.
:::

---

## 🔄 Resetting Counters

The rate limit counters are reset in the following cases:

- API restart
- Server restart

---

_Parts of this documentation were created with the assistance of AI tools. All AI-generated content has undergone review, but it may still contain inaccuracies, omissions, or outdated information._
