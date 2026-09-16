# Database Schemas

This document describes the SQLAlchemy-managed PostgreSQL tables created by the backend.

## 1) `users`
Stores account and authentication identity.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `full_name` | VARCHAR(255) | Not null |
| `email` | VARCHAR(255) | Unique, indexed, not null |
| `password_hash` | VARCHAR(255) | Not null |
| `is_active` | BOOLEAN | Not null, default `true` |
| `created_at` | TIMESTAMPTZ | Not null, default `now()` |
| `updated_at` | TIMESTAMPTZ | Not null, default `now()`, auto-updated |

## 2) `password_reset_otps`
Stores one-time password records for password resets.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key -> `users.id` (`ON DELETE CASCADE`), not null |
| `otp_code` | VARCHAR(6) | Not null |
| `expires_at` | TIMESTAMPTZ | Not null |
| `used_at` | TIMESTAMPTZ | Nullable |
| `created_at` | TIMESTAMPTZ | Not null, default `now()` |

### OTP lifecycle
- New OTPs are generated as random 6-digit numeric values.
- Existing active OTPs for the same user are invalidated when a new OTP is issued.
- OTPs are valid only until `expires_at`.
- OTPs are marked as consumed by setting `used_at` after successful reset.

## 3) `chat_sessions`
Stores chat sessions per user.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key -> `users.id` (`ON DELETE CASCADE`), not null |
| `title` | VARCHAR(255) | Not null, default `New Chat` |
| `extra_data` | JSONB | Not null, default `{}` |
| `created_at` | TIMESTAMPTZ | Not null, default `now()` |
| `updated_at` | TIMESTAMPTZ | Not null, default `now()`, auto-updated |

## 4) `chat_messages`
Stores messages belonging to chat sessions.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `session_id` | UUID | Foreign key -> `chat_sessions.id` (`ON DELETE CASCADE`), not null |
| `role` | VARCHAR(50) | Not null |
| `content` | TEXT | Not null |
| `extra_data` | JSONB | Not null, default `{}` |
| `created_at` | TIMESTAMPTZ | Not null, default `now()` |

## Relationships
- `users` 1-to-many `chat_sessions`
- `chat_sessions` 1-to-many `chat_messages`
- `users` 1-to-many `password_reset_otps`
