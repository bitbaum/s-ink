import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import * as espree from 'espree';

// Two ESLint-10 workarounds, same as evig / camille-boulangerie / substrata,
// until upstream ships ESLint 10 releases:
// 1. eslint-config-next's `settings.react.version: 'detect'` calls the removed
//    `context.getFilename()` inside eslint-plugin-react — pin the version.
// 2. Plain .js/.mjs go through Next's vendored babel parser, which predates
//    ESLint 10's Language API and crashes the run — parse them with espree.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: { react: { version: '19.2.8' } },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { parser: espree },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
