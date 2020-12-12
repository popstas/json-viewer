FROM mhart/alpine-node:12

RUN apk update && \ 
    apk upgrade && \
    apk add --no-cache git nano bash jq

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npm run-script build

# Only copy over the node pieces we need from the above image
FROM mhart/alpine-node:slim-12
WORKDIR /app
COPY --from=0 /app .
COPY . .
EXPOSE 3000

CMD ["npm", "run", "dev"]
