import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

async function main() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--remote-allow-origins=*',
    '--user-data-dir=/tmp/qa-chrome-profile-' + Date.now()
  ]);

  let targetWsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        targetWsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  console.log('Target WS URL:', targetWsUrl);
  if (!targetWsUrl) {
    chrome.kill();
    return;
  }

  const ws = new WebSocket(targetWsUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating...');
  await send('Page.navigate', { url: 'http://localhost:4173/' });
  await new Promise(r => setTimeout(r, 1000));

  const titleRes = await send('Runtime.evaluate', {
    expression: 'document.title'
  });
  console.log('Page Title:', titleRes.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');
  console.log('Screenshot captured, bytes:', buf.length);

  ws.close();
  chrome.kill();
}

main().catch(console.error);
