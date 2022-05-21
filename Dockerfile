FROM node:14-alpine AS builder

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git nano bash jq

WORKDIR /app

COPY package.json package-lock.json ./
RUN chown -R node:node /app
USER node
RUN npm install
RUN npm run build

# Only copy over the node pieces we need from the above image
FROM node:14-alpine
WORKDIR /app
USER node
COPY --from=builder /app .
COPY . .

EXPOSE 5302
ENV PORT=5302

# CMD ["npm", "start"]
CMD npm run dev-clean
