FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies in a clean environment to ensure a smaller final image size
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Production Environment
FROM node:20-alpine AS production

#  Install OpenSSL in the final environment so Prisma can use it
RUN apk add --no-cache openssl

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
# CMD npx prisma migrate deploy && node src/server.js