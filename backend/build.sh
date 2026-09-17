#!/usr/bin/env bash
# Render build script for Poietik Academy Django Backend
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py setup_initial_data

