#!/bin/bash

# Script to manage Docker Compose environments
# Usage: ./compose.sh [dev|prod] [up|down|build|logs]

ENV="dev"
COMMAND="up -d"

# Parse arguments
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
  ENV="prod"
  shift
elif [ "$1" == "dev" ] || [ "$1" == "development" ]; then
  shift
fi

# Parse command
if [ "$1" == "down" ]; then
  COMMAND="down"
  shift
elif [ "$1" == "build" ]; then
  COMMAND="build"
  shift
elif [ "$1" == "logs" ]; then
  COMMAND="logs -f"
  shift
fi

# Set compose file path
COMPOSE_FILE="../compose/$ENV/docker-compose.yml"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Compose file not found at $COMPOSE_FILE"
  exit 1
fi

# Run docker-compose
echo "Running: docker-compose -f $COMPOSE_FILE $COMMAND $@"
docker-compose -f "$COMPOSE_FILE" $COMMAND "$@"
