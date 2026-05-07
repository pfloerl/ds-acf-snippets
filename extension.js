const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const TRIGGER = '!ds-fields';
const SKIP_TYPES = new Set(['tab', 'accordion', 'message']);

function parseLabelToName(label) {
    return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Parse helper-function format: ds_*_field('key', 'Label', ...)
function parseHelperFormat(content) {
    const subFieldsMatch = content.match(/'sub_fields'\s*=>\s*array\s*\(([\s\S]*)/);
    if (!subFieldsMatch) return null;

    const fields = [];
    const regex = /\b(ds_\w+_field)\s*\(\s*'[^']*'\s*,\s*'([^']*)'/g;
    let match;
    while ((match = regex.exec(subFieldsMatch[1])) !== null) {
        fields.push({ name: parseLabelToName(match[2]), isImage: match[1].includes('image') });
    }
    return fields.length ? fields : null;
}

// Parse raw ACF array format: array('name' => '...', 'type' => '...', ...)
function parseRawFormat(content) {
    const subFieldsMatch = content.match(/'sub_fields'\s*=>\s*array\s*\(([\s\S]*)/);
    if (!subFieldsMatch) return null;
    const subContent = subFieldsMatch[1];

    const nameMatches = [...subContent.matchAll(/'name'\s*=>\s*'([^']*)'/g)];
    const typeMatches = [...subContent.matchAll(/'type'\s*=>\s*'([^']*)'/g)];

    const fields = [];
    for (let i = 0; i < nameMatches.length; i++) {
        const namePos = nameMatches[i].index;
        const nextNamePos = i + 1 < nameMatches.length ? nameMatches[i + 1].index : subContent.length;
        const typeMatch = typeMatches.find(t => t.index > namePos && t.index < nextNamePos);
        if (!typeMatch) continue;
        const type = typeMatch[1];
        if (SKIP_TYPES.has(type)) continue;
        fields.push({ name: nameMatches[i][1], isImage: type.includes('image') });
    }
    return fields.length ? fields : null;
}

// Maps a section file path to its corresponding config file path and format.
// Supports two conventions:
//   templates/sections/foo.php  →  templates/fields/foo.php  (raw array format)
//   theme/page-templates/sections/foo.php  →  theme/config/acf-fields/elements/fields/foo.php  (helper format)
function findConfigFile(sectionFilePath) {
    const normalized = sectionFilePath.replace(/\\/g, '/');

    const m1 = normalized.match(/^(.*\/templates)\/sections\/(.+)$/);
    if (m1) {
        return { configPath: path.join(m1[1], 'fields', m1[2]), format: 'raw' };
    }

    const m2 = normalized.match(/^(.*?)\/page-templates\/sections\/(.+)$/);
    if (m2) {
        return { configPath: path.join(m2[1], 'config', 'acf-fields', 'elements', 'fields', m2[2]), format: 'helper' };
    }

    return null;
}

function generateCode(fields) {
    return fields.map(({ name, isImage }) => {
        const getter = isImage
            ? `ds_get_image_data_from_sub_field('${name}')`
            : `get_sub_field('${name}')`;
        return `$${name} = ${getter};`;
    }).join('\n');
}

function activate(context) {
    const provider = vscode.languages.registerCompletionItemProvider(
        'php',
        {
            provideCompletionItems(document, position) {
                const prefix = document.lineAt(position).text.substring(0, position.character);
                if (!prefix.endsWith(TRIGGER)) return undefined;

                const result = findConfigFile(document.fileName);
                if (!result) return undefined;

                const { configPath, format } = result;
                if (!fs.existsSync(configPath)) return undefined;

                let content;
                try { content = fs.readFileSync(configPath, 'utf8'); } catch { return undefined; }

                const fields = format === 'helper' ? parseHelperFormat(content) : parseRawFormat(content);
                if (!fields || !fields.length) return undefined;

                const item = new vscode.CompletionItem(TRIGGER, vscode.CompletionItemKind.Snippet);
                item.insertText = generateCode(fields); // plain string — $ is treated literally
                item.filterText = TRIGGER;
                item.preselect = true;
                item.sortText = '!';
                item.documentation = new vscode.MarkdownString('Generates ACF `get_sub_field` variable assignments from the corresponding config file.');
                item.range = new vscode.Range(
                    position.translate(0, -TRIGGER.length),
                    position
                );
                return [item];
            }
        },
        's' // trigger fires when the final 's' of !ds-fields is typed
    );

    context.subscriptions.push(provider);
}

function deactivate() {}

module.exports = { activate, deactivate };
