FROM alpine:latest

WORKDIR /recorder

COPY . .

# build
# remove dev dependencies
RUN apk add --no-cache --virtual .gyp python make g++ \
    && apk add --no-cache npm \
    && npm install \
    && ./node_modules/.bin/gulp build \
    && : "remove dev dependencies" \
    && npm prune --production \
    && apk del .gyp \
    && npm rm -g npm \
    && : "remove files which unused" \
    && rm -rf \
        html \
        ts \
        css \
        coverage \
        Dockerfile \
        tsconfig.json \
        *.iml \
        Gulpfile.js \
        package-lock.json \
        package.json

CMD ["node", "dist/node/discord-controller"]
