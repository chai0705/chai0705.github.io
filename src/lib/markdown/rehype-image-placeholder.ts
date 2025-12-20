/**
 * Rehype plugin to enhance images with lazy loading and placeholder containers
 * Wraps images in figure elements with placeholder styling for CLS prevention
 */
import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeImagePlaceholder() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'img') return;
      if (index === undefined || !parent) return;

      // Skip if already wrapped (e.g., in a figure or custom component)
      if (parent.type === 'element' && parent.tagName === 'figure') return;

      // Get existing class
      const existingClass = typeof node.properties?.class === 'string' ? node.properties.class : '';

      // Add lazy loading attributes and class
      node.properties = {
        ...node.properties,
        loading: 'lazy',
        decoding: 'async',
        class: `${existingClass} markdown-image`.trim(),
      };

      // Wrap in figure container
      const wrapper: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { class: 'markdown-image-wrapper' },
        children: [node],
      };

      // Replace img with wrapper
      parent.children[index] = wrapper;
    });
  };
}
