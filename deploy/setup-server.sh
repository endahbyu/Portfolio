#!/usr/bin/env bash
# One-time VPS setup for the portfolio deploy. Run from the repo root: bash deploy/setup-server.sh
# Afterwards, every push to main deploys via .github/workflows/deploy.yml.
set -euo pipefail

REPO="${REPO:-endahbyu/Portfolio}"
RUNNER_DIR="$HOME/actions-runner-portfolio"
APP_DIR=/var/www/portfolio

echo "==> App directory"
sudo mkdir -p "$APP_DIR/releases"
sudo chown -R "$USER:$USER" "$APP_DIR"

echo "==> systemd service"
sudo cp deploy/portfolio.service /etc/systemd/system/portfolio.service
sudo systemctl daemon-reload
sudo systemctl enable portfolio

echo "==> Caddy (backup kept at /etc/caddy/Caddyfile.bak)"
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy

echo "==> GitHub Actions self-hosted runner"
if [ ! -d "$RUNNER_DIR" ]; then
  VERSION=$(gh api repos/actions/runner/releases/latest --jq .tag_name | sed 's/^v//')
  mkdir -p "$RUNNER_DIR" && cd "$RUNNER_DIR"
  curl -fsSL -o runner.tgz \
    "https://github.com/actions/runner/releases/download/v${VERSION}/actions-runner-linux-x64-${VERSION}.tar.gz"
  tar xzf runner.tgz && rm runner.tgz
  TOKEN=$(gh api -X POST "repos/$REPO/actions/runners/registration-token" --jq .token)
  ./config.sh --unattended --url "https://github.com/$REPO" --token "$TOKEN" \
    --name "$(hostname)-portfolio" --labels portfolio --replace
  sudo ./svc.sh install "$USER"
  sudo ./svc.sh start
fi

echo "Done. Push to main to deploy."
