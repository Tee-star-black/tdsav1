FROM node:22-alpine

# Publisher task runs as a Cloud Run Job using encrypted FTP over TLS.
RUN apk add --no-cache lftp ca-certificates

WORKDIR /app/blog-cms
COPY blog-cms/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY blog-cms ./
COPY images /app/images
COPY sitemap.xml /app/sitemap.xml
COPY telemedia-suite.html /app/telemedia-suite.html

ENV NODE_ENV=production
ENV CMS_HOST=0.0.0.0
ENV PORT=8080
ENV CMS_AUTH_FILE=/data/auth.local.json
VOLUME ["/data"]
EXPOSE 8080

CMD ["npm","start"]
