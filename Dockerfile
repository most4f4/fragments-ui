# Dockerfile for the Fragments UI Frontend
# This file defines the instructions for building a Docker image of the frontend.
# It allows the application to be containerized and run in any environment where Docker is supported.
# Reference: https://github.com/most4f4/fragments-ui

# ────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:22.12.0@sha256:0e910f435308c36ea60b4cfd7b80208044d77a074d16b768a81901ce938a62dc AS dependencies

# Add metadata to the image
LABEL maintainer="Mostafa Hasanalipourshahrabadi <mhasanalipourshahrab@myseneca.com>" \
      description="Fragments UI React/Next.js frontend for testing and interacting with the fragments microservice"

# We default to use port 3000 (just like in development)
ENV PORT=3000

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci

############################################################################

# ─────────────────────────────────────────────────────────────
# Stage 2: Application Build
# ─────────────────────────────────────────────────────────────

FROM node:22.12.0@sha256:0e910f435308c36ea60b4cfd7b80208044d77a074d16b768a81901ce938a62dc AS build

# Build arguments (passed during docker build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AWS_COGNITO_POOL_ID
ARG NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID
ARG NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL
ARG NEXT_PUBLIC_COGNITO_DOMAIN

# Convert build args to environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AWS_COGNITO_POOL_ID=$NEXT_PUBLIC_AWS_COGNITO_POOL_ID
ENV NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=$NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID
ENV NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL=$NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL
ENV NEXT_PUBLIC_COGNITO_DOMAIN=$NEXT_PUBLIC_COGNITO_DOMAIN

ENV PORT=3000
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy source code to /app/src/
COPY ./src ./src

# Copy configuration files
COPY next.config.mjs ./
COPY jsconfig.json ./
COPY eslint.config.mjs ./


# Build the Next.js application for production
RUN npm run build

############################################################################

# ─────────────────────────────────────────────────────────────
# Stage 3: Final Image - Production with nginx
# ─────────────────────────────────────────────────────────────

FROM node:22.12.0-slim@sha256:35531c52ce27b6575d69755c73e65d4468dba93a25644eed56dc12879cae9213 AS runtime

ENV PORT=3000
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy app from build stage
COPY --from=build /app /app

# Start the container by running our Next.js server (just like npm run dev, but production)
CMD ["npm", "start"]

# We run our service on port 3000 (same as development)
EXPOSE 3000