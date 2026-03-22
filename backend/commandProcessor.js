import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execPromise = promisify(exec);
const userHome = os.homedir();
const documentsPath = path.join(userHome, 'Documents');
const downloadsPath = path.join(userHome, 'Downloads');
const picturesPath = path.join(userHome, 'Pictures');

// --- Python Core Bridge (Phase 4, 6, 8) ---
const callPythonCore = (command, payload = {}) => {
  return new Promise((resolve) => {
    const python = spawn('python', [
      path.join(process.cwd(), 'backend', 'nextbot_core.py'),
      command,
      JSON.stringify(payload)
    ]);

    let data = '';
    python.stdout.on('data', (chunk) => { data += chunk.toString(); });
    python.stderr.on('data', (chunk) => { console.error(`[Python Core Error]: ${chunk}`); });
    python.on('close', () => {
      try {
        resolve(JSON.parse(data.trim() ||'{"status":"error", "message":"Empty output"}'));
      } catch (e) {
        resolve({ status: 'error', message: 'Core bridge failure.' });
      }
    });
  });
};

/**
 * Advanced Command Processor for Nextbot
 * Fulfills Phased Requirements (1-8)
 */
export async function processCommand(command) {
  const rawCommand = command;
  command = command.toLowerCase().trim();

  // --- 1. Application Management (Phase 1) ---
  const appMap = {
    'notepad': 'notepad',
    'excel': 'start excel',
    'word': 'start winword',
    'calculator': 'calc',
    'command prompt': 'start cmd',
    'cmd': 'start cmd',
    'powershell': 'start powershell',
    'terminal': 'start wt || start cmd',
    'chrome': 'start chrome',
    'firefox': 'start firefox',
    'edge': 'start msedge',
    'vs code': 'code',
    'vscode': 'code',
    'task manager': 'start taskmgr',
    'settings': 'start ms-settings:',
    'downloads': `explorer "${downloadsPath}"`,
    'documents': `explorer "${documentsPath}"`,
    'pictures': `explorer "${picturesPath}"`,
    'camera': 'start microsoft.windows.camera:',
    'calendar': 'start outlookcal:',
    'gmail': 'start https://mail.google.com',
    'youtube': 'start https://www.youtube.com',
    'github': 'start https://www.github.com',
    'maps': 'start bingmaps:',
    'weather': 'start https://www.google.com/search?q=weather',
    'news': 'start https://news.google.com',
    'whatsapp': 'start whatsapp:',
    'python idle': 'start pythonw -m idlelib',
    'idle': 'start pythonw -m idlelib',
    'git bash': 'start sh --login',
    'bash': 'start sh --login',
    'xampp': 'start /b "" "C:\\xampp\\xampp-control.exe"',
    'docker': 'start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
    'mysql': 'start MySQLWorkbench',
    'workbench': 'start MySQLWorkbench',
  };

  // Check exact/alias matches
  for (const [key, cmd] of Object.entries(appMap)) {
    if (command === key || command === `open ${key}` || command === `start ${key}` || command === `run ${key}`) {
      try {
        const finalCmd = cmd.startsWith('start') ? `cmd /c ${cmd}` : cmd;
        await execPromise(finalCmd);
        return { status: 'success', message: `Successfully launched ${key}` };
      } catch (err) {
        return { status: 'error', message: `Failed to open ${key}` };
      }
    }
  }

  // --- 2. Web Search & Information (Phase 1, 3) ---
  if (command.includes('google search ') || command.includes('search google ') || command.includes('google ')) {
    const query = command.replace(/google search |search google |google /i, '');
    await execPromise(`start https://www.google.com/search?q="${encodeURIComponent(query)}"`);
    return { status: 'success', message: `Searching Google for ${query}` };
  }

  // --- 3. System Controls (Phase 1, 2, 8) ---
  const sysControls = {
    'shutdown computer': 'shutdown /s /t 60',
    'restart computer': 'shutdown /r /t 60',
    'lock computer': 'rundll32.exe user32.dll,LockWorkStation',
    'mute system': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]173)"',
    'increase volume': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]175)"',
    'decrease volume': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]174)"',
    'take screenshot': 'screenshot_handler', // Special flag
    'analyze vision': 'python_vision',
    'object detection': 'python_vision',
    'organize downloads': 'organize_downloads_handler',
  };

  for (const [key, cmd] of Object.entries(sysControls)) {
    if (command.includes(key)) {
      if (cmd === 'python_vision') {
          const result = await callPythonCore('vision');
          return { status: 'success', message: result.message };
      }
      if (cmd === 'screenshot_handler') {
          const pathShot = path.join(picturesPath, `Nextbot_Shot_${Date.now()}.png`);
          const ps = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen($screen.Location.X, $screen.Location.Y, 0, 0, $screen.Size); $bitmap.Save('${pathShot}', [System.Drawing.Imaging.ImageFormat]::Png); $bitmap.Dispose(); $graphics.Dispose();"`;
          await execPromise(ps);
          return { status: 'success', message: `Screenshot saved to Pictures.` };
      }
      
      const { stdout } = await execPromise(cmd);
      return { status: 'success', message: `Executed ${key}` };
    }
  }

  // --- 4. Task Automation & Multi-Step (Phase 4) ---
  if (command.includes(' and ') || command.includes(' then ')) {
    const steps = command.split(/ and | then /i);
    let logs = [];
    for (const step of steps) {
        const res = await processCommand(step.trim());
        logs.push(res.message);
    }
    return { status: 'success', message: `Sequence Complete: ${logs.join(' -> ')}` };
  }

  // --- 5. File Industry (Phase 4) ---
  const fileMatch = command.match(/(?:create|make)\s+(word|excel|text)\s+(?:file|document)\s+(?:named|called)\s+(.+)/i);
  if (fileMatch) {
    const type = fileMatch[1];
    const name = fileMatch[2].trim();
    const result = await callPythonCore('automate', { action: 'create_file', params: { type, name } });
    return { status: 'success', message: result.message };
  }

  // Final Universal Fallback
  return { status: 'success', message: `I've noted your request: "${rawCommand}". How else can I assist with your system?` };
}
