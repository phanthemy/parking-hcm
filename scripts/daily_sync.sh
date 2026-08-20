#!/bin/bash
# MapGo Data Pipeline - Automated Daily Sync & Deduplication
# Runs every night at 3:00 AM

LOG_FILE="/var/www/parking-hcm/logs/sync_$(date +%Y%m%d).log"
mkdir -p /var/www/parking-hcm/logs

echo "==========================================" >> "$LOG_FILE"
echo "Starting Daily Data Sync at $(date)" >> "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"

cd /var/www/parking-hcm

# 1. Crawl OSM Automotive updates
echo "[1/2] Running Automotive Crawler..." >> "$LOG_FILE"
python3 scripts/crawl_fuel_osm.py >> "$LOG_FILE" 2>&1

# 2. Run Data Normalization & Deduplication
echo "[2/2] Running Normalization & Deduplication Pipeline..." >> "$LOG_FILE"
python3 scripts/deduplication_pipeline.py >> "$LOG_FILE" 2>&1

echo "Daily Sync Completed at $(date)" >> "$LOG_FILE"
