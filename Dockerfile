FROM ubuntu:19.04

WORKDIR /recorder

ENV NODE_PATH /usr/lib/node_modules

# build
# remove dev dependencies
RUN apt update \
    && apt install -y \
        ffmpeg \
        xvfb \
        gconf-service \
        libasound2 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgcc1 \
        libgconf-2-4 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        ca-certificates \
        fonts-liberation \
        libappindicator1 \
        libnss3 \
        lsb-release \
        xdg-utils \
        wget \
        language-pack-ja \
        language-pack-ja-base \
        fonts-takao \
        fonts-ipafont \
        fonts-ipaexfont \
        fonts-noto-color-emoji \
    && : "install node and npm dependences" \
    && apt install -y npm \
    && npm install n -g \
    && n 8 \
    && apt purge -y npm \
    && hash -r \
    && : "initialize something" \
    &&  dbus-uuidgen \
    && chmod +s $(which Xvfb)

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN ./node_modules/.bin/gulp build \
    && : "remove dev dependencies" \
    && npm prune --production \
    && npm rm -g npm \
    && : "remove files which unused" \
    && rm -rf \
        ts \
        coverage \
        Dockerfile \
        tsconfig.json \
        *.iml \
        Gulpfile.js \
        package-lock.json \
        package.json \
    && : "initialize something" \
    &&  dbus-uuidgen
# Add user so we don't need --no-sandbox.
RUN groupadd recorder && adduser --ingroup recorder recorder \
    && chown -R recorder:recorder /recorder

USER recorder

CMD ./docker.sh
