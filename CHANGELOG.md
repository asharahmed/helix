# Changelog

## v1.2.0

- Added Vitest-based test coverage for cache, exports, event persistence, health aggregation, alert normalisation, and webhook auth
- Added client-side CSV and JSON export actions for alerts, logs, and metric charts
- Added persistent event history with `/api/events` and command-centre timeline seeding from stored webhook events
- Added dynamic topology discovery from Prometheus targets with cached `/api/topology` responses
- Added grouped alert view with local preference persistence and keyboard-accessible alert rows
- Added Wazuh vulnerability inventory with API, hook, and security dashboard panel
- Added Grafana quick links for metric charts and Prometheus alert details when `GRAFANA_URL` is configured
- Added accessibility improvements including skip-to-content navigation, status live regions, clearer button labelling, and topology labelling

## v1.1.0

- Fixed Wazuh API integration for current endpoint format
- Added input validation on all API routes
- Switched webhook authentication to timing-safe comparison
- Added toast notification system for user feedback
- Added confirmation dialogs for destructive actions (silence creation, CrowdSec unbanning)
- Added error boundaries with graceful fallback UI
- Unified Prometheus and Wazuh alerts into a single filterable table
- Applied Canadian English spelling throughout the interface
- Added topology detail panel with per-node metadata
- Improved SSE connection status accuracy and reconnection logic

## v1.0.0

- Command Centre with D3 force-directed topology graph, alert summary, metric sparklines, and event timeline
- Alerts page with search, source/severity filtering, and Alertmanager silence creation
- Security page with Wazuh agent inventory, HIDS alerts, FIM events, and CrowdSec ban management
- Metrics page with CPU, memory, disk, network charts and per-container resource usage
- Logs page with Loki log viewer, container filtering, text search, and virtualised scrolling
- Server-Sent Events for real-time alert and webhook delivery
- LRU cache layer with 50 entries, 5-second TTL, and 50MB cap
- D3 force-directed topology graph with drag, zoom, and collision detection
