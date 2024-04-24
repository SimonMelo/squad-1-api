const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Configuração da chave secreta para o JWT
const secretKey = 'yourSecretKey';

// Middleware para autenticação JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Rota de login
app.post('/login', (req, res) => {
  const { cpfCnpj, password } = req.body;

  // Lê o arquivo db.json
  fs.readFile('db.json', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo db.json:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    let db = JSON.parse(data);
    // Procura pelo CPF/CNPJ no banco de dados
    const user = db.users.find(user => user.cpfCnpj === cpfCnpj);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('CPF/CNPJ ou senha inválidos');
    }

    // Cria e retorna o token JWT
    const token = jwt.sign({ cpfCnpj: user.cpfCnpj, id: user.id }, secretKey);
    res.json({ token });
  });
});

app.post('/signup', (req, res) => {
    const { cpfCnpj, password } = req.body;
  
    // Lê o arquivo db.json
    fs.readFile('db.json', (err, data) => {
      if (err) {
        console.error('Erro ao ler o arquivo db.json:', err);
        return res.status(500).send('Erro interno do servidor');
      }
  
      let db = JSON.parse(data);
      // Verifica se o CPF/CNPJ já existe no banco de dados
      if (db.users.find(user => user.cpfCnpj === cpfCnpj)) {
        return res.status(400).send('CPF/CNPJ já cadastrado');
      }
  
      // Hash da senha antes de salvar no banco de dados
      const hashedPassword = bcrypt.hashSync(password, 10);
  
      // Adiciona o novo usuário ao banco de dados com a data de criação
      const newUser = {
        cpfCnpj,
        password: hashedPassword,
        createdAt: new Date()
      };
      db.users.push(newUser);
  
      // Escreve o arquivo db.json atualizado
      fs.writeFile('db.json', JSON.stringify(db, null, 2), (err) => {
        if (err) {
          console.error('Erro ao escrever o arquivo db.json:', err);
          return res.status(500).send('Erro interno do servidor');
        }
        res.status(201).json(newUser);
      });
    });
  });

// Rota para obter todos os usuários
app.get('/users', (req, res) => {
  // Lê o arquivo db.json
  fs.readFile('db.json', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo db.json:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    let db = JSON.parse(data);
    res.json(db.users);
  });
});

// Rota protegida
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: `Autenticado como ${req.user.cpfCnpj}` });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
