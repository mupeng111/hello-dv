FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl unzip ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN curl -fsSL -o /tmp/nezha-agent.zip https://github.com/nezhahq/agent/releases/download/v2.4.0/nezha-agent_linux_amd64.zip \
 && unzip -o /tmp/nezha-agent.zip -d /tmp/nezha \
 && find /tmp/nezha -name 'nezha-agent' -type f -exec cp {} /app/nezha-agent \; \
 && chmod +x /app/nezha-agent \
 && rm -rf /tmp/nezha-agent.zip /tmp/nezha
EXPOSE 3000
CMD ["sh", "start.sh"]
