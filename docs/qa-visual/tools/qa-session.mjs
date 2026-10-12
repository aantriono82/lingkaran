import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'http://localhost:4173';
const OUTPUT_DIR = path.resolve('/home/aantriono/Dev/lingkaran/docs/qa-visual');

const VIEWPORTS = {
  360: { width: 360, height: 800, isMobile: true, dpr: 2 },
  768: { width: 768, height: 1024, isMobile: false, dpr: 1 },
  1280: { width: 1280, height: 800, isMobile: false, dpr: 1 },
  1920: { width: 1920, height: 1080, isMobile: false, dpr: 1 },
  3840: { width: 3840, height: 2160, isMobile: false, dpr: 1 },
  800: { width: 800, height: 360, isMobile: true, dpr: 2 } // Landscape
};

const TOPICS = [
  '01-unsur',
  '02-keliling',
  '03-luas',
  '04-sudut',
  '05-tali-busur',
  '06-segi-empat',
  '07-dalam-segitiga',
  '08-luar-segitiga',
  '09-garis-singgung',
  '10-kedudukan'
];

class ChromeSession {
  constructor() {
    this.chrome = null;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.consoleLogs = [];
    this.networkRequests = [];
  }

  async launch() {
    const profileDir = `/tmp/qa-chrome-${Date.now()}`;
    this.chrome = spawn('google-chrome', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--remote-allow-origins=*',
      `--user-data-dir=${profileDir}`
    ]);

    let targetWsUrl = null;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
        if (res.ok) {
          const data = await res.json();
          targetWsUrl = data.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!targetWsUrl) throw new Error('Failed to get Chrome debugger WebSocket URL');

    this.ws = new WebSocket(targetWsUrl);
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === 'Page.javascriptDialogOpening') {
        // Otomatis tangani dialog javascript seperti confirm/alert agar CDP tidak pernah hang
        this.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
        this.consoleLogs.push({ type: msg.params.type, text, timestamp: Date.now() });
      } else if (msg.method === 'Log.entryAdded') {
        this.consoleLogs.push({ type: msg.params.entry.level, text: msg.params.entry.text, timestamp: Date.now() });
      } else if (msg.method === 'Network.requestWillBeSent') {
        this.networkRequests.push({ url: msg.params.request.url, method: msg.params.request.method });
      }
    };

    await new Promise((resolve) => {
      this.ws.onopen = resolve;
    });

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Log.enable');
    await this.send('Network.enable');

    // Hindari dialog yang membekukan CDP
    await this.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.confirm = () => true;
        window.alert = () => {};
        window.prompt = () => '';
      `
    });
  }

  send(method, params = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timeout waiting for CDP method ${method} (${timeoutMs}ms)`));
        }
      }, timeoutMs);

      this.pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    try {
      this.ws.close();
    } catch (e) {}
    try {
      this.chrome.kill();
    } catch (e) {}
  }

  async setViewport(width, height, isMobile = false, dpr = 1) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: dpr,
      mobile: isMobile
    });
  }

  async navigate(hashPath = '') {
    const targetUrl = `${BASE_URL}/#${hashPath}`;
    await this.send('Page.navigate', { url: targetUrl });
    await this.waitForLoad(500);
  }

  async waitForLoad(ms = 600) {
    await new Promise((r) => setTimeout(r, ms));
  }

  async evaluate(expression, timeoutMs = 10000) {
    const res = await this.send(
      'Runtime.evaluate',
      {
        expression,
        returnByValue: true,
        awaitPromise: true
      },
      timeoutMs
    );
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(relativeFilePath, skipIfExists = true) {
    const fullPath = path.join(OUTPUT_DIR, relativeFilePath);
    if (skipIfExists) {
      try {
        await fs.access(fullPath);
        return fullPath; // sudah ada, lewati
      } catch {}
    }
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    const shot = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    const buf = Buffer.from(shot.data, 'base64');
    await fs.writeFile(fullPath, buf);
    return fullPath;
  }

  async setModeKelas(aktif) {
    await this.evaluate(`
      (() => {
        try {
          localStorage.setItem('simulasi-lingkaran-preferensi-mode-ifp', '${aktif}');
          document.body.classList.toggle('mode-ifp', ${aktif});
          document.documentElement.style.setProperty('--skala-garis', ${aktif ? "'1.3'" : "'1'"});
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'simulasi-lingkaran-preferensi-mode-ifp',
            newValue: '${aktif}'
          }));
        } catch(e) {}
      })()
    `);
    await this.waitForLoad(200);
  }

  async setScores(scoreMap) {
    await this.evaluate(`
      (() => {
        try {
          localStorage.setItem('simulasi-lingkaran-skor-terbaik', JSON.stringify(${JSON.stringify(scoreMap)}));
        } catch(e) {}
      })()
    `);
  }

  async clearStorage() {
    await this.evaluate(`
      (() => {
        try {
          localStorage.clear();
        } catch(e) {}
      })()
    `);
  }
}

export { ChromeSession, VIEWPORTS, TOPICS, OUTPUT_DIR, BASE_URL };
