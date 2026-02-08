# Architecture Overview

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [next.config.ts](file://next.config.ts)
- [src/app/layout.tsx](file://src/app/layout.tsx)
- [src/app/providers.tsx](file://src/app/providers.tsx)
- [src/lib/supabase.ts](file://src/lib/supabase.ts)
- [src/context/AuthContext.tsx](file://src/context/AuthContext.tsx)
- [src/hooks/useUser.ts](file://src/hooks/useUser.ts)
- [src/services/supabaseService.ts](file://src/services/supabaseService.ts)
- [src/services/messagingService.ts](file://src/services/messagingService.ts)
- [src/lib/storage.ts](file://src/lib/storage.ts)
- [src/types/database.types.ts](file://src/types/database.types.ts)
- [src/types/messaging.ts](file://src/types/messaging.ts)
- [supabase/schema.sql](file://supabase/schema.sql)
- [src/app/page.tsx](file://src/app/page.tsx)
- [src/components/PropertyCard.tsx](file://src/components/PropertyCard.tsx)
- [src/app/search/page.tsx](file://src/app/search/page.tsx)
- [src/app/admin/layout.tsx](file://src/app/admin/layout.tsx)
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

## Introduction
This document presents the architectural design of the Gamasa Properties platform. It describes the high-level system built with Next.js App Router, React components, Supabase backend services, and a PostgreSQL-backed schema with Row Level Security (RLS). The document covers layered architecture, component hierarchy, data flow, provider pattern implementation, state management, real-time communication, system boundaries, integration points, deployment topology, scalability, security, and performance optimization strategies.

## Project Structure
Gamasa Properties follows a modern Next.js 16 App Router structure with a clear separation of concerns:
- Application shell and providers in the root layout
- Feature pages under src/app (e.g., homepage, search, admin)
- Shared UI components under src/components
- Context and hooks for state and auth
- Services for backend interactions
- Supabase client and typed database types
- Supabase schema and policies

```mermaid
graph TB
subgraph "Next.js App Router"
L["Root Layout<br/>Providers"]
P["Pages<br/>Home, Search, Admin"]
end
subgraph "React Layer"
C1["Components<br/>PropertyCard, Header, etc."]
CTX["Context<br/>AuthContext"]
HK["Hooks<br/>useUser"]
end
subgraph "Services Layer"
S1["supabaseService"]
S2["messagingService"]
LS["Local Storage Abstraction<br/>storage.ts"]
end
subgraph "Supabase Backend"
SB["Supabase Client<br/>auth, realtime, storage"]
DB["PostgreSQL Schema<br/>RLS Policies"]
end
L --> P
P --> C1
P --> CTX
P --> HK
P --> S1
P --> S2
S1 --> SB
S2 --> SB
SB --> DB
C1 --> S1
CTX --> SB
HK --> SB
S1 --> LS
```

**Diagram sources**
- [src/app/layout.tsx](file://src/app/layout.tsx#L64-L89)
- [src/app/providers.tsx](file://src/app/providers.tsx#L7-L17)
- [src/services/supabaseService.ts](file://src/services/supabaseService.ts#L153-L800)
- [src/services/messagingService.ts](file://src/services/messagingService.ts#L4-L123)
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [supabase/schema.sql](file://supabase/schema.sql#L1-L416)

**Section sources**
- [src/app/layout.tsx](file://src/app/layout.tsx#L64-L89)
- [src/app/providers.tsx](file://src/app/providers.tsx#L7-L17)
- [package.json](file://package.json#L1-L42)
- [next.config.ts](file://next.config.ts#L12-L31)

## Core Components
- Provider stack: ThemeProvider, AuthProvider, ToastProvider encapsulated via Providers wrapper
- Supabase client configured with auto-refresh and persisted sessions
- AuthContext managing user state, login/register/logout, and mock/SaaS mode switching
- Local storage abstraction for offline-first UX and cross-tab synchronization
- Supabase service facade for properties, favorites, unlocks, notifications, reviews, and messaging
- Messaging service for media uploads, permissions, and typing indicators via Supabase channels
- Typed database interfaces generated from Supabase schema

**Section sources**
- [src/app/providers.tsx](file://src/app/providers.tsx#L7-L17)
- [src/context/AuthContext.tsx](file://src/context/AuthContext.tsx#L22-L186)
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [src/lib/storage.ts](file://src/lib/storage.ts#L1-L633)
- [src/services/supabaseService.ts](file://src/services/supabaseService.ts#L153-L800)
- [src/services/messagingService.ts](file://src/services/messagingService.ts#L4-L123)
- [src/types/database.types.ts](file://src/types/database.types.ts#L12-L310)
- [src/types/messaging.ts](file://src/types/messaging.ts#L1-L37)

## Architecture Overview
The system follows a layered architecture:
- Presentation Layer: Next.js App Router pages and React components
- Domain Layer: Services orchestrating business logic and data transformations
- Persistence Layer: Supabase client interacting with PostgreSQL and Storage
- Security Layer: Supabase RLS policies and auth guards

```mermaid
graph TB
UI["UI Pages<br/>src/app/*"] --> CMP["Components<br/>src/components/*"]
UI --> SRV["Services<br/>supabaseService.ts, messagingService.ts"]
SRV --> SUP["Supabase Client<br/>auth, realtime, storage"]
SUP --> DB["PostgreSQL<br/>RLS-enabled tables"]
SRV --> LS["Local Storage Abstraction<br/>storage.ts"]
AUTH["AuthContext<br/>AuthProvider"] --> SUP
AUTH --> LS
```

**Diagram sources**
- [src/app/page.tsx](file://src/app/page.tsx#L88-L194)
- [src/components/PropertyCard.tsx](file://src/components/PropertyCard.tsx#L26-L199)
- [src/services/supabaseService.ts](file://src/services/supabaseService.ts#L153-L800)
- [src/services/messagingService.ts](file://src/services/messagingService.ts#L4-L123)
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L1-L68)
- [supabase/schema.sql](file://supabase/schema.sql#L170-L416)

## Detailed Component Analysis

### Authentication and State Management
The provider pattern centralizes global state:
- Providers composes ThemeProvider, AuthProvider, and ToastProvider
- AuthProvider manages user session, loading state, and login/register/logout
- useUser hook integrates with Supabase auth state changes and profile retrieval
- Local storage utilities coordinate cross-tab updates and mock mode

```mermaid
sequenceDiagram
participant U as "User"
participant C as "LoginForm"
participant A as "AuthContext"
participant S as "Supabase Client"
participant P as "Providers"
U->>C : Submit credentials
C->>A : login(email, password)
A->>S : auth.signInWithPassword()
S-->>A : { user, session } or error
A->>A : Persist current user
A-->>C : { success }
C-->>U : Redirect to home
Note over P,S : Session auto-refresh enabled
```

**Diagram sources**
- [src/app/providers.tsx](file://src/app/providers.tsx#L7-L17)
- [src/context/AuthContext.tsx](file://src/context/AuthContext.tsx#L80-L115)
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L18-L28)
- [src/components/auth/LoginForm.tsx](file://src/components/auth/LoginForm.tsx#L20-L46)

**Section sources**
- [src/app/providers.tsx](file://src/app/providers.tsx#L7-L17)
- [src/context/AuthContext.tsx](file://src/context/AuthContext.tsx#L22-L186)
- [src/hooks/useUser.ts](file://src/hooks/useUser.ts#L37-L178)
- [src/lib/storage.ts](file://src/lib/storage.ts#L18-L40)

### Data Flow: Property Discovery and Interaction
Property discovery involves hybrid logic:
- Supabase service fetches properties with optional filters
- Client-side mapping to normalized Property type
- Optional client-side text search
- PropertyCard handles favorites toggle with optimistic UI and error rollback

```mermaid
sequenceDiagram
participant U as "User"
participant SP as "Search Page"
participant SS as "supabaseService"
participant SB as "Supabase Client"
participant DB as "PostgreSQL"
participant PC as "PropertyCard"
U->>SP : Enter filters/query
SP->>SS : getProperties(filters)
SS->>SB : from(properties).select(...).order(...)
SB->>DB : Query properties
DB-->>SB : Rows
SB-->>SS : Rows
SS-->>SP : Property[]
SP->>PC : Render cards
U->>PC : Toggle favorite
PC->>SS : toggleFavorite(userId, propertyId)
SS->>SB : Upsert favorites
SB->>DB : Insert/Delete
DB-->>SB : OK
SB-->>SS : OK
SS-->>PC : Status
PC-->>U : Update UI
```

**Diagram sources**
- [src/app/search/page.tsx](file://src/app/search/page.tsx#L24-L82)
- [src/services/supabaseService.ts](file://src/services/supabaseService.ts#L313-L358)
- [src/components/PropertyCard.tsx](file://src/components/PropertyCard.tsx#L57-L79)
- [supabase/schema.sql](file://supabase/schema.sql#L41-L160)

**Section sources**
- [src/app/search/page.tsx](file://src/app/search/page.tsx#L12-L82)
- [src/services/supabaseService.ts](file://src/services/supabaseService.ts#L313-L358)
- [src/components/PropertyCard.tsx](file://src/components/PropertyCard.tsx#L26-L199)

### Real-Time Communication and Messaging
Real-time features leverage Supabase channels and publication:
- Typing indicators broadcast via channels per conversation
- Media permission requests stored as system messages
- Public image/voice buckets for chat media

```mermaid
sequenceDiagram
participant U1 as "User A"
participant MS as "messagingService"
participant SB as "Supabase Client"
participant CH as "Channel typing-<cid>"
participant U2 as "User B"
U1->>MS : sendTypingIndicator(isTyping=true)
MS->>CH : subscribe() + send({type : 'broadcast', event : 'typing'})
CH-->>U2 : on('broadcast', 'typing')
U2-->>U1 : See typing indicator
MS-->>U1 : Done
```

**Diagram sources**
- [src/services/messagingService.ts](file://src/services/messagingService.ts#L89-L117)
- [supabase/schema.sql](file://supabase/schema.sql#L406-L416)

**Section sources**
- [src/services/messagingService.ts](file://src/services/messagingService.ts#L4-L123)
- [supabase/schema.sql](file://supabase/schema.sql#L338-L416)

### Database Design and Security
The schema defines core entities with RLS policies:
- Profiles, Properties, Bookings, Payment Requests, Reviews, Notifications, Favorites, Unlocked Properties
- Conversations and Messages for real-time chat
- RLS policies restrict access by user identity and roles
- Realtime publication enabled for messages

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
float8 location_lat
float8 location_lng
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
text media_permission_status
timestamptz created_at
timestamptz updated_at
}
MESSAGES {
uuid id PK
uuid conversation_id FK
uuid sender_id FK
text text
text message_type
text media_url
int duration
boolean is_read
jsonb metadata
timestamptz created_at
}
PROFILES ||--o{ PROPERTIES : "owns"
PROFILES ||--o{ BOOKINGS : "books"
PROFILES ||--o{ PAYMENT_REQUESTS : "requests"
PROFILES ||--o{ REVIEWS : "writes"
PROFILES ||--o{ NOTIFICATIONS : "receives"
PROFILES ||--o{ FAVORITES : "has"
PROFILES ||--o{ UNLOCKED_PROPERTIES : "unlocks"
PROPERTIES ||--o{ BOOKINGS : "has"
PROPERTIES ||--o{ REVIEWS : "rated"
PROPERTIES ||--o{ FAVORITES : "favorited_by"
PROPERTIES ||--o{ UNLOCKED_PROPERTIES : "unlocked_by"
PROPERTIES ||--o{ CONVERSATIONS : "has"
CONVERSATIONS ||--o{ MESSAGES : "contains"
```

**Diagram sources**
- [supabase/schema.sql](file://supabase/schema.sql#L7-L416)
- [src/types/database.types.ts](file://src/types/database.types.ts#L12-L310)

**Section sources**
- [supabase/schema.sql](file://supabase/schema.sql#L1-L416)
- [src/types/database.types.ts](file://src/types/database.types.ts#L12-L310)

### Admin Guard and Access Control
Admin-only areas are protected by an admin guard that enforces role checks and redirects unauthorized users.

```mermaid
flowchart TD
Start(["Admin Route"]) --> Check["AdminGuard"]
Check --> IsAdmin{"Is user admin?"}
IsAdmin --> |Yes| Render["Render Admin Layout"]
IsAdmin --> |No| Redirect["Redirect to home"]
Render --> Nav["Admin Navigation"]
Nav --> Content["Admin Content"]
```

**Diagram sources**
- [src/app/admin/layout.tsx](file://src/app/admin/layout.tsx#L9-L63)

**Section sources**
- [src/app/admin/layout.tsx](file://src/app/admin/layout.tsx#L9-L63)

## Dependency Analysis
External dependencies and integrations:
- Next.js 16 with App Router, PWA plugin
- Supabase JS SDK for auth, realtime, storage
- Tailwind CSS ecosystem
- Leaflet for maps (UI component usage)

```mermaid
graph LR
APP["Next.js App"] --> SUP["Supabase JS SDK"]
APP --> TWT["Tailwind CSS"]
APP --> LFT["Leaflet"]
APP --> PWA["next-pwa"]
SUP --> RT["Realtime Channels"]
SUP --> ST["Storage Buckets"]
SUP --> PG["PostgreSQL"]
```

**Diagram sources**
- [package.json](file://package.json#L11-L27)
- [next.config.ts](file://next.config.ts#L5-L10)
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L1-L68)

**Section sources**
- [package.json](file://package.json#L11-L27)
- [next.config.ts](file://next.config.ts#L5-L10)

## Performance Considerations
- Client-side caching and optimistic UI for favorites and toggles
- Local storage abstraction reduces backend calls during development and supports offline UX
- Supabase auto-refresh and persisted sessions minimize re-auth overhead
- PWA configuration improves caching and offline availability
- Consider adding server-side search and indexing for production-scale queries
- Optimize image delivery via Supabase Storage and CDN

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and remedies:
- Missing Supabase environment variables cause warnings; ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- Auth state changes require proper subscription cleanup; use the provided hooks and guards
- Realtime channels must be subscribed before broadcasting; ensure channel.subscribe() is called
- Storage uploads enforce size/type constraints; handle errors gracefully in messagingService

**Section sources**
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L7-L15)
- [src/hooks/useUser.ts](file://src/hooks/useUser.ts#L144-L168)
- [src/services/messagingService.ts](file://src/services/messagingService.ts#L6-L33)

## Conclusion
Gamasa Properties employs a clean layered architecture with Next.js App Router and React components, backed by Supabase for authentication, real-time communication, storage, and database operations. The provider pattern centralizes state, while local storage enables an offline-first experience. Supabase’s RLS and policies secure data access, and the admin guard enforces role-based access. The system is designed for scalability, maintainability, and performance, with room for enhancements such as server-side search and advanced indexing.