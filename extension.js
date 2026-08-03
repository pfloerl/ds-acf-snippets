const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const TRIGGER = '!ds-fields';
const TRIGGER_CHARS = ['!', '-', 's'];

// ACF types that carry no value and therefore get no variable.
const VALUELESS_TYPES = new Set(['tab', 'accordion', 'message']);

// Raw ACF types that store an attachment ID (return_format => 'id').
const IMAGE_TYPES = new Set(['image', 'image_aspect_ratio_crop']);

// Helpers from theme/utils/acf-fields/image.php that return an attachment ID.
// ds_header_image_field is intentionally absent — it returns the full array.
const IMAGE_HELPERS = new Set(['ds_image_field', 'ds_image_crop_field']);

/* -------------------------------------------------------------------------- */
/* PHP source scanning                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Returns a copy of the source in which the contents of string literals and
 * comments are replaced by 'x'. Offsets stay identical to the original, so the
 * mask can be scanned for structure (brackets, commas) without tripping over
 * punctuation inside strings, while values are still read from the original.
 */
function maskStringsAndComments(code) {
    const mask = code.split('');
    const len = code.length;
    let i = 0;

    const blank = (index) => {
        if (index < len && code[index] !== '\n') mask[index] = 'x';
    };

    while (i < len) {
        const ch = code[i];

        if (ch === "'" || ch === '"') {
            const quote = ch;
            i++;
            while (i < len) {
                if (code[i] === '\\') {
                    blank(i);
                    blank(i + 1);
                    i += 2;
                    continue;
                }
                if (code[i] === quote) { i++; break; }
                blank(i);
                i++;
            }
            continue;
        }

        if (ch === '/' && code[i + 1] === '*') {
            blank(i);
            blank(i + 1);
            i += 2;
            while (i < len && !(code[i] === '*' && code[i + 1] === '/')) { blank(i); i++; }
            blank(i);
            blank(i + 1);
            i += 2;
            continue;
        }

        if ((ch === '/' && code[i + 1] === '/') || ch === '#') {
            while (i < len && code[i] !== '\n') { blank(i); i++; }
            continue;
        }

        i++;
    }

    return mask.join('');
}

const OPENING = { '(': ')', '[': ']', '{': '}' };

/** Index of the bracket closing the one at `openIndex`, or -1. */
function findClosing(mask, openIndex) {
    const open = mask[openIndex];
    const close = OPENING[open];
    if (!close) return -1;

    let depth = 0;
    for (let i = openIndex; i < mask.length; i++) {
        if (mask[i] === open) depth++;
        else if (mask[i] === close && --depth === 0) return i;
    }
    return -1;
}

/** Splits `[start, end)` into comma-separated segments at bracket depth 0. */
function splitTopLevel(mask, start, end) {
    const segments = [];
    let depth = 0;
    let segmentStart = start;

    for (let i = start; i < end; i++) {
        const ch = mask[i];
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        else if (ch === ',' && depth === 0) {
            segments.push({ start: segmentStart, end: i });
            segmentStart = i + 1;
        }
    }
    segments.push({ start: segmentStart, end });

    return segments;
}

/**
 * Inner range of the `array( … )` / `[ … ]` expression that starts at `from`.
 * Only whitespace and the `array` keyword may precede the opening bracket.
 */
function arrayBodyRange(mask, from, end) {
    for (let i = from; i < end; i++) {
        const ch = mask[i];
        if (ch === '(' || ch === '[') {
            const close = findClosing(mask, i);
            return close === -1 ? null : { start: i + 1, end: close };
        }
        if (!/[\sa-zA-Z_]/.test(ch)) return null;
    }
    return null;
}

/** Value of a top-level `'key' => 'value'` pair inside an array body. */
function readStringEntry(code, mask, body, key) {
    const pattern = new RegExp(`^\\s*['"]${key}['"]\\s*=>\\s*['"]([^'"]*)['"]`);

    for (const segment of splitTopLevel(mask, body.start, body.end)) {
        const match = code.slice(segment.start, segment.end).match(pattern);
        if (match) return match[1];
    }
    return null;
}

/* -------------------------------------------------------------------------- */
/* Config parsing                                                             */
/* -------------------------------------------------------------------------- */

/** Mirrors ds_parse_label_to_name() from theme/utils/helpers.php. */
function parseLabelToName(label) {
    return label
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

/**
 * Locates the layout array in a config file. By convention the variable is
 * named after the file (cta.php defines $cta); other arrays in the same file
 * are nested layouts. Falls back to the last array that has sub_fields.
 */
function findLayoutBody(code, mask, variableName) {
    const assignment = /\$([a-zA-Z_]\w*)\s*=\s*(?:array\s*\(|\[)/g;
    const candidates = [];
    let match;

    while ((match = assignment.exec(mask)) !== null) {
        const body = arrayBodyRange(mask, match.index + match[0].length - 1, mask.length);
        if (body && findSubFieldsBody(code, mask, body)) {
            candidates.push({ name: match[1], body });
        }
    }

    const named = candidates.find((candidate) => candidate.name === variableName);
    const chosen = named || candidates[candidates.length - 1];

    return chosen ? chosen.body : null;
}

/** Inner range of the `'sub_fields' => array( … )` entry of a layout array. */
function findSubFieldsBody(code, mask, body) {
    for (const segment of splitTopLevel(mask, body.start, body.end)) {
        const match = code.slice(segment.start, segment.end).match(/^\s*['"]sub_fields['"]\s*=>/);
        if (match) return arrayBodyRange(mask, segment.start + match[0].length, segment.end);
    }
    return null;
}

/** Field from a helper call: ds_image_field('field_x', 'Image', ['name' => 'y']). */
function parseHelperField(code, mask, segment) {
    const text = code.slice(segment.start, segment.end);
    const call = text.match(/^\s*(ds_\w+)\s*\(/);
    if (!call) return null;

    const args = arrayBodyRange(mask, segment.start + call[0].length - 1, segment.end);
    if (!args) return null;

    const [, labelArg, ...restArgs] = splitTopLevel(mask, args.start, args.end);
    if (!labelArg) return null;

    const label = code.slice(labelArg.start, labelArg.end).match(/^\s*['"]([^'"]*)['"]\s*$/);
    if (!label) return null;

    // A helper's $args array may override the generated name.
    const override = restArgs
        .map((arg) => code.slice(arg.start, arg.end).match(/['"]name['"]\s*=>\s*['"]([^'"]*)['"]/))
        .find(Boolean);

    const name = override ? override[1] : parseLabelToName(label[1]);
    if (!name) return null;

    return { name, isImage: IMAGE_HELPERS.has(call[1]) };
}

/** Field from a raw ACF array: array('name' => 'x', 'type' => 'image', …). */
function parseRawField(code, mask, segment) {
    const body = arrayBodyRange(mask, segment.start, segment.end);
    if (!body) return null;

    const type = readStringEntry(code, mask, body, 'type');
    const name = readStringEntry(code, mask, body, 'name');
    if (!name || !type || VALUELESS_TYPES.has(type)) return null;

    const returnsId = readStringEntry(code, mask, body, 'return_format') !== 'array';

    return { name, isImage: IMAGE_TYPES.has(type) && returnsId };
}

/**
 * All top-level fields of a section config, in source order. Sub-fields nested
 * in repeaters, groups or flexible content are skipped — the containing field
 * itself is returned instead.
 */
function parseConfig(code, variableName) {
    const mask = maskStringsAndComments(code);

    const layout = findLayoutBody(code, mask, variableName);
    if (!layout) return [];

    const subFields = findSubFieldsBody(code, mask, layout);
    if (!subFields) return [];

    const fields = [];
    const seen = new Set();

    for (const segment of splitTopLevel(mask, subFields.start, subFields.end)) {
        const text = code.slice(segment.start, segment.end).trim();
        if (!text) continue;

        const field = /^ds_\w+\s*\(/.test(text)
            ? parseHelperField(code, mask, segment)
            : parseRawField(code, mask, segment);

        if (field && !seen.has(field.name)) {
            seen.add(field.name);
            fields.push(field);
        }
    }

    return fields;
}

/* -------------------------------------------------------------------------- */
/* Section → config resolution                                                */
/* -------------------------------------------------------------------------- */

/**
 * Config file candidates for a section file, most specific first:
 *   theme/page-templates/sections/foo.php → theme/config/acf-fields/elements/fields/foo.php
 *   templates/sections/foo.php            → templates/fields/foo.php
 */
function configCandidates(sectionFilePath) {
    const normalized = sectionFilePath.replace(/\\/g, '/');
    const match = normalized.match(/^(.*)\/([^/]+)\/sections\/([^/]+\.php)$/);
    if (!match) return [];

    const [, base, sectionsParent, fileName] = match;
    const candidates = [];

    if (sectionsParent === 'page-templates') {
        candidates.push(path.join(base, 'config', 'acf-fields', 'elements', 'fields', fileName));
    }
    candidates.push(path.join(base, sectionsParent, 'fields', fileName));

    return candidates;
}

function generateCode(fields) {
    return fields
        .map(({ name, isImage }) => {
            const getter = isImage
                ? `ds_get_image_data_from_sub_field('${name}')`
                : `get_sub_field('${name}')`;
            return `$${name} = ${getter};`;
        })
        .join('\n');
}

/* -------------------------------------------------------------------------- */
/* Completion provider                                                        */
/* -------------------------------------------------------------------------- */

function buildItem(position, insertText, detail, documentation) {
    const item = new vscode.CompletionItem(TRIGGER, vscode.CompletionItemKind.Snippet);

    // Plain string insert text — `$` stays literal instead of becoming a tab stop.
    item.insertText = insertText;
    item.filterText = TRIGGER;
    item.detail = detail;
    item.documentation = new vscode.MarkdownString(documentation);
    item.preselect = true;
    item.sortText = '!';
    item.range = new vscode.Range(position.translate(0, -TRIGGER.length), position);

    return [item];
}

function provideCompletionItems(document, position) {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    if (!linePrefix.endsWith(TRIGGER)) return undefined;

    const candidates = configCandidates(document.fileName);
    if (!candidates.length) return undefined;

    const configPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (!configPath) {
        return buildItem(
            position,
            TRIGGER,
            'No config file found',
            ['Looked for:', ...candidates.map((candidate) => `- \`${candidate}\``)].join('\n')
        );
    }

    let content;
    try {
        content = fs.readFileSync(configPath, 'utf8');
    } catch (error) {
        return buildItem(position, TRIGGER, 'Config file unreadable', `\`${error.message}\``);
    }

    const variableName = path.basename(configPath, '.php');
    const fields = parseConfig(content, variableName);

    if (!fields.length) {
        return buildItem(
            position,
            TRIGGER,
            'No fields found',
            `No \`sub_fields\` on \`$${variableName}\` in \`${configPath}\`.`
        );
    }

    return buildItem(
        position,
        generateCode(fields),
        `${fields.length} field${fields.length === 1 ? '' : 's'} from ${path.basename(configPath)}`,
        [
            `Top-level fields of \`$${variableName}\`:`,
            '',
            '```php',
            generateCode(fields),
            '```',
        ].join('\n')
    );
}

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'php',
            { provideCompletionItems },
            ...TRIGGER_CHARS
        )
    );
}

function deactivate() {}

module.exports = { activate, deactivate };
