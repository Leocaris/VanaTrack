# VanaTrack — From Planting to Proof
### Environmental Impact Intelligence Platform

---

# 🌱 VanaTrack – From Planting to Proof

**Environmental Impact Intelligence Platform**

A full-stack platform for tracking tree-planting activities, monitoring survival rates, verifying environmental progress, and visualizing project impact.

### 🚀 Live Demo
[Visit VanaTrack](https://vanatrack.onrender.com)


## 1. Executive Summary

**VanaTrack** is an enterprise-grade Environmental Impact Intelligence Platform engineered to bring institutional rigor to reforestation and ecological restoration. It bridges the gap between field-level sapling planting and institutional carbon verification by providing:

1. **Rigorous Plantation Verification**: Only field-audited, photographically proven planting activities count toward confirmed project targets.
2. **Survival Rate Intelligence (Key Differentiating Feature)**: Tracks longitudinal post-planting survival audits (30-day, 90-day, 180-day) with a strict architectural guarantee: *repeat survival sampling never artificially inflates planted tree counts*.
3. **Database-Driven Dashboard Analytics**: All metrics, monthly trends, and biome distributions are dynamically computed via database aggregations—zero hardcoding.
4. **Smart Environmental Alerts**: Automated rule engine that detects low survival rates ($<70\%$), stalled activities, and approaching deadlines.
5. **Immutable Audit Trail**: Append-only log recording user email, role, action, and full previous-vs-new state diffs.
6. **Geospatial Mapping**: Interactive OpenStreetMap GIS visualization via Leaflet.

---

## 2. Technology Architecture

```
                       ┌────────────────────────────────────────┐
                       │          React 18 + Vite SPA           │
                       │   Tailwind CSS  •  Recharts  • Lucide  │
                       │           React Leaflet GIS            │
                       └───────────────────┬────────────────────┘
                                           │  JWT / Bearer
                                           ▼
                       ┌────────────────────────────────────────┐
                       │        Express.js REST Gateway         │
                       │   JWT Middleware • RBAC Authorization  │
                       │    Multer Evidence • Error Handling    │
                       └───────────────────┬────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
┌─────────────────┐ ┌─────────────────┐  ┌──────────────────┐ ┌────────────────┐
│  Auth & Users   │ │   Projects      │  │ PlantingActivities│ │ Survival Audits│
│  bcrypt hashing │ │ Target Tracking │  │ Evidence & Proof │ │ 30/90/180-Day  │
└─────────────────┘ └─────────────────┘  └──────────────────┘ └────────────────┘
         │                   │                     │                   │
         └───────────────────┼─────────────────────┴───────────────────┘
                             ▼
            ┌───────────────────────────────────┐
            │       MongoDB (Atlas / Memory)    │
            │  Mongoose Schemas & Aggregations  │
            └───────────────────────────────────┘
```

### Architectural Decisions
- **Unified Full-Stack Binary with Zero-Setup Mode**: The server connects to external **MongoDB Atlas** when `MONGODB_URI` is provided, but automatically falls back to an embedded in-memory MongoDB instance for immediate, zero-friction local testing or evaluator demonstrations without requiring pre-installed database engines.
- **Strict Separation of Quantity vs. Health**: Plantation activities track trees *added*; survival inspections track trees *sampled*. Mathematical segregation prevents double-counting.
- **Atomic Recalculation Engine**: Any change to an activity (Pending $\rightarrow$ Verified or Rejected) automatically triggers atomic recalculation across all dependent project metrics, progress bars, and alerts.

---

## 3. Pre-Seeded Test Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@vanatrack.org` | `Admin@123` | Full administrative control, project creation, user management, audit review, delete operations. |
| **Project Manager** | `manager@vanatrack.org` | `Manager@123` | Field management, project updates, activity submission, evidence verification & survival audits. |
| **Viewer / Auditor** | `viewer@vanatrack.org` | `Viewer@123` | Read-only access to intelligence dashboards, GIS maps, survival reports, and audit trails. |

> **Pro-Tip**: The login page and the sidebar include **One-Click Quick Persona Switchers** to test RBAC boundaries instantly without retyping passwords.

---

## 4. Verification of the Important Test Scenario

### Scenario Requirements:
- **Project Target**: 1,000 trees (`PRJ-2026-001: Wayanad Western Ghats Reforestation`).
- **Initial State**: 600 verified trees (Batch 1: 400 trees + Batch 2: 200 trees). Remaining: 400 trees (60% completion).
- **Test Event**: A pending batch of **250 trees** (`ACT-WYD-003`) is audited and verified.
- **Expected Outcome**:
  - **Verified Plantation Count**: $850$
  - **Remaining Target**: $150$
  - **Completion Rate**: $85\%$

### Automated Test Run
Execute the end-to-end scenario verification suite:
```bash
node server/test/scenarioTest.js
```

### Test Output:
```
▶ Test 2: Checking Baseline Scenario (Target 1000 trees, 600 verified)...
  Initial Target: 1000
  Initial Verified: 600
  Initial Pending: 250
  Initial Remaining: 400
  Initial Completion: 60%
  ✅ Baseline values match exactly: 600 verified / 1000 target (60%).

▶ Test 3: Verifying pending 250-tree batch (ACT-WYD-003)...
  Updated Target: 1000
  Updated Verified: 850
  Updated Pending: 0
  Updated Remaining: 150
  Updated Completion: 85%
  ✅ SCENARIO PASSED: Verified=850, Remaining=150, Completion=85%!
```

### Manual Verification in the UI:
1. Log in as **Administrator** (`admin@vanatrack.org`).
2. Navigate to **Planting Activities**.
3. Locate activity `ACT-WYD-003` (250 trees, Plot 9C Vythiri Watershed, status **Pending**).
4. Click **Review & Verify**, view the high-resolution evidence photo, add auditor notes, and click **Verify 250 Trees**.
5. Observe the instant toast and observe that the Wayanad project immediately updates to **850 verified / 150 remaining / 85% completion** on the Dashboard, Project Registry, and Project Dossier.

---

## 5. Tree Survival Monitoring (Key Differentiating Feature)

Survival audits protect carbon credit integrity by assessing sapling establishment over time.

### Mathematical Formula:
$$\text{Survival Rate} = \left(\frac{\text{Surviving Trees}}{\text{Inspected Trees}}\right) \times 100$$

### Key Guarantees:
- **Milestone Audits**: Standardized 30-day, 90-day, and 180-day milestone intervals.
- **Double-Count Guard**: Inspected sample trees (e.g. 200 saplings sampled) are never added to the project's cumulative planted total.
- **Dynamic Risk Alert**: If an audit records a survival rate $<70\%$, the Smart Alerts engine immediately escalates a `CRITICAL` alert for soil or irrigation intervention.

---

## 6. Smart Rule-Based Alerts Engine

The platform continuously evaluates project health against operational thresholds:

| Alert Category | Rule Condition | Severity | Action Triggered |
| :--- | :--- | :--- | :--- |
| **Low Survival Rate** | Inspected survival rate $< 70\%$ | `CRITICAL` (High) | Remedial planting & irrigation audit |
| **Pending Verification** | Planted activities awaiting evidence review $> 0$ | `WARNING` (Medium) | Auditor photo & ground truth sign-off |
| **Deadline Approaching** | End date $\le 60$ days away with completion $< 50\%$ | `WARNING` (Medium) | Schedule acceleration |
| **Stalled Activity** | Active project with no logs for $> 45$ days | `INFO` (Low) | Field check with Project Lead |
| **Target Exceeded** | Verified trees exceed project target baseline | `NOTICE` (Low) | Target revision or project closing |

---

## 7. Database Collections & Schema Design

- **`users`**: `name`, `email` (unique), `password` (bcrypt hash), `role` (`admin` \| `project_manager` \| `viewer`), `organization`.
- **`projects`**: `projectId` (unique), `name`, `category`, `location`, `latitude`, `longitude`, `startDate`, `endDate`, `targetTrees`, `projectManager` (FK $\rightarrow$ users), `status`.
- **`plantingactivities`**: `projectId` (FK), `activityCode`, `plantationDate`, `treesPlanted` (integer $>0$), `location`, `description`, `speciesList`, `evidencePhotoUrl`, `submittedBy` (FK), `verificationStatus` (`Pending` \| `Verified` \| `Rejected`), `verifiedBy` (FK), `verifiedAt`, `verificationNotes`.
- **`survivalinspections`**: `projectId` (FK), `activityId` (FK, optional), `inspectionType` (`30-Day` \| `90-Day` \| `180-Day` \| `Annual`), `inspectionDate`, `treesInspected`, `treesSurviving`, `treesDead`, `survivalRate`, `notes`, `healthCondition`, `recordedBy` (FK).
- **`auditlogs`**: `userId`, `userEmail`, `userRole`, `action`, `entityType`, `entityId`, `recordTitle`, `previousValue`, `newValue`, `reason`, `timestamp`.

---

## 8. Step-by-Step Running Guide

### Prerequisites
- Node.js v18+ (tested on Node v22.14 LTS)
- npm v9+

### 1. Installation
Clone the repository and install all root and workspace dependencies:
```bash
git clone <repo-url>
cd VanaTrack
npm install
```

### 2. Environment Configuration
Default environment files are pre-configured. If you wish to use **MongoDB Atlas**, update `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vanatrack?retryWrites=true&w=majority
JWT_SECRET=vanatrack_production_jwt_secret_key_2026_climate
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*(If `MONGODB_URI` is left blank, the backend automatically boots an in-memory MongoDB instance for zero-configuration local evaluation!)*

### 3. Build & Run Application

#### Option A: Unified Full-Stack Server (Recommended for Evaluation)
Builds the client and serves both API and UI from `http://localhost:5000`:
```bash
npm run build:client
npm start
```
Visit: **http://localhost:5000**

#### Option B: Concurrent Development Servers
Run the backend API and Vite hot-reloading dev server side by side:
```bash
# Terminal 1: Backend API
npm run dev:server

# Terminal 2: Vite React Frontend
npm run dev:client
```
Visit: **http://localhost:5173**

---


*VanaTrack is designed and engineered for high reliability, data transparency, and climate impact verification.*

