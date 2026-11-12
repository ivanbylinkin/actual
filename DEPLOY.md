# Deploying to Coolify

GitHub Actions builds the image; Coolify only pulls it and runs it.

1. A push to `master` runs `.github/workflows/fork-docker.yml`.
2. It builds `sync-server.Dockerfile` (the sync server, which also serves the
   web client) and pushes `ghcr.io/ivanbylinkin/actual` tagged `latest` and
   with the full commit SHA.
3. Its last step calls Coolify's deploy webhook.
4. Coolify pulls `latest` and restarts the service from
   `docker-compose.coolify.yml`.

Coolify must not build the image: the client build needs about 8 GB of memory.

## GitHub, once

1. **Enable Actions on the fork.** Open the repository's **Actions** tab and
   confirm that workflows may run. Forks start with them off.
2. **Disable upstream's workflows.** They publish images and packages, cut
   releases and queue jobs on runners this fork doesn't have. Run:

   ```sh
   bin/fork-disable-upstream-workflows
   ```

   It disables everything except `.github/workflows/fork-*.yml`. It changes a
   repository setting, not files, so run it again after rebasing on upstream.

3. **If the Coolify server is ARM**, add a repository variable
   `IMAGE_PLATFORMS` with the value `linux/arm64` (Settings → Secrets and
   variables → Actions → Variables). The default is `linux/amd64`. Run
   `uname -m` on the server to check: `x86_64` is amd64, `aarch64` is arm64.

## Coolify settings

Create a resource from this Git repository with the **Docker Compose** build
pack.

| Setting                 | Value                         |
| ----------------------- | ----------------------------- |
| Branch                  | `master`                      |
| Docker Compose location | `/docker-compose.coolify.yml` |
| Domain for `budget`     | `https://your.domain:5006`    |
| Auto Deploy             | Off                           |

- The `:5006` after the domain tells Coolify's proxy which container port to
  send traffic to. It is not opened to the internet, and the compose file
  publishes no host ports.
- **HTTPS is required.** The client only runs in a secure context. Use an
  `https://` domain so Coolify issues a certificate.
- **Auto Deploy must be off.** With it on, Coolify deploys on push, before the
  new image exists, and restarts the old one. The workflow triggers the deploy
  itself once the image is pushed.

## Deploy webhook and token

In Coolify:

- **Webhook URL**: the resource's **Webhooks** page, under **Deploy Webhook
  (auth required)**. It looks like
  `https://<coolify>/api/v1/deploy?uuid=<resource-uuid>&force=false`.
- **Token**: **Keys & Tokens → API tokens**. Create one with the **deploy**
  permission. API access has to be enabled under **Settings**.

In GitHub, under Settings → Secrets and variables → Actions → Secrets, add:

| Secret                | Value                  |
| --------------------- | ---------------------- |
| `COOLIFY_WEBHOOK_URL` | The deploy webhook URL |
| `COOLIFY_TOKEN`       | The API token          |

Without both secrets the workflow still builds and pushes the image, prints
that it skipped the deployment, and succeeds.

## If the image is private

A package pushed by Actions may start out private; check it under your GitHub
profile → **Packages** → `actual` → Package settings. Either make it public
there, or let the Coolify server log in to GHCR:

1. Create a GitHub personal access token (classic) with only the
   `read:packages` scope.
2. On the Coolify server, as the user Coolify deploys with (normally `root`),
   run:

   ```sh
   docker login ghcr.io -u ivanbylinkin
   ```

   and paste the token as the password. The login is stored on the server and
   used for every later pull.

## Rolling back

Every build is also tagged with its commit SHA. To run an older one:

1. Find the full SHA of the commit to go back to (`git log`, or the package's
   tag list on GitHub).
2. In Coolify, add an environment variable `IMAGE_TAG` set to that SHA.
3. Redeploy.

While `IMAGE_TAG` is set, later pushes still build new images but Coolify
keeps deploying the pinned one. Remove the variable and redeploy to return to
`latest`.

Rolling back the image does not roll back data. If a newer version migrated a
budget file, restore the volume backup taken before that deploy as well.

## Backing up the volume

All server data (budget files, accounts, the server's own database) is in the
named volume mounted at `/data`. Coolify prefixes the name with the resource's
ID; find it with:

```sh
docker volume ls | grep budget-data
```

Back it up to a tarball in the current directory. Stop the service in Coolify
first so the SQLite files are not written to mid-copy:

```sh
docker run --rm \
  -v <volume-name>:/data:ro \
  -v "$PWD":/backup \
  alpine tar czf /backup/budget-data-$(date +%F).tar.gz -C /data .
```

Restore into an empty volume, with the service stopped:

```sh
docker run --rm \
  -v <volume-name>:/data \
  -v "$PWD":/backup \
  alpine tar xzf /backup/budget-data-YYYY-MM-DD.tar.gz -C /data
```

Each budget can also be exported from the app (Settings → Export data), which
is worth doing before a risky change even with volume backups in place.
