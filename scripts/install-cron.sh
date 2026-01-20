#!/bin/bash

# Install WatchBox Content Regeneration Cron Job
# This script adds the cron job to your crontab

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Escape spaces in path for crontab
PROJECT_ROOT_ESCAPED=$(echo "$PROJECT_ROOT" | sed 's/ /\\ /g')

# Create crontab entries with environment variables
CRON_ENTRIES="SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin
0 2 * * * $PROJECT_ROOT_ESCAPED/scripts/regenerate-content-cron.sh >> $PROJECT_ROOT_ESCAPED/logs/cron.log 2>&1"

echo "WatchBox Cron Job Installer"
echo "=========================="
echo ""
echo "This will add the following cron job to your crontab:"
echo ""
echo "$CRON_ENTRIES"
echo ""
echo "Schedule: Every day at 2:00 AM"
echo ""

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "regenerate-content-cron.sh"; then
    echo "⚠️  A cron job for WatchBox content regeneration already exists."
    echo ""
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
    # Remove existing entries (both the job and environment variables if they exist)
    crontab -l 2>/dev/null | grep -v "regenerate-content-cron.sh" | grep -v "^SHELL=" | grep -v "^PATH=" | crontab -
fi

# Get existing crontab (excluding our entries)
EXISTING_CRONTAB=$(crontab -l 2>/dev/null | grep -v "regenerate-content-cron.sh" | grep -v "^SHELL=" | grep -v "^PATH=" || true)

# Add the new cron entries
(echo "$EXISTING_CRONTAB"; echo "$CRON_ENTRIES") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job installed successfully!"
    echo ""
    echo "To verify, run: crontab -l"
    echo "To remove, run: crontab -e (then delete the line)"
    echo ""
    echo "The cron job will run every day at 2:00 AM."
else
    echo "❌ Failed to install cron job."
    exit 1
fi

