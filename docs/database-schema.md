# Database Schema

CiteMind uses MongoDB through Mongoose when `MONGODB_URI` is configured. When
MongoDB is not configured, the backend falls back to an in-memory repository
with the same application-level shape.

## User

Stores registered application users.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | String | Yes | Display name. |
| `email` | String | Yes | Unique and lowercased. |
| `passwordHash` | String | Yes | bcrypt hash, never a plain password. |
| `createdAt` | Date | No | Defaults to current time. |

## Site

Stores a website tracked by a user.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `userId` | ObjectId -> User | Yes | Owner of the site. |
| `domain` | String | Yes | Website domain or URL. |
| `name` | String | Yes | Friendly client/site name. |
| `bankId` | String | Yes | Site-specific memory bank id. |
| `shareOfModel` | Number | No | Latest citation share score. |
| `createdAt` | Date | No | Defaults to current time. |

## Query

Stores target AI-answer queries for a site.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `siteId` | ObjectId -> Site | Yes | Tracked site. |
| `text` | String | Yes | Query text. |
| `intent` | String | No | `local`, `commercial`, or `informational`. |
| `createdAt` | Date | No | Defaults to current time. |

## CitationCheck

Stores each citation check result.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `siteId` | ObjectId -> Site | Yes | Tracked site. |
| `queryId` | ObjectId -> Query | Yes | Query that was checked. |
| `engine` | String | Yes | `perplexity`, `chatgpt`, `claude`, or `ai_overview`. |
| `cited` | Boolean | No | Whether the site was cited. |
| `position` | Number/null | No | Citation position when available. |
| `competitorCited` | String/null | No | Competitor cited instead. |
| `decayType` | String/null | No | `statistical`, `structural`, `competitive`, or `null`. |
| `rawAnswer` | String | No | Raw or simulated answer text. |
| `checkedAt` | Date | No | Defaults to current time. |

## Recommendation

Stores agent answers generated from user questions.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `siteId` | ObjectId -> Site | Yes | Tracked site. |
| `queryText` | String | Yes | User question or query text. |
| `answer` | String | Yes | Agent recommendation. |
| `backedByMemory` | Boolean | No | Whether retained memory supported the response. |
| `proofCount` | Number | No | Number of supporting memories/observations. |
| `createdAt` | Date | No | Defaults to current time. |

## Memory Bank

Memory is keyed by `Site.bankId`, for example `site-example-com`.

Each retained memory contains natural-language evidence such as:

- citation check outcomes;
- competitor displacement events;
- optimization experiments;
- recovery windows;
- repeated patterns consolidated into observations.
