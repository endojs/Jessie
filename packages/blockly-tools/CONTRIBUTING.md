# Contributing to Blockly Tools

## Development Setup

```bash
# From the repository root
yarn install

# Navigate to the blockly-tools package
cd packages/blockly-tools

# Install package dependencies
yarn install

# Start development server with hot module reloading
yarn dev
```

The dev server will start at `http://localhost:5173` with hot module reloading enabled.

## Testing

### Running Tests

```bash
yarn test
```

### Test Coverage

The test suite validates:
- Block definitions for all three languages (JSON, Justin, Jessie)
- Code generation accuracy
- Edge cases (special characters, escaping, etc.)

### Testing Convention

**All contributions must include tests.** When adding new blocks or modifying generators:

1. **Add a failing test** - Write a test that fails with the current implementation
2. **Fix the implementation** - Make the code changes to pass the test
3. **Verify** - Ensure all tests pass with `yarn test`

The test suite (`test/test-generators.js`) follows this pattern:
- Browse grammar productions in `quasi-json.js`, `quasi-justin.js`, `quasi-jessie.js`
- For each production (especially those we didn't get right the first time), choose a handful of correct usages
- Create test blocks and assert the generated code matches expected syntax

### Test Example

```javascript
// Test a new block type
const block = workspace.newBlock('my_new_block');
block.setFieldValue('value', 'FIELD_NAME');

assertEqual(
  generator.blockToCode(block),
  'expected code',
  'Test description'
);
```

## Project Structure

```
packages/blockly-tools/
├── src/
│   ├── blocks/          # Block definitions
│   │   ├── json-blocks.js
│   │   ├── justin-blocks.js
│   │   └── jessie-blocks.js
│   ├── generators/      # Code generators
│   │   ├── json-generator.js
│   │   ├── justin-generator.js
│   │   └── jessie-generator.js
│   ├── toolbox/         # Toolbox configurations
│   │   ├── json-toolbox.js
│   │   ├── justin-toolbox.js
│   │   └── jessie-toolbox.js
│   └── main.js          # Entry point
├── public/
│   └── index.html       # Main HTML file
├── dist/                # Build output (gitignored)
└── README.md
```

## Code Documentation Guidelines

Follow these documentation practices used throughout the Jessie project:

- **Be concise**: Don't repeat what the code says
- **Add value**: Only document what an experienced JS developer would find cost-effective to maintain
- **File headers**: Include a brief `@file` comment at the top of each file with `@see` references to main exports/functions
- **Function docs**: Document functions that need explanation, visible in IDEs

Example:
```javascript
/**
 * @file Defines Blockly blocks for JSON data structures.
 * @see {jsonBlocks}
 * @see {registerJsonBlocks}
 */

/**
 * Register all JSON blocks with Blockly.
 * @param {Blockly} blockly - The Blockly instance
 */
export const registerJsonBlocks = (blockly) => {
  // Implementation...
};
```

## Building for Deployment

Build the tools for deployment to static site hosting (GitHub Pages, Netlify, Vercel, Cloudflare):

```bash
yarn build
```

The optimized production build will be created in the `dist/` directory, ready to deploy.

## Testing

Run tests with:
```bash
yarn test
```

Currently, tests are minimal. Contributions for additional tests are welcome, especially:
- Unit tests for block definitions
- Code generator validation tests
- Integration tests using existing Jessie test materials

## Linting

```bash
# Check for lint errors
yarn lint

# Fix auto-fixable issues
yarn lint-fix
```

## How Blockly Works

Blockly consists of three main components:

1. **Block Definitions** - Define the visual appearance and behavior of blocks
2. **Toolbox** - Specifies which blocks are available in the palette
3. **Code Generators** - Convert block configurations to target language code

Each language tool (JSON, Justin, Jessie) has its own set of these components.

## Adding New Blocks

1. Define the block in the appropriate `src/blocks/*-blocks.js` file
2. Add the block to the toolbox in `src/toolbox/*-toolbox.js`
3. Implement code generation in `src/generators/*-generator.js`
4. Test manually in the dev server

## Conventions from the Blockly Community

This tool follows vanilla JavaScript patterns without heavy frameworks, as is common in the Blockly community. Keep dependencies minimal and focus on simplicity and accessibility.

## Related References

- [Blockly Block Definition Guide](https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks)
- [Code Generation Guide](https://developers.google.com/blockly/guides/create-custom-blocks/generating-code)
- [Example: Rho Calculus Blockly Tool](https://github.com/rchain/developer.rchain.coop/blob/master/rho-blockly.html)
