FROM debian:bullseye-slim as base

RUN apt-get update -yq \
    && apt-get -yq install curl gnupg ca-certificates \
    && curl -L https://deb.nodesource.com/setup_14.x | bash \
    && apt-get update -yq \
    && apt-get install -yq \
        tini \
        nodejs

FROM base as dev

ENV SHELL=/bin/sh

WORKDIR /usr/src/flow-test/

COPY apps/flow-test/install.sh ./apps/flow-test/
RUN sh -ci "./apps/flow-test/install.sh"

ENV PATH="/root/.local/bin:${PATH}"

COPY tools/scripts/package-subset* ./tools/scripts/
COPY subset.config.js ./
COPY package.json ./
COPY package-lock.json ./
RUN node ./tools/scripts/package-subset.js flow-dev subset.config.js package.json package.json
RUN npm ci
COPY workspace.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY flow.json ./
COPY libs/shared ./libs/shared
COPY apps/flow-test/tsconfig.json ./apps/flow-test/
COPY apps/flow-test/src ./apps/flow-test/src

ENTRYPOINT ["/usr/bin/tini", "-v", "--"]
CMD ["npm", "run", "flow-dev"]
