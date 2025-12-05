/**
 * @file Vitest test suite for Blockly code generators.
 * Tests use JSON block definitions for input and expected code output.
 */

import { describe, it, expect, beforeAll } from 'vitest';
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

  // Set input values (value inputs) and statement inputs
  if (blockDef.inputs) {
    Object.entries(blockDef.inputs).forEach(([name, inputDef]) => {
      if (inputDef.block) {
        const childBlock = createBlockFromJson(workspace, inputDef.block);
        const input = block.getInput(name);
        if (input) {
          // Check if it's a value input or statement input
          if (input.connection && childBlock.outputConnection) {
            // Value input
            input.connection.connect(childBlock.outputConnection);
          } else if (input.connection && childBlock.previousConnection) {
            // Statement input
            input.connection.connect(childBlock.previousConnection);
          }
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
 * Test a single case.
 * @param {Blockly.Workspace} workspace - The workspace
 * @param {Object} generator - The code generator
 * @param {Object} testCase - Test case definition
 */
function testCase(workspace, generator, testCase) {
  const block = createBlockFromJson(workspace, testCase.block);
  const code = generator.blockToCode(block);

  // Handle both string and array return values
  const actualCode = Array.isArray(code) ? code[0] : code;

  expect(actualCode.trim()).toBe(testCase.expected.trim());

  // Clean up
  block.dispose();
}

// Load test data
const testDataPath = join(__dirname, 'test-data.json');
const testData = JSON.parse(readFileSync(testDataPath, 'utf-8'));

describe('JSON Generator', () => {
  let workspace;
  let generator;

  beforeAll(() => {
    Blockly.defineBlocksWithJsonArray(jsonBlocks);
    workspace = new Blockly.Workspace();
    generator = createJsonGenerator(workspace);
  });

  testData.json.forEach(tc => {
    it(tc.name, () => {
      testCase(workspace, generator, tc);
    });
  });
});

describe('Justin Generator', () => {
  let workspace;
  let generator;

  beforeAll(() => {
    Blockly.defineBlocksWithJsonArray([...jsonBlocks, ...justinBlocks]);
    workspace = new Blockly.Workspace();
    generator = createJustinGenerator(workspace);
  });

  testData.justin.forEach(tc => {
    it(tc.name, () => {
      testCase(workspace, generator, tc);
    });
  });
});

describe('Jessie Generator', () => {
  let workspace;
  let generator;

  beforeAll(() => {
    Blockly.defineBlocksWithJsonArray([
      ...jsonBlocks,
      ...justinBlocks,
      ...jessieBlocks,
    ]);
    workspace = new Blockly.Workspace();
    generator = createJessieGenerator(workspace);
  });

  testData.jessie.forEach(tc => {
    it(tc.name, () => {
      testCase(workspace, generator, tc);
    });
  });
});
