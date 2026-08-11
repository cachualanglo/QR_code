#!/usr/bin/env bash
# Generates a PKCS12 keystore for local TLS (server.keystore)
set -euo pipefail
KEYSTORE_FILE="keystore.p12"
PASSWORD="password"
if [ -f "$KEYSTORE_FILE" ]; then
  echo "Keystore already exists: $KEYSTORE_FILE"
  exit 0
fi
if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found in PATH. Please install JDK and ensure keytool is accessible." >&2
  exit 1
fi
keytool -genkeypair -alias server -keyalg RSA -keysize 2048 -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" -storepass "$PASSWORD" -keypass "$PASSWORD" \
  -dname "CN=localhost, OU=Dev, O=AI Projects, L=City, S=State, C=US"
echo "Keystore generated at $KEYSTORE_FILE"
