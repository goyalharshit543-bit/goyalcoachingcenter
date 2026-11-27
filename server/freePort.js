import net from 'net';
import { exec } from 'child_process';

/**
 * Checks if a port is in use and terminates the occupying process on Windows
 * so Goyal Coaching Center always starts reliably on its permanent ports (5000 & 5173).
 */
export function freePortIfOccupied(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`[AutoPort] Port ${port} is held by a previous session. Reclaiming permanent port...`);
          // Windows netstat command to find PID on port
          exec(`netstat -ano | findstr :${port}`, (findErr, stdout) => {
            if (!findErr && stdout) {
              const lines = stdout.trim().split('\n');
              const pids = new Set();
              lines.forEach(line => {
                if (line.includes('LISTENING')) {
                  const parts = line.trim().split(/\s+/);
                  const pid = parts[parts.length - 1];
                  if (pid && pid !== '0' && pid !== String(process.pid)) {
                    pids.add(pid);
                  }
                }
              });

              if (pids.size > 0) {
                const killCmd = `taskkill /F ${Array.from(pids).map(p => `/PID ${p}`).join(' ')}`;
                exec(killCmd, () => {
                  setTimeout(resolve, 600);
                });
                return;
              }
            }
            setTimeout(resolve, 300);
          });
        } else {
          resolve();
        }
      })
      .once('listening', () => {
        tester.close(() => resolve());
      })
      .listen(port);
  });
}
