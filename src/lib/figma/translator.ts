import {
  FigmaNode,
  FigmaFile,
  JSXElement,
  GeneratedComponent,
  TranslationConfig,
} from './types';
import { NODE_TYPE_MAP, COMPONENT_CONFIG } from './constants';
import { StyleMapper } from './style-mapper';

export class TranslationEngine {
  private config: TranslationConfig;
  private styleMapper: StyleMapper;
  private processedNodes: Set<string>;

  constructor(config?: Partial<TranslationConfig>) {
    this.config = {
      indentSize: config?.indentSize || COMPONENT_CONFIG.defaultIndentSize,
      useArbitraryValues: config?.useArbitraryValues ?? true,
      generateComments: config?.generateComments ?? false,
      formatCode: config?.formatCode ?? true,
      componentNamePrefix: config?.componentNamePrefix,
    };
    this.styleMapper = new StyleMapper();
    this.processedNodes = new Set();
  }

  /**
   * Main translation method - converts Figma file to React components
   */
  translate(fileData: FigmaFile): GeneratedComponent[] {
    const components: GeneratedComponent[] = [];

    // Process each top-level page/canvas
    const pages = fileData.document.children || [];

    for (const page of pages) {
      if (page.type === 'CANVAS' && page.visible !== false) {
        const component = this.translatePage(page);
        if (component) {
          components.push(component);
        }
      }
    }

    return components;
  }

  /**
   * Translate a single page/canvas to a component
   */
  private translatePage(page: FigmaNode): GeneratedComponent | null {
    try {
      this.processedNodes.clear();

      // Generate component name from page name
      const componentName = this.sanitizeComponentName(page.name);

      // Traverse the page structure
      const rootElement = this.traverseNode(page);

      // Generate JSX string
      const jsx = this.generateComponentString(componentName, rootElement);

      // Count elements for stats
      const elementCount = this.countElements(rootElement);

      return {
        name: componentName,
        jsx,
        nodeId: page.id,
        stats: {
          lines: jsx.split('\n').length,
          elements: elementCount,
        },
      };
    } catch (error) {
      console.error(`Error translating page ${page.name}:`, error);
      return null;
    }
  }

  /**
   * Recursively traverse Figma node tree
   */
  private traverseNode(node: FigmaNode, depth: number = 0): JSXElement {
    // Prevent infinite loops
    if (this.processedNodes.has(node.id)) {
      return this.createEmptyElement();
    }
    this.processedNodes.add(node.id);

    // Skip invisible nodes
    if (node.visible === false) {
      return this.createEmptyElement();
    }

    // Create JSX element
    const element: JSXElement = {
      type: this.mapNodeType(node),
      props: {},
      styles: [],
      children: [],
    };

    // Map styles using StyleMapper
    element.styles = this.styleMapper.mapNode(node);

    // Extract text content
    if (node.type === 'TEXT' && node.characters) {
      element.content = this.escapeText(node.characters);
    }

    // Add image source for image nodes
    if (this.hasImageFill(node)) {
      element.props.src = ''; // Will be filled later with asset URLs
      element.props.alt = node.name || 'Image';
    }

    // Process children recursively
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childElement = this.traverseNode(child, depth + 1);
        if (childElement.type !== 'empty') {
          element.children.push(childElement);
        }
      }
    }

    return element;
  }

  /**
   * Map Figma node type to HTML element
   */
  private mapNodeType(node: FigmaNode): string {
    // Special cases
    if (node.type === 'TEXT') {
      return 'p';
    }

    if (this.hasImageFill(node)) {
      return 'img';
    }

    // Use mapping or default to div
    return NODE_TYPE_MAP[node.type] || 'div';
  }

  /**
   * Check if node has an image fill
   */
  private hasImageFill(node: FigmaNode): boolean {
    if (!node.fills || !Array.isArray(node.fills)) {
      return false;
    }

    return node.fills.some(
      (fill) => fill.type === 'IMAGE' && fill.visible !== false
    );
  }

  /**
   * Generate complete component string
   */
  private generateComponentString(
    name: string,
    rootElement: JSXElement
  ): string {
    const jsx = this.generateJSX(rootElement, 2);

    return `export default function ${name}() {
  return (
${jsx}
  );
}`;
  }

  /**
   * Generate JSX string from element tree
   */
  private generateJSX(element: JSXElement, indent: number = 0): string {
    if (element.type === 'empty') {
      return '';
    }

    const indentation = ' '.repeat(indent);
    const className = element.styles.join(' ').trim();

    let jsx = `${indentation}<${element.type}`;

    // Add className if exists
    if (className) {
      jsx += ` className="${className}"`;
    }

    // Add other props
    Object.entries(element.props).forEach(([key, value]) => {
      if (typeof value === 'string') {
        jsx += ` ${key}="${value}"`;
      } else if (typeof value === 'boolean' && value) {
        jsx += ` ${key}`;
      } else {
        jsx += ` ${key}={${JSON.stringify(value)}}`;
      }
    });

    // Self-closing or with children/content
    if (element.children.length === 0 && !element.content) {
      jsx += ' />';
    } else {
      jsx += '>';

      // Add content (for text nodes)
      if (element.content) {
        if (element.content.includes('\n')) {
          // Multiline text
          jsx += '\n';
          const lines = element.content.split('\n');
          lines.forEach((line) => {
            jsx += `${indentation}  ${line}\n`;
          });
          jsx += `${indentation}`;
        } else {
          jsx += element.content;
        }
      }

      // Add children
      if (element.children.length > 0) {
        jsx += '\n';
        element.children.forEach((child) => {
          const childJsx = this.generateJSX(child, indent + 2);
          if (childJsx) {
            jsx += childJsx + '\n';
          }
        });
        jsx += `${indentation}`;
      }

      jsx += `</${element.type}>`;
    }

    return jsx;
  }

  /**
   * Sanitize component name (remove special chars, ensure valid JS identifier)
   */
  private sanitizeComponentName(name: string): string {
    // Remove special characters and spaces
    let sanitized = name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .trim();

    // Ensure starts with capital letter
    sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);

    // Handle empty or reserved names
    if (!sanitized || COMPONENT_CONFIG.reservedNames.includes(sanitized.toLowerCase())) {
      sanitized = 'Component';
    }

    // Truncate if too long
    if (sanitized.length > COMPONENT_CONFIG.maxComponentNameLength) {
      sanitized = sanitized.substring(0, COMPONENT_CONFIG.maxComponentNameLength);
    }

    // Add prefix if configured
    if (this.config.componentNamePrefix) {
      sanitized = this.config.componentNamePrefix + sanitized;
    }

    return sanitized;
  }

  /**
   * Escape text content for JSX
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}');
  }

  /**
   * Create empty element (for skipped nodes)
   */
  private createEmptyElement(): JSXElement {
    return {
      type: 'empty',
      props: {},
      styles: [],
      children: [],
    };
  }

  /**
   * Count total elements in tree
   */
  private countElements(element: JSXElement): number {
    if (element.type === 'empty') {
      return 0;
    }

    let count = 1;
    for (const child of element.children) {
      count += this.countElements(child);
    }
    return count;
  }
}
