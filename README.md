# API de Autenticação em Node.js para o Squad 1

Esta é uma API simples de autenticação em Node.js que permite aos usuários se registrarem, fazerem login e acessarem rotas protegidas usando tokens JWT.

## Funcionalidades

- Registro de novos usuários com CPF/CNPJ e senha.
- Login de usuários registrados com validação de CPF/CNPJ e senha.
- Geração de token JWT para usuários autenticados.
- Acesso a rotas protegidas usando token JWT para autenticação.

## Rotas

### Registro de Usuário

```
POST /signup
```

Permite que um novo usuário se registre fornecendo seu CPF/CNPJ e senha.

**Corpo da solicitação:**
```json
{
  "cpfCnpj": "string",
  "password": "string"
}
```

### Login de Usuário

```
POST /login
```

Permite que um usuário registrado faça login fornecendo seu CPF/CNPJ e senha.

**Corpo da solicitação:**
```json
{
  "cpfCnpj": "string",
  "password": "string"
}
```

### Obter Todos os Usuários

```
GET /users
```

Retorna uma lista de todos os usuários cadastrados no sistema.

### Acesso Protegido

```
GET /protected
```

Uma rota protegida que requer autenticação JWT. Somente usuários autenticados podem acessá-la.

## Instalação e Execução

1. Clone este repositório:
   ```
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   ```

2. Instale as dependências:
   ```
   cd nome-do-repositorio
   npm install
   ```

3. Execute o servidor:
   ```
   node server.js
   ```

O servidor estará em execução em `http://localhost:3000`.

## Tecnologias Utilizadas

- Node.js
- Express.js
- bcryptjs
- jsonwebtoken
