import OpenAI from 'openai';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import si from 'systeminformation';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = promisify(exec);
const userHome = os.homedir();
const docPath = path.join(userHome, 'Documents');
const nextbotPath = path.join(docPath, 'Nextbot_Workspace');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
});

// Ensure workspace exists
if (!fs.existsSync(nextbotPath)) fs.mkdirSync(nextbotPath, { recursive: true });

// --- Advanced App Map (Internal Reference) ---
const KERNEL_APP_MAP = {
  'vscode': 'code', 'chrome': 'chrome', 'notepad': 'notepad', 'calculator': 'calc',
  'file explorer': 'explorer', 'task manager': 'taskmgr', 'spotify': 'start spotify:',
  'whatsapp': 'start whatsapp:', 'discord': 'start discord:', 'youtube': 'start https://www.youtube.com'
};

// --- Agent Tools Definition ---
const TOOLS = [
    {
        name: "launch_application",
        description: "Open a specific local desktop application or web portal.",
        parameters: {
            type: "object",
            properties: {
                app_name: { type: "string", description: "Name of the app (e.g., vscode, chrome, notepad)" }
            },
            required: ["app_name"]
        }
    },
    {
        name: "system_control",
        description: "Execute system-level tasks like locking, volume, or screenshots.",
        parameters: {
            type: "object",
            properties: {
                action: { type: "string", enum: ["lock", "screenshot", "volume_up", "volume_down"], description: "System action to trigger" }
            },
            required: ["action"]
        }
    },
    {
        name: "create_workspace_file",
        description: "Generate a new code file in the Nextbot workspace with boilerplate.",
        parameters: {
            type: "object",
            properties: {
                language: { type: "string", enum: ["python", "javascript", "html", "c", "cpp"], description: "Programming language" },
                filename: { type: "string", description: "Name of the file without extension" }
            },
            required: ["language", "filename"]
        }
    },
    {
        name: "get_system_telemetry",
        description: "Fetch real-time CPU, RAM, and hardware health data.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "visualize_environment",
        description: "Trigger the vision module to scan for faces, objects, or UI elements.",
        parameters: { type: "object", properties: {} }
    }
];

// --- Handlers ---
const handlers = {
    launch_application: async ({ app_name }) => {
        const cmd = KERNEL_APP_MAP[app_name.toLowerCase()] || `start ${app_name}`;
        exec(`cmd /c "${cmd}"`);
        return { status: 'success', message: `Neural Link: ${app_name} synchronized and launched.` };
    },
    system_control: async ({ action }) => {
        switch (action) {
            case 'lock': exec('rundll32.exe user32.dll,LockWorkStation'); break;
            case 'screenshot': 
                const pathShot = path.join(path.join(userHome, 'Pictures'), `Nextbot_Sync_${Date.now()}.png`);
                const ps = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $s = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $b = New-Object System.Drawing.Bitmap($s.Width, $s.Height); $g = [System.Drawing.Graphics]::FromImage($b); $g.CopyFromScreen($s.Location.X, $s.Location.Y, 0, 0, $s.Size); $b.Save('${pathShot}', [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose(); $g.Dispose();"`;
                await execPromise(ps);
                return { status: 'success', message: "Neural Snapshot stored in Pictures." };
            case 'volume_up': exec(`powershell -Command "(new-object -com wscript.shell).SendKeys([char]175)"`); break;
            case 'volume_down': exec(`powershell -Command "(new-object -com wscript.shell).SendKeys([char]174)"`); break;
        }
        return { status: 'success', message: `System directive: ${action} executed.` };
    },
    create_workspace_file: async ({ language, filename }) => {
        const extMap = { 'c': 'c', 'python': 'py', 'javascript': 'js', 'html': 'html', 'cpp': 'cpp' };
        const ext = extMap[language] || 'txt';
        const filePath = path.join(nextbotPath, `${filename}.${ext}`);
        const boilerplate = language === 'python' ? 'print("Nextbot Synapse Node: Active")' : '// Nextbot Node';
        fs.writeFileSync(filePath, boilerplate);
        exec(`code "${filePath}"`);
        return { status: 'success', message: `Cognition Manifested: ${filename}.${ext} initialized in workspace.` };
    },
    get_system_telemetry: async () => {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        return { status: 'success', message: `Telemetry: CPU at ${cpu.currentLoad.toFixed(1)}%, RAM at ${((mem.active/mem.total)*100).toFixed(1)}%.` };
    },
    visualize_environment: async () => {
        return new Promise((resolve) => {
           const py = spawn('python', ['backend/nextbot_core.py', 'vision']);
           py.stdout.on('data', (data) => resolve(JSON.parse(data.toString())));
           py.stderr.on('data', () => resolve({ status: 'error', message: 'Vision link failed.' }));
        });
    }
};

export async function processCommand(command) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are the Nextbot Humanoid AI Brain. Use your tools to control the user's system and provide intelligent assistance. Always respond with a futuristic, cybernetic persona." },
                { role: "user", content: command }
            ],
            functions: TOOLS,
            function_call: "auto",
        });

        const message = response.choices[0].message;

        if (message.function_call) {
            const { name, arguments: argsJson } = message.function_call;
            const args = JSON.parse(argsJson);
            
            if (handlers[name]) {
                const result = await handlers[name](args);
                return result;
            }
        }

        return { status: 'success', message: message.content };
    } catch (error) {
        console.error("Agent Brain Error:", error);
        return { status: 'error', message: "Neural Overload: Processing failed. Check link status." };
    }
}
