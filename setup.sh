#!/bin/bash

# Check if NVM directory exists
if [ -d "$HOME/.nvm" ]; then
    echo "NVM directory found. Loading NVM..."
else
    echo "NVM not found. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

    echo "NVM installed."
fi

echo "Installing Node 22.14..."
nvm install
nvm use

echo "Setting up pnpm..."
corepack enable pnpm
corepack install

echo "Installing dependencies..."
pnpm install

echo "Starting Docker container..."
docker compose up db -d

echo "Running Prisma setup..."
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm exec prisma db seed
