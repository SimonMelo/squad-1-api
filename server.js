const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const SignupUser = require("./models/userSign");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Configuração da chave secreta para o JWT
const secretKey = "yourSecretKey";

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
app.post("/login", async (req, res) => {
  const { cpfCnpj, password } = req.body;

  try {
    // Consulta o usuário pelo CPF/CNPJ no banco de dados
    const user = await SignupUser.findOne({ where: { cpfCnpj } });

    // Verifica se o usuário existe e se a senha está correta
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send("CPF/CNPJ ou senha inválidos");
    }

    // Cria e retorna o token JWT
    const token = jwt.sign({ cpfCnpj: user.cpfCnpj, id: user.id }, secretKey);
    res.json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

app.post("/signup", async (req, res) => {
  const { name, cpfCnpj, email, confirmEmail, password, confirmPassword } =
    req.body;

  if (
    !name ||
    !cpfCnpj ||
    !email ||
    !confirmEmail ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).send("Todos os campos são obrigatórios");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("As senhas não coincidem");
  }

  if (email !== confirmEmail) {
    return res.status(400).send("Os e-mails não coincidem");
  }

  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return res.status(400).send("CPF/CNPJ inválido");
  }

  try {
    // Verifica se o CPF/CNPJ e o e-mail já existem no banco de dados
    const existingUserCpfCnpj = await SignupUser.findOne({
      where: { cpfCnpj },
    });
    if (existingUserCpfCnpj) {
      return res.status(400).send("CPF/CNPJ já cadastrado");
    }

    const existingUserEmail = await SignupUser.findOne({ where: { email } });
    if (existingUserEmail) {
      return res.status(400).send("E-mail já cadastrado");
    }

    // Hash da senha antes de salvar no banco de dados
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Cria o novo usuário no banco de dados
    const newUser = await SignupUser.create({
      name,
      cpfCnpj,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

// Rota para obter todos os usuários
app.get("/users", async (req, res) => {
  try {
    // Consulta todos os usuários no banco de dados
    const users = await SignupUser.findAll();

    // Retorna os usuários encontrados
    res.json(users);
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

// Rota protegida
app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: `Autenticado como ${req.user.cpfCnpj}` });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
