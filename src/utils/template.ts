import ejs from 'ejs';
import path from 'path';

export async function renderFile(filePath: string, context: Record<string, unknown>): Promise<string> {
  return ejs.renderFile(filePath, context, { async: true });
}

export function renderString(template: string, context: Record<string, unknown>): string {
  return ejs.render(template, context);
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function getTemplatePath(...segments: string[]): string {
  // Resolves template path relative to the dist output
  const base = path.resolve(__dirname, 'templates');
  return path.join(base, ...segments);
}
