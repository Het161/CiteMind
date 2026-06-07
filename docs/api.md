# API Documentation

Base URL for local development:

```text
http://localhost:5000/api
```

Authenticated routes require:

```text
Authorization: Bearer <jwt-token>
```

## Health

### GET `/health`

Returns backend status and active AI/memory modes.

Response:

```json
{
  "ok": true,
  "memory": "fallback",
  "groq": false
}
```

## Auth

### POST `/auth/register`

Request:

```json
{
  "name": "Demo User",
  "email": "demo@citemind.ai",
  "password": "password123"
}
```

Response:

```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "<user-id>",
    "name": "Demo User",
    "email": "demo@citemind.ai"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "demo@citemind.ai",
  "password": "password123"
}
```

Response matches `/auth/register`.

## Sites

### POST `/sites`

Creates a tracked site and derives its memory bank id.

Request:

```json
{
  "domain": "https://example.com",
  "name": "Example Client"
}
```

### GET `/sites`

Lists sites owned by the authenticated user.

### GET `/sites/:id`

Returns site detail, configured queries, and recent citation checks.

### POST `/sites/:id/queries`

Adds one or more target queries.

Single query request:

```json
{
  "text": "best web developer in ahmedabad",
  "intent": "local"
}
```

Bulk request:

```json
{
  "queries": [
    {
      "text": "best web developer in ahmedabad",
      "intent": "local"
    },
    {
      "text": "react developer for hire",
      "intent": "commercial"
    }
  ]
}
```

## Monitoring

### POST `/monitor/:siteId/run`

Runs citation checks across all queries for the selected site. Results are also
retained to memory.

Response:

```json
{
  "shareOfModel": 62,
  "checks": [
    {
      "engine": "perplexity",
      "cited": true,
      "position": 2,
      "competitorCited": null,
      "decayType": null
    }
  ]
}
```

## Agent

### GET `/agent/:siteId/observations`

Returns consolidated observations from memory.

Response:

```json
{
  "observations": [
    {
      "text": "FAQ schema plus fresh stats recover local-intent pages.",
      "strength": "strengthening",
      "proofCount": 4
    }
  ]
}
```

### POST `/agent/:siteId/ask`

Asks the memory-backed agent for a recommendation.

Request:

```json
{
  "question": "How should we recover citations for the Ahmedabad page?"
}
```

Response:

```json
{
  "text": "Use FAQ schema and update stale statistics first...",
  "backedByMemory": true,
  "proofCount": 5
}
```

## Demo

### POST `/demo/:siteId/seed`

Seeds three months of realistic citation history into memory. Optional query
parameter: `gap`, the delay in milliseconds between live memory events.

Example:

```text
POST /api/demo/<site-id>/seed?gap=150
```

### POST `/demo/:siteId/ask-empty`

Asks a throwaway empty memory bank to show the generic "before" answer.

Request:

```json
{
  "question": "How do I get my new page cited?"
}
```

### POST `/demo/:siteId/reset`

Clears demo checks and recommendations, then rotates the site's memory bank for
a clean demo.

## WebSocket Events

Clients join a site room with:

```text
join_site <siteId>
```

Server events:

| Event | Meaning |
| --- | --- |
| `citation_checked` | A query/engine citation result was produced. |
| `memory_retained` | A memory item was retained. |
| `observation_formed` | A consolidated belief was formed. |
| `monitor_complete` | A monitoring run finished. |
| `seed_complete` | Demo memory seeding finished. |
| `demo_reset` | Demo state was reset. |
