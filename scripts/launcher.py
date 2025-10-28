#!/usr/bin/env python3
"""
Archived launcher - moved under scripts/
This is the same universal launcher as before, kept for maintainers.
"""

import os
import sys
from pathlib import Path

with open(Path(__file__).parent.parent / "PROJECT_ANALYSIS.md", "r") as f:
    header = f.read().splitlines()[:5]

print("Archived launcher moved to scripts/ for repository cleanliness.")
print("Use ./launch.sh for the recommended interactive launcher.")
