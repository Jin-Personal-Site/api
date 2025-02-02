FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./

# Copy the rest of the application code
COPY . .

# Install Certificate
RUN if [ ! -f ./secrets/cert.pem ] && [ ! -f ./secrets/key.pem ]; then \
    pnpm cert:create-ca; \
		pnpm cert:create; \
	fi

# Expose the port the app runs on
EXPOSE 543
EXPOSE 433
EXPOSE 9229
EXPOSE 5555

# Install dependencies using pnpm each time the container starts
CMD ["sh", "-c", "pnpm install && pnpm db:generate && pnpm start:dev"]
