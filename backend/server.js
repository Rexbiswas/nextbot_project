import dotenv from 'dotenv';
import path from 'path';
// Load environment variables silently
dotenv.config({ path: path.resolve(process.cwd(), '.env'), debug: false });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import { processCommand } from './commandProcessor.js';

const app = express();
const PORT = process.env.PORT || 3002;

// --- Security & Middleware ---
app.use(helmet());
app.use(cors()); // Allow all origins for unbridged access (adjust for production)
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nextbot';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('\x1b[36m%s\x1b[0m', ' NEXTBOT MEMORY: CLOUD CONNECTED');
    safeLog({ level: 'info', message: 'Database Connected Successfully' });
  })
  .catch(err => {
    console.error('\x1b[31m%s\x1b[0m', ' CLOUD MEMORY WARNING: Database Offline. Running in Local Mode.');
    console.error(`Reason: ${err.message}`);
  });

// --- Schemas ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  settings: {
    theme: { type: String, default: 'dark' },
    voiceRate: { type: Number, default: 1 },
    voicePitch: { type: Number, default: 1 },
    voiceVolume: { type: Number, default: 1 },
    language: { type: String, default: 'en-US' }
  },
  memory: {
    lastCommands: { type: [String], default: [] },
    favoriteFolders: { type: [String], default: [] },
    context: { type: Object, default: {} }
  },
  faceDescriptor: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  platform: { type: String, enum: ['desktop', 'mobile', 'web'], default: 'desktop' },
  messages: [{
    role: { type: String, enum: ['user', 'bot'], required: true },
    content: { type: String, required: true },
    intent: { type: String }, // AI Intent detected
    timestamp: { type: Date, default: Date.now }
  }]
});

const logSchema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  message: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now }
});

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  time: { type: Date, required: true },
  isFired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Log = mongoose.model('Log', logSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const Task = mongoose.model('Task', taskSchema);

// --- Helpers ---
const safeLog = async (data) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Log.create(data);
    } else {
      console.log(`[Nextbot Internal Log]: ${data.message}`);
    }
  } catch (e) {
    console.warn("[Log Sync Failed]");
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.id;
    next();
  });
};

// --- Routes ---

// 1. Health Check
app.get('/', (req, res) => res.send({ status: 'NextBot Server Online', version: '1.0.0' }));

// 2. Auth: Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 3. Auth: Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    res.json({ token, username: user.username, settings: user.settings, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 4. Update Settings
app.put('/api/user/settings', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { settings: req.body }, { new: true });
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 5. Update Face Data
app.put('/api/user/face', verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;
    await User.findByIdAndUpdate(req.userId, { faceDescriptor: descriptor });
    res.json({ message: 'Face data updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update face data' });
  }
});

// 6. Face Login
app.post('/api/login/face', async (req, res) => {
  try {
    const { descriptor } = req.body;
    const users = await User.find({ faceDescriptor: { $exists: true, $not: { $size: 0 } } });
    
    let bestMatch = { user: null, distance: 1.0 };
    users.forEach(user => {
      const storedDesc = user.faceDescriptor;
      const distance = Math.sqrt(
        descriptor.reduce( (sum, val, i) => sum + Math.pow(val - storedDesc[i], 2), 0)
      );
      if (distance < bestMatch.distance) {
        bestMatch = { user, distance };
      }
    });

    if (bestMatch.distance < 0.5) {
      const user = bestMatch.user;
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
      return res.status(200).json({ token, username: user.username, settings: user.settings, userId: user._id });
    }
    res.status(401).json({ error: 'Face not recognized' });
  } catch (error) {
    res.status(500).json({ error: 'Face login failed' });
  }
});

// 4. Advanced Command Execution (Local System Interaction)
app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  
  try {
    const result = await processCommand(command);
    
    // Log intent/action
    if (result.status === 'success') {
      safeLog({ level: 'info', message: `Command: ${command}`, metadata: { result: result.message } });
    } else {
      safeLog({ level: 'warn', message: `Command Unhandled: ${command}` });
    }

    res.json(result);
  } catch (error) {
    console.error(`[Processor Error]: ${error}`);
    safeLog({ level: 'error', message: `Command failed: ${command}`, metadata: { error: error.toString() } });
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 5. Store Conversation (AI Context)
app.post('/api/conversation', verifyToken, async (req, res) => {
  try {
    const { platform, messages } = req.body;
    // Find active conversation or create new
    // For simplicity, just logging or creating new entries
    const conv = await Conversation.create({
      userId: req.userId,
      platform,
      messages
    });
    res.status(201).json({ id: conv._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save context' });
  }
});

// 6. Get History
app.get('/api/history', verifyToken, async (req, res) => {
  try {
    const history = await Conversation.find({ userId: req.userId }).sort({ _id: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 7. Reminders (CRUD)
app.get('/api/reminders', verifyToken, async (req, res) => {
  const rems = await Reminder.find({ userId: req.userId, isFired: false }).sort({ time: 1 });
  res.json(rems);
});

app.post('/api/reminders', verifyToken, async (req, res) => {
  const { text, time } = req.body;
  const rem = await Reminder.create({ userId: req.userId, text, time });
  res.status(201).json(rem);
});

app.delete('/api/reminders/:id', verifyToken, async (req, res) => {
  await Reminder.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: 'Deleted' });
});

// 8. Tasks (CRUD)
app.get('/api/tasks', verifyToken, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  const { text } = req.body;
  const task = await Task.create({ userId: req.userId, text });
  res.status(201).json(task);
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  const { done } = req.body;
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { done }, { new: true });
  res.json(task);
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: 'Deleted' });
});

app.delete('/api/tasks', verifyToken, async (req, res) => {
   await Task.deleteMany({ userId: req.userId });
   res.json({ message: 'Cleared all tasks' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log('\x1b[35m%s\x1b[0m', ' NEXTBOT UNBRIDGED SERVER LIVE');
  console.log('\x1b[2m%s\x1b[0m', ` > Endpoint: http://localhost:${PORT}`);
  console.log('-------------------------------------------');
});
