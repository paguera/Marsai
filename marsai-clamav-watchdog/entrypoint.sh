#!/bin/bash
set -e

echo "[ClamAV Watchdog] Initializing ClamAV watchdog service..."
mkdir -p /var/lib/clamav /run/clamav
chown -R clamav:clamav /var/lib/clamav /run/clamav

if [ ! -f /var/lib/clamav/main.cvd ] && [ ! -f /var/lib/clamav/main.cld ]; then
    echo "[ClamAV Watchdog] Downloading initial virus definitions..."
    freshclam || true
fi

# Run freshclam daemon in background to keep virus DB updated (checks every 2h)
freshclam -d -c 12 &

echo "[ClamAV Watchdog] Starting ClamAV daemon..."
clamd &

echo "[ClamAV Watchdog] Waiting for clamd daemon to initialize socket..."
while [ ! -S /run/clamav/clamd.sock ]; do
    sleep 1
done
echo "[ClamAV Watchdog] ClamAV daemon is active and ready."

exec /usr/local/bin/watchdog.sh
