FROM mhart/alpine-node:12

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git nano bash jq

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npm run build

# Only copy over the node pieces we need from the above image
FROM mhart/alpine-node:12
WORKDIR /app
COPY --from=0 /app .
COPY . .

EXPOSE 5302
ENV PORT=5302

# CMD ["npm", "start"]
CMD npm run dev-clean
