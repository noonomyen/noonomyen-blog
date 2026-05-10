#!/bin/sh
wget -qO- http://localhost/api/health | grep -q '{"status":"ok"}'
