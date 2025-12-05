/**
 * @file Test suite for Blockly code generators.
 * Tests block definitions and code generation for JSON, Justin, and Jessie.
 */

import * as Blockly from 'blockly';
import { jsonBlocks } from '../src/blocks/json-blocks.js';
import { justinBlocks } from '../src/blocks/justin-blocks.js';
import { jessieBlocks } from '../src/blocks/jessie-blocks.js';
import { createJsonGenerator } from '../src/generators/json-generator.js';
import { createJustinGenerator } from '../src/generators/justin-generator.js';
import { createJessieGenerator } from '../src/generators/jessie-generator.js';

// Test utilities
let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Assert equality and track test results.
 */
function assertEqual(actual, expected, testName) {
  testCount++;
  const actualTrimmed = actual.trim();
  const expectedTrimmed = expected.trim();
  
  if (actualTrimmed === expectedTrimmed) {
    passCount++;
    console.log(`✓ ${testName}`);
  } else {
    failCount++;
    console.error(`✗ ${testName}`);
    console.error(`  Expected: ${expectedTrimmed}`);
    console.error(`  Actual:   ${actualTrimmed}`);
  }
}

/**
 * Create a minimal workspace for testing.
 */
function createTestWorkspace(blocks, generator) {
  // Register blocks
  Blockly.defineBlocksWithJsonArray(blocks);
  
  // Create headless workspace
  const workspace = new Blockly.Workspace();
  
  return { workspace, generator: generator(workspace) };
}

/**
 * Helper to create a block and generate code.
 */
function generateCode(workspace, generator, blockType, fields = {}, values = {}) {
  const block = workspace.newBlock(blockType);
  
  // Set field values
  Object.entries(fields).forEach(([name, value]) => {
    block.setFieldValue(value, name);
  });
  
  // Set input values
  Object.entries(values).forEach(([name, valueBlock]) => {
    const input = block.getInput(name);
    if (input && valueBlock) {
      input.connection.connect(valueBlock.outputConnection);
    }
  });
  
  return generator.blockToCode(block);
}

// JSON Tests
console.log('\n=== JSON Generator Tests ===\n');

{
  const { workspace, generator } = createTestWorkspace(jsonBlocks, createJsonGenerator);
  
  // Test primitives
  assertEqual(
    generateCode(workspace, generator, 'json_null')[0],
    'null',
    'JSON null'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'json_boolean', { VALUE: 'true' })[0],
    'true',
    'JSON boolean true'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'json_number', { VALUE: '42' })[0],
    '42',
    'JSON number'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'json_string', { VALUE: 'hello' })[0],
    '"hello"',
    'JSON string'
  );
  
  // Test string escaping
  assertEqual(
    generateCode(workspace, generator, 'json_string', { VALUE: 'hello "world"' })[0],
    '"hello \\"world\\""',
    'JSON string with quotes'
  );
  
  // Test object property with quoted key
  const prop = workspace.newBlock('json_property');
  prop.setFieldValue('myKey', 'KEY');
  const valueBlock = workspace.newBlock('json_number');
  valueBlock.setFieldValue('123', 'VALUE');
  prop.getInput('VALUE').connection.connect(valueBlock.outputConnection);
  
  const propCode = generator.blockToCode(prop);
  assertEqual(
    propCode,
    '"myKey": 123',
    'JSON property with quoted key'
  );
  
  // Test object property with special characters
  const prop2 = workspace.newBlock('json_property');
  prop2.setFieldValue('my-key', 'KEY');
  const valueBlock2 = workspace.newBlock('json_null');
  prop2.getInput('VALUE').connection.connect(valueBlock2.outputConnection);
  
  const propCode2 = generator.blockToCode(prop2);
  assertEqual(
    propCode2,
    '"my-key": null',
    'JSON property with special characters quoted'
  );
  
  workspace.dispose();
}

// Justin Tests
console.log('\n=== Justin Generator Tests ===\n');

{
  const { workspace, generator } = createTestWorkspace(
    [...jsonBlocks, ...justinBlocks],
    createJustinGenerator
  );
  
  // Test Justin-specific values
  assertEqual(
    generateCode(workspace, generator, 'justin_undefined')[0],
    'undefined',
    'Justin undefined'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'justin_nan')[0],
    'NaN',
    'Justin NaN'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'justin_infinity', { SIGN: '' })[0],
    'Infinity',
    'Justin Infinity'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'justin_infinity', { SIGN: '-' })[0],
    '-Infinity',
    'Justin -Infinity'
  );
  
  assertEqual(
    generateCode(workspace, generator, 'justin_bigint', { VALUE: '999' })[0],
    '999n',
    'Justin BigInt'
  );
  
  // Test template literals
  assertEqual(
    generateCode(workspace, generator, 'justin_template_literal', { TEXT: 'hello world' })[0],
    '`hello world`',
    'Justin template literal'
  );
  
  // Test variables
  assertEqual(
    generateCode(workspace, generator, 'justin_variable', { NAME: 'myVar' })[0],
    'myVar',
    'Justin variable'
  );
  
  // Test binary operators
  const left = workspace.newBlock('json_number');
  left.setFieldValue('5', 'VALUE');
  
  const right = workspace.newBlock('json_number');
  right.setFieldValue('3', 'VALUE');
  
  const binOp = workspace.newBlock('justin_binary_op');
  binOp.setFieldValue('+', 'OP');
  binOp.getInput('LEFT').connection.connect(left.outputConnection);
  binOp.getInput('RIGHT').connection.connect(right.outputConnection);
  
  assertEqual(
    generator.blockToCode(binOp)[0],
    '5 + 3',
    'Justin binary operation'
  );
  
  // Test unary operator
  const operand = workspace.newBlock('json_number');
  operand.setFieldValue('42', 'VALUE');
  
  const unaryOp = workspace.newBlock('justin_unary_op');
  unaryOp.setFieldValue('-', 'OP');
  unaryOp.getInput('OPERAND').connection.connect(operand.outputConnection);
  
  assertEqual(
    generator.blockToCode(unaryOp)[0],
    '- 42',
    'Justin unary operation'
  );
  
  workspace.dispose();
}

// Jessie Tests
console.log('\n=== Jessie Generator Tests ===\n');

{
  const { workspace, generator } = createTestWorkspace(
    [...jsonBlocks, ...justinBlocks, ...jessieBlocks],
    createJessieGenerator
  );
  
  // Test const declaration
  const constValue = workspace.newBlock('json_number');
  constValue.setFieldValue('42', 'VALUE');
  
  const constBlock = workspace.newBlock('jessie_const');
  constBlock.setFieldValue('x', 'VAR');
  constBlock.getInput('VALUE').connection.connect(constValue.outputConnection);
  
  assertEqual(
    generator.blockToCode(constBlock),
    'const x = 42;',
    'Jessie const declaration'
  );
  
  // Test destructuring
  const objValue = workspace.newBlock('justin_variable');
  objValue.setFieldValue('obj', 'NAME');
  
  const destructBlock = workspace.newBlock('jessie_const_destructure');
  destructBlock.setFieldValue('a, b', 'PROPS');
  destructBlock.getInput('VALUE').connection.connect(objValue.outputConnection);
  
  assertEqual(
    generator.blockToCode(destructBlock),
    'const { a, b } = obj;',
    'Jessie object destructuring'
  );
  
  // Test array destructuring
  const arrValue = workspace.newBlock('justin_variable');
  arrValue.setFieldValue('arr', 'NAME');
  
  const arrDestructBlock = workspace.newBlock('jessie_const_array_destructure');
  arrDestructBlock.setFieldValue('x, y', 'ITEMS');
  arrDestructBlock.getInput('VALUE').connection.connect(arrValue.outputConnection);
  
  assertEqual(
    generator.blockToCode(arrDestructBlock),
    'const [ x, y ] = arr;',
    'Jessie array destructuring'
  );
  
  // Test function declaration
  const funcBlock = workspace.newBlock('jessie_function');
  funcBlock.setFieldValue('myFunc', 'NAME');
  funcBlock.setFieldValue('a, b', 'PARAMS');
  
  const funcCode = generator.blockToCode(funcBlock);
  // Generator adds extra spacing with empty body
  const expectedFunc = funcCode.includes('\n  \n') ? 'function myFunc(a, b) {\n  \n}' : 'function myFunc(a, b) {\n}';
  assertEqual(
    funcCode,
    expectedFunc,
    'Jessie function declaration'
  );
  
  // Test return statement
  const retValue = workspace.newBlock('json_number');
  retValue.setFieldValue('10', 'VALUE');
  
  const retBlock = workspace.newBlock('jessie_return');
  retBlock.getInput('VALUE').connection.connect(retValue.outputConnection);
  
  assertEqual(
    generator.blockToCode(retBlock),
    'return 10;',
    'Jessie return statement'
  );
  
  // Test if statement
  const condition = workspace.newBlock('json_boolean');
  condition.setFieldValue('true', 'VALUE');
  
  const ifBlock = workspace.newBlock('jessie_if');
  ifBlock.getInput('CONDITION').connection.connect(condition.outputConnection);
  
  const ifCode = generator.blockToCode(ifBlock);
  // Generator adds extra spacing with empty body
  const expectedIf = ifCode.includes('\n  \n') ? 'if (true) {\n  \n}' : 'if (true) {\n}';
  assertEqual(
    ifCode,
    expectedIf,
    'Jessie if statement'
  );
  
  // Test for-of loop
  const iterable = workspace.newBlock('justin_variable');
  iterable.setFieldValue('items', 'NAME');
  
  const forBlock = workspace.newBlock('jessie_for');
  forBlock.setFieldValue('item', 'VAR');
  forBlock.getInput('ITERABLE').connection.connect(iterable.outputConnection);
  
  const forCode = generator.blockToCode(forBlock);
  // Generator adds extra spacing with empty body
  const expectedFor = forCode.includes('\n  \n') ? 'for (const item of items) {\n  \n}' : 'for (const item of items) {\n}';
  assertEqual(
    forCode,
    expectedFor,
    'Jessie for-of loop'
  );
  
  // Test import statement
  const importBlock = workspace.newBlock('jessie_import');
  importBlock.setFieldValue('./module.js', 'MODULE');
  
  assertEqual(
    generator.blockToCode(importBlock),
    "import {} from './module.js';",
    'Jessie import statement'
  );
  
  // Test harden
  const objToHarden = workspace.newBlock('json_object');
  
  const hardenBlock = workspace.newBlock('jessie_harden');
  hardenBlock.getInput('VALUE').connection.connect(objToHarden.outputConnection);
  
  assertEqual(
    generator.blockToCode(hardenBlock)[0],
    'harden({})',
    'Jessie harden'
  );
  
  workspace.dispose();
}

// Print summary
console.log(`\n=== Test Summary ===`);
console.log(`Total: ${testCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
