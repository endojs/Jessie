/**
 * @file Code generator for JSON blocks.
 * @see {createJsonGenerator}
 */

import * as Blockly from 'blockly';

/**
 * Create a JSON code generator.
 * @param {Blockly.WorkspaceSvg} workspace - The Blockly workspace
 * @returns {object} Generator object
 */
export const createJsonGenerator = workspace => {
  const generator = new Blockly.Generator('JSON');

  generator.scrub_ = function (block, code, thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
      return `${code  },\n${  generator.blockToCode(nextBlock)}`;
    }
    return code;
  };

  generator.forBlock.json_null = function () {
    return ['null', generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_boolean = function (block) {
    const value = block.getFieldValue('VALUE');
    return [value, generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_number = function (block) {
    const value = block.getFieldValue('VALUE');
    return [String(value), generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_string = function (block) {
    const value = block.getFieldValue('VALUE');
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return [`"${  escaped  }"`, generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_array = function (block) {
    const elements = generator.statementToCode(block, 'ELEMENTS');
    if (elements) {
      return [`[\n${  generator.prefixLines(elements, generator.INDENT)  }\n]`, generator.ORDER_ATOMIC];
    }
    return ['[]', generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_array_element = function (block) {
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    return value;
  };

  generator.forBlock.json_object = function (block) {
    const properties = generator.statementToCode(block, 'PROPERTIES');
    if (properties) {
      return [`{\n${  generator.prefixLines(properties, generator.INDENT)  }\n}`, generator.ORDER_ATOMIC];
    }
    return ['{}', generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_property = function (block) {
    const key = block.getFieldValue('KEY');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    // Use quotes if key contains special characters
    const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
    const keyStr = needsQuotes ? `"${  key  }"` : key;
    return `${keyStr  }: ${  value}`;
  };

  generator.ORDER_ATOMIC = 0;
  generator.ORDER_NONE = 99;

  return generator;
};
