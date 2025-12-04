/**
 * @file Toolbox configuration for Jessie blocks.
 * @see {jessieToolbox}
 */

export const jessieToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Variables',
      colour: '330',
      contents: [
        { kind: 'block', type: 'jessie_const' },
        { kind: 'block', type: 'jessie_let' },
        { kind: 'block', type: 'jessie_assign' },
        { kind: 'block', type: 'justin_variable' },
      ],
    },
    {
      kind: 'category',
      name: 'Functions',
      colour: '290',
      contents: [
        { kind: 'block', type: 'jessie_function' },
        { kind: 'block', type: 'jessie_arrow' },
        { kind: 'block', type: 'jessie_return' },
        { kind: 'block', type: 'justin_call' },
        { kind: 'block', type: 'justin_argument' },
      ],
    },
    {
      kind: 'category',
      name: 'Control Flow',
      colour: '210',
      contents: [
        { kind: 'block', type: 'jessie_if' },
        { kind: 'block', type: 'jessie_if_else' },
        { kind: 'block', type: 'jessie_for' },
        { kind: 'block', type: 'jessie_while' },
        { kind: 'block', type: 'jessie_break' },
        { kind: 'block', type: 'jessie_continue' },
      ],
    },
    {
      kind: 'category',
      name: 'Error Handling',
      colour: '0',
      contents: [
        { kind: 'block', type: 'jessie_throw' },
        { kind: 'block', type: 'jessie_try_catch' },
      ],
    },
    {
      kind: 'category',
      name: 'Values',
      colour: '210',
      contents: [
        { kind: 'block', type: 'json_null' },
        { kind: 'block', type: 'json_boolean' },
        { kind: 'block', type: 'json_number' },
        { kind: 'block', type: 'json_string' },
        { kind: 'block', type: 'justin_undefined' },
        { kind: 'block', type: 'justin_nan' },
        { kind: 'block', type: 'justin_infinity' },
        { kind: 'block', type: 'justin_bigint' },
      ],
    },
    {
      kind: 'category',
      name: 'Operators',
      colour: '160',
      contents: [
        { kind: 'block', type: 'justin_binary_op' },
        { kind: 'block', type: 'justin_unary_op' },
        { kind: 'block', type: 'justin_ternary' },
      ],
    },
    {
      kind: 'category',
      name: 'Arrays',
      colour: '260',
      contents: [
        { kind: 'block', type: 'json_array' },
        { kind: 'block', type: 'json_array_element' },
      ],
    },
    {
      kind: 'category',
      name: 'Objects',
      colour: '290',
      contents: [
        { kind: 'block', type: 'json_object' },
        { kind: 'block', type: 'json_property' },
        { kind: 'block', type: 'justin_member' },
        { kind: 'block', type: 'justin_index' },
        { kind: 'block', type: 'jessie_harden' },
      ],
    },
    {
      kind: 'category',
      name: 'Module',
      colour: '160',
      contents: [
        { kind: 'block', type: 'jessie_export' },
        { kind: 'block', type: 'jessie_export_item' },
      ],
    },
  ],
};
