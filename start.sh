#!/bin/sh
# Start the monitor agent (if panel env vars are set) alongside the test app.
# The agent config is written at container start from env vars only; no secret lives in the repo.
if [ -n "$NZ_CLIENT_SECRET" ] && [ -n "$NZ_UUID" ]; then
  cat > /app/nezha-agent-config.yaml <<EOF
server: ${NZ_SERVER:-nz.woairenqi.eu.cc:11111}
tls: false
client_secret: ${NZ_CLIENT_SECRET}
uuid: ${NZ_UUID}
debug: false
disable_auto_update: true
disable_force_update: true
EOF
  chmod 600 /app/nezha-agent-config.yaml
  ( while true; do /app/nezha-agent -c /app/nezha-agent-config.yaml >> /app/nezha-agent.log 2>&1; echo "nezha-agent exited, restarting in 10s" >> /app/nezha-agent.log; sleep 10; done ) &
  echo "nezha-agent supervisor started pid $!"
else
  echo "nezha-agent skipped: NZ_CLIENT_SECRET or NZ_UUID not set"
fi
exec node server.js
