/**
 * Docusaurus plugin that makes the documentation usable by LLMs and AI tools.
 *
 * Generates three things at build time:
 *   - /llms.txt       Curated index of all documentation pages (https://llmstxt.org)
 *   - /llms-full.txt  Full text of every page in one file
 *   - /<page>.md      Raw Markdown copy of each documentation page
 *
 * The Markdown copies are also used by the "Copy page as Markdown" button.
 */

const fs = require('fs');
const path = require('path');

const DOCS_PLUGIN = 'docusaurus-plugin-content-docs';

const SITE_SUMMARY =
  'MOS (Modular Operating System) is a lightweight, web-based management system ' +
  'for servers and homelabs, built on Devuan Linux.';

const SITE_INTRO =
  'This is the official documentation for MOS. It covers installation, storage pools, ' +
  'shares, Docker, LXC, virtual machines, networking, the MOS Hub, plugins and the MOS API.';

let docsVersion = null;
let siteDir = null;

/** Remove the YAML front matter block at the top of a Markdown file. */
function stripFrontMatter(text) {
  if (!text.startsWith('---')) {
    return text;
  }
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? text.slice(match[0].length) : text;
}

/** Strip leading emoji/symbols so plain-text output reads cleanly. */
function plain(text) {
  return String(text || '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .trim();
}

/** Escape characters that would break a Markdown link label. */
function escapeLabel(text) {
  return String(text || '').replace(/[[\]]/g, '\\$&');
}

/** Resolve an "@site/..." source path to an absolute file system path. */
function resolveSource(source) {
  if (source.startsWith('@site/')) {
    return path.join(siteDir, source.slice('@site/'.length));
  }
  return source;
}

/** Write a file, creating parent directories as needed. */
function writeFile(target, content) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content, 'utf8');
}

/** Read the glossary terms if the glossary plugin file exists. */
function readGlossary() {
  const file = path.join(siteDir, 'glossary', 'glossary.json');
  if (!fs.existsSync(file)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data.terms) && data.terms.length > 0 ? data : null;
  } catch (error) {
    console.warn(`[llms-txt] Could not read glossary: ${error.message}`);
    return null;
  }
}

/**
 * Where the Markdown copy of a page lives inside the build directory.
 * "/docs/Pools/X"  -> "docs/Pools/X.md"
 * "/docs/"         -> "docs/index.md"
 * "/docs/LXC/"     -> "docs/LXC/index.md"
 */
function markdownPathForPermalink(outDir, permalink) {
  const clean = permalink.replace(/^\/+/, '');
  if (permalink.endsWith('/')) {
    return path.join(outDir, clean, 'index.md');
  }
  return path.join(outDir, `${clean}.md`);
}

module.exports = function llmsTxtPlugin(context) {
  siteDir = context.siteDir;

  return {
    name: 'llms-txt',

    async allContentLoaded({allContent}) {
      docsVersion = allContent[DOCS_PLUGIN]?.default?.loadedVersions?.[0] || null;
    },

    async postBuild({outDir, siteConfig}) {
      if (!docsVersion) {
        console.warn('[llms-txt] No docs content found, skipping.');
        return;
      }

      const docsById = new Map(docsVersion.docs.map((doc) => [doc.id, doc]));
      const usedIds = new Set();
      const sections = [];
      const orderedDocs = [];

      const sidebars = docsVersion.sidebars || {};
      const sidebarItems = Object.values(sidebars)[0] || [];

      const collect = (items) => {
        const result = [];
        for (const item of items || []) {
          if (item.type === 'doc') {
            const doc = docsById.get(item.id);
            if (doc && !doc.draft) {
              usedIds.add(doc.id);
              orderedDocs.push(doc);
              result.push({type: 'doc', doc, label: item.label});
            }
          } else if (item.type === 'category') {
            const children = collect(item.items);
            if (children.length > 0) {
              result.push({type: 'category', label: plain(item.label), children});
            }
          }
        }
        return result;
      };

      for (const node of collect(sidebarItems)) {
        if (node.type === 'doc') {
          sections.push({type: 'doc', doc: node.doc, label: node.label});
        } else {
          sections.push(node);
        }
      }

      // Pages that are not part of the sidebar (unlisted pages, drafts excluded).
      for (const doc of docsVersion.docs) {
        if (!doc.draft && !usedIds.has(doc.id)) {
          orderedDocs.push(doc);
          sections.push({type: 'doc', doc});
        }
      }

      const baseUrl = siteConfig.url.replace(/\/$/, '');

      // ---------------------------------------------------------------- llms.txt
      const lines = ['# MOS Documentation', '', `> ${SITE_SUMMARY}`, '', SITE_INTRO, ''];
      lines.push(`- [Full documentation (single file)](${baseUrl}/llms-full.txt)`);
      lines.push('');

      const renderNodes = (nodes, headingLevel) => {
        for (const node of nodes) {
          if (node.type === 'doc') {
            const {doc} = node;
            const title = escapeLabel(plain(node.label || doc.title));
            const description = doc.description ? `: ${doc.description}` : '';
            lines.push(`- [${title}](${baseUrl}${doc.permalink})${description}`);
          } else if (node.type === 'category') {
            lines.push('');
            lines.push(`${'#'.repeat(headingLevel)} ${node.label}`);
            lines.push('');
            renderNodes(node.children, headingLevel + 1);
          }
        }
      };

      lines.push('## Documentation');
      lines.push('');
      renderNodes(sections, 3);
      lines.push('');

      // The glossary is a plugin page, not a docs page, so read it separately.
      const glossary = readGlossary();

      if (glossary) {
        lines.push('## Glossary');
        lines.push('');
        for (const entry of glossary.terms) {
          lines.push(`- **${entry.term}**: ${entry.definition}`);
        }
        lines.push('');
      }

      writeFile(path.join(outDir, 'llms.txt'), `${lines.join('\n').trim()}\n`);

      // ----------------------------------------------------------- llms-full.txt
      const fullParts = [`# MOS Documentation`, '', `> ${SITE_SUMMARY}`, '', SITE_INTRO, ''];

      for (const doc of orderedDocs) {
        const sourcePath = resolveSource(doc.source);
        if (!fs.existsSync(sourcePath)) {
          continue;
        }
        const body = stripFrontMatter(fs.readFileSync(sourcePath, 'utf8')).trim();
        fullParts.push('---', '');
        fullParts.push(`# ${plain(doc.title)}`);
        fullParts.push('');
        fullParts.push(`Source: ${baseUrl}${doc.permalink}`);
        fullParts.push('');
        fullParts.push(body);
        fullParts.push('');
      }

      if (glossary) {
        fullParts.push('---', '', '# Glossary', '');
        for (const entry of glossary.terms) {
          fullParts.push(`## ${entry.term}`, '', entry.definition, '');
        }
      }

      const fullText = `${fullParts.join('\n').trim()}\n`;
      writeFile(path.join(outDir, 'llms-full.txt'), fullText);

      // ------------------------------------------------- per-page Markdown copies
      let written = 0;
      for (const doc of orderedDocs) {
        const sourcePath = resolveSource(doc.source);
        if (!fs.existsSync(sourcePath)) {
          continue;
        }
        const body = stripFrontMatter(fs.readFileSync(sourcePath, 'utf8')).trim();
        const target = markdownPathForPermalink(outDir, doc.permalink);
        writeFile(target, `${body}\n`);
        written += 1;
      }

      console.log(
        `[llms-txt] Wrote llms.txt, llms-full.txt (${Math.round(fullText.length / 1024)} KB) and ${written} Markdown page(s).`,
      );
    },
  };
};
