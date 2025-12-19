#!/bin/sh
set -e

echo "=========================================="
echo "   Weather Backend - Entrypoint Script   "
echo "=========================================="

# Function to wait for MySQL
wait_for_mysql() {
    echo "[1/3] Waiting for MySQL to be ready..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if node -e "
            const mysql = require('mysql2/promise');
            mysql.createConnection({
                host: process.env.DB_HOST || 'mysql',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || 'root123'
            }).then(() => process.exit(0)).catch(() => process.exit(1));
        " 2>/dev/null; then
            echo "✓ MySQL is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "  Attempt $attempt/$max_attempts - MySQL not ready, waiting..."
        sleep 2
    done
    
    echo "✗ Could not connect to MySQL after $max_attempts attempts"
    exit 1
}

# Function to run seeds
run_seeds() {
    echo "[2/3] Running database seeds..."
    
    # Check if locations already exist
    location_count=$(node -e "
        const { AppDataSource } = require('./dist/data-source');
        const { Location } = require('./dist/entities/Location');
        
        AppDataSource.initialize()
            .then(async () => {
                const count = await AppDataSource.getRepository(Location).count();
                console.log(count);
                await AppDataSource.destroy();
            })
            .catch(() => console.log('0'));
    " 2>/dev/null || echo "0")
    
    if [ "$location_count" = "0" ] || [ -z "$location_count" ]; then
        echo "  No locations found, seeding database..."
        # Run the seed using ts-node in development or compiled version
        if [ -f "./dist/seeds/locationSeed.js" ]; then
            node ./dist/seeds/locationSeed.js || echo "  Seed script not found in dist, skipping..."
        else
            echo "  Seed script not compiled, skipping..."
        fi
    else
        echo "  ✓ Database already has $location_count locations, skipping seed"
    fi
}

# Function to start the application
start_app() {
    echo "[3/3] Starting application..."
    echo "=========================================="
    echo ""
    
    exec node dist/index.js
}

# Main execution
wait_for_mysql
run_seeds
start_app
