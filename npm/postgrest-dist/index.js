import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";

import { fileURLToPath } from "node:url";

// Is there an official way to get the path to another packages binary?
const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = resolve(
  __dirname,
  "../",
  `postgrest-dist-${process.platform}-${process.arch}`,
  /^win/.test(process.platform) ? "postgrest.exe" : "postgrest",
);

export default async (env = {}) => {
  const serverPort = env.PGRST_SERVER_PORT || process.env.PGRST_SERVER_PORT ||
    3000;
  const healthWaitTime = parseInt(
    env.PGRST_HEALTH_WAIT_TIME || process.env.PGRST_HEALTH_WAIT_TIME,
  ) || 5000; // 5s to wait for start
  let isClosed = false;
  const proc = spawn(
    binPath,
    [],
    {
      env: {
        ...process.env,
        ...env,
      },
    },
  );

  proc.stdout.on("data", (data) => console.log(data.toString()));
  proc.stderr.on("data", (data) => console.error(data.toString()));
  proc.on("close", (code) => {
    console.warn("postgrestShutdown", code);
    isClosed = true;
  });

  await new Promise((resolve, reject) => {
    const processCloseTimeout = setTimeout(() => {
      if (isClosed) {
        reject(new Error("Postgrest didn't start properly"));
      } else {
        reject(new Error("Postgrest didn't respond"));
        proc.kill("SIGKILL");
      }
    }, healthWaitTime);

    let backoff = 50;
    async function checkIfPostgrestRunning() {
      const result = await fetch(`http://127.0.0.1:${serverPort}`)
        .then((res) => res.status < 499)
        .catch(
          () => null,
        );
      if (result) {
        clearTimeout(processCloseTimeout);
        resolve();
      } else {
        setTimeout(checkIfPostgrestRunning, backoff);
        backoff = Math.min(backoff + 50, 250);
      }
    }
    checkIfPostgrestRunning();
  });

  return {
    proc,
    stop: async () => {
      proc.stdout.destroy();
      proc.stderr.destroy();
      proc.kill("SIGKILL");
    },
  };
};
