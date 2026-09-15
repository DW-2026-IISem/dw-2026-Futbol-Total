const { execSync } = require('node:child_process');

const port = process.env.PORT ?? 3002;

try {
  execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
  console.log(`Puerto ${port} liberado.`);
} catch {
  console.log(`Puerto ${port} ya estaba libre.`);
}
