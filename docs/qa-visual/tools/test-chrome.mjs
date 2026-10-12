import { spawn } from 'node:child_process';
import http from 'node:http';

async function main() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--remote-allow-origins=*'
  ]);

  chrome.stderr.on('data', (d) => process.stderr.write(d.toString()));
  
  // wait for port
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  console.log('WS URL:', wsUrl);
  chrome.kill();
}

main().catch(console.error);
