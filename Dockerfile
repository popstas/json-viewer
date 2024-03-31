FROM node:18-alpine AS builder

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
FROM node:18-alpine
WORKDIR /app
USER node
COPY --from=builder /app .
COPY . .

EXPOSE 5302
ENV PORT=5302
ENV NODE_ENV production

# CMD ["npm", "start"]
CMD npm run dev-clean
