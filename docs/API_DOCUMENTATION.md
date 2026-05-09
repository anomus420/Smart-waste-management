# Smart Waste Management – API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, returns JWT |
| GET | `/me` | ✅ | Get logged-in user |
| PUT | `/change-password` | ✅ | Change password |
| GET | `/google` | ❌ | Initiate Google OAuth |
| GET | `/google/callback` | ❌ | Google OAuth callback |

### POST `/signup`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Pass@123" }
```
Response `201`:
```json
{ "success": true, "token": "<jwt>", "user": { "_id": "...", "name": "Jane Doe", "role": "user" } }
```

### POST `/login`
```json
{ "email": "jane@example.com", "password": "Pass@123" }
```

---

## Complaints (`/api/complaints`) — 🔒 All routes require login

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | File a new complaint (multipart/form-data) |
| GET | `/` | Get own complaints (paginated) |
| GET | `/nearby?lat=&lng=&radius=` | Get complaints near coordinates |
| GET | `/:id` | Get single complaint detail |
| PUT | `/:id` | Update pending complaint |
| DELETE | `/:id` | Delete pending complaint |

### POST `/` (multipart/form-data)
| Field | Type | Required |
|-------|------|----------|
| title | string | ✅ |
| description | string | ✅ |
| locationAddress | string | ✅ |
| locationLat | number | ❌ |
| locationLng | number | ❌ |
| category | string | ❌ (AI-suggested if omitted) |
| image | file | ❌ |
| isAnonymous | boolean | ❌ |

Response `201`:
```json
{
  "success": true,
  "complaint": {
    "_id": "...",
    "title": "Overflowing bins",
    "status": "pending",
    "aiSuggestion": { "category": "garbage_overflow", "tips": ["..."] },
    "timeline": [{ "status": "pending", "message": "Complaint filed." }]
  }
}
```

### GET `/?status=pending&page=1&limit=10`
Query params: `status`, `page`, `limit`

---

## E-Waste (`/api/ewaste`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/centers` | ❌ | List all waste centers |
| POST | `/` | ✅ | Request e-waste pickup |
| GET | `/` | ✅ | My pickup requests |
| GET | `/:id` | ✅ | Single pickup detail |
| PUT | `/:id` | ✅ | Cancel own pickup |

### POST `/` (JSON)
```json
{
  "wasteType": "laptops",
  "quantity": "2 laptops",
  "address": "42 Green Street, Delhi",
  "pickupDate": "2025-12-25",
  "pickupTimeSlot": "morning",
  "contactPhone": "+919876543210"
}
```

---

## Users (`/api/users`) — 🔒 All routes require login

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update profile (name, phone, address, avatar) |
| GET | `/stats` | Get complaint + pickup counts |
| GET | `/notifications` | Get in-app notifications |
| PUT | `/notifications/read` | Mark notifications as read |

### PUT `/notifications/read`
```json
{ "ids": ["notif_id_1", "notif_id_2"] }
```
Omit `ids` or send `[]` to mark ALL as read.

---

## Awareness Hub (`/api/awareness`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | List published articles |
| GET | `/:id` | ❌ | Single article |
| POST | `/` | 🔒 Admin | Create article |
| PUT | `/:id` | 🔒 Admin | Update article |
| DELETE | `/:id` | 🔒 Admin | Delete article |

Query params for GET `/`: `category`, `search`, `page`, `limit`

---

## Admin (`/api/admin`) — 🔒 Admin role required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Stats, charts, recent activity |
| GET | `/complaints` | All complaints (filterable) |
| PUT | `/complaints/:id` | Update status, priority, notes |
| GET | `/users` | All users |
| PUT | `/users/:id/block` | Toggle user block |
| DELETE | `/users/:id` | Delete user |
| GET | `/ewaste` | All pickup requests |
| PUT | `/ewaste/:id` | Update pickup status |
| POST | `/centers` | Add waste center |
| DELETE | `/centers/:id` | Remove waste center |

### PUT `/complaints/:id`
```json
{
  "status": "in_progress",
  "priority": "high",
  "adminNotes": "Assigned to sector 4 team.",
  "statusMessage": "Team dispatched."
}
```

### GET `/complaints?status=pending&priority=high&category=garbage_overflow&search=mumbai&page=1`

---

## Standard Response Envelope

### Success
```json
{ "success": true, "message": "...", "data": {} }
```

### Error
```json
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "Invalid" }] }
```

## Pagination Meta
All list responses include:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Complaint Status Flow

```
pending → in_progress → resolved
                     ↘ rejected
```

## E-Waste Pickup Status Flow

```
requested → confirmed → picked_up
          ↘ cancelled
```