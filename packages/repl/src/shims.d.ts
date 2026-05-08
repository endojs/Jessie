declare module '@jessie.js/eslint-plugin' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module '@jessie.js/eslint-plugin/lib/use-jessie-rules.js' {
  import type { Linter } from 'eslint';
  export const jessieRules: Linter.RulesRecord;
}
