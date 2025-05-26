# WhatsApp Test Interface

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/thadeucbr/project-6)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Versão](https://img.shields.io/badge/version-0.0.0-blue)](https://github.com/thadeucbr/project-6)
[![Linguagem](https://img.shields.io/badge/language-TypeScript-blue)](https://www.typescriptlang.org/)

Uma interface web para criar, gerenciar e executar testes de mensagens do WhatsApp.

## Visão Geral Detalhada / Sobre o Projeto

Este projeto fornece uma interface amigável para simular e testar fluxos de mensagens do WhatsApp. Ele permite que desenvolvedores e equipes de QA definam casos de teste, especifiquem interações esperadas e analisem os resultados dos testes. O objetivo principal é otimizar o processo de teste para aplicações que se integram com o WhatsApp, garantindo a confiabilidade e correção de sequências de mensagens automatizadas.

Este projeto destina-se a desenvolvedores de software, engenheiros de QA e equipes de produto envolvidos no desenvolvimento ou teste de soluções de comunicação baseadas no WhatsApp.

## Funcionalidades Principais

*   **Gerenciamento de Casos de Teste:** Crie, edite e exclua casos de teste.
*   **Definição de Interação:** Defina sequências de mensagens e respostas esperadas.
*   **Execução de Testes:** Execute os casos de teste definidos e visualize o progresso em tempo real.
*   **Análise de Resultados:** Revise os resultados dos testes e identifique falhas.
*   **Seleção de Número de Telefone:** Filtre e gerencie testes com base nos números de telefone associados.
*   **Suporte a Testes Locais e em Nuvem (implícito):** A interface do usuário sugere uma distinção entre testes locais e em nuvem.
*   **Funcionalidade de Busca:** Encontre rapidamente testes específicos.

## Tecnologias Utilizadas

*   **TypeScript**
*   **React**
*   **Vite**
*   **Tailwind CSS**
*   **Zustand** (para gerenciamento de estado)
*   **React Router DOM** (para navegação)
*   **Lucide React** (para ícones)
*   **Axios** (para requisições HTTP)
*   **Socket.io-client** (para comunicação em tempo real)
*   **Vitest** (para testes)
*   **ESLint** (para linting)
*   **Docker**

## Estrutura do Projeto

```
├── public/               # Assets estáticos
├── src/                  # Código fonte principal
│   ├── api/              # Módulos de integração com API
│   ├── components/       # Componentes React reutilizáveis
│   ├── pages/            # Componentes de página (views)
│   ├── store.ts          # Gerenciamento de estado (Zustand)
│   ├── types.ts          # Definições de tipos TypeScript
│   ├── App.tsx           # Componente principal da aplicação
│   ├── main.tsx          # Ponto de entrada da aplicação React
│   └── index.css         # Estilos globais
├── .env                  # Arquivo de variáveis de ambiente (ex: VITE_API_BASE_URL, VITE_SOCKET_URL)
├── Dockerfile            # Configuração para build da imagem Docker
├── docker-compose.yml    # Configuração para orquestração de containers Docker
├── package.json          # Metadados do projeto e dependências NPM
├── vite.config.ts        # Configuração do Vite
├── vitest.config.ts      # Configuração do Vitest
└── README.md             # Este arquivo
```

## Pré-requisitos

*   Node.js (versão recomendada: >=18.x)
*   npm (geralmente vem com o Node.js)
*   Docker (opcional, para execução em container)

## Instalação e Configuração

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/thadeucbr/project-6.git
    cd whatsapp-test-interface
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Crie um arquivo `.env` na raiz do projeto:**

    Copie o conteúdo abaixo ou crie o arquivo manualmente:

    ```env
    VITE_API_BASE_URL=https://whatsappapi.barbudas.com/api/v1
    VITE_SOCKET_URL=https://whatsappapi.barbudas.com
    ```

    Substitua os valores pelos corretos para o seu ambiente, se necessário.

## Uso / Como Executar

1.  **Para desenvolvimento (com hot-reload):**

    ```bash
    npm run dev
    ```

    Isso iniciará o servidor de desenvolvimento Vite, geralmente em `http://localhost:5173`.

2.  **Para build de produção:**

    ```bash
    npm run build
    ```

    Os arquivos otimizados para produção serão gerados na pasta `dist/`.

3.  **Para executar testes (unitários/integração):**

    ```bash
    npm run test
    ```

    Para executar testes com interface gráfica (UI mode):

    ```bash
    npm run test:ui
    ```

4.  **Para visualizar a build de produção localmente:**

    ```bash
    npm run preview
    ```

5.  **Para executar com Docker:**

    ```bash
    docker-compose up --build
    ```

    Esta configuração Docker irá construir uma imagem para a aplicação e executá-la em um container.
    * O `Dockerfile` utiliza uma imagem base `node:22-alpine`, copia os arquivos do projeto, instala as dependências com `npm install` e expõe a porta `5173`.
    * O comando padrão para o container é `npm run dev`, iniciando o servidor de desenvolvimento Vite.
    * O `docker-compose.yml` define um serviço chamado `app` que constrói a imagem a partir do `Dockerfile` no diretório atual.
    * Ele mapeia a porta `5173` do host para a porta `5173` do container.
    * Monta o diretório atual (`.`) para `/app` no container, permitindo o hot-reloading durante o desenvolvimento.
    * Define a variável de ambiente `NODE_ENV` como `development`.

    Para executar em modo de produção com Docker, você precisaria ajustar o `Dockerfile` para executar `npm run build` e então servir a pasta `dist` (por exemplo, com um servidor como Nginx ou `serve`), e modificar o `CMD` ou o `docker-compose.yml` de acordo.

## Como Contribuir

*   **Reportar Bugs:** Use a seção "Issues" do repositório GitHub para reportar bugs detalhadamente.
*   **Sugerir Novas Funcionalidades:** Crie uma "Issue" descrevendo a funcionalidade e sua utilidade.
*   **Pull Requests:**
    1.  Faça um fork do projeto.
    2.  Crie uma nova branch para sua feature (`git checkout -b feature/nova-feature`).
    3.  Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`).
    4.  Faça push para a branch (`git push origin feature/nova-feature`).
    5.  Abra um Pull Request.
*   **Padrões de Código:** Siga os padrões de linting configurados (ESLint). Execute `npm run lint` para verificar.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
