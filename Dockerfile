FROM mhart/alpine-node:12

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git nano bash jq

WORKDIR /app

# COPY package.json package-lock.json ./
COPY package.json ./
RUN yarn install
RUN npm run build

# Only copy over the node pieces we need from the above image
FROM mhart/alpine-node:12
WORKDIR /app
COPY --from=0 /app .
COPY . .

EXPOSE 5302
ENV PORT=5302

RUN apk add --no-cache nano bash jq

# CMD ["npm", "start"]
CMD npm run dev-clean
