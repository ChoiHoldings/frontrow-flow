# BASE IMAGE (210MB)
# ------------------------------------------------------------------------------------
FROM node:16-bullseye-slim as base
RUN apt-get update -yq \
    && apt-get install -yq \
        curl \
        tini

# DEV EMULATOR BUILD IMAGE (568MB)
# ------------------------------------------------------------------------------------
FROM base as build.dev
ENV SHELL=/bin/sh
ARG FLOW_CLI_VER=v0.31.1
ENV FLOW_CLI_VER=$FLOW_CLI_VER
WORKDIR /usr/src
COPY apps/blockchain-emulator/install.sh ./apps/blockchain-emulator/
RUN sh -ci "./apps/blockchain-emulator/install.sh $FLOW_CLI_VER"
ENV PATH="/root/.local/bin:${PATH}"
COPY tools/scripts/package-subset* ./tools/scripts/
COPY subset.config.js ./
COPY package.json ./
COPY package-lock.json ./
RUN node ./tools/scripts/package-subset.js blockchain-emulator subset.config.js package.json package.json

# Copy in prebuilt @parcel/watcher
COPY tools/prebuilds/@parcel/watcher ./node_modules/@parcel/watcher
RUN npm install

COPY workspace.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY flow.json ./
COPY apps/blockchain-emulator/tsconfig*.json ./apps/blockchain-emulator/
COPY apps/blockchain-emulator/src ./apps/blockchain-emulator/src
COPY libs/shared ./libs/shared
COPY libs/backend ./libs/backend
COPY libs/blockchain ./libs/blockchain

# DEV EMULATOR APP IMAGE (568MB)
# ------------------------------------------------------------------------------------
FROM build.dev as dev
ENTRYPOINT ["/usr/bin/tini", "-v", "--"]
CMD ["npx", "nx", "serve", "blockchain-emulator"]


# # PROD EMULATOR BUILD IMAGE (642MB)
# # ------------------------------------------------------------------------------------
# FROM build.dev as build.prod
# RUN npx nx build blockchain-emulator
# RUN npm ci --production

# # PROD EMULATOR APP IMAGE (267MB)
# # ------------------------------------------------------------------------------------
# FROM base AS prod
# WORKDIR /usr/src
# COPY --from=build.prod --chown=app:app /usr/src/dist/apps/blockchain-emulator dist/apps/blockchain-emulator
# COPY --from=build.prod --chown=app:app /usr/src/node_modules ./node_modules
# EXPOSE 7000
# ENTRYPOINT ["/usr/bin/tini", "-v", "--"]
# CMD ["node", "./dist/apps/blockchain-emulator/main.js"]
