FROM node:18-alpine AS build

WORKDIR /FLICKS/frontend
COPY package.json package-lock.json ./

RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=build /FLICKS/frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"] 