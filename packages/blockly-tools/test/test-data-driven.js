/**
 * @file Data-driven test suite for Blockly code generators.
 * Tests use JSON block definitions for input and expected code output.
 * @see {runTests}
 */

import * as Blockly from 'blockly';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { jsonBlocks } from '../src/blocks/json-blocks.js';
import { justinBlocks } from '../src/blocks/justin-blocks.js';
import { jessieBlocks } from '../src/blocks/jessie-blocks.js';
import { createJsonGenerator } from '../src/generators/json-generator.js';
import { createJustinGenerator } from '../src/generators/justin-generator.js';
import { createJessieGenerator } from '../src/generators/jessie-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Create a block from JSON definition recursively.
 * @param {Blockly.Workspace} workspace - The workspace
 * @param {Object} blockDef - Block definition from JSON
 * @returns {Blockly.Block} The created block
 */
function createBlockFromJson(workspace, blockDef) {
  const block = workspace.newBlock(blockDef.type);

  // Set field values
  if (blockDef.fields) {
    Object.entries(blockDef.fields).forEach(([name, value]) => {
      block.setFieldValue(String(value), name);
    });
  }

  // Set input values (value inputs)
  if (blockDef.inputs) {
    Object.entries(blockDef.inputs).forEach(([name, inputDef]) => {
      if (inputDef.block) {
        const childBlock = createBlockFromJson(workspace, inputDef.block);
        const input = block.getInput(name);
        if (input && childBlock.outputConnection) {
          input.connection.connect(childBlock.outputConnection);
        }
      }
    });
  }

  // Set statement inputs (next blocks)
  if (blockDef.next) {
    const nextBlock = createBlockFromJson(workspace, blockDef.next);
    if (block.nextConnection && nextBlock.previousConnection) {
      block.nextConnection.connect(nextBlock.previousConnection);
    }
  }

  return block;
}

/**
 * Run a single test case.
 * @param {Blockly.Workspace} workspace - The workspace
 * @param {Object} generator - The code generator
 * @param {Object} testCase - Test case definition
 */
function runTestCase(workspace, generator, testCase) {
  const block = createBlockFromJson(workspace, testCase.block);
  const code = generator.blockToCode(block);

  // Handle both string and array return values
  const actualCode = Array.isArray(code) ? code[0] : code;

  assertEqual(actualCode, testCase.expected, testCase.name);

  // Clean up
  block.dispose();
}

/**
 * Run all tests for a language.
 * @param {string} language - Language name (json, justin, jessie)
 * @param {Array} blocks - Block definitions
 * @param {Function} generatorFactory - Generator factory function
 * @param {Array} testCases - Test cases from JSON
 */
function runLanguageTests(language, blocks, generatorFactory, testCases) {
  console.log(`\n=== ${language.toUpperCase()} Generator Tests ===\n`);

  // Register blocks
  Blockly.defineBlocksWithJsonArray(blocks);

  // Create headless workspace
  const workspace = new Blockly.Workspace();
  const generator = generatorFactory(workspace);

  // Run each test case
  testCases.forEach(testCase => {
    runTestCase(workspace, generator, testCase);
  });

  workspace.dispose();
}

/**
 * Main test runner.
 */
function runTests() {
  // Load test data
  const testDataPath = join(__dirname, 'test-data.json');
  const testData = JSON.parse(readFileSync(testDataPath, 'utf-8'));

  // Run tests for each language
  runLanguageTests('json', jsonBlocks, createJsonGenerator, testData.json);
  runLanguageTests(
    'justin',
    [...jsonBlocks, ...justinBlocks],
    createJustinGenerator,
    testData.justin,
  );
  runLanguageTests(
    'jessie',
    [...jsonBlocks, ...justinBlocks, ...jessieBlocks],
    createJessieGenerator,
    testData.jessie,
  );

  // Print summary
  console.log(`\n=== Test Summary ===`);
  console.log(`Total: ${testCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runTests();
