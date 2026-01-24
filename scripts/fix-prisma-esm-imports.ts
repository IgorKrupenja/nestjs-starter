import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GENERATED_ROOT = path.resolve('src/generated/prisma');
const EXTENSION_REGEX = /\.(cjs|js|json|mjs|node)$/i;

// todo investigate why necessary
async function getFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function addJsExtensionToRelativeImports(contents: string): string {
  return contents
    .replace(/from\s+['"](\.[^'"]+)['"]/g, (match, specifier: string) => {
      if (EXTENSION_REGEX.test(specifier)) return match;
      return match.replace(specifier, `${specifier}.js`);
    })
    .replace(/export\s+\*\s+from\s+['"](\.[^'"]+)['"]/g, (match, specifier: string) => {
      if (EXTENSION_REGEX.test(specifier)) return match;
      return match.replace(specifier, `${specifier}.js`);
    });
}

async function main(): Promise<void> {
  const files = await getFiles(GENERATED_ROOT);

  await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(file, 'utf-8');
      const updated = addJsExtensionToRelativeImports(contents);
      if (updated !== contents) {
        await writeFile(file, updated, 'utf-8');
      }
    }),
  );
}

await main();
