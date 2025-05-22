# Base image for building the application
#FROM node:20-alpine AS builder
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
#RUN npm run build

# Production image
#FROM node:20-alpine AS runner

#WORKDIR /app

#ENV NODE_ENV production

# Create a non-root user
#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
#COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
#COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
#COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
#COPY --from=builder --chown=nextjs:nodejs /app/public ./public
#COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
#COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

# Set proper permissions
#USER nextjs

# Expose port
EXPOSE 3000

# Start the application
#CMD ["npm", "run", "start"]
CMD ["npm", "run", "dev"]
