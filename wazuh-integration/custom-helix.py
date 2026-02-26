#!/usr/bin/env python3
"""
Wazuh custom integration script for Helix.

Sends high-severity alerts to the Helix webhook endpoint.
Placed in /var/ossec/integrations/custom-helix inside the Wazuh Manager container.

IMPORTANT: wazuh-integratord runs as the restricted 'ossec' user and strips
environment variables. The webhook secret MUST be read from a mounted file,
not from os.environ.

Configure in ossec.conf:
<integration>
  <name>custom-helix</name>
  <hook_url>http://helix:3000/api/webhooks/wazuh</hook_url>
  <level>10</level>
  <alert_format>json</alert_format>
</integration>

Mount the secret file via docker-compose:
  volumes:
    - ./secrets/helix_secret.txt:/var/ossec/etc/helix_secret.txt:ro
"""
import sys
import json
import urllib.request
import urllib.error

SECRET_FILE = '/var/ossec/etc/helix_secret.txt'


def main():
    if len(sys.argv) < 4:
        sys.exit(1)

    alert_file = sys.argv[1]
    # sys.argv[2] is the API key (unused, we use file-based secret)
    webhook_url = sys.argv[3]  # passed via <hook_url> in ossec.conf

    # Read secret from file (env vars are stripped by integratord)
    try:
        with open(SECRET_FILE) as f:
            secret = f.read().strip()
    except FileNotFoundError:
        # No secret file = skip silently (don't block integratord queue)
        sys.exit(0)

    # Read the alert
    try:
        with open(alert_file) as f:
            alert = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        sys.exit(1)

    # Send to Helix
    try:
        data = json.dumps(alert).encode('utf-8')
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {secret}',
            },
        )
        # 1s timeout -- same Docker network, zero latency.
        # Drop fast to avoid blocking integratord queue.
        urllib.request.urlopen(req, timeout=1)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError):
        # Fail silently to avoid blocking the integratord pipeline
        pass


if __name__ == '__main__':
    main()
