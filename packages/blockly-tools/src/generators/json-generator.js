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
      // Split by newlines, filter empty, remove trailing commas from each line
      const lines = elements.split('\n').filter(line => line.trim()).map(line => line.trim().replace(/,\s*$/, ''));
      const formatted = lines.join(',\n');
      return [`[\n${generator.prefixLines(formatted, generator.INDENT)}\n]`, generator.ORDER_ATOMIC];
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
      // Split by newlines, filter empty, remove trailing commas from each line
      const lines = properties.split('\n').filter(line => line.trim()).map(line => line.trim().replace(/,\s*$/, ''));
      const formatted = lines.join(',\n');
      return [`{\n${generator.prefixLines(formatted, generator.INDENT)}\n}`, generator.ORDER_ATOMIC];
    }
    return ['{}', generator.ORDER_ATOMIC];
  };

  generator.forBlock.json_property = function (block) {
    const key = block.getFieldValue('KEY');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    // JSON requires all keys to be quoted
    const escaped = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}": ${value}`;
  };

  generator.ORDER_ATOMIC = 0;
  generator.ORDER_NONE = 99;

  return generator;
};
