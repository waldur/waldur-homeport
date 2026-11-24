import fs from 'node:fs';
import path from 'node:path';

import MagicString from 'magic-string';
import type { Logger, Plugin } from 'vite';

export const ALL_WEIGHTS = [
  'bold',
  'duotone',
  'fill',
  'light',
  'regular',
  'thin',
] as const;

const VALID_WEIGHTS = new Set<string>(ALL_WEIGHTS);

// One `["weight", node]` entry of a def's Map. An entry ends where the next one
// starts or, for the last one, at the end of MAP_REGEX's capture (which stops
// before the closing `]`).
const ENTRY_REGEX =
  /\[\s*"(bold|duotone|fill|light|regular|thin)"\s*,\s*([\s\S]*?)\s*\](?=\s*,\s*\[|\s*\]\s*\)|\s*$)/g;
const MAP_REGEX =
  /const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\/\*[\s\S]*?\*\/\s*)?new\s+Map\(\[\s*([\s\S]*?)\s*\]\);/;

const NON_ICON_EXPORTS = new Set([
  'Icon',
  'IconProps',
  'IconWeight',
  'IconContext',
  'IconBase',
  'SSRProvider',
]);

const WEIGHT_LITERAL_REGEX =
  /(?:'|")\s*(bold|duotone|fill|light|regular|thin)\s*(?:'|")/g;

export interface PhosphorPluginOptions {
  /** Root directories to scan for icon usage relative to project root. Defaults to ['src', 'packages']. */
  scanDirs?: string[];
}

export interface ScanResult extends Map<string, Set<string>> {
  unresolvedIcons: Set<string>;
}

export interface TransformResult {
  code: string;
  map: any;
}

function extractJsxTags(content: string, tagName: string): string[] {
  const tags: string[] = [];
  const regex = new RegExp(`<${tagName}(?=[\\s\\/>])`, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    let index = match.index + match[0].length;
    let braceCount = 0;
    let inQuote: string | null = null;
    let isEscaped = false;
    let tagClosed = false;
    const attrStartIndex = index;

    while (index < content.length) {
      const char = content[index];

      if (isEscaped) {
        isEscaped = false;
        index++;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        index++;
        continue;
      }

      if (inQuote !== null) {
        if (char === inQuote) {
          inQuote = null;
        }
        index++;
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inQuote = char;
        index++;
        continue;
      }

      if (char === '{') {
        braceCount++;
        index++;
        continue;
      }

      if (char === '}') {
        if (braceCount > 0) braceCount--;
        index++;
        continue;
      }

      if (braceCount === 0) {
        if (char === '/' && content[index + 1] === '>') {
          tags.push(content.slice(attrStartIndex, index));
          tagClosed = true;
          regex.lastIndex = index + 2;
          break;
        } else if (char === '>') {
          tags.push(content.slice(attrStartIndex, index));
          tagClosed = true;
          regex.lastIndex = index + 1;
          break;
        }
      }

      index++;
    }

    if (!tagClosed) {
      break;
    }
  }

  return tags;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whether a tag's attribute text spreads props (`{...props}`) at the top level.
 * A spread can carry a `weight` the scanner cannot see.
 */
function hasSpreadAttribute(tagAttributes: string): boolean {
  let braceCount = 0;
  let inQuote: string | null = null;
  for (let i = 0; i < tagAttributes.length; i++) {
    const char = tagAttributes[i];
    if (inQuote !== null) {
      if (char === inQuote) inQuote = null;
    } else if (char === '"' || char === "'" || char === '`') {
      inQuote = char;
    } else if (char === '{') {
      if (
        braceCount === 0 &&
        /^\{\s*\.\.\./.test(tagAttributes.slice(i, i + 16))
      ) {
        return true;
      }
      braceCount++;
    } else if (char === '}' && braceCount > 0) {
      braceCount--;
    }
  }
  return false;
}

/**
 * Whether the alias is used anywhere other than as a JSX tag name, for
 * example passed as a prop (`icon={GearIcon}`), stored in a lookup table or
 * picked in a ternary. Such a use can be rendered with any weight, even when
 * the same file also renders the icon directly. Matches inside strings and
 * comments count too, which only ever keeps more weights.
 */
function hasNonJsxReference(code: string, alias: string): boolean {
  const name = escapeRegExp(alias);
  const references = code.match(
    new RegExp(`(?<![\\w$.])${name}(?![\\w$])`, 'g'),
  );
  const jsxTags = code.match(new RegExp(`<\\/?${name}(?=[\\s/>])`, 'g'));
  return (references?.length ?? 0) > (jsxTags?.length ?? 0);
}

export function scanSourceContent(
  content: string,
  usedWeightsByIcon: Map<string, Set<string>>,
  unresolvedIcons: Set<string> = new Set(),
): void {
  if (!content.includes('@phosphor-icons/react')) return;

  const importRegex =
    /(?:^|\n)\s*import\s+\{([^}]+)\}\s+from\s+['"]@phosphor-icons\/react(?:\/[^'"]+)?['"]/g;

  let importMatch: RegExpExecArray | null;
  const fileImports = new Map<string, string>(); // alias -> baseIconName

  while ((importMatch = importRegex.exec(content)) !== null) {
    const specifiers = importMatch[1].split(',');
    for (const spec of specifiers) {
      const trimmed = spec.trim();
      if (!trimmed) continue;
      // Skip type-only specifiers: e.g. "type IconWeight", "type IconProps"
      if (/^type\s+/.test(trimmed)) continue;

      let base: string;
      let alias: string;
      if (trimmed.includes(' as ')) {
        const parts = trimmed.split(/\s+as\s+/);
        base = parts[0].trim();
        alias = parts[1].trim();
      } else {
        base = alias = trimmed.split(/\s+/)[0].trim();
      }

      if (NON_ICON_EXPORTS.has(base)) continue;

      const normalizedBase =
        base.endsWith('Icon') && base.length > 4 ? base.slice(0, -4) : base;
      if (!normalizedBase) continue;

      fileImports.set(alias, normalizedBase);
    }
  }

  // The import statements themselves name every alias; leave them out when
  // looking for other references.
  importRegex.lastIndex = 0;
  const body = content.replace(importRegex, '\n');

  for (const [alias, baseIcon] of fileImports.entries()) {
    if (!usedWeightsByIcon.has(baseIcon)) {
      usedWeightsByIcon.set(baseIcon, new Set());
    }
    const weights = usedWeightsByIcon.get(baseIcon)!;

    const tags = extractJsxTags(body, alias);

    // Not rendered directly as <Alias>, or also used some other way (passed as
    // prop icon={Alias}, assigned in const C = isHalf ? StarHalfIcon : StarIcon,
    // put in a lookup map): it can be drawn with any weight.
    if (tags.length === 0 || hasNonJsxReference(body, alias)) {
      ALL_WEIGHTS.forEach((w) => weights.add(w));
      unresolvedIcons.add(baseIcon);
      continue;
    }

    for (const tagAttributes of tags) {
      if (hasSpreadAttribute(tagAttributes)) {
        // <Alias {...props} /> may receive any weight through the spread
        ALL_WEIGHTS.forEach((w) => weights.add(w));
        unresolvedIcons.add(baseIcon);
        continue;
      }

      const weightMatch = /\bweight\s*=\s*/.exec(tagAttributes);
      if (!weightMatch) {
        // Omitted weight defaults to 'regular' in Phosphor
        weights.add('regular');
        continue;
      }

      const valueStartIndex = weightMatch.index + weightMatch[0].length;
      const firstChar = tagAttributes[valueStartIndex];

      if (firstChar === '"' || firstChar === "'") {
        const endQuote = tagAttributes.indexOf(firstChar, valueStartIndex + 1);
        const literalVal =
          endQuote !== -1
            ? tagAttributes.slice(valueStartIndex + 1, endQuote).trim()
            : '';
        if (VALID_WEIGHTS.has(literalVal)) {
          weights.add(literalVal);
        } else {
          // Unrecognized literal weight, fall back to keeping all weights
          ALL_WEIGHTS.forEach((w) => weights.add(w));
          unresolvedIcons.add(baseIcon);
        }
      } else if (firstChar === '{') {
        // Extract expression inside { ... }
        let braceCount = 1;
        let idx = valueStartIndex + 1;
        let inQuote: string | null = null;
        let exprEnd = -1;

        while (idx < tagAttributes.length) {
          const c = tagAttributes[idx];
          if (inQuote !== null) {
            if (c === inQuote) inQuote = null;
          } else if (c === '"' || c === "'" || c === '`') {
            inQuote = c;
          } else if (c === '{') {
            braceCount++;
          } else if (c === '}') {
            braceCount--;
            if (braceCount === 0) {
              exprEnd = idx;
              break;
            }
          }
          idx++;
        }

        const expr =
          exprEnd !== -1
            ? tagAttributes.slice(valueStartIndex + 1, exprEnd)
            : tagAttributes.slice(valueStartIndex + 1);

        WEIGHT_LITERAL_REGEX.lastIndex = 0;
        let litMatch: RegExpExecArray | null;
        let foundCount = 0;
        while ((litMatch = WEIGHT_LITERAL_REGEX.exec(expr)) !== null) {
          weights.add(litMatch[1]);
          foundCount++;
        }

        if (foundCount === 0) {
          // Dynamic expression without any weight literals (e.g. weight={customWeight})
          ALL_WEIGHTS.forEach((w) => weights.add(w));
          unresolvedIcons.add(baseIcon);
        }
      } else {
        // Unrecognized / boolean attribute format
        ALL_WEIGHTS.forEach((w) => weights.add(w));
        unresolvedIcons.add(baseIcon);
      }
    }
  }
}

export function scanPhosphorWeights(
  root: string,
  scanDirs = ['src', 'packages'],
): ScanResult {
  const usedWeightsByIcon = new Map<string, Set<string>>() as ScanResult;
  const unresolvedIcons = new Set<string>();
  usedWeightsByIcon.unresolvedIcons = unresolvedIcons;

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name.startsWith('.')
        ) {
          continue;
        }
        walkDir(fullPath);
      } else if (
        /\.[jt]sx?$/.test(entry.name) &&
        !/\.(test|spec|stories)\.[jt]sx?$/.test(entry.name) &&
        !entry.name.endsWith('.d.ts')
      ) {
        const content = fs.readFileSync(fullPath, 'utf8');
        scanSourceContent(content, usedWeightsByIcon, unresolvedIcons);
      }
    }
  }

  for (const dir of scanDirs) {
    walkDir(path.resolve(root, dir));
  }

  return usedWeightsByIcon;
}

export function transformPhosphorDef(
  code: string,
  targetWeights?: Set<string>,
): TransformResult | null {
  const mapMatch = MAP_REGEX.exec(code);
  if (!mapMatch) return null;

  const varName = mapMatch[1];
  const entriesContent = mapMatch[2];

  ENTRY_REGEX.lastIndex = 0;
  const parsedEntries: Array<{ weight: string; node: string }> = [];
  let entryMatch: RegExpExecArray | null;
  while ((entryMatch = ENTRY_REGEX.exec(entriesContent)) !== null) {
    parsedEntries.push({
      weight: entryMatch[1],
      node: entryMatch[2],
    });
  }

  if (parsedEntries.length === 0) return null;

  // Filter entries to only detected weights
  let filteredEntries: Array<{ weight: string; node: string }>;
  if (targetWeights && targetWeights.size > 0) {
    filteredEntries = parsedEntries.filter((e) => targetWeights.has(e.weight));
  } else {
    // If targetWeights is omitted or empty (e.g. unscanned icon), keep all weights safely
    return null;
  }

  // Ensure at least one weight is kept
  if (filteredEntries.length === 0) {
    const boldEntry = parsedEntries.find((e) => e.weight === 'bold');
    filteredEntries = [boldEntry || parsedEntries[0]];
  }

  // If all weights were kept, no need to rewrite
  if (filteredEntries.length === parsedEntries.length) {
    return null;
  }

  const newEntriesStr = filteredEntries
    .map((e) => `  [${JSON.stringify(e.weight)}, ${e.node}]`)
    .join(',\n');

  const replacement = `const ${varName} = /* @__PURE__ */ new Map([\n${newEntriesStr}\n]);
const _get_${varName} = ${varName}.get.bind(${varName});
${varName}.get = (w) => _get_${varName}(w) || _get_${varName}("bold") || _get_${varName}("regular") || ${varName}.values().next().value;`;

  const s = new MagicString(code);
  s.overwrite(mapMatch.index, mapMatch.index + mapMatch[0].length, replacement);

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true }),
  };
}

export default function phosphorWeightsPlugin(
  options: PhosphorPluginOptions = {},
): Plugin {
  let usedWeightsByIcon: ScanResult;
  let isProductionBuild = false;
  let projectRoot = process.cwd();
  let logger: Logger | undefined;

  return {
    name: 'vite-plugin-phosphor-weights',
    enforce: 'pre',
    configResolved(config) {
      isProductionBuild = config.command === 'build';
      projectRoot = config.root;
      logger = config.logger;
    },
    buildStart() {
      if (!isProductionBuild) return;
      usedWeightsByIcon = scanPhosphorWeights(projectRoot, options.scanDirs);
      if (usedWeightsByIcon.unresolvedIcons.size > 0) {
        const iconList = Array.from(usedWeightsByIcon.unresolvedIcons)
          .sort()
          .join(', ');
        const message = `[vite-plugin-phosphor-weights] Retained all 6 weights for ${usedWeightsByIcon.unresolvedIcons.size} icon(s) with indirect or dynamic usage: ${iconList}`;
        if (typeof this?.warn === 'function') {
          this.warn(message);
        } else if (logger) {
          logger.warn(message);
        }
      }
    },
    transform(code, id) {
      if (!isProductionBuild) return null;
      // Fast path: only process Phosphor defs
      if (!id.includes('@phosphor-icons/react/dist/defs/')) return null;

      const normalizedId = id.replace(/\\/g, '/');
      const defMatch = normalizedId.match(
        /@phosphor-icons\/react\/dist\/defs\/([^/]+)\.es\.js(?:\?.*)?$/,
      );
      if (!defMatch) return null;

      const iconName = defMatch[1];
      const targetWeights = usedWeightsByIcon?.get(iconName);

      const transformed = transformPhosphorDef(code, targetWeights);
      if (!transformed) return null;

      return {
        code: transformed.code,
        map: transformed.map,
      };
    },
  };
}
