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

### Test Structure

Tests are data-driven and use JSON block definitions:
- **Test data**: `test/test-data.json` contains test cases with block JSON and expected output
- **Test runner**: `test/test-data-driven.js` loads test data and validates code generation

### Test Coverage

The test suite validates:
- Block definitions for all three languages (JSON, Justin, Jessie)
- Code generation accuracy
- Edge cases (special characters, escaping, etc.)

### Testing Convention

**All contributions must include tests.** When adding new blocks or modifying generators:

1. **Add test data** - Add a new entry to `test/test-data.json` with:
   ```json
   {
     "name": "Test description",
     "block": {
       "type": "block_type",
       "fields": { "FIELD_NAME": "value" },
       "inputs": {
         "INPUT_NAME": {
           "block": { "type": "nested_block" }
         }
       }
     },
     "expected": "generated code"
   }
   ```

2. **Verify the test fails** - Run `yarn test` to ensure the test fails before fixing
3. **Fix the implementation** - Make code changes to pass the test
4. **Verify all tests pass** - Run `yarn test` again

The test suite uses Blockly's [JSON serialization format](https://developers.google.com/blockly/guides/configure/web/serialization) for block definitions, making tests:
- Easy to read and maintain
- Separate from implementation code
- Simple to add new test cases

### Test Example

From `test/test-data.json`:
```json
{
  "name": "JSON number",
  "block": {
    "type": "json_number",
    "fields": {
      "VALUE": 42
    }
  },
  "expected": "42"
}
```

This tests that a JSON number block with value 42 generates the code `42`.

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
