# GeoQuest

A location-based treasure-hunt mobile application built for a Kingston
University summative assessment. Users discover virtual "caches" placed at
real-world GPS coordinates by physically travelling within an unlock radius,
reading a clue, optionally capturing photo evidence, and earning points -
individually (Global Mode) and within private, invite-only events (Private
Event Mode).

## Overview

GeoQuest is a React Native (Expo) mobile app, written entirely in JavaScript
(no TypeScript). It uses real device GPS to gate cache discovery - a cache
can only be unlocked by actually being within its configured radius - and the
device camera to capture photo evidence, satisfying the assignment's "at
least two meaningful sensors" requirement. Data (users, caches, discoveries,
events, participants) persists locally via `AsyncStorage`, structured so it
can be swapped for Firebase/Firestore without changing any screen code.

## Features

- **Authentication** - register/login/logout with validation, password
  visibility toggle, loading and error states (local/mock backend by
  default; see [Firebase Configuration](#firebase-configuration)).
- **Home dashboard** - welcome message, avatar, total points, caches
  discovered, current rank, nearby caches, active events, recent discoveries,
  quick actions.
- **Map** - live map with the user's GPS position, public + event cache
  markers, distinct locked/unlocked/discovered marker states, a bottom-sheet
  cache card, and a "my location" recenter button.
- **Cache details & navigation** - full cache info, live distance, and a
  "Treasure Compass" screen with live compass heading + distance (device
  magnetometer, with graceful fallback if unavailable).
- **Cache discovery workflow** - GPS proximity re-validated at the point of
  discovery (no "unlock from anywhere" shortcut) → clue reveal → optional/
  required camera photo evidence → points awarded → success screen with a
  full points breakdown (base + photo bonus + first-discoverer bonus).
- **Discovery history** - chronological log of everything a user has found.
- **Global leaderboard** - ranked by total points, with medals for the top 3.
- **Private events** - create an event (name/description/start+end dates),
  get a unique invite code, join other events by code, event-scoped cache
  list, event-scoped leaderboard, and an owner-only participant progress view
  (caches discovered per participant).
- **Create Cache** - form for title, description, clue, difficulty, points,
  unlock radius, photo-required toggle, and GPS coordinates (via "use my
  current location").
- **Settings** - metric/imperial unit toggle (applied to every distance
  badge app-wide) and a notifications preference.
- **Scoring** - difficulty-based base points (Easy/Medium/Hard/Expert) plus
  photo-evidence and first-discoverer bonuses; duplicate discoveries of the
  same cache are blocked so points can't be farmed repeatedly.

## Technology Stack

- React Native + Expo (SDK 54), JavaScript only, functional components + Hooks
- React Navigation (native-stack + bottom-tabs)
- `react-native-maps` for the map
- `expo-location` for GPS
- `expo-camera` for photo evidence
- `expo-sensors` (`Magnetometer`) for the optional compass feature
- `@react-native-async-storage/async-storage` for local persistence
- React Context (`AuthContext`, `SettingsContext`) for app-wide state
- Jest (`jest-expo`/`babel-jest`) for unit tests

## Application Architecture

```
GeoQuest/
├── App.js                # Root component: providers + navigation
├── app.config.js         # Expo config (reads .env for keys/dev-mode flag)
├── index.js               # Expo entry point
├── assets/                 # Icons, splash images
├── components/             # Reusable UI (CacheCard, CacheMarker,
│                            #   PrimaryButton/SecondaryButton, PointsBadge,
│                            #   DistanceBadge, CacheStatusBadge, LoadingScreen,
│                            #   EmptyState, ErrorMessage)
├── config/                 # Constants (storage keys, units, etc.)
├── context/                 # React Context providers
│   ├── AuthContext.js       #   current user/session
│   └── SettingsContext.js   #   units/notifications
├── hooks/                   # useAuth, useSettings, etc.
├── navigation/               # React Navigation stacks/tabs
├── screens/                  # One file per screen (see Features above)
├── services/                  # AsyncStorage-backed data layer
│   ├── authService.js          #   users, auth, points
│   ├── cacheService.js         #   cache CRUD/queries
│   ├── discoveryService.js     #   recorded discoveries
│   ├── eventService.js         #   events, participants, invite codes
│   ├── leaderboardService.js   #   global/event leaderboard aggregation
│   └── settingsService.js      #   user preferences
├── utils/                      # Pure helper functions + their Jest tests
│                                #   (distanceCalculator, validation,
│                                #   formatDistance, formatDate, cacheStatus)
└── data/                        # Seed/mock cache data
```

This layered structure means the storage backend (currently `AsyncStorage`)
can be replaced with Firebase/Firestore later by only editing the `services/`
files - no screen or component needs to change.

## Sensors

The app uses two meaningful sensors, as required:

1. **GPS / Location** (`expo-location`, wrapped by `hooks/useLocation.js`) -
   shows the user's live position on the map, calculates real-time distance
   to every cache, and is the actual gate for cache unlocking (a cache only
   unlocks when the live distance is within its `unlockRadius`). Handles
   permission denied, permanently denied, GPS disabled, and location
   unavailable, each with a friendly message and retry action.
2. **Camera** (`expo-camera`, `CameraView`/`useCameraPermissions`) - used to
   capture required photo evidence during discovery, with preview/retake/
   confirm before the photo is attached to the discovery record.

**Optional sensor - Compass**: `expo-sensors` `Magnetometer` powers a
"Treasure Compass" on `NavigationScreen` showing an arrow rotated toward the
selected cache plus live distance, with a static fallback if no magnetometer
is available on the device.

## Installation

Prerequisites: Node.js LTS, the [Expo Go](https://expo.dev/go) app (or an
Android/iOS emulator/simulator).

```powershell
npm install
copy .env.example .env
```

## Running the Application

```powershell
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a`
/ `i` in the terminal to launch an emulator/simulator.

## Environment Variables

See [.env.example](.env.example) for the full list with comments. Summary:

| Variable | Purpose | Required? |
|---|---|---|
| `GOOGLE_MAPS_API_KEY_ANDROID` / `_IOS` | Removes the "for development purposes only" map watermark on Android | No - app works without it |
| `EXPO_PUBLIC_FIREBASE_*` | Firebase project config | No - falls back to a local mock auth/storage layer when blank |
| `EXPO_PUBLIC_DEV_MODE` | When `true`, exposes a developer-only "teleport" control to simulate being near a cache, so the discovery workflow can be tested without physically travelling to every location. Does **not** fake GPS proximity in production logic - it only overrides the location value fed into the same real distance check | No - defaults are set for convenient local testing |

`.env` is git-ignored; never commit real secrets. No credentials are
hardcoded anywhere in the source.

## Firebase Configuration

Firebase is supported as an optional, drop-in persistence layer (Auth +
Firestore), but is **not required** to run or demo the app: when the
`EXPO_PUBLIC_FIREBASE_*` variables in `.env` are left blank, `authService.js`
and the other `services/*.js` files automatically fall back to a local,
fully-functional mock backend built on `AsyncStorage`. This keeps the app
demoable offline and without any cloud setup, while the service-layer
architecture (see [Application Architecture](#application-architecture))
means real Firebase Authentication/Firestore could be wired in later by
editing only the files under `services/`, not the UI.

## Testing

```powershell
npm test
```

Runs the Jest suite (36 tests) covering the pure utility functions in
`utils/` (validation, distance calculation, distance formatting, date
formatting). Jest is configured with an inline Babel transform in
`package.json`'s `jest` block rather than a project-root `babel.config.js`,
so it doesn't interfere with Metro's own bundling/Hermes compilation step
(see note below if you ever add one).

> **Note:** Do not add a root `babel.config.js` to this project. Metro (the
> Expo bundler) has a working internal default Babel transform; a manually
> authored `babel.config.js` can silently break Hermes bytecode compilation
> (e.g. "async functions are unsupported" / "invalid statement encountered"
> for class syntax), even with a version-matched `babel-preset-expo`. If you
> need Jest to understand JSX/ESM, configure it via the inline `transform`
> option in `package.json`'s `jest` block instead.

## Project Structure

See [Application Architecture](#application-architecture) above for the full
folder-by-folder breakdown.

## Known Limitations

- `CreateCacheScreen` sets coordinates via "use my current location" only -
  there's no interactive map-tap picker for choosing an arbitrary point.
- Auth/data persistence is local (`AsyncStorage`) by default; Firebase wiring
  is optional and not implemented beyond reading the env vars.
- No push notifications are actually sent - the "notifications enabled"
  setting is stored but not yet connected to a notification service.
- Compass heading (`expo-sensors` `Magnetometer`) accuracy varies by device
  and requires calibration on some hardware; the app falls back to a static
  arrow if the sensor is unavailable.
- The map does not currently expose a difficulty filter or a "sort by
  nearest" toggle in the UI (both are optional per the assignment brief);
  the underlying distance-sorted data is already computed in `useCaches.js`.
- Mock/seed data (`data/caches.js`) contains 10 public caches; event caches
  are created live through `CreateCacheScreen` rather than being pre-seeded.
- There is no clue "answer" input (the brief marks this optional) - a cache
  is completed once GPS proximity is valid and any required photo is taken.

## Future Improvements

- Wire up real Firebase Authentication + Firestore/Storage for true
  multi-device cloud persistence.
- Add a map-tap coordinate picker for `CreateCacheScreen`.
- Add push notifications (e.g. "a cache near you was just discovered").
- Add a difficulty filter and nearest-first sort control to the map/list UI.
- Add an optional clue-answer input with attempt limiting.

## Academic Project Note

This project was built as a summative assessment for Kingston University. It
is intended to demonstrate: map functionality, live GPS location, cache
markers, real distance calculation, real proximity-based unlocking, the
camera sensor, photo evidence capture, the discovery workflow, scoring,
leaderboards, Global Mode, Private Event Mode, persistent data, error
handling, and permission handling - all implemented with real device APIs
(no faked sensor logic).
