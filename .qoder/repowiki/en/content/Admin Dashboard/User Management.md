# User Management

<cite>
**Referenced Files in This Document**
- [schema.sql](file://supabase/schema.sql)
- [database.types.ts](file://src/types/database.types.ts)
- [AuthContext.tsx](file://src/context/AuthContext.tsx)
- [useUser.ts](file://src/hooks/useUser.ts)
- [supabase.ts](file://src/lib/supabase.ts)
- [storage.ts](file://src/lib/storage.ts)
- [supabaseService.ts](file://src/services/supabaseService.ts)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx)
- [AdminLayout.tsx](file://src/app/admin/layout.tsx)
- [users/page.tsx](file://src/app/admin/users/page.tsx)
- [messagingService.ts](file://src/services/messagingService.ts)
- [messaging.ts](file://src/types/messaging.ts)
- [LoginForm.tsx](file://src/components/auth/LoginForm.tsx)
- [SignUpForm.tsx](file://src/components/auth/SignUpForm.tsx)
- [profile/page.tsx](file://src/app/profile/page.tsx)
- [index.ts](file://src/types/index.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the user management system for the real estate platform. It covers user roles (tenant, landlord, admin), user verification, account status management, profile monitoring, activity tracking, behavioral analytics, suspension/deactivation procedures, account recovery, communication tools, demographics reporting, registration analytics, engagement metrics, support workflows, complaints, and community moderation.

## Project Structure
The user management system spans Supabase database definitions, TypeScript types, authentication contexts, service abstractions, admin UI, and messaging infrastructure.

```mermaid
graph TB
subgraph "Database"
Profiles["profiles table<br/>roles, verification, admin flags"]
Properties["properties table"]
Bookings["bookings table"]
Payments["payment_requests table"]
Reviews["reviews table"]
Notifications["notifications table"]
Favorites["favorites table"]
Unlocked["unlocked_properties table"]
Conversations["conversations table"]
Messages["messages table"]
end
subgraph "Types"
DBTypes["database.types.ts"]
AppTypes["types/index.ts"]
MsgTypes["types/messaging.ts"]
end
subgraph "Services"
SupabaseLib["lib/supabase.ts"]
StorageLib["lib/storage.ts"]
Svc["services/supabaseService.ts"]
MsgSvc["services/messagingService.ts"]
end
subgraph "Auth"
AuthCtx["context/AuthContext.tsx"]
UseUser["hooks/useUser.ts"]
LoginForm["components/auth/LoginForm.tsx"]
SignUpForm["components/auth/SignUpForm.tsx"]
end
subgraph "Admin"
AdminGuard["components/auth/AdminGuard.tsx"]
AdminLayout["app/admin/layout.tsx"]
UsersPage["app/admin/users/page.tsx"]
end
Profiles --> DBTypes
Properties --> DBTypes
Bookings --> DBTypes
Payments --> DBTypes
Reviews --> DBTypes
Notifications --> DBTypes
Favorites --> DBTypes
Unlocked --> DBTypes
Conversations --> DBTypes
Messages --> DBTypes
DBTypes --> Svc
AppTypes --> Svc
MsgTypes --> MsgSvc
SupabaseLib --> Svc
StorageLib --> Svc
AuthCtx --> UseUser
LoginForm --> AuthCtx
SignUpForm --> AuthCtx
AdminGuard --> AdminLayout
AdminLayout --> UsersPage
UsersPage --> Svc
```

**Diagram sources**
- [schema.sql](file://supabase/schema.sql#L8-L19)
- [database.types.ts](file://src/types/database.types.ts#L14-L52)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [storage.ts](file://src/lib/storage.ts#L1-L633)
- [supabaseService.ts](file://src/services/supabaseService.ts#L153-L737)
- [messagingService.ts](file://src/services/messagingService.ts#L1-L123)
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [LoginForm.tsx](file://src/components/auth/LoginForm.tsx#L1-L220)
- [SignUpForm.tsx](file://src/components/auth/SignUpForm.tsx#L1-L274)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)
- [AdminLayout.tsx](file://src/app/admin/layout.tsx#L1-L64)
- [users/page.tsx](file://src/app/admin/users/page.tsx#L1-L157)

**Section sources**
- [schema.sql](file://supabase/schema.sql#L1-L416)
- [database.types.ts](file://src/types/database.types.ts#L1-L310)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [storage.ts](file://src/lib/storage.ts#L1-L633)
- [supabaseService.ts](file://src/services/supabaseService.ts#L153-L737)
- [messagingService.ts](file://src/services/messagingService.ts#L1-L123)
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [LoginForm.tsx](file://src/components/auth/LoginForm.tsx#L1-L220)
- [SignUpForm.tsx](file://src/components/auth/SignUpForm.tsx#L1-L274)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)
- [AdminLayout.tsx](file://src/app/admin/layout.tsx#L1-L64)
- [users/page.tsx](file://src/app/admin/users/page.tsx#L1-L157)

## Core Components
- Database schema defines user profiles with role, verification, and admin flags, plus related entities for properties, bookings, payments, reviews, notifications, favorites, and unlocked properties.
- Supabase client and service layer abstract database operations and provide typed access to entities.
- Authentication contexts manage login, registration, and session state, mapping Supabase sessions to application user profiles.
- Admin guard enforces admin-only access to administrative areas.
- Messaging service supports media uploads, permission requests, typing indicators, and real-time channels.

**Section sources**
- [schema.sql](file://supabase/schema.sql#L8-L19)
- [database.types.ts](file://src/types/database.types.ts#L14-L52)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [supabaseService.ts](file://src/services/supabaseService.ts#L153-L737)
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)
- [messagingService.ts](file://src/services/messagingService.ts#L1-L123)

## Architecture Overview
The system integrates Supabase for authentication and relational data, with a service layer that exposes typed operations. Admin capabilities are gated via an admin guard. Messaging uses Supabase storage and channels.

```mermaid
sequenceDiagram
participant U as "User"
participant C as "AuthContext.tsx"
participant H as "useUser.ts"
participant S as "supabaseService.ts"
participant L as "lib/supabase.ts"
participant DB as "Supabase DB"
U->>C : "Login/Signup"
C->>L : "Auth call"
L-->>C : "Session"
C->>H : "Fetch profile"
H->>S : "Get profile by auth user id"
S->>DB : "Select from profiles"
DB-->>S : "Profile row"
S-->>H : "Mapped AppUser"
H-->>C : "Set user state"
C-->>U : "Authenticated UI"
```

**Diagram sources**
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L80-L161)
- [useUser.ts](file://src/hooks/useUser.ts#L57-L107)
- [supabaseService.ts](file://src/services/supabaseService.ts#L204-L228)
- [supabase.ts](file://src/lib/supabase.ts#L18-L28)
- [schema.sql](file://supabase/schema.sql#L8-L19)

**Section sources**
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [supabaseService.ts](file://src/services/supabaseService.ts#L153-L228)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [schema.sql](file://supabase/schema.sql#L8-L19)

## Detailed Component Analysis

### User Roles, Verification, and Admin Controls
- Roles: tenant, landlord, admin are stored in the profiles table with a constraint ensuring allowed values.
- Verification: profiles include is_verified and is_admin flags for identity verification and administrative privileges.
- Admin UI: admin users can toggle verification and admin status for other users.

```mermaid
flowchart TD
Start(["Admin action"]) --> CheckRole{"Is current user admin?"}
CheckRole --> |No| Deny["Redirect or deny access"]
CheckRole --> |Yes| Action{"Action type"}
Action --> ToggleVerify["Toggle is_verified"]
Action --> ToggleAdmin["Toggle is_admin"]
ToggleVerify --> Persist["Persist to profiles"]
ToggleAdmin --> Persist
Persist --> RefreshUI["Update local UI"]
RefreshUI --> End(["Done"])
Deny --> End
```

**Diagram sources**
- [users/page.tsx](file://src/app/admin/users/page.tsx#L26-L45)
- [schema.sql](file://supabase/schema.sql#L8-L19)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L11-L42)

**Section sources**
- [schema.sql](file://supabase/schema.sql#L8-L19)
- [users/page.tsx](file://src/app/admin/users/page.tsx#L1-L157)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)

### Authentication and Session Management
- AuthContext handles login and registration flows, with mock mode fallback and Supabase integration.
- useUser loads the current user profile from Supabase and subscribes to auth state changes.
- LoginForm and SignUpForm provide UI for login and registration, including social login options.

```mermaid
sequenceDiagram
participant UI as "LoginForm.tsx"
participant Ctx as "AuthContext.tsx"
participant Supabase as "lib/supabase.ts"
participant DB as "Supabase DB"
UI->>Ctx : "Submit login"
Ctx->>Supabase : "signInWithPassword"
Supabase-->>Ctx : "Session"
Ctx-->>UI : "Success/Failure"
Note over Ctx,DB : "useUser.ts listens to auth state and fetches profile"
```

**Diagram sources**
- [LoginForm.tsx](file://src/components/auth/LoginForm.tsx#L20-L46)
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L80-L115)
- [useUser.ts](file://src/hooks/useUser.ts#L110-L136)
- [supabase.ts](file://src/lib/supabase.ts#L18-L28)

**Section sources**
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [LoginForm.tsx](file://src/components/auth/LoginForm.tsx#L1-L220)
- [SignUpForm.tsx](file://src/components/auth/SignUpForm.tsx#L1-L274)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)

### Profile Monitoring and Activity Tracking
- Profile retrieval maps Supabase profile rows to application user types.
- Activity stats include owned properties, unlocked properties, and favorites.
- Notifications support read/unread tracking and bulk marking.

```mermaid
flowchart TD
FetchProfile["Fetch profile by auth id"] --> MapProfile["Map to AppUser"]
MapProfile --> Stats["Compute stats:<br/>Owned properties<br/>Unlocked properties<br/>Favorites"]
Stats --> Render["Render profile page"]
Notifications["Fetch notifications"] --> MarkRead["Mark as read"]
MarkRead --> Render
```

**Diagram sources**
- [useUser.ts](file://src/hooks/useUser.ts#L57-L107)
- [profile/page.tsx](file://src/app/profile/page.tsx#L27-L47)
- [storage.ts](file://src/lib/storage.ts#L434-L476)

**Section sources**
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [profile/page.tsx](file://src/app/profile/page.tsx#L1-L289)
- [storage.ts](file://src/lib/storage.ts#L434-L476)

### Behavioral Analytics and Engagement Metrics
- Property views are incremented via RPC or fallback update.
- Favorites and unlocked properties track engagement.
- Notifications provide engagement touchpoints.

```mermaid
flowchart TD
ViewProperty["User views property"] --> RPC["RPC increment_views"]
RPC --> Success{"RPC succeeded?"}
Success --> |Yes| Done["Views updated"]
Success --> |No| Fallback["Fallback update"]
Fallback --> Done
Favorites["Toggle favorite"] --> SaveFav["Save to favorites"]
Unlocked["Unlock property"] --> SaveUnlock["Save to unlocked"]
Done --> End(["Analytics updated"])
SaveFav --> End
SaveUnlock --> End
```

**Diagram sources**
- [schema.sql](file://supabase/schema.sql#L297-L304)
- [supabaseService.ts](file://src/services/supabaseService.ts#L378-L391)
- [storage.ts](file://src/lib/storage.ts#L330-L368)

**Section sources**
- [schema.sql](file://supabase/schema.sql#L297-L304)
- [supabaseService.ts](file://src/services/supabaseService.ts#L378-L391)
- [storage.ts](file://src/lib/storage.ts#L330-L368)

### Suspension and Deactivation Procedures
- Admins can toggle is_verified and is_admin flags to suspend or revoke privileges.
- Deactivation can be modeled by setting is_verified=false and removing admin privileges.

```mermaid
flowchart TD
Request["Admin requests action"] --> Verify{"Deactivate or suspend?"}
Verify --> ToggleVerify["Set is_verified=false"]
Verify --> ToggleAdmin["Set is_admin=false"]
ToggleVerify --> Persist["Persist to profiles"]
ToggleAdmin --> Persist
Persist --> Notify["Optional: notify user"]
Notify --> End(["Done"])
```

**Diagram sources**
- [users/page.tsx](file://src/app/admin/users/page.tsx#L26-L45)
- [schema.sql](file://supabase/schema.sql#L8-L19)

**Section sources**
- [users/page.tsx](file://src/app/admin/users/page.tsx#L1-L157)
- [schema.sql](file://supabase/schema.sql#L8-L19)

### Account Recovery Processes
- Password reset is supported via login form navigation to reset flow.
- Supabase authentication provides built-in mechanisms for password recovery.

**Section sources**
- [LoginForm.tsx](file://src/components/auth/LoginForm.tsx#L122-L130)
- [supabase.ts](file://src/lib/supabase.ts#L18-L28)

### User Communication Tools
- Messaging service supports image and voice note uploads, permission requests, and typing indicators.
- Real-time channels broadcast typing events.

```mermaid
sequenceDiagram
participant Buyer as "Buyer"
participant MsgSvc as "messagingService.ts"
participant Store as "Supabase Storage"
participant Owner as "Owner"
Buyer->>MsgSvc : "Upload media"
MsgSvc->>Store : "Upload image/voice"
Store-->>MsgSvc : "Public URL"
MsgSvc-->>Buyer : "URL"
Buyer->>MsgSvc : "Request media permission"
MsgSvc-->>Owner : "System message"
Owner->>MsgSvc : "Grant/Deny"
MsgSvc-->>Buyer : "Permission status"
Buyer->>MsgSvc : "Send typing indicator"
MsgSvc-->>Owner : "Broadcast typing"
```

**Diagram sources**
- [messagingService.ts](file://src/services/messagingService.ts#L6-L107)
- [messaging.ts](file://src/types/messaging.ts#L1-L37)

**Section sources**
- [messagingService.ts](file://src/services/messagingService.ts#L1-L123)
- [messaging.ts](file://src/types/messaging.ts#L1-L37)

### Demographics Reporting, Registration Analytics, and Engagement Metrics
- Demographics: national_id field exists in profiles for potential demographic tracking.
- Registration analytics: registration form captures role selection and metadata.
- Engagement: favorites, unlocked properties, notifications, and property views.

**Section sources**
- [schema.sql](file://supabase/schema.sql#L13-L14)
- [SignUpForm.tsx](file://src/components/auth/SignUpForm.tsx#L8-L104)
- [storage.ts](file://src/lib/storage.ts#L330-L368)
- [profile/page.tsx](file://src/app/profile/page.tsx#L21-L47)

### Support Workflows, Complaint Handling, and Community Moderation
- Support link is exposed in the profile menu.
- AdminGuard secures admin areas for moderation tasks.
- Notifications can be used for support communications.

**Section sources**
- [profile/page.tsx](file://src/app/profile/page.tsx#L210-L217)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)
- [AdminLayout.tsx](file://src/app/admin/layout.tsx#L1-L64)
- [storage.ts](file://src/lib/storage.ts#L434-L476)

## Dependency Analysis
The system exhibits clear separation of concerns:
- Types define domain entities and enums.
- Services encapsulate database operations and expose typed APIs.
- Auth contexts bridge Supabase and application state.
- Admin guard enforces authorization policies.

```mermaid
graph LR
Types["types/index.ts"] --> Svc["services/supabaseService.ts"]
DBTypes["types/database.types.ts"] --> Svc
Svc --> SupabaseLib["lib/supabase.ts"]
AuthCtx["context/AuthContext.tsx"] --> UseUser["hooks/useUser.ts"]
UseUser --> Svc
AdminGuard["components/auth/AdminGuard.tsx"] --> AdminLayout["app/admin/layout.tsx"]
AdminLayout --> UsersPage["app/admin/users/page.tsx"]
UsersPage --> Svc
MsgSvc["services/messagingService.ts"] --> SupabaseLib
```

**Diagram sources**
- [index.ts](file://src/types/index.ts#L56-L70)
- [database.types.ts](file://src/types/database.types.ts#L14-L52)
- [supabaseService.ts](file://src/services/supabaseService.ts#L153-L737)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)
- [AdminLayout.tsx](file://src/app/admin/layout.tsx#L1-L64)
- [users/page.tsx](file://src/app/admin/users/page.tsx#L1-L157)
- [messagingService.ts](file://src/services/messagingService.ts#L1-L123)

**Section sources**
- [index.ts](file://src/types/index.ts#L1-L237)
- [database.types.ts](file://src/types/database.types.ts#L1-L310)
- [supabaseService.ts](file://src/services/supabaseService.ts#L153-L737)
- [supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [AuthContext.tsx](file://src/context/AuthContext.tsx#L1-L195)
- [useUser.ts](file://src/hooks/useUser.ts#L1-L178)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L1-L44)
- [AdminLayout.tsx](file://src/app/admin/layout.tsx#L1-L64)
- [users/page.tsx](file://src/app/admin/users/page.tsx#L1-L157)
- [messagingService.ts](file://src/services/messagingService.ts#L1-L123)

## Performance Considerations
- Prefer batched reads/writes for stats computation (owned properties, favorites, unlocked).
- Use RPC for atomic increments (views) to avoid race conditions.
- Cache frequently accessed user data locally when appropriate.
- Optimize queries with indexes and filters in service methods.

## Troubleshooting Guide
- Authentication failures: verify environment variables for Supabase client initialization and network connectivity.
- Profile fetch errors: ensure auth session exists and profile record is present.
- Admin access denied: confirm is_admin flag and AdminGuard route protection.
- Messaging upload errors: check storage bucket permissions and file size/type constraints.

**Section sources**
- [supabase.ts](file://src/lib/supabase.ts#L7-L15)
- [useUser.ts](file://src/hooks/useUser.ts#L67-L83)
- [AdminGuard.tsx](file://src/components/auth/AdminGuard.tsx#L15-L23)
- [messagingService.ts](file://src/services/messagingService.ts#L17-L26)

## Conclusion
The user management system integrates Supabase authentication and relational data with a typed service layer and admin controls. It supports role-based access, verification, engagement tracking, and communication tools, while providing a foundation for analytics and moderation.

## Appendices
- Data model overview for profiles and related entities.

```mermaid
erDiagram
PROFILES {
uuid id PK
text full_name
text avatar_url
text phone
text national_id
text role
boolean is_verified
boolean is_admin
timestamptz updated_at
timestamptz created_at
}
PROPERTIES {
uuid id PK
uuid owner_id FK
text title
text description
numeric price
text price_unit
text category
text status
numeric location_lat
numeric location_lng
text address
text area
int bedrooms
int bathrooms
int floor_area
int floor_number
text[] features
text[] images
text owner_phone
text owner_name
boolean is_verified
int views_count
timestamptz created_at
timestamptz updated_at
}
BOOKINGS {
uuid id PK
uuid property_id FK
uuid guest_id FK
date check_in
date check_out
numeric total_price
text status
timestamptz created_at
}
PAYMENT_REQUESTS {
uuid id PK
uuid user_id FK
uuid property_id FK
numeric amount
text payment_method
text receipt_image
text status
text admin_note
timestamptz processed_at
timestamptz created_at
}
REVIEWS {
uuid id PK
uuid property_id FK
uuid user_id FK
int rating
text comment
timestamptz created_at
}
NOTIFICATIONS {
uuid id PK
uuid user_id FK
text title
text message
text type
boolean is_read
text link
timestamptz created_at
}
FAVORITES {
uuid user_id FK
uuid property_id FK
timestamptz created_at
}
UNLOCKED_PROPERTIES {
uuid user_id FK
uuid property_id FK
timestamptz unlocked_at
}
CONVERSATIONS {
uuid id PK
uuid property_id FK
uuid buyer_id FK
uuid owner_id FK
timestamptz created_at
timestamptz updated_at
}
MESSAGES {
uuid id PK
uuid conversation_id FK
uuid sender_id FK
text text
boolean is_read
timestamptz created_at
}
PROFILES ||--o{ PROPERTIES : "owns"
PROFILES ||--o{ BOOKINGS : "books"
PROFILES ||--o{ PAYMENT_REQUESTS : "requests"
PROFILES ||--o{ REVIEWS : "writes"
PROFILES ||--o{ NOTIFICATIONS : "receives"
PROFILES ||--o{ FAVORITES : "favorites"
PROFILES ||--o{ UNLOCKED_PROPERTIES : "unlocks"
PROFILES ||--o{ CONVERSATIONS : "participates"
PROPERTIES ||--o{ BOOKINGS : "has"
PROPERTIES ||--o{ REVIEWS : "rated"
PROPERTIES ||--o{ FAVORITES : "favorited_by"
PROPERTIES ||--o{ UNLOCKED_PROPERTIES : "unlocked_by"
PROPERTIES ||--o{ CONVERSATIONS : "has"
CONVERSATIONS ||--o{ MESSAGES : "contains"
```

**Diagram sources**
- [schema.sql](file://supabase/schema.sql#L8-L19)
- [schema.sql](file://supabase/schema.sql#L42-L67)
- [schema.sql](file://supabase/schema.sql#L95-L104)
- [schema.sql](file://supabase/schema.sql#L117-L128)
- [schema.sql](file://supabase/schema.sql#L131-L139)
- [schema.sql](file://supabase/schema.sql#L142-L151)
- [schema.sql](file://supabase/schema.sql#L154-L167)
- [schema.sql](file://supabase/schema.sql#L162-L167)
- [schema.sql](file://supabase/schema.sql#L340-L360)
- [schema.sql](file://supabase/schema.sql#L353-L360)