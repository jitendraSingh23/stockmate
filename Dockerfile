# Dockerfile
FROM node:18

# Set the working directory
WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy Prisma files
COPY prisma ./prisma

# Copy the rest of the application
COPY . .

# Generate Prisma client before changing permissions
RUN npx prisma generate

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set proper permissions
RUN chown -R nextjs:nodejs /app
RUN chmod -R 755 /app
RUN chmod -R 777 /app/node_modules/.prisma

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "dev"]
