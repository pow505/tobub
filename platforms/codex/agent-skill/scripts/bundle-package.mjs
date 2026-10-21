import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { readDemo } from './demo-resources.mjs';
import { verifyPackage } from './verify-package.mjs';

/** Copy a repository Skill into an independent, verified package with its indexed demos bundled. */
export async function bundleAgentSkill(source, target, repositoryRoot) {
  await verifyPackage(source, repositoryRoot);
  await cp(source, target, { recursive: true, force: false, errorOnExist: true });

  const indexPath = join(target, 'references/demos-index.json');
  const index = JSON.parse(await readFile(indexPath, 'utf8'));
  if (index.layout === 'repository') {
    const lockPath = join(target, 'references/source-lock.json');
    const lock = JSON.parse(await readFile(lockPath, 'utf8'));
    for (const demo of index.examples) {
      const bytes = await readDemo(source, index, demo, repositoryRoot);
      demo.file = `examples/${demo.source_path.slice('demos/'.length)}`;
      const destination = join(target, demo.file);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, bytes, { flag: 'wx' });
      lock.resources.push({ path: demo.file, sha256: demo.sha256 });
    }
    index.layout = 'bundled';
    const text = `${JSON.stringify(index, null, 2)}\n`;
    await writeFile(indexPath, text);
    const indexResource = lock.resources.find((resource) => resource.path === 'references/demos-index.json');
    if (!indexResource) throw new Error('Demo index is missing from the resource lock');
    indexResource.sha256 = createHash('sha256').update(text).digest('hex');
    lock.resources.sort((a, b) => a.path.localeCompare(b.path, 'en'));
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  }

  return verifyPackage(target);
}
