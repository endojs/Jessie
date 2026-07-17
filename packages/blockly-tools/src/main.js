/**
 * @file Main entry point for Jessie Blockly tools.
 * Initializes workspaces, registers blocks, and handles UI interactions.
 * @see {initializeWorkspace}
 * @see {setupTabSwitching}
 * @see {setupCodeGeneration}
 */

import * as Blockly from 'blockly';
import { jsonBlocks } from './blocks/json-blocks.js';
import { justinBlocks } from './blocks/justin-blocks.js';
import { jessieBlocks } from './blocks/jessie-blocks.js';
import { createJsonGenerator } from './generators/json-generator.js';
import { createJustinGenerator } from './generators/justin-generator.js';
import { createJessieGenerator } from './generators/jessie-generator.js';
import { jsonToolbox } from './toolbox/json-toolbox.js';
import { justinToolbox } from './toolbox/justin-toolbox.js';
import { jessieToolbox } from './toolbox/jessie-toolbox.js';

/**
 * Initialize a Blockly workspace with blocks and generator.
 * @param {string} containerId - DOM element ID for the workspace
 * @param {Array} blocks - Block definitions
 * @param {object} toolbox - Toolbox configuration
 * @param {Function} generatorFactory - Function to create code generator
 * @returns {object} Workspace and generator
 */
const initializeWorkspace = (containerId, blocks, toolbox, generatorFactory) => {
  // Register blocks
  Blockly.defineBlocksWithJsonArray(blocks);

  // Create workspace
  const workspace = Blockly.inject(containerId, {
    toolbox,
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
    trashcan: true,
  });

  // Create generator
  const generator = generatorFactory(workspace);

  return { workspace, generator };
};

/**
 * Set up tab switching functionality.
 * @param {object} workspaces - Map of workspace objects
 */
const setupTabSwitching = workspaces => {
  const tabs = document.querySelectorAll('.tab');
  const containers = document.querySelectorAll('.tool-container');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tool = tab.dataset.tool;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active container
      containers.forEach(c => c.classList.remove('active'));
      document.getElementById(`${tool}-tool`).classList.add('active');

      // Resize workspace to fit container
      const workspace = workspaces[tool].workspace;
      Blockly.svgResize(workspace);
    });
  });
};

/**
 * Set up code generation for a workspace.
 * @param {string} tool - Tool name (json, justin, or jessie)
 * @param {Blockly.WorkspaceSvg} workspace - The workspace
 * @param {object} generator - The code generator
 */
const setupCodeGeneration = (tool, workspace, generator) => {
  const outputElement = document.getElementById(`${tool}-output`);

  const updateCode = () => {
    try {
      const code = generator.workspaceToCode(workspace);
      outputElement.textContent = code || '// Drag blocks to generate code...';
    } catch (error) {
      outputElement.textContent = `// Error generating code:\n// ${error.message}`;
    }
  };

  // Update code when workspace changes
  workspace.addChangeListener(updateCode);

  // Initial update
  updateCode();
};

/**
 * Set up copy to clipboard functionality.
 */
const setupCopyButtons = () => {
  const copyButtons = document.querySelectorAll('.copy-button');

  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const outputId = `${button.dataset.output  }-output`;
      const outputElement = document.getElementById(outputId);
      const code = outputElement.textContent;

      navigator.clipboard.writeText(code).then(
        () => {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        },
        err => {
          console.error('Failed to copy:', err);
          button.textContent = 'Failed';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        },
      );
    });
  });
};

// Initialize all workspaces
const workspaces = {
  json: initializeWorkspace('json-blockly', jsonBlocks, jsonToolbox, createJsonGenerator),
  justin: initializeWorkspace('justin-blockly', justinBlocks, justinToolbox, createJustinGenerator),
  jessie: initializeWorkspace('jessie-blockly', jessieBlocks, jessieToolbox, createJessieGenerator),
};

// Set up code generation for each workspace
Object.entries(workspaces).forEach(([tool, { workspace, generator }]) => {
  setupCodeGeneration(tool, workspace, generator);
});

// Set up UI interactions
setupTabSwitching(workspaces);
setupCopyButtons();

// Handle window resize
window.addEventListener('resize', () => {
  Object.values(workspaces).forEach(({ workspace }) => {
    Blockly.svgResize(workspace);
  });
});
