/**
 * @file Code generator for Justin blocks.
 * @see {createJustinGenerator}
 */

import * as Blockly from 'blockly';
import { createJsonGenerator } from './json-generator.js';

/**
 * Create a Justin code generator.
 * @param {Blockly.WorkspaceSvg} workspace - The Blockly workspace
 * @returns {object} Generator object
 */
export const createJustinGenerator = workspace => {
  const generator = createJsonGenerator(workspace);

  generator.forBlock.justin_undefined = function () {
    return ['undefined', generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_nan = function () {
    return ['NaN', generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_infinity = function (block) {
    const sign = block.getFieldValue('SIGN');
    return [`${sign  }Infinity`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_bigint = function (block) {
    const value = block.getFieldValue('VALUE');
    return [`${value  }n`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_variable = function (block) {
    const name = block.getFieldValue('NAME');
    return [name, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_binary_op = function (block) {
    const order = {
      '**': 1,
      '*': 2,
      '/': 2,
      '%': 2,
      '+': 3,
      '-': 3,
      '<': 4,
      '<=': 4,
      '>': 4,
      '>=': 4,
      '===': 5,
      '!==': 5,
      '&&': 6,
      '||': 7,
    };
    const op = block.getFieldValue('OP');
    const precedence = order[op] || 10;
    const left = generator.valueToCode(block, 'LEFT', precedence) || '0';
    const right = generator.valueToCode(block, 'RIGHT', precedence) || '0';
    return [`${left  } ${  op  } ${  right}`, precedence];
  };

  generator.forBlock.justin_unary_op = function (block) {
    const op = block.getFieldValue('OP');
    const operand = generator.valueToCode(block, 'OPERAND', generator.ORDER_ATOMIC) || '0';
    return [`${op  } ${  operand}`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_ternary = function (block) {
    const condition = generator.valueToCode(block, 'CONDITION', 8) || 'false';
    const trueValue = generator.valueToCode(block, 'TRUE', 8) || 'null';
    const falseValue = generator.valueToCode(block, 'FALSE', 8) || 'null';
    return [`${condition  } ? ${  trueValue  } : ${  falseValue}`, 8];
  };

  generator.forBlock.justin_call = function (block) {
    const func = generator.valueToCode(block, 'FUNCTION', generator.ORDER_ATOMIC) || 'f';
    const args = generator.statementToCode(block, 'ARGS');
    if (args) {
      const argList = args.split(',\n').join(', ');
      return [`${func  }(${  argList  })`, generator.ORDER_ATOMIC];
    }
    return [`${func  }()`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_argument = function (block) {
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    return value;
  };

  generator.forBlock.justin_member = function (block) {
    const object = generator.valueToCode(block, 'OBJECT', generator.ORDER_ATOMIC) || 'obj';
    const property = block.getFieldValue('PROPERTY');
    return [`${object  }.${  property}`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_index = function (block) {
    const object = generator.valueToCode(block, 'OBJECT', generator.ORDER_ATOMIC) || 'obj';
    const index = generator.valueToCode(block, 'INDEX', generator.ORDER_NONE) || '0';
    return [`${object  }[${  index  }]`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_template_literal = function (block) {
    const text = block.getFieldValue('TEXT');
    // Escape backticks and backslashes
    const escaped = text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
    return [`\`${  escaped  }\``, generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_template_with_holes = function (block) {
    const parts = generator.statementToCode(block, 'PARTS');
    if (parts) {
      return [`\`${  parts  }\``, generator.ORDER_ATOMIC];
    }
    return ['``', generator.ORDER_ATOMIC];
  };

  generator.forBlock.justin_template_text = function (block) {
    const text = block.getFieldValue('TEXT');
    // Escape backticks and backslashes in template literals
    const escaped = text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    return escaped;
  };

  generator.forBlock.justin_template_expr = function (block) {
    const expr = generator.valueToCode(block, 'EXPR', generator.ORDER_NONE) || '';
    return `\${${  expr  }}`;
  };

  return generator;
};
