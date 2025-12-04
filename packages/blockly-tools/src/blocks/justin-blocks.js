/**
 * @file Block definitions for Justin pure expressions.
 * @see {justinBlocks}
 */

export const justinBlocks = [
  // Include all JSON blocks
  {
    type: 'justin_undefined',
    message0: 'undefined',
    output: 'Value',
    colour: 210,
    tooltip: 'Undefined value',
  },
  {
    type: 'justin_nan',
    message0: 'NaN',
    output: 'Value',
    colour: 210,
    tooltip: 'Not a Number',
  },
  {
    type: 'justin_infinity',
    message0: '%1Infinity',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SIGN',
        options: [
          ['', ''],
          ['-', '-'],
        ],
      },
    ],
    output: 'Value',
    colour: 210,
    tooltip: 'Infinity or -Infinity',
  },
  {
    type: 'justin_bigint',
    message0: '%1n',
    args0: [
      {
        type: 'field_input',
        name: 'VALUE',
        text: '123',
      },
    ],
    output: 'Value',
    colour: 210,
    tooltip: 'BigInt literal',
  },
  {
    type: 'justin_variable',
    message0: '%1',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'x',
      },
    ],
    output: 'Value',
    colour: 330,
    tooltip: 'Variable reference',
  },
  {
    type: 'justin_binary_op',
    message0: '%1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'LEFT',
        check: 'Value',
      },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['+', '+'],
          ['-', '-'],
          ['*', '*'],
          ['/', '/'],
          ['%', '%'],
          ['**', '**'],
          ['===', '==='],
          ['!==', '!=='],
          ['<', '<'],
          ['<=', '<='],
          ['>', '>'],
          ['>=', '>='],
          ['&&', '&&'],
          ['||', '||'],
        ],
      },
      {
        type: 'input_value',
        name: 'RIGHT',
        check: 'Value',
      },
    ],
    inputsInline: true,
    output: 'Value',
    colour: 160,
    tooltip: 'Binary operation',
  },
  {
    type: 'justin_unary_op',
    message0: '%1 %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['!', '!'],
          ['-', '-'],
          ['+', '+'],
          ['typeof', 'typeof'],
        ],
      },
      {
        type: 'input_value',
        name: 'OPERAND',
        check: 'Value',
      },
    ],
    inputsInline: true,
    output: 'Value',
    colour: 160,
    tooltip: 'Unary operation',
  },
  {
    type: 'justin_ternary',
    message0: '%1 ? %2 : %3',
    args0: [
      {
        type: 'input_value',
        name: 'CONDITION',
        check: 'Value',
      },
      {
        type: 'input_value',
        name: 'TRUE',
        check: 'Value',
      },
      {
        type: 'input_value',
        name: 'FALSE',
        check: 'Value',
      },
    ],
    inputsInline: false,
    output: 'Value',
    colour: 160,
    tooltip: 'Conditional (ternary) expression',
  },
  {
    type: 'justin_call',
    message0: 'call %1 %2',
    args0: [
      {
        type: 'input_value',
        name: 'FUNCTION',
        check: 'Value',
      },
      {
        type: 'input_statement',
        name: 'ARGS',
        check: 'Argument',
      },
    ],
    output: 'Value',
    colour: 290,
    tooltip: 'Function call',
  },
  {
    type: 'justin_argument',
    message0: 'arg %1',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Argument',
    nextStatement: 'Argument',
    colour: 290,
    tooltip: 'Function argument',
  },
  {
    type: 'justin_member',
    message0: '%1 . %2',
    args0: [
      {
        type: 'input_value',
        name: 'OBJECT',
        check: 'Value',
      },
      {
        type: 'field_input',
        name: 'PROPERTY',
        text: 'prop',
      },
    ],
    inputsInline: true,
    output: 'Value',
    colour: 290,
    tooltip: 'Property access',
  },
  {
    type: 'justin_index',
    message0: '%1 [ %2 ]',
    args0: [
      {
        type: 'input_value',
        name: 'OBJECT',
        check: 'Value',
      },
      {
        type: 'input_value',
        name: 'INDEX',
        check: 'Value',
      },
    ],
    inputsInline: true,
    output: 'Value',
    colour: 290,
    tooltip: 'Computed property access',
  },
];
