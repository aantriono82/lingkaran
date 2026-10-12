import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const executable = process.platform === 'win32' ? 'node_modules/.bin/eslint.cmd' : 'node_modules/.bin/eslint';
if (!existsSync(executable)) {
  console.error('ESLint belum terpasang. Jalankan perintah instalasi pada bagian “Langkah untuk Bapak” di docs/perbaikan-teknis.md.');
  process.exit(1);
}

const hasil = spawnSync(executable, ['.'], { stdio: 'inherit' });
process.exit(hasil.status ?? 1);
