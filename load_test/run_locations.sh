#!/bin/bash

k6 run -e MAGE_TOKEN="${MAGE_TOKEN}" --vus 30 --duration 30s locations.js
