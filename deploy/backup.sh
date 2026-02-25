#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/carthtml}"
DB_PATH="${DB_PATH:-$PROJECT_DIR/data/store.sqlite}"
UPLOADS_DIR="${UPLOADS_DIR:-$PROJECT_DIR/public/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/carthtml}"
STAMP="$(date +%F-%H%M%S)"

mkdir -p "$BACKUP_DIR"

sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/store-$STAMP.sqlite'"

tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$UPLOADS_DIR" .

find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "Backup OK: $STAMP"
