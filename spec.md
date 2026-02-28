# VR1627 Portfolio

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack video editing portfolio website named "VR1627"
- Admin authentication (login/logout) to protect the control panel
- YouTube video management: add video by pasting URL, auto-extract thumbnail, set title, description, category (Shorts / Long Videos / Client Work), reorder, delete
- Photo gallery management: upload photos directly, delete photos
- About Me section: editable bio text, profile photo upload, hidden when empty
- Contact section: editable Instagram link, email, phone number; public contact form (Name, Email, Message) with submissions stored in backend
- Admin control panel: all content editable without coding
- Public portfolio site: Home, Work, About, Contact navigation
- Dark minimal premium design, Apple-inspired aesthetic, smooth animations, fully responsive

### Modify
N/A (new project)

### Remove
N/A (new project)

## Implementation Plan

### Backend (Motoko)
- Admin auth: single admin with password-protected login, session management
- Video store: CRUD for video entries (id, youtubeUrl, youtubeId, title, description, category, order, createdAt)
- Photo store: CRUD for photo blobs via blob-storage integration (id, blobId, title, createdAt)
- About store: single record (bio, profilePhotoBlobId, isVisible)
- Contact info store: single record (instagram, email, phone)
- Contact form submissions: store incoming messages (name, email, message, timestamp)
- All mutation endpoints require admin auth

### Frontend
- Public pages: Home (hero), Work (video grid + photo gallery), About, Contact
- Single-page app with smooth scroll sections and animated nav
- Video grid: YouTube thumbnails, category filter tabs, click to open fullscreen embed modal
- Photo gallery: masonry/grid layout, lightbox on click
- Admin panel (route /admin): login form → dashboard with tabs for Videos, Photos, About, Contact, Submissions
- Responsive: mobile-first, tablet, desktop breakpoints
- Favicon and footer "© VR1627"
