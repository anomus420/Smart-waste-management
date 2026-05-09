# Database Schema Reference

MongoDB database: `smart-waste-db`

---

## Collection: `users`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | 2–50 chars, required |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt-hashed, select:false |
| `googleId` | String | Populated on Google OAuth |
| `avatar` | String | URL or file path |
| `phone` | String | Optional |
| `role` | Enum | `user` \| `admin` |
| `isBlocked` | Boolean | Default false |
| `isEmailVerified` | Boolean | Default false |
| `address` | String | Optional |
| `ecoPoints` | Number | Gamification points |
| `lastLogin` | Date | Updated on login |
| `createdAt` | Date | Auto-timestamp |
| `updatedAt` | Date | Auto-timestamp |

**Indexes:** `email` (unique)

---

## Collection: `complaints`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `title` | String | 5–100 chars |
| `description` | String | 10–1000 chars |
| `image` | String | Relative path to upload |
| `location.address` | String | Required |
| `location.coordinates.lat` | Number | Optional |
| `location.coordinates.lng` | Number | Optional |
| `status` | Enum | `pending` \| `in_progress` \| `resolved` \| `rejected` |
| `priority` | Enum | `low` \| `medium` \| `high` \| `urgent` |
| `category` | Enum | `garbage_overflow` \| `illegal_dumping` \| `littering` \| `hazardous_waste` \| `drainage_blockage` \| `other` |
| `aiSuggestion.category` | String | AI-generated |
| `aiSuggestion.tips` | [String] | AI-generated tips |
| `userId` | ObjectId → User | Required |
| `assignedTo` | ObjectId → User | Admin assignment |
| `timeline` | [TimelineEvent] | Status history |
| `adminNotes` | String | Internal notes |
| `isAnonymous` | Boolean | Hides user identity |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Timeline Sub-document:**
```
{ status, message, updatedBy (ObjectId), createdAt }
```

**Indexes:** `userId + createdAt`, `status`, `location.coordinates (2dsphere sparse)`

---

## Collection: `ewastepickups`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId → User | |
| `wasteType` | Enum | mobile_phones, laptops, tablets, televisions, refrigerators, washing_machines, printers, batteries, cables_accessories, other |
| `quantity` | String | Description |
| `description` | String | Optional details |
| `address` | String | Pickup address |
| `coordinates.lat/lng` | Number | Optional |
| `pickupDate` | Date | Required, must be future |
| `pickupTimeSlot` | Enum | `morning` \| `afternoon` \| `evening` |
| `status` | Enum | `requested` \| `confirmed` \| `picked_up` \| `cancelled` |
| `contactPhone` | String | |
| `adminNotes` | String | |
| `createdAt/updatedAt` | Date | |

**Indexes:** `userId + createdAt`, `status`, `pickupDate`

---

## Collection: `wastecenters`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `name` | String | |
| `address` | String | |
| `location` | GeoJSON Point | `{ type: 'Point', coordinates: [lng, lat] }` |
| `lat` / `lng` | Number | Human-readable copy |
| `phone` | String | |
| `email` | String | |
| `operatingHours` | String | |
| `acceptedWasteTypes` | [String] | |
| `isActive` | Boolean | |
| `rating` | Number | 0–5 |
| `city` / `state` | String | |

**Indexes:** `location (2dsphere)`

---

## Collection: `notifications`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId → User | |
| `title` | String | |
| `message` | String | |
| `type` | Enum | `complaint_update` \| `ewaste_update` \| `system` \| `info` \| `warning` |
| `refModel` | String | `Complaint` or `EWastePickup` |
| `refId` | ObjectId | Reference doc ID |
| `isRead` | Boolean | Default false |
| `readAt` | Date | |
| `createdAt` | Date | TTL: auto-deleted after 90 days |

**Indexes:** `userId + isRead + createdAt`, TTL on `createdAt`

---

## Collection: `awarenessarticles`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `title` | String | 5–150 chars |
| `content` | String | Full HTML/Markdown body |
| `excerpt` | String | Auto-generated from content |
| `coverImage` | String | Path or URL |
| `category` | Enum | waste_reduction, recycling, composting, ewaste, plastic_pollution, sustainability, policy, tips |
| `tags` | [String] | |
| `createdBy` | ObjectId → User | Admin |
| `isPublished` | Boolean | |
| `views` | Number | Incremented on read |
| `readTime` | Number | Auto-calculated (minutes) |

**Indexes:** Full-text on `title + content + tags`, `category + isPublished`