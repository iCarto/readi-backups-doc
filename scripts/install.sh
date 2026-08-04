#!/usr/bin/env bash

set -euo pipefail

this_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)"

cd "${this_dir}"/..

PYTHON_VERSION=3.12.2
PROJECT_NAME=readi-backups-docs

# Clean up
command -v deactivate && deactivate

: "${PROJECT_NAME}" # checks that project_name exists, if not an unbound variable is raised

# Developer Experience Setup
# Installs the version set in .python-version
# uv python install
uv python install "${PYTHON_VERSION}"

# Removes if exists and creates the virtualenv in .venv
uv venv --clear

# No need to do this here
# source .venv/bin/activate

# backend and dev dependencies
uv sync

# System deps for mkdocs-material[imaging]
sudo apt install --yes libcairo2-dev libfreetype6-dev libffi-dev libjpeg-dev libpng-dev libz-dev pngquant

npm install
uv run prek uninstall --refresh
uv run prek cache clean --config .pre-commit-config.yaml
uv run prek cache gc --config .pre-commit-config.yaml
uv run prek install --install-hooks --overwrite --refresh --config .pre-commit-config.yaml
uv run prek validate-config --verbose .pre-commit-config.yaml

mkdir -p .cache/

echo "* DONE :)

Activate the virtualenv with:
source .venv/bin/activate
"
