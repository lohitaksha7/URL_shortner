FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy prisma schema first so we can generate the client
COPY prisma ./prisma/

# Generate prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
