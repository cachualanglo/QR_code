#!/usr/bin/env bash
set -euo pipefail
echo "Building backend locally (GPS TLS + tests) ..."
mvn -Dorg.slf4j.simpleLogger.defaultLogLevel=DEBUG -DskipTests=false package
