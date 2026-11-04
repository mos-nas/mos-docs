import ApiExplorer from '@site/src/components/ApiExplorer/ApiExplorer';
import SyncBadge from '@site/src/components/ApiExplorer/SyncBadge';

# 📚 MOS API Reference

This is the complete, interactive reference for the **MOS REST API**. It mirrors the
built-in Swagger UI at `http://<MOS-IP>/api-docs/` and covers every endpoint, parameter,
request/response schema and example request.

:::info[Authentication]
Most endpoints require a **Bearer token**. Create one in the WebUI under
**User Settings → Admin API Tokens**, then send it in the `Authorization` header:

```
Authorization: Bearer <TOKEN>
```

:::

:::info[Auto-Sync]
This reference is regenerated automatically from the
[mos-nas/mos-api](https://github.com/mos-nas/mos-api) repository every
**Sunday around 23:00 (Austrian time, CET/CEST)**. A manual update can be triggered any time via the
**Sync OpenAPI Reference** workflow on the *Actions* tab of the
[mos-docs](https://github.com/mos-nas/mos-docs/actions) repository.

<SyncBadge />
:::

## Endpoints

<ApiExplorer />
