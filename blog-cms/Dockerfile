FROM node:22-alpine

WORKDIR /app/blog-cms
COPY blog-cms/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY blog-cms ./
COPY images /app/images
COPY telemedia-suite.html /app/telemedia-suite.html

ENV NODE_ENV=production
ENV CMS_HOST=0.0.0.0
EXPOSE 8080

CMD ["npm","start"]
