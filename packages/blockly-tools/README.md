# @jessie.js/blockly-tools

Blockly-based visual programming tools for learning and experimenting with:
- **JSON** - The base object grammar for data structures
- **Justin** - The pure expression grammar (no loops) 
- **Jessie** - The top-level module grammar

## Getting Started

### For Students and Learners

These tools provide a visual, block-based interface for learning the Jessie language family. Each tool corresponds to a different level of the language:

1. **JSON Tool** - Start here to learn basic data structures (objects, arrays, literals)
2. **Justin Tool** - Learn pure expressions, operators, and function calls
3. **Jessie Tool** - Learn complete programs with modules, functions, and control flow

### Using the Tools

Open `index.html` in a web browser to access all three tools:
- The left panel shows the block palette
- Drag blocks into the workspace to build your program
- The right panel shows the generated code
- Copy the generated code to use in your projects

### Example Workflows

**Creating a JSON object:**
1. Drag an "Object" block from the palette
2. Add "Property" blocks to define fields
3. Use "Value" blocks for numbers, strings, or nested structures

**Writing a Justin expression:**
1. Use operator blocks (add, multiply, compare)
2. Combine with function call blocks
3. Create pure, side-effect-free expressions

**Building a Jessie module:**
1. Start with a module block
2. Add function definitions
3. Use control flow blocks (if, for, while)
4. Export your module's API

## For Developers

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, testing, and deployment instructions.

## What are Jessie Languages?

Jessie is a family of safe JavaScript subsets:
- **JSON** - Simple universal representation for safe mobile data
- **Justin** - Pure expression language, superset of JSON
- **Jessie** - Complete safe ocap subset of JavaScript

Learn more in the [main Jessie README](../../README.md).

## References

- [Blockly Developer Guide](https://developers.google.com/blockly/guides/get-started/blocks)
- [Jessie Grammar Documentation](https://github.com/endojs/Jessie/blob/main/README.md)
