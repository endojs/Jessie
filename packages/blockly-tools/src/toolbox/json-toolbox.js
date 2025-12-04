/**
 * @file Toolbox configuration for JSON blocks.
 * @see {jsonToolbox}
 */

export const jsonToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Values',
      colour: '210',
      contents: [
        { kind: 'block', type: 'json_null' },
        { kind: 'block', type: 'json_boolean' },
        { kind: 'block', type: 'json_number' },
        { kind: 'block', type: 'json_string' },
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
      ],
    },
  ],
};
