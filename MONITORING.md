# Monitoring Runbook

## Project Type

This project is a Vercel-only Astro static site. It has no separate backend host, database, worker, queue, or persistent app state in this repository.

## App-Side Monitoring Added

- Public health endpoint at `/health`
  - Returns `200` when the generated site can serve the endpoint.
  - Includes only safe metadata: service name, environment, version, commit, and timestamp.
  - Does not expose secrets, internal dependency details, customer data, or host information.
- Optional PostHog browser telemetry
  - Enabled only when `PUBLIC_POSTHOG_KEY` is present at build/runtime.
  - Uses `PUBLIC_POSTHOG_HOST` when provided, otherwise defaults to the PostHog US ingest host.
  - Captures page views, frontend errors, and unhandled promise rejections.
  - Registers privacy-safe release metadata: service, app version, commit, and environment.
  - Disables autocapture and session recording by default.

## Environment Variables

Store real values in the deployment platform or Anchor-managed secret storage. Do not commit real secrets or project keys.

| Variable | Required | Purpose |
|---|---:|---|
| `PUBLIC_POSTHOG_KEY` | No | Public PostHog project key used to enable browser analytics. |
| `PUBLIC_POSTHOG_HOST` | No | PostHog ingest host. Defaults to `https://us.i.posthog.com`. |
| `PUBLIC_APP_ENV` | No | Public deployment environment label, such as `production` or `preview`. |
| `PUBLIC_APP_COMMIT` | No | Public commit SHA fallback when the platform does not provide one. |

## Logs

This is a static frontend, so there is no application server log stream in the repo. Use Vercel request, deployment, and build logs for platform-side troubleshooting.

Suggested Loki labels if Anchor forwards Vercel logs:

- `service=branded-bikers-site`
- `component=frontend`
- `environment=<deployment environment>`
- `platform=vercel`

## Metrics

Prometheus `/metrics` is not exposed because this project is a static Vercel site with no long-running server process. Use external uptime checks, Vercel analytics or logs, and PostHog events for frontend behavior.

## Uptime Kuma

Use Uptime Kuma for public black-box checks after production deployment. The app does not need Uptime Kuma-specific code.

Recommended monitors:

- `Branded Bikers Web Health`: `GET` the deployed `/health` URL, expect status `200`, interval `60s`.
- `Branded Bikers Homepage`: `GET` the deployed `/` URL, expect status `200`, interval `300s`.
- `Branded Bikers Contact Page`: `GET` the deployed contact or primary lead page URL, expect status `200`, interval `300s`.

Route notifications to the existing approved Uptime Kuma notification channel. Do not create new destinations or escalation routes without owner approval.

## Wazuh Door-Host Coverage

Do not install Wazuh in the Vercel static site or add Wazuh agent code to this repository. If this site has an Anchor-managed "door" host outside Vercel, such as an ingress box, bastion, VPN host, reverse proxy, jump box, or admin workstation, enroll that host in Wazuh through the approved operator process.

Recommended Wazuh coverage for door hosts:

- Agent online/offline alerting.
- Authentication failure and privilege escalation alerts.
- Suspicious process execution alerts.
- File integrity monitoring for proxy, VPN, SSH, and service configuration.
- Package and vulnerability inventory.
- Malware/rootkit scan alerts where supported.

Record the Wazuh manager, agent ID, host role, alert route, and dashboard link in Anchor after enrollment. Do not invent agent IDs, hostnames, Vault paths, or alert destinations in this repository.

## Backups

No app data backup is required for this repository because the site is stateless. Recovery depends on:

- Git repository history.
- Vercel project configuration.
- PostHog project configuration, if analytics is enabled.
- Any domain/DNS records managed outside this repo.

## Anchor Tools UI Steps

Complete these steps in Anchor tools after deployment access is available.

### Uptime Kuma

1. Open Anchor tools.
2. Open the customer or project service record.
3. Record the Uptime Kuma monitor names and links after they are created.
4. Confirm the health monitor targets the deployed site health endpoint ending in `/health`.
5. Confirm the expected status code is `200`.
6. Confirm the monitor shows healthy after at least one successful check.

### PostHog

1. Open Anchor tools.
2. Go to the customer secret or environment management area.
3. Add `PUBLIC_POSTHOG_KEY` with the approved PostHog project public key.
4. Add `PUBLIC_POSTHOG_HOST` only if the project uses a non-default PostHog host.
5. Add `PUBLIC_APP_ENV` with the deployment environment label.
6. Redeploy the Vercel site so public environment variables are embedded into the static build.
7. Open the deployed site and confirm page view events arrive in the approved PostHog project.

### Alerts

1. Open Anchor tools.
2. Go to Alerting or notification policies.
3. Attach the uptime monitor to the customer-approved notification route.
4. Add an alert for health endpoint failures.
5. Add an alert for repeated deployment failures if Vercel build status is integrated.
6. Add PostHog or product analytics alerts only when the customer has approved the signal and destination.
7. If an Anchor-managed door host exists, record Wazuh agent enrollment and security alert ownership.

### Logs

1. Open Anchor tools.
2. Go to Log sources or integrations.
3. Add or verify the Vercel integration for this project.
4. Apply labels for service, component, environment, and platform.
5. Confirm build and request logs are visible for the deployed site.

## Uptime Kuma UI Steps

1. Open Uptime Kuma.
2. Select `Add New Monitor`.
3. Create `Branded Bikers Web Health`.
4. Set monitor type to `HTTP(s)`.
5. Set URL to the deployed `/health` URL.
6. Set method to `GET`.
7. Set heartbeat interval to `60` seconds.
8. Assign the existing approved notification channel.
9. Save the monitor and confirm it reports up.
10. Repeat for homepage and primary contact or lead page using `300` second intervals and status-code checks.
11. Copy the saved monitor links into Anchor under the project service record.

### Secrets

1. Open Anchor tools.
2. Go to Vault or the approved secret store.
3. Store PostHog configuration values using customer-approved naming.
4. Confirm Vercel receives only the public environment variables needed by the frontend.
5. Document the owner and rotation cadence for the PostHog project key.

## Skipped Items

- `/ready` was not added because this static site has no startup readiness phase separate from liveness.
- `/metrics` was not added because there is no app server process.
- Host agents, node exporter, Wazuh, CrowdSec, and backup jobs were not added because this project is deployed as a static Vercel site and this repo does not document a VPS or stateful host. Wazuh is recommended for any Anchor-managed door host outside Vercel.
- Live alerts, dashboards, secrets, and monitors were not created because Anchor UI access and customer-approved destinations were not provided.
- Uptime Kuma access was not used, so monitors still need to be created in the UI.
