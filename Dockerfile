# Use uma imagem base com Node.js Alpine LTS
FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código da aplicação
COPY . .

# Expõe a porta que o Vite utiliza
EXPOSE 5173

# Comando para iniciar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "dev"]
