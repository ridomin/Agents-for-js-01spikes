FROM node:alpine
WORKDIR /app
COPY dist/bundle.js .
COPY cert.pem .
COPY cert.key .
CMD ["node", "bundle.js"]