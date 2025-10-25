#!/bin/bash
# Activate the virtual environment 
if [ -d "env" ]; then
    source env/bin/activate
    echo "Virtual environment 'env' activated."
else
    echo "Virtual environment 'env' not found. Please run the setup script first."
fi