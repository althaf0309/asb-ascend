import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * UTF-8 text saved through a Windows-1252 editor turns "©" into "Â©" and "—"
 * into "â€”". The site shipped "Â© 2026" in its footer this way.
 */
const MOJIBAKE = /Â[©®°·±»«]|â€[\u0080-¿‐-›™]|Ã[\u0080-¿]/;

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : /\.(tsx?|css|html|json)$/.test(name) ? [full] : [];
  });

describe('source text encoding', () => {
  it('contains no mis-encoded characters', () => {
    const root = path.resolve(__dirname, '../..');
    const offenders = [...files(path.join(root, 'src')), path.join(root, 'index.html')]
      .filter((file) => !file.endsWith('encoding.test.ts'))
      .filter((file) => MOJIBAKE.test(readFileSync(file, 'utf8')))
      .map((file) => path.relative(root, file));
    expect(offenders).toEqual([]);
  });
});
