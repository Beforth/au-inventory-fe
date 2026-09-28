# TallyConnect API Reference

**Version:** 0.2.0
**Base URL:** `http://<host>:8000` (default; set per deployment)
&nbsp;&nbsp;&nbsp;&nbsp;• Production (the backend the inventory module calls): `https://tally-server.encryptedbar.com`
&nbsp;&nbsp;&nbsp;&nbsp;• Local dev backend: `http://localhost:8000`
**API prefix:** `/api/v1`
**Interactive docs:** `/docs` (Swagger UI), `/redoc`, raw schema at `/openapi.json`

TallyConnect is a **read-only** gateway. Every data endpoint is a `GET`; the only
writes are `/auth/login`, `/sync/*`, `/tally/nudge`, and `/admin/keys`. Nothing is
ever written back to Tally.

This document focuses on the endpoints an **inventory module** needs: items, stock
levels, units of measure, ledgers (parties), and the vouchers that move stock. Auth,
sync triggers, and system status are included because you'll need them too.

> Verified against the live server's `/openapi.json` (version **0.2.0**) on 2026-09-01.
> The server also exposes `/api/v1/ledgers` — included below as §4.5.

---

## 1. Authentication

Every `/api/v1/*` endpoint (except `/auth/login`) requires authentication. Two schemes
are accepted; pick whichever fits your integration.

### Option A — API key (recommended for service-to-service)

Send the key in a header on every request:

```
X-API-Key: tc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Keys are created via `POST /api/v1/admin/keys` (admin only) and carry one of three roles:

| Role        | Can read data | Can trigger sync | Can manage keys/users |
|-------------|---------------|------------------|-----------------------|
| `read_only` | ✅            | ❌               | ❌                    |
| `sync`      | ✅            | ✅               | ❌                    |
| `admin`     | ✅            | ✅               | ✅                    |

For a read-only inventory module, a `read_only` key is enough. Use a `sync` key only
if the module also needs to force a refresh.

### Option B — JWT bearer token (for user-facing apps)

```
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "admin", "password": "••••••" }
```

Response:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "role": "admin",
  "name": "admin"
}
```

Then send `Authorization: Bearer <access_token>` on subsequent requests.

> The resolver tries `X-API-Key` first, then falls back to the bearer token.

### Who am I? — `GET /api/v1/auth/identity`

Returns the identity behind the current credentials. Accepts either auth scheme.

```json
{ "role": "read_only", "name": "inventory-fe", "auth_type": "api_key" }
```

### Admin key management (`admin` role only)

| Endpoint | Method | Effect |
|----------|--------|--------|
| `/api/v1/admin/keys` | GET | List keys (`id`, `name`, `role`, `is_active`, `last_used_at`, `created_at`) — never returns the raw key |
| `/api/v1/admin/keys` | POST | Create a key — `{ "name": "...", "role": "read_only" }`; response includes `raw_key` **once** |
| `/api/v1/admin/keys/{key_id}` | DELETE | Revoke a key |

### Auth errors

| Status | When |
|--------|------|
| `401`  | No credentials, invalid API key, or invalid/expired token |
| `403`  | Valid credentials but role lacks permission for the endpoint |

```json
{ "detail": "Invalid API key" }
```

---

## 2. Response envelope

All `/api/v1` data endpoints return the same wrapper:

```json
{
  "success": true,
  "data": <object | array | null>,
  "last_sync": "2026-08-31T09:15:00Z",
  "pagination": {
    "page": 1,
    "page_size": 100,
    "total": 379,
    "total_pages": 4
  }
}
```

- `data` — the payload. An object for single-resource endpoints, an array for list endpoints.
- `pagination` — present only on paginated list endpoints.
- `last_sync` — nullable; may be `null` on endpoints that don't track it.

### Error envelope

Application-level errors use:

```json
{
  "success": false,
  "error": { "code": "SYNC_LOCKED", "message": "Sync already in progress" }
}
```

FastAPI validation / not-found errors use the plain `{"detail": "..."}` form.

| Status | Meaning |
|--------|---------|
| `400` / `422` | Bad query params |
| `401` | Not authenticated |
| `403` | Wrong role |
| `404` | Resource ID not found |
| `409` | Sync already running for that collection (`SYNC_LOCKED`) |
| `429` | Rate limit exceeded (`RATE_LIMIT_EXCEEDED`) — default **100 req/min per IP** |
| `502` | Upstream Tally sync failed |
| `503` | Service not ready (`/health/ready`) |

---

## 3. Pagination & filtering

List endpoints accept:

| Param       | Type   | Default | Range    | Notes |
|-------------|--------|---------|----------|-------|
| `page`      | int    | `1`     | `≥ 1`    | 1-indexed |
| `page_size` | int    | `100`   | `1–1000` | |
| `search`    | string | –       |          | Case-insensitive substring match (see each endpoint for the field it matches) |

---

## 4. Inventory endpoints

### 4.1 Items (stock items / products)

#### `GET /api/v1/items`

List stock items. `search` matches on **item name**.

Auth: any authenticated identity (`read_only`+).

```
GET /api/v1/items?page=1&page_size=100&search=bearing
X-API-Key: tc_live_...
```

```json
{
  "success": true,
  "data": [
    {
      "id": "7c3f9a12-5b8e-4d21-9f4a-1e2d3c4b5a6f",
      "name": "6203 ZZ Bearing",
      "parent_name": "Bearings",
      "base_units": "nos",
      "opening_balance": "120.00",
      "closing_balance": "84.00",
      "std_selling_price": "45.00",
      "std_cost_price": "31.50",
      "created_at": "2026-08-20T06:00:00Z",
      "updated_at": "2026-08-31T09:15:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 100, "total": 379, "total_pages": 4 }
}
```

#### `GET /api/v1/items/{item_id}`

Single item by UUID. `404` if not found.

**Item fields**

| Field               | Type              | Notes |
|---------------------|-------------------|-------|
| `id`                | UUID              | TallyConnect primary key (use this for `{item_id}`) |
| `name`              | string            | Unique item name from Tally |
| `parent_name`       | string \| null    | Tally stock group |
| `base_units`        | string \| null    | Base unit symbol, e.g. `"nos"`, `"kg"` |
| `opening_balance`   | decimal \| null   | Opening qty |
| `closing_balance`   | decimal \| null   | Current qty per Tally's stock-item closing balance |
| `std_selling_price` | decimal \| null   | Standard selling price |
| `std_cost_price`    | decimal \| null   | Standard cost price |
| `created_at`        | datetime          | |
| `updated_at`        | datetime          | Advances when the item changes in Tally |

Decimals are serialized as JSON **strings** (`"84.00"`) to preserve precision.

---

### 4.2 Stock (on-hand levels & valuation)

#### `GET /api/v1/stock`

Company-wide stock summary, one row per item, ordered by item name.
`search` matches on **item name**.

Auth: any authenticated identity.

```
GET /api/v1/stock?search=bearing
X-API-Key: tc_live_...
```

```json
{
  "success": true,
  "data": [
    {
      "id": "9a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9",
      "item_name": "6203 ZZ Bearing",
      "godown_name": null,
      "quantity": "84.00",
      "unit": "nos",
      "rate": "31.50",
      "amount": "2646.00",
      "created_at": "2026-08-20T06:00:00Z",
      "updated_at": "2026-08-31T09:15:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 100, "total": 379, "total_pages": 4 }
}
```

**Stock fields**

| Field         | Type            | Notes |
|---------------|-----------------|-------|
| `id`          | UUID            | |
| `item_name`   | string          | Join key back to `items.name` |
| `godown_name` | string \| null  | **Always `null` today** — stock is company-wide, not per-godown (reserved for future work) |
| `quantity`    | decimal \| null | Closing balance quantity |
| `unit`        | string \| null  | Unit symbol |
| `rate`        | decimal \| null | Per-unit valuation rate |
| `amount`      | decimal \| null | Total value (`quantity × rate`) |
| `created_at`  | datetime        | |
| `updated_at`  | datetime        | |

> There is no `GET /stock/{id}` endpoint — stock is a list-only summary. Match by
> `item_name` (or fetch the item and read its `closing_balance`).

---

### 4.3 Units of measure

#### `GET /api/v1/units`

List units. `search` matches on **unit name**.

Auth: **API key only** (`X-API-Key`). This endpoint does not accept the JWT bearer token.

| Extra query param | Type   | Notes |
|-------------------|--------|-------|
| `type`            | string | Filter by `SIMPLE` or `COMPOUND` (case-insensitive) |

```
GET /api/v1/units?type=compound
X-API-Key: tc_live_...
```

```json
{
  "success": true,
  "data": [
    {
      "id": "1f2e3d4c-5b6a-7089-9012-3456789abcde",
      "name": "box of 12",
      "tally_guid": "8a7b6c5d-...-0001",
      "symbol": "box",
      "formal_name": "Box",
      "type": "COMPOUND",
      "first_unit": "box",
      "conversion": "12",
      "second_unit": "nos",
      "decimal_places": 0,
      "is_deleted": false,
      "created_at": "2026-08-20T06:00:00Z",
      "updated_at": "2026-08-20T06:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 100, "total": 14, "total_pages": 1 }
}
```

#### `GET /api/v1/units/{unit_id}`

Single unit by UUID. `404` if not found. API key only.

**Unit fields**

| Field            | Type           | Notes |
|------------------|----------------|-------|
| `id`             | UUID           | |
| `name`           | string         | Unique |
| `tally_guid`     | string         | Tally's GUID |
| `symbol`         | string \| null | Short symbol |
| `formal_name`    | string \| null | |
| `type`           | string \| null | `SIMPLE` or `COMPOUND` |
| `first_unit`     | string \| null | Compound only — base unit |
| `conversion`     | string \| null | Compound only — conversion factor (as string) |
| `second_unit`    | string \| null | Compound only — sub unit |
| `decimal_places` | int \| null    | |
| `is_deleted`     | bool           | Soft-delete flag from Tally |
| `created_at`     | datetime       | |
| `updated_at`     | datetime       | |

---

### 4.4 Vouchers (stock movements: sales, purchases, stock journals)

Vouchers carry the inventory line items (`items[]`) that actually move stock.

#### `GET /api/v1/vouchers`

List vouchers, newest-first not guaranteed — sort client-side on `date` if needed.

Auth: any authenticated identity.

| Query param    | Type   | Notes |
|----------------|--------|-------|
| `page`         | int    | |
| `page_size`    | int    | 1–1000 |
| `voucher_type` | string | Exact match against Tally's voucher type name |

> Note: the voucher list endpoint has **no `search` param** — only `voucher_type`.
>
> Voucher type names are whatever the connected company configured in Tally — they
> are **not** a fixed enum. Standard names (`Sales`, `Purchase`, `Stock Journal`,
> `Delivery Note`) are common, but a company may use custom types (e.g. `MFG JOURNAL`).
> Omit the filter and read `voucher_type` off the results to discover what exists.

```
GET /api/v1/vouchers?voucher_type=Sales&page=1&page_size=50
X-API-Key: tc_live_...
```

```json
{
  "success": true,
  "data": [
    {
      "id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
      "voucher_type": "Sales",
      "voucher_number": "S/0042",
      "date": "2026-08-30",
      "narration": "Counter sale",
      "party_name": "Acme Traders",
      "reference": "PO-9911",
      "gross_total": "531.00",
      "ledger_entries": [ { "ledger": "Acme Traders", "amount": "531.00" } ],
      "alter_id": 20514,
      "is_deleted": false,
      "synced_at": "2026-08-31T09:15:00Z",
      "items": [
        {
          "line_no": 1,
          "item_name": "6203 ZZ Bearing",
          "qty": "10.00",
          "qty_unit": "nos",
          "rate": "45.00",
          "rate_unit": "nos",
          "amount": "450.00",
          "godown": "Main Location",
          "batch": null
        }
      ],
      "created_at": "2026-08-31T09:15:00Z",
      "updated_at": "2026-08-31T09:15:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 50, "total": 128, "total_pages": 3 }
}
```

#### `GET /api/v1/vouchers/{voucher_id}`

Single voucher by UUID, including `items[]`. `404` if not found.

**Voucher fields**

| Field            | Type              | Notes |
|------------------|-------------------|-------|
| `id`             | UUID              | |
| `voucher_type`   | string            | Tally voucher type name |
| `voucher_number` | string \| null    | |
| `date`           | date (`YYYY-MM-DD`)| Voucher date |
| `narration`      | string \| null    | |
| `party_name`     | string \| null    | Party ledger |
| `reference`      | string \| null    | |
| `gross_total`    | decimal \| null   | |
| `ledger_entries` | array/object \| null | Raw accounting entries (shape varies by voucher) |
| `alter_id`       | int \| null       | Tally ALTERID; increases on every edit |
| `is_deleted`     | bool              | Soft-delete flag |
| `synced_at`      | datetime \| null  | When TallyConnect last pulled it |
| `items`          | array             | Inventory lines — see below |
| `created_at`     | datetime          | |
| `updated_at`     | datetime          | |

**Voucher line item (`items[]`) fields**

| Field       | Type            | Notes |
|-------------|-----------------|-------|
| `line_no`   | int             | 1-indexed position |
| `item_name` | string \| null  | Join key to `items.name` |
| `qty`       | decimal \| null | Quantity moved (sign depends on voucher type) |
| `qty_unit`  | string \| null  | |
| `rate`      | decimal \| null | Per-unit rate |
| `rate_unit` | string \| null  | |
| `amount`    | decimal \| null | Line amount |
| `godown`    | string \| null  | Godown / location for the line |
| `batch`     | string \| null  | Batch name if batch tracking is on |

---

### 4.5 Ledgers (parties: customers, suppliers, tax & GL accounts)

Not strictly inventory, but you need ledgers to resolve a voucher's `party_name`
to contact / tax details, and for procurement/vendor screens.

#### `GET /api/v1/ledgers`

List ledgers. `search` matches on **ledger name**.

Auth: any authenticated identity (`read_only`+).

| Extra query param | Type   | Notes |
|-------------------|--------|-------|
| `ledger_type`     | string | Filter by the gateway's normalized ledger class. Observed values: `customer`, `supplier`, `general` (lower-case). |

```
GET /api/v1/ledgers?search=acme&ledger_type=customer
X-API-Key: tc_live_...
```

```json
{
  "success": true,
  "data": [
    {
      "id": "3d4e5f60-7182-4930-a1b2-c3d4e5f60718",
      "name": "AARTI SURGICALS",
      "parent_name": "Sundry Debtors",
      "opening_balance": "0.00",
      "closing_balance": "8931.00",
      "address": "42 Industrial Estate, Pune",
      "pincode": "411019",
      "phone": null,
      "mobile": "9822012345",
      "email": "artisurgicals@gmail.com",
      "gstin": "27ABCDE1234F1Z5",
      "pan": "ABCDE1234F",
      "ledger_type": "supplier",
      "created_at": "2026-08-20T06:00:00Z",
      "updated_at": "2026-08-31T09:15:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 100, "total": 1259, "total_pages": 13 }
}
```

> `parent_name` is the raw Tally group ("Sundry Debtors", "Sundry Creditors", …);
> `ledger_type` is the gateway's coarser bucket (`customer` / `supplier` / `general`).

#### `GET /api/v1/ledgers/{ledger_id}`

Single ledger by UUID. `404` if not found.

**Ledger fields**

| Field             | Type            | Notes |
|-------------------|-----------------|-------|
| `id`              | UUID            | |
| `name`            | string          | Unique ledger name; matches `voucher.party_name` |
| `parent_name`     | string \| null  | Tally ledger group |
| `opening_balance` | decimal \| null | String-encoded decimal |
| `closing_balance` | decimal \| null | String-encoded decimal; sign per Tally (Dr/Cr) |
| `address`         | string \| null  | |
| `pincode`         | string \| null  | |
| `phone`           | string \| null  | |
| `mobile`          | string \| null  | |
| `email`           | string \| null  | |
| `gstin`           | string \| null  | |
| `pan`             | string \| null  | |
| `ledger_type`     | string          | Always present (required) |
| `created_at`      | datetime        | |
| `updated_at`      | datetime        | |

---

### 4.6 Companies (context)

#### `GET /api/v1/companies`

List synced companies. Not paginated. Auth: any authenticated identity.

```json
{
  "success": true,
  "data": [
    {
      "id": "c0ffee00-...", "name": "Demo Traders Pvt Ltd",
      "address": "12 MG Road, Pune", "phone": "020-1234567",
      "email": "accounts@demo.example", "created_at": "...", "updated_at": "..."
    }
  ]
}
```

TallyConnect syncs one active company at a time (configured server-side). Use
`GET /api/v1/system` to see which company is connected and what else is available.

---

## 5. Forcing a refresh (optional)

Data is refreshed automatically by a background scheduler. If your module needs
fresh data on demand, trigger a sync — but note these hit the live Tally instance
and can take a few seconds.

| Endpoint                       | Role required     | Effect |
|--------------------------------|-------------------|--------|
| `POST /api/v1/sync/items`      | `admin` or `sync` | Incremental item sync |
| `POST /api/v1/sync/units`      | `admin` or `sync` | Incremental unit sync |
| `POST /api/v1/sync/stock`      | `admin` or `sync` | Incremental stock sync |
| `POST /api/v1/sync/ledgers`    | `admin` or `sync` | Incremental ledger sync |
| `POST /api/v1/sync/vouchers`   | `admin` or `sync` | Incremental voucher sync (bookmark-based; not a full resync) |
| `POST /api/v1/sync/all`        | `admin`           | Sync every collection |
| `GET  /api/v1/sync/voucher-state` | `admin`/`sync`/`read_only` | Voucher sync bookmark + last outcome (cached, cheap to poll) |
| `POST /api/v1/tally/nudge`     | **none** (unauthenticated) | Zero-payload trigger that wakes the voucher poller so it syncs in ~1s. Carries no data; used by Tally's TDL HTTP action. Restrict by source IP if exposed. Returns `202`. |

No request body. Response:

```json
{ "success": true, "data": { "fetched": 12, "inserted": 3, "updated": 4, "unchanged": 5 } }
```

Errors: `409` if a sync for that collection is already running, `502` if Tally is unreachable.

---

## 6. System & health

| Endpoint              | Auth | Purpose |
|-----------------------|------|---------|
| `GET /api/v1/system`  | none | Tally connectivity, active company, available companies, version |
| `GET /health/live`    | none | Liveness probe → `{"data":{"status":"alive"}}` |
| `GET /health/ready`   | none | Readiness probe → `200` ready / `503` not ready |

```json
// GET /api/v1/system
{
  "version": "0.2.0",
  "tally": {
    "host": "192.168.1.10", "port": 9000, "scheme": "http",
    "url": "http://192.168.1.10:9000",
    "connected": true,
    "company": "Demo Traders Pvt Ltd",
    "available_companies": ["Demo Traders Pvt Ltd", "Demo Traders (FY24)"]
  }
}
```

> `company` is a plain string and can be `""` (empty) even while `connected` is
> `true` — treat empty as "no active company", not just `null`. `available_companies`
> is always an array (possibly with one entry).

---

## 7. Integration notes for an inventory module

- **Treat everything as read-only.** There is no create/update/delete. To change
  stock, users edit Tally; TallyConnect picks it up on the next sync.
- **Join model:** `stock.item_name` ↔ `items.name` ↔ `voucher.items[].item_name`.
  Names are the stable business key across resources; UUIDs are TallyConnect-local.
- **Current on-hand quantity:** use `stock.quantity` (or `item.closing_balance` —
  same source value). `stock` also gives you valuation (`rate`, `amount`).
- **Movement history:** page through `/vouchers` filtered by `voucher_type`, and read
  `items[]` for the per-line quantity/godown/batch.
- **Decimals are strings** in JSON — parse them with a decimal type, not a float.
- **Staleness:** check `GET /api/v1/system` `.connected` and
  `GET /api/v1/sync/voucher-state` if you need to show a "last updated" indicator.
- **Rate limit:** default 100 requests/minute per client IP. Batch with
  `page_size` up to 1000 rather than making many small calls.
- **Pagination loop:** stop when `page >= pagination.total_pages`.
