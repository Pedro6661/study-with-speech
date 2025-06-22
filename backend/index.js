const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Study With Speech rodando!' });
});

// Rotas de exemplo
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/messages', async (req, res) => {
  const messages = await prisma.message.findMany({ include: { user: true } });
  res.json(messages);
});

app.get('/suggestions', async (req, res) => {
  const suggestions = await prisma.suggestion.findMany();
  res.json(suggestions);
});

// Middleware para autenticação JWT
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// Criar mensagem (autenticado)
app.post('/messages', authMiddleware, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo obrigatório.' });
  try {
    // Salva a mensagem do usuário
    const userMessage = await prisma.message.create({
      data: {
        content,
        userId: req.userId
      },
      include: { user: true }
    });

    // Chama a API do Groq
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY não configurada.' });
    }
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'Você é um assistente educacional que responde de forma clara e didática.' },
          { role: 'user', content }
        ]
      })
    });
    const groqData = await groqRes.json();
    console.log('Resposta da Groq:', JSON.stringify(groqData, null, 2));
    const aiResponse = groqData.choices?.[0]?.message?.content;
    if (!aiResponse) {
      return res.status(500).json({ error: 'Não foi possível obter resposta da IA.', groqData });
    }

    // Salva a resposta do bot no banco
    const botMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        userId: req.userId
      }
    });

    // Retorna ambos para o frontend
    res.status(201).json({
      userMessage,
      botMessage
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar mensagem ou consultar IA.' });
  }
});

// Criar sugestão (autenticado)
app.post('/suggestions', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto obrigatório.' });
  try {
    const suggestion = await prisma.suggestion.create({
      data: { text }
    });
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar sugestão.' });
  }
});

// Registro de usuário
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email já cadastrado.' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name }
    });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// Login de usuário
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Curtir uma mensagem
app.post('/messages/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const message = await prisma.message.update({
      where: { id: Number(id) },
      data: { likes: { increment: 1 } }
    });
    res.json({ likes: message.likes });
  } catch (err) {
    res.status(404).json({ error: 'Mensagem não encontrada.' });
  }
});

// Não curtir uma mensagem
app.post('/messages/:id/dislike', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const message = await prisma.message.update({
      where: { id: Number(id) },
      data: { dislikes: { increment: 1 } }
    });
    res.json({ dislikes: message.dislikes });
  } catch (err) {
    res.status(404).json({ error: 'Mensagem não encontrada.' });
  }
});

// Atualizar imagem de perfil do usuário autenticado
app.patch('/profile-image', authMiddleware, async (req, res) => {
  const { profileImage } = req.body;
  if (!profileImage) return res.status(400).json({ error: 'Imagem não fornecida.' });
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { profileImage }
    });
    res.json({ profileImage: user.profileImage });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar imagem de perfil.' });
  }
});

// Listar mensagens salvas do usuário autenticado
app.get('/saved-messages', authMiddleware, async (req, res) => {
  try {
    const saved = await prisma.savedMessage.findMany({
      where: { userId: req.userId },
      include: { message: true }
    });
    res.json(saved.map(s => ({
      id: s.id,
      messageId: s.messageId,
      content: s.message.content,
      createdAt: s.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens salvas.' });
  }
});

// Salvar uma mensagem
app.post('/saved-messages', authMiddleware, async (req, res) => {
  const { messageId } = req.body;
  if (!messageId) return res.status(400).json({ error: 'messageId obrigatório.' });
  try {
    // Evitar duplicidade
    const exists = await prisma.savedMessage.findFirst({ where: { userId: req.userId, messageId: Number(messageId) } });
    if (exists) return res.status(409).json({ error: 'Mensagem já salva.' });
    const saved = await prisma.savedMessage.create({
      data: { userId: req.userId, messageId: Number(messageId) }
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    res.status(500).json({ error: 'Erro ao salvar mensagem.' });
  }
});

// Remover uma mensagem salva
app.delete('/saved-messages/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.savedMessage.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover mensagem salva.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 