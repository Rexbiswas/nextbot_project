(() => {
  'use strict';

  // --- UI elements
  const micBtn = document.getElementById('micBtn');
  const clearBtn = document.getElementById('clearBtn');
  const chat = document.getElementById('chat');
  const inputForm = document.getElementById('inputForm');
  const textInput = document.getElementById('textInput');
  const reminderListEl = document.getElementById('reminderList');
  const todoListEl = document.getElementById('todoList');
  const assistantModal = document.getElementById('assistantModal');
  const closeAssistant = document.getElementById('closeAssistant');
  const letsTalkBtn = document.getElementById('letsTalkBtn');

  // --- nextbot personality
  const NEXTBOT = {
    name: 'nextbot',
    voice: 'en-US',
    rate: 0.95,
    pitch: 0.9,
    volume: 1,
    greetings: [
      "Hello! I'm nextbot. How can I help you today?",
      "Hey there! nextbot here, ready to assist.",
      "Greetings! I'm nextbot. What can I do for you?",
      "nextbot online. How may I be of service?",
      "Hi! This is nextbot. How can I assist you today?"
    ],
    acknowledgements: [
      "Got it!", "Done!", "Sure thing!", "Alright!", "Processing now.", "Consider it done.", "Will do."
    ],
    errors: [
      "I'm sorry, I didn't understand that.",
      "Could you rephrase that?",
      "I'm not sure what you mean.",
      "Could you be more specific?",
      "I didn't catch that. Please try again."
    ]
  };

  // --- API Base
  const API_BASE = '/api';

  async function apiCall(endpoint, method = 'GET', body = null) {
    const token = window.auth?.getToken();
    if (!token) return null;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, options);
      if (res.status === 401 || res.status === 403) {
        window.auth.logout();
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  }

  // --- Enhanced Speech setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = NEXTBOT.voice;
  }

  // --- Advanced TTS
  function speak(text, options = {}) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    const user = window.auth?.getCurrentUser?.();
    const userSettings = user?.settings || {};

    ut.rate = options.rate || userSettings.voiceRate || NEXTBOT.rate;
    ut.pitch = options.pitch || userSettings.voicePitch || NEXTBOT.pitch;
    ut.volume = options.volume || userSettings.voiceVolume || NEXTBOT.volume;
    ut.lang = options.lang || userSettings.language || NEXTBOT.voice;
    
    const voices = speechSynthesis.getVoices();
    let preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced'));
    if (preferred) ut.voice = preferred;
    window.speechSynthesis.speak(ut);
  }

  function appendMessage(text, who = 'bot', options = {}) {
    if (!chat) return;
    const el = document.createElement('div');
    el.className = `message ${who}`;
    
    if (options.typing && who === 'bot') {
      el.textContent = '';
      el.classList.add('typing');
      chat.appendChild(el);
      chat.scrollTop = chat.scrollHeight;
      
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          el.textContent += text[i];
          chat.scrollTop = chat.scrollHeight;
          i++;
        } else {
          el.classList.remove('typing');
          clearInterval(typingInterval);
        }
      }, 20);
    } else {
      el.textContent = text;
      chat.appendChild(el);
      chat.scrollTop = chat.scrollHeight;
    }
  }

  function jarvisSpeak(text, showTyping = true) {
    appendMessage(text, 'bot', { typing: showTyping });
    speak(text);
  }

  function jarvisAcknowledge() {
    const msg = NEXTBOT.acknowledgements[Math.floor(Math.random() * NEXTBOT.acknowledgements.length)];
    speak(msg);
  }

  // --- Data & Sync
  let currentReminders = [];
  let currentTasks = [];

  async function syncData() {
    if (!window.auth?.isLoggedIn()) return;
    const [rems, tasks] = await Promise.all([
      apiCall('/reminders'),
      apiCall('/tasks')
    ]);
    if (rems) {
      currentReminders = rems;
      rems.forEach(r => scheduleReminder(r));
      renderReminders();
    }
    if (tasks) {
      currentTasks = tasks;
      renderTodos();
    }
  }

  // --- Reminder Scheduling
  let scheduledTimeouts = {};

  function scheduleReminder(reminder) {
    const id = reminder._id;
    const targetTime = new Date(reminder.time).getTime();
    const ms = targetTime - Date.now();

    if (ms <= 0) {
      triggerReminder(reminder);
      return;
    }

    if (scheduledTimeouts[id]) clearTimeout(scheduledTimeouts[id]);
    scheduledTimeouts[id] = setTimeout(() => {
      triggerReminder(reminder);
      delete scheduledTimeouts[id];
    }, ms);
  }

  async function triggerReminder(reminder) {
    const text = `Reminder: ${reminder.text}`;
    jarvisSpeak(text);
    await apiCall(`/reminders/${reminder._id}`, 'DELETE');
    currentReminders = currentReminders.filter(r => r._id !== reminder._id);
    renderReminders();
  }

  // --- UI Rendering
  function renderReminders() {
    if (!reminderListEl) return;
    const rems = currentReminders.sort((a, b) => new Date(a.time) - new Date(b.time));
    reminderListEl.innerHTML = rems.length ? '' : '<li>No active reminders</li>';
    rems.forEach(r => {
      const li = document.createElement('li');
      const when = new Date(r.time);
      const now = Date.now();
      const msUntil = when - now;
      const timeUntil = msUntil > 0 ? formatTimeUntil(msUntil) : 'Overdue';
      li.innerHTML = `<div><strong>${r.text}</strong><small>${when.toLocaleString()}</small><small style="color:#3498db">⏱ ${timeUntil}</small></div>`;
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.onclick = async () => {
        await apiCall(`/reminders/${r._id}`, 'DELETE');
        currentReminders = currentReminders.filter(x => x._id !== r._id);
        renderReminders();
        jarvisAcknowledge();
      };
      li.appendChild(del);
      reminderListEl.appendChild(li);
    });
  }

  function renderTodos() {
    if (!todoListEl) return;
    todoListEl.innerHTML = currentTasks.length ? '' : '<li>No tasks</li>';
    currentTasks.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<div><strong${t.done ? ' style="text-decoration:line-through; opacity:0.6"' : ''}>${t.text}</strong></div>`;
      const toggle = document.createElement('button');
      toggle.textContent = t.done ? 'Undo' : 'Done';
      toggle.onclick = async () => {
        const updated = await apiCall(`/tasks/${t._id}`, 'PUT', { done: !t.done });
        if (updated) { t.done = updated.done; renderTodos(); speak(t.done ? 'Task marked complete' : 'Task restored'); }
      };
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.onclick = async () => {
        await apiCall(`/tasks/${t._id}`, 'DELETE');
        currentTasks = currentTasks.filter(item => item._id !== t._id);
        renderTodos();
        jarvisAcknowledge();
      };
      li.appendChild(toggle);
      li.appendChild(del);
      todoListEl.appendChild(li);
    });
  }

  function formatTimeUntil(ms) {
    const min = Math.floor(ms / 60000);
    const hrs = Math.floor(min / 60);
    if (hrs > 0) return `${hrs}h ${min % 60}m`;
    if (min > 0) return `${min}m`;
    return `${Math.floor(ms / 1000)}s`;
  }

  // --- Command Logic
  async function parseAndExecute(text) {
    text = text.trim();
    if (!text) return;
    appendMessage(text, 'user');

    if (/^(hi|hello|hey|good)/i.test(text)) {
      jarvisSpeak(NEXTBOT.greetings[Math.floor(Math.random() * NEXTBOT.greetings.length)]);
      return;
    }

    if (/remind me (?:to|about) (.+?) (?:in|after) (\d+)\s*(seconds?|minutes?|hours?|days?)/i.test(text)) {
       // ... existing logic for time patterns ...
       const match = text.match(/remind me (?:to|about) (.+?) (?:in|after) (\d+)\s*(seconds?|minutes?|hours?|days?)/i);
       const what = match[1];
       const amt = parseInt(match[2], 10);
       const unit = match[3].toLowerCase();
       let ms = amt * (unit.startsWith('sec') ? 1000 : unit.startsWith('min') ? 60000 : unit.startsWith('hour') ? 3600000 : 86400000);
       const target = new Date(Date.now() + ms);
       const res = await apiCall('/reminders', 'POST', { text: what, time: target });
       if (res) { currentReminders.push(res); scheduleReminder(res); jarvisSpeak(`I'll remind you to ${what} in ${amt} ${unit}.`); renderReminders(); }
       return;
    }

    const todoAdd = text.match(/(?:add|create|new)\s+(?:todo|task)\s+:?\s*(.+)/i);
    if (todoAdd) {
       const res = await apiCall('/tasks', 'POST', { text: todoAdd[1] });
       if (res) { currentTasks.push(res); jarvisSpeak(`Added task: ${todoAdd[1]}`); renderTodos(); }
       return;
    }

    // Local Pattern Matcher (Fallback if bridge fails)
    const openMatch = text.match(/(?:open|launch|run|start)\s+(.+)/i);
    if (openMatch) {
       const what = openMatch[1].trim().toLowerCase();
       // First try desktop bridge
       try {
         const response = await fetch('/command', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ command: text })
         });
         const data = await response.json();
         if (data.status === 'success') {
             jarvisSpeak(data.message);
             return;
         }
       } catch (e) { }

       // Fallback for known mobile-style apps
       if (what.includes('word')) window.open('https://office.live.com/start/Word.aspx');
       else if (what.includes('excel')) window.open('https://office.live.com/start/Excel.aspx');
       else window.open(`https://www.google.com/search?q=${encodeURIComponent(what)}`, '_blank');
       jarvisSpeak(`Opening search for: ${what}`);
       return;
    }
  }

  // --- Listeners
  if (inputForm) inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    parseAndExecute(textInput.value);
    textInput.value = '';
  });

  if (recognition && micBtn) {
    micBtn.onclick = () => {
      try { recognition.start(); micBtn.textContent = 'Listening...'; } catch(e) { recognition.stop(); micBtn.textContent = 'Start'; }
    };
    recognition.onresult = (e) => {
      const final = e.results[e.results.length - 1][0].transcript;
      parseAndExecute(final);
      micBtn.textContent = 'Start';
    };
    recognition.onend = () => { micBtn.textContent = 'Start'; };
  }

  // --- Init
  (function init() {
    if (window.auth?.isLoggedIn()) syncData();
    else { renderTodos(); renderReminders(); }
    setTimeout(() => {
        const g = NEXTBOT.greetings[Math.floor(Math.random() * NEXTBOT.greetings.length)];
        jarvisSpeak(g);
    }, 1000);
  })();

})();