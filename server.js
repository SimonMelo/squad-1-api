const express = require("express")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const jsonfile = require("jsonfile")

const app = express()
const PORT = 3000
const dbFilePath = "./db.json"
const secretKey = "yourSecretKey"

const generateNewToken = (nextUserId) => {
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' })
}

app.use(bodyParser.json())

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403)
      }
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

// Função para ler o arquivo JSON
const readDBFile = async () => {
  try {
    const data = await jsonfile.readFile(dbFilePath)
    return data
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error)
    throw error
  }
}

// Função para escrever no arquivo JSON
const writeDBFile = async (data) => {
  try {
    await jsonfile.writeFile(dbFilePath, data, { spaces: 2 })
  } catch (error) {
    console.error("Erro ao escrever no arquivo JSON:", error)
    throw error
  }
}

app.post("/login", async (req, res) => {
  const { cpfCnpj, password } = req.body

  try {
    const db = await readDBFile()
    const user = db.users.find((user) => user.cpfCnpj === cpfCnpj)

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send("CPF/CNPJ ou senha inválidos")
    }

    const token = jwt.sign({ cpfCnpj: user.cpfCnpj, id: user.id }, secretKey)
    res.json({ token })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    res.status(500).send("Erro interno do servidor")
  }
})

app.post("/signup", async (req, res) => {
  const { name, cpfCnpj, email, confirmEmail, password, confirmPassword } =
    req.body

  if (!name || !cpfCnpj || !email || !confirmEmail || !password || !confirmPassword) {
    return res.status(400).send("Todos os campos são obrigatórios")
  }

  if (password !== confirmPassword) {
    return res.status(400).send("As senhas não coincidem")
  }

  if (email !== confirmEmail) {
    return res.status(400).send("Os e-mails não coincidem")
  }

  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return res.status(400).send("CPF/CNPJ inválido")
  }

  try {
    const db = await readDBFile()

    if (db.users.some((user) => user.cpfCnpj === cpfCnpj)) {
      return res.status(400).send("CPF/CNPJ já cadastrado")
    }

    if (db.users.some((user) => user.email === email)) {
      return res.status(400).send("E-mail já cadastrado")
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = { id: db.nextUserId++, name, cpfCnpj, email, password: hashedPassword, createdAt: new Date() }

    db.users.push(newUser)
    await writeDBFile(db)

    res.status(201).json(newUser)
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)
    res.status(500).send("Erro interno do servidor")
  }
})

app.get("/users", async (req, res) => {
  try {
    const db = await readDBFile()
    res.json(db.users)
  } catch (error) {
    console.error("Erro ao obter usuários:", error)
    res.status(500).send("Erro interno do servidor")
  }
})

app.post("/reset-password", async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).send("Todos os campos são obrigatórios")
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).send("As senhas não coincidem")
  }

  try {
    const db = await readDBFile()
    const userIndex = db.users.findIndex((user) => user.email === email)

    if (userIndex === -1) {
      return res.status(404).send("E-mail não encontrado")
    }

    // Atualiza a senha do usuário
    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    db.users[userIndex].password = hashedPassword

    await writeDBFile(db)

    res.status(200).send("Senha resetada com sucesso")
  } catch (error) {
    console.error("Erro ao resetar senha:", error)
    res.status(500).send("Erro interno do servidor")
  }
})

app.post("/reset-token", authenticateJWT, (req, res)=> {
  try {
    const newToken = generateNewToken(req.user.userId)
    res.json({ token: newToken })
  } catch (error) {
    console.error(`Erro ao resetar token: ${error}`)
    res.status(500).send("Erro interno do servidor")
  }
})

app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: `Autenticado como ${req.user.cpfCnpj}` })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
