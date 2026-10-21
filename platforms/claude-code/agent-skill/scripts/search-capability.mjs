import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const [kind, query, limitText = '8', ...extra] = process.argv.slice(2);
  const limit = Number(limitText);
  if (!['capabilities', 'demos'].includes(kind) || !query?.trim() || extra.length || !Number.isInteger(limit) || limit < 1 || limit > 30) throw new Error('Usage: node search-capability.mjs capabilities|demos <query> [limit:1..30]');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const catalog = JSON.parse(await readFile(join(root, 'references', kind === 'capabilities' ? 'capability-catalog.json' : 'demos-index.json'), 'utf8'));
  const terms = query.trim().toLowerCase().split(/\s+/);
  const items = kind === 'capabilities' ? catalog.items : catalog.examples;
  const matches = items.map((item) => {
    const identity = `${item.id ?? ''} ${item.name ?? ''} ${item.platform ?? ''}`.toLowerCase();
    const text = JSON.stringify(item).toLowerCase();
    return { item, score: terms.reduce((score, term) => score + (identity.includes(term) ? 10 : text.includes(term) ? 1 : -100), 0) };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
  console.log(JSON.stringify({ kind, query, total: matches.length, items: matches.slice(0, limit).map((entry) => entry.item) }, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
