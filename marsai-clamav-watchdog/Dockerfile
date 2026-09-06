FROM alpine:latest

# Install ClamAV, freshclam, inotify-tools, bash, and shadow
RUN apk add --no-cache clamav freshclam inotify-tools bash shadow

# Set up configuration directories and permissions
RUN mkdir -p /var/lib/clamav /run/clamav /scandir && \
    chown -R clamav:clamav /var/lib/clamav /run/clamav

# Configure clamd socket path
RUN sed -i 's/^#LocalSocket /LocalSocket /' /etc/clamav/clamd.conf && \
    sed -i 's/^#Foreground /Foreground /' /etc/clamav/clamd.conf

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY watchdog.sh /usr/local/bin/watchdog.sh

RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/watchdog.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
