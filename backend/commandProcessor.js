import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Advanced Command Processor for Nextbot
 * Handles system-level interactions across various domains.
 */
export const processCommand = async (rawCommand) => {
  const command = rawCommand.toLowerCase().trim();
  console.log(`[Processor] Processing command: ${command}`);

  // Helpers for common paths
  const userHome = os.homedir();
  const downloadsPath = path.join(userHome, 'Downloads');
  const documentsPath = path.join(userHome, 'Documents');
  const picturesPath = path.join(userHome, 'Pictures');

  // --- 1. App Launchers & Web Links ---
  const appMap = {
    // Standard Apps
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
    'system info': 'msinfo32',
    'notes': 'start notepad',
    'file explorer': 'explorer',

    'python idle': 'idle',
    'git bash': 'start sh --login',
    'xampp': 'start "" "C:\\xampp\\xampp-control.exe"',
    'pycharm': 'start pycharm',
    'mysql workbench': 'start MySQLWorkbench',
    'adobe indesign': 'start indesign',
    'visual studio installer': 'start "" "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\setup.exe"',
    'mongodb': 'start mongosh',
    'canva': 'start https://www.canva.com',
    'adobe illustrator': 'start illustrator',
    'cursor': 'start cursor',
    'mysql 5.5': 'start mysql',
    'turbo c++': 'start "" "C:\\TurboC7\\TC.exe"',
    'figma': 'start figma',
    'atom': 'start atom',
    'r language': 'start RGui',
    'docker desktop': 'start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
    'adobe photoshop': 'start photoshop',
    'sublime text': 'start subl',
    'rstudio': 'start rstudio',
    'cleaner': 'cmd /c start /wait cleanmgr /sagerun:1',
    'coreldraw': 'start coreldrw',
    'antigravity': `echo Antigravity stands ready to assist you.`,
    'anydesk': 'start anydesk',

    // Locations
    'downloads': `explorer "${downloadsPath}"`,
    'documents': `explorer "${documentsPath}"`,
    'pictures': `explorer "${picturesPath}"`,
    'project folder': `explorer "${process.cwd()}"`,

    // Web Links
    'gmail': 'start https://mail.google.com',
    'youtube': 'start https://www.youtube.com',
    'github': 'start https://www.github.com',
    'ai tools': 'start https://chatgpt.com',
    'wikipedia': 'start https://en.wikipedia.org',
    'weather': 'start https://www.google.com/search?q=weather',
    'news': 'start https://news.google.com',

    // System Protocols
    'camera': 'start microsoft.windows.camera:',
    'calendar': 'start outlookcal:',
    'maps': 'start bingmaps:',
    'whatsapp': 'start whatsapp:',
    'timer': 'start ms-clock:',
    'alarm': 'start ms-clock:',
    'bluetooth': 'start ms-settings:bluetooth'
  };

  // Direct matches for opening apps
  const triggers = ['open ', 'launch ', 'start ', 'run '];
  for (const [key, cmd] of Object.entries(appMap)) {
    const isMatched = triggers.some(t => command.includes(t + key)) || command === key;
    if (isMatched) {
      try {
        // Use cmd /c for 'start' commands to ensure proper shell execution
        const finalCmd = cmd.startsWith('start') ? `cmd /c ${cmd}` : cmd;
        await execAsync(finalCmd);
        return { status: 'success', message: `Opened ${key}` };
      } catch (err) {
        console.error(`[Processor] Failed to open ${key}:`, err);
        return { status: 'error', message: `Could not open ${key}. Is it installed?` };
      }
    }
  }

  // --- 1.1 Universal Fallback (Try opening anything requested) ---
  const universalTrigger = triggers.find(t => command.startsWith(t));
  if (universalTrigger) {
    const unknownApp = command.replace(universalTrigger, '').trim();
    if (unknownApp && !appMap[unknownApp]) {
       try {
         // Attempt to start the app directly via shell
         await execAsync(`cmd /c start ${unknownApp}`);
         return { status: 'success', message: `Successfully launched ${unknownApp}` };
       } catch (e) {
         // If start fails, we let it fall through to other handlers or web search
         console.log(`[Processor] Universal launch failed for: ${unknownApp}`);
       }
    }
  }

  // --- 2. Web Search & Information ---
  if (command.includes('google search ') || command.includes('search google ') || command.includes('google ')) {
    const query = command.replace(/google search |search google |google /i, '');
    await execAsync(`start https://www.google.com/search?q="${encodeURIComponent(query)}"`);
    return { status: 'success', message: `Searching Google for ${query}` };
  }

  if (command.includes('youtube search ') || command.includes('search youtube ') || command.includes('youtube ')) {
    const query = command.replace(/youtube search |search youtube |youtube /i, '');
    await execAsync(`start https://www.youtube.com/results?search_query="${encodeURIComponent(query)}"`);
    return { status: 'success', message: `Searching YouTube for ${query}` };
  }

  if (command.includes('wikipedia search ') || command.includes('search wikipedia ') || command.includes('wikipedia ')) {
    const query = command.replace(/wikipedia search |search wikipedia |wikipedia /i, '');
    await execAsync(`start https://en.wikipedia.org/wiki/Special:Search?search="${encodeURIComponent(query)}"`);
    return { status: 'success', message: `Searching Wikipedia for ${query}` };
  }

  if (command.includes('search on desktop ')) {
    const query = command.replace('search on desktop ', '');
    await execAsync(`start explorer "search-ms:query=${query}"`);
    return { status: 'success', message: `Searching desktop for ${query}` };
  }

  // --- 3. System Controls ---
  const sysControls = {
    'shutdown computer': 'shutdown /s /t 0',
    'restart computer': 'shutdown /r /t 0',
    'lock computer': 'rundll32.exe user32.dll,LockWorkStation',
    'mute system': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]173)"',
    'increase volume': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]175)"',
    'decrease volume': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]174)"',
    'play music': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]179)"',
    'pause music': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]179)"',
    'stop music': 'powershell -Command "(new-object -com wscript.shell).SendKeys([char]178)"',
    'take screenshot': 'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'{PRTSC}\')"',
    'check cpu usage': 'powershell -Command "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty LoadPercentage"',
    'check memory usage': 'powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object @{Name=\'Used\';Expression={($_.TotalVisibleMemorySize - $_.FreePhysicalMemory) / 1024 / 1024}}" ',
    'enable wifi': 'netsh interface set interface "Wi-Fi" enabled',
    'disable wifi': 'netsh interface set interface "Wi-Fi" disabled',
    'check battery': 'powershell -Command "Get-CimInstance Win32_Battery | Select-Object -ExpandProperty EstimatedChargeRemaining"',
    'open task manager': 'start taskmgr',
    'set alarm': 'start ms-clock:',
    'set timer': 'start ms-clock:',
    'show schedule': 'start outlookcal:',
    'search location': 'start bingmaps:',
    'minimize window': 'powershell -Command "(new-object -com wscript.shell).SendKeys(\'(% )n\')"',
    'maximize window': 'powershell -Command "(new-object -com wscript.shell).SendKeys(\'(% )x\')"',
    'start focus mode': 'start ms-settings:quietmoments',
    'stop focus mode': 'start ms-settings:quietmoments',
  };

  for (const [key, cmd] of Object.entries(sysControls)) {
    if (command.includes(key)) {
      const { stdout } = await execAsync(cmd);
      let msg = `Executed ${key}`;
      if (key.includes('usage') || key.includes('battery')) {
        msg = `${key}: ${stdout.trim()}${key.includes('usage') ? '%' : ''}`;
      }
      return { status: 'success', message: msg };
    }
  }

  // --- 4. File Management & Folder Operations ---
  if (command.includes('copy file ')) {
     const parts = command.replace('copy file ', '').split(' to ');
     if (parts.length === 2) {
       fs.copyFileSync(path.join(documentsPath, parts[0].trim()), path.join(documentsPath, parts[1].trim()));
       return { status: 'success', message: `Copied ${parts[0]} to ${parts[1]}` };
     }
  }

  if (command.includes('move file ') || command.includes('rename file ')) {
     const action = command.includes('move file ') ? 'move file ' : 'rename file ';
     const parts = command.replace(action, '').split(' to ');
     if (parts.length === 2) {
       fs.renameSync(path.join(documentsPath, parts[0].trim()), path.join(documentsPath, parts[1].trim()));
       return { status: 'success', message: `${action.charAt(0).toUpperCase() + action.slice(1)} completed.` };
     }
  }

  if (command.includes('create new folder ') || command.includes('create folder ')) {
    const folderName = command.replace(/create new folder |create folder /i, '').trim();
    const folderPath = path.join(documentsPath, folderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      return { status: 'success', message: `Created folder "${folderName}" in Documents` };
    }
    return { status: 'error', message: 'Folder already exists' };
  }

  if (command.includes('delete file ')) {
    const fileName = command.replace('delete file ', '');
    const filePath = path.join(documentsPath, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { status: 'success', message: `Deleted file ${fileName}` };
    }
    return { status: 'error', message: 'File not found' };
  }

  if (command.includes('search file ')) {
    const fileName = command.replace('search file ', '').trim();
    const { stdout } = await execAsync(`powershell -Command "Get-ChildItem -Path '${userHome}' -Filter '*${fileName}*' -Recurse -Depth 1 | Select-Object -ExpandProperty FullName"`);
    return { status: 'success', message: stdout.trim() || 'No files found within search depth' };
  }

  if (command.includes('clean temporary files') || command.includes('clean temp')) {
    await execAsync('del /q /s %temp%\\*');
    return { status: 'success', message: 'Cleaned temporary files.' };
  }

  if (command.includes('close application')) {
    const appName = command.replace('close application ', '').trim();
    await execAsync(`taskkill /F /IM ${appName}.exe /T`);
    return { status: 'success', message: `Closed ${appName}` };
  }

  // --- 5. Dev / Automation / Git ---
  if (command.includes('pull repository') || command.includes('git pull')) {
    const { stdout } = await execAsync('git pull');
    return { status: 'success', message: `Git Pull: ${stdout.trim()}` };
  }
  if (command.includes('push repository') || command.includes('git push')) {
    const { stdout } = await execAsync('git push');
    return { status: 'success', message: `Git Push: ${stdout.trim()}` };
  }
  if (command.includes('run python file')) {
     const { stdout } = await execAsync('python main.py');
     return { status: 'success', message: `Python output: ${stdout}` };
  }

  // --- 6. AI/Logic Tasks (Summaries, Ideas) ---
  if (command.includes('explain python') || command.includes('what is python')) {
    return { status: 'success', message: 'Python is a high-level, interpreted language known for its readability. It is popular in web, AI, and automation.' };
  }

  if (command.includes('write a c program')) {
     return { status: 'success', message: 'Certainly! Here is a C program:\n#include <stdio.h>\nint main() { printf("Hello World\\n"); return 0; }' };
  }

  if (command.includes('summarize text') || command.includes('explain concept')) {
    return { status: 'success', message: 'Please provide the text you would like me to process.' };
  }

  if (command.includes('generate idea')) {
     return { status: 'success', message: 'How about an AI-powered personal organizer that syncs across all your devices?' };
  }

  // --- 7. Fallback Search ---
  if (command.split(' ').length > 2) {
     await execAsync(`start https://www.google.com/search?q="${encodeURIComponent(rawCommand)}"`);
     return { status: 'success', message: `I searched Google for: ${rawCommand}` };
  }

  return { status: 'unhandled', message: 'I am not sure how to handle that command yet.' };
};
