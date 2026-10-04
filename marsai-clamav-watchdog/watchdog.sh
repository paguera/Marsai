#!/bin/bash
echo "[ClamAV Watchdog] Watching /scandir recursively for new files..."

inotifywait -m -r -e close_write,moved_to --format '%w%f' /scandir | while read -r FILE; do
    if [ -f "$FILE" ]; then
        echo "[ClamAV Watchdog] File uploaded: $FILE. Starting antivirus scan..."
        if clamdscan --fdpass --no-summary "$FILE"; then
            echo "[ClamAV Watchdog] OK: $FILE passed antivirus check."
        else
            EXIT_CODE=$?
            if [ $EXIT_CODE -eq 1 ]; then
                echo "=================================================================="
                echo "[SECURITY ALERT] MALWARE DETECTED in file: $FILE"
                echo "[ClamAV Watchdog] Removing infected file immediately!"
                rm -f "$FILE"
                echo "[ClamAV Watchdog] Infected file $FILE successfully destroyed."
                echo "=================================================================="
            else
                echo "[ClamAV Watchdog] Scan error (code $EXIT_CODE) when scanning $FILE"
            fi
        fi
    fi
done
