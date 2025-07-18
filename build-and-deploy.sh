# This script will pull the latest state from main, build the project, and deploy if no errors
# are found
#!/bin/bash

# Define variables
REPO_DIR="$HOME/dev/gh/ts_planner_copy"
BUILD_LOG="$REPO_DIR/build.log"
PRODUCTION_DIR="$HOME/dev/gh/ts_planner_copy"
ERROR_LOG="$REPO_DIR/error.log"

echo "Starting Project Deployment script"

# Navigate to the repo directory
cd "$REPO_DIR" || { echo "Error: Repo Directory Find Error" |
tee -a "$ERROR_LOG"; exit 1; }

# Change to main branch 
if ! git checkout main; then
    echo "Error with switch to main branch" | tee -a "$ERROR_LOG"
    exit 1
fi

# Pull latest changes
if ! git pull origin main; then
    echo "Error: Failed to pull from main" | tee -a "$ERROR_LOG"
    exit 1
fi

# Install dependencies
if ! npm install; then
    echo "Error: Npm Intall Error" | tee -a "$ERROR_LOG"
    exit 1
fi

# Build the frontend
if ! npm run build 2> "$BUILD_LOG"; then
    echo "Error: Frontend Build Error" | tee -a "$ERROR_LOG"
    exit 1
fi

# Ensure production directory exists
mkdir -p "$PRODUCTION_DIR"

# Copy build files to production
if ! cp -r "$REPO_DIR/dist/." "$PRODUCTION_DIR/"; then
    echo "Error: Build File Copy Error" | tee -a "$ERROR_LOG"
    exit 1
fi

echo "Project Deploy Success"
exit 0