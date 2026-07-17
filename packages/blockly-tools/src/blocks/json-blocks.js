/**
 * @file Block definitions for JSON data structures.
 * @see {jsonBlocks}
 */

export const jsonBlocks = [
  {
    type: 'json_null',
    message0: 'null',
    output: 'Value',
    colour: 210,
    tooltip: 'Null value',
  },
  {
    type: 'json_boolean',
    message0: '%1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'VALUE',
        options: [
          ['true', 'true'],
          ['false', 'false'],
        ],
      },
    ],
    output: 'Value',
    colour: 210,
    tooltip: 'Boolean value',
  },
  {
    type: 'json_number',
    message0: '%1',
    args0: [
      {
        type: 'field_number',
        name: 'VALUE',
        value: 0,
      },
    ],
    output: 'Value',
    colour: 210,
    tooltip: 'Number value',
  },
  {
    type: 'json_string',
    message0: '"%1"',
    args0: [
      {
        type: 'field_input',
        name: 'VALUE',
        text: 'text',
      },
    ],
    output: 'Value',
    colour: 210,
    tooltip: 'String value',
  },
  {
    type: 'json_array',
    message0: 'array %1',
    args0: [
      {
        type: 'input_statement',
        name: 'ELEMENTS',
        check: 'ArrayElement',
      },
    ],
    output: 'Value',
    colour: 260,
    tooltip: 'Create an array',
  },
  {
    type: 'json_array_element',
    message0: 'element %1',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'ArrayElement',
    nextStatement: 'ArrayElement',
    colour: 260,
    tooltip: 'Array element',
  },
  {
    type: 'json_object',
    message0: 'object %1',
    args0: [
      {
        type: 'input_statement',
        name: 'PROPERTIES',
        check: 'Property',
      },
    ],
    output: 'Value',
    colour: 290,
    tooltip: 'Create an object',
  },
  {
    type: 'json_property',
    message0: '%1 : %2',
    args0: [
      {
        type: 'field_input',
        name: 'KEY',
        text: 'key',
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Property',
    nextStatement: 'Property',
    colour: 290,
    tooltip: 'Object property',
  },
];
