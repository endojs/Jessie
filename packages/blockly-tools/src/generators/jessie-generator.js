/**
 * @file Code generator for Jessie blocks.
 * @see {createJessieGenerator}
 */

import * as Blockly from 'blockly';
import { createJustinGenerator } from './justin-generator.js';

/**
 * Create a Jessie code generator.
 * @param {Blockly.WorkspaceSvg} workspace - The Blockly workspace
 * @returns {object} Generator object
 */
export const createJessieGenerator = workspace => {
  const generator = createJustinGenerator(workspace);

  generator.scrub_ = function (block, code, thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
      return `${code  }\n${  generator.blockToCode(nextBlock)}`;
    }
    return code;
  };

  generator.forBlock.jessie_const = function (block) {
    const varName = block.getFieldValue('VAR');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    return `const ${  varName  } = ${  value  };`;
  };

  generator.forBlock.jessie_let = function (block) {
    const varName = block.getFieldValue('VAR');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    return `let ${  varName  } = ${  value  };`;
  };

  generator.forBlock.jessie_assign = function (block) {
    const varName = block.getFieldValue('VAR');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    return `${varName  } = ${  value  };`;
  };

  generator.forBlock.jessie_function = function (block) {
    const name = block.getFieldValue('NAME');
    const params = block.getFieldValue('PARAMS');
    const body = generator.statementToCode(block, 'BODY') || '';
    return (
      `function ${ 
      name 
      }(${ 
      params 
      }) {\n${ 
      generator.prefixLines(body, generator.INDENT) 
      }\n}`
    );
  };

  generator.forBlock.jessie_arrow = function (block) {
    const params = block.getFieldValue('PARAMS');
    const expr = generator.valueToCode(block, 'EXPR', generator.ORDER_NONE) || 'null';
    return [`(${  params  }) => ${  expr}`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.jessie_return = function (block) {
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '';
    return `return ${  value  };`;
  };

  generator.forBlock.jessie_if = function (block) {
    const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
    const then = generator.statementToCode(block, 'THEN') || '';
    return `if (${  condition  }) {\n${  generator.prefixLines(then, generator.INDENT)  }\n}`;
  };

  generator.forBlock.jessie_if_else = function (block) {
    const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
    const then = generator.statementToCode(block, 'THEN') || '';
    const elseBranch = generator.statementToCode(block, 'ELSE') || '';
    return (
      `if (${ 
      condition 
      }) {\n${ 
      generator.prefixLines(then, generator.INDENT) 
      }\n} else {\n${ 
      generator.prefixLines(elseBranch, generator.INDENT) 
      }\n}`
    );
  };

  generator.forBlock.jessie_for = function (block) {
    const varName = block.getFieldValue('VAR');
    const iterable = generator.valueToCode(block, 'ITERABLE', generator.ORDER_NONE) || '[]';
    const body = generator.statementToCode(block, 'BODY') || '';
    return (
      `for (const ${ 
      varName 
      } of ${ 
      iterable 
      }) {\n${ 
      generator.prefixLines(body, generator.INDENT) 
      }\n}`
    );
  };

  generator.forBlock.jessie_while = function (block) {
    const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
    const body = generator.statementToCode(block, 'BODY') || '';
    return `while (${  condition  }) {\n${  generator.prefixLines(body, generator.INDENT)  }\n}`;
  };

  generator.forBlock.jessie_break = function () {
    return 'break;';
  };

  generator.forBlock.jessie_continue = function () {
    return 'continue;';
  };

  generator.forBlock.jessie_throw = function (block) {
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'new Error()';
    return `throw ${  value  };`;
  };

  generator.forBlock.jessie_try_catch = function (block) {
    const tryBody = generator.statementToCode(block, 'TRY') || '';
    const errorVar = block.getFieldValue('ERROR');
    const catchBody = generator.statementToCode(block, 'CATCH') || '';
    return (
      `try {\n${ 
      generator.prefixLines(tryBody, generator.INDENT) 
      }\n} catch (${ 
      errorVar 
      }) {\n${ 
      generator.prefixLines(catchBody, generator.INDENT) 
      }\n}`
    );
  };

  generator.forBlock.jessie_harden = function (block) {
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC) || 'null';
    return [`harden(${  value  })`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.jessie_export = function (block) {
    const exports = generator.statementToCode(block, 'EXPORTS');
    if (exports) {
      const exportList = exports.split(',\n').join(', ');
      return `export { ${  exportList  } };`;
    }
    return 'export {};';
  };

  generator.forBlock.jessie_export_item = function (block) {
    const name = block.getFieldValue('NAME');
    return name;
  };

  return generator;
};
