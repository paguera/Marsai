import fs from 'fs';

export const getSecret = (envVar: string): string | undefined => {
  const filePath = process.env[envVar];
  if (filePath && fs.existsSync(filePath)) {
    try {
      return fs.readFileSync(filePath, 'utf8').trim();
    } catch (err) {
      console.error(`Error reading secret from ${filePath}:`, err);
    }
  }
  return undefined;
};
