import { FigmaNode, Color } from './types';
import {
  SPACING_MAP,
  FONT_WEIGHT_MAP,
  TEXT_ALIGN_MAP,
  BORDER_RADIUS_MAP,
  PRIMARY_AXIS_ALIGN_MAP,
  COUNTER_AXIS_ALIGN_MAP,
} from './constants';

export class StyleMapper {
  /**
   * Main method - map all styles from a Figma node
   */
  mapNode(node: FigmaNode): string[] {
    const classes: string[] = [];

    // Layout styles (Auto Layout / Flexbox)
    if (node.layoutMode && node.layoutMode !== 'NONE') {
      classes.push(...this.mapAutoLayout(node));
    }

    // Sizing
    classes.push(...this.mapDimensions(node));

    // Spacing (padding)
    classes.push(...this.mapPadding(node));

    // Background fills
    if (node.fills) {
      classes.push(...this.mapFills(node.fills));
    }

    // Border/Stroke
    if (node.strokes && node.strokes.length > 0) {
      classes.push(...this.mapStrokes(node));
    }

    // Border radius
    if (node.cornerRadius !== undefined || node.rectangleCornerRadii) {
      classes.push(...this.mapBorderRadius(node));
    }

    // Typography (for text nodes)
    if (node.type === 'TEXT' && node.style) {
      classes.push(...this.mapTypography(node));
    }

    // Effects (shadows, blur)
    if (node.effects && node.effects.length > 0) {
      classes.push(...this.mapEffects(node.effects));
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity < 1) {
      classes.push(this.mapOpacity(node.opacity));
    }

    return classes.filter((c) => c.length > 0);
  }

  /**
   * Map Auto Layout to Flexbox
   */
  private mapAutoLayout(node: FigmaNode): string[] {
    const classes: string[] = ['flex'];

    // Direction
    if (node.layoutMode === 'HORIZONTAL') {
      classes.push('flex-row');
    } else if (node.layoutMode === 'VERTICAL') {
      classes.push('flex-col');
    }

    // Item spacing (gap)
    if (node.itemSpacing !== undefined && node.itemSpacing > 0) {
      const gapClass = this.mapSpacing(node.itemSpacing, 'gap');
      if (gapClass) classes.push(gapClass);
    }

    // Primary axis alignment (justify)
    if (node.primaryAxisAlignItems && PRIMARY_AXIS_ALIGN_MAP[node.primaryAxisAlignItems]) {
      classes.push(PRIMARY_AXIS_ALIGN_MAP[node.primaryAxisAlignItems]);
    }

    // Counter axis alignment (items)
    if (node.counterAxisAlignItems && COUNTER_AXIS_ALIGN_MAP[node.counterAxisAlignItems]) {
      classes.push(COUNTER_AXIS_ALIGN_MAP[node.counterAxisAlignItems]);
    }

    return classes;
  }

  /**
   * Map dimensions (width, height)
   */
  private mapDimensions(node: FigmaNode): string[] {
    const classes: string[] = [];

    if (!node.absoluteBoundingBox) {
      return classes;
    }

    const { width, height } = node.absoluteBoundingBox;

    // Check for layout grow (flex-1)
    if (node.layoutGrow !== undefined && node.layoutGrow > 0) {
      classes.push('flex-1');
    } else if (width) {
      // Fixed width
      classes.push(`w-[${Math.round(width)}px]`);
    }

    // Height
    if (height) {
      classes.push(`h-[${Math.round(height)}px]`);
    }

    return classes;
  }

  /**
   * Map padding
   */
  private mapPadding(node: FigmaNode): string[] {
    const classes: string[] = [];

    const top = node.paddingTop || 0;
    const right = node.paddingRight || 0;
    const bottom = node.paddingBottom || 0;
    const left = node.paddingLeft || 0;

    // Check if all sides are equal
    if (top === right && right === bottom && bottom === left && top > 0) {
      const paddingClass = this.mapSpacing(top, 'p');
      if (paddingClass) classes.push(paddingClass);
    } else {
      // Individual sides
      if (top > 0) {
        const cls = this.mapSpacing(top, 'pt');
        if (cls) classes.push(cls);
      }
      if (right > 0) {
        const cls = this.mapSpacing(right, 'pr');
        if (cls) classes.push(cls);
      }
      if (bottom > 0) {
        const cls = this.mapSpacing(bottom, 'pb');
        if (cls) classes.push(cls);
      }
      if (left > 0) {
        const cls = this.mapSpacing(left, 'pl');
        if (cls) classes.push(cls);
      }
    }

    return classes;
  }

  /**
   * Map background fills
   */
  private mapFills(fills: FigmaNode['fills']): string[] {
    if (!fills || fills.length === 0) return [];

    // Get first visible solid fill
    const solidFill = fills.find(
      (f) => f.type === 'SOLID' && f.visible !== false && f.color
    );

    if (solidFill && solidFill.color) {
      return [this.mapColor(solidFill.color, 'bg')];
    }

    return [];
  }

  /**
   * Map strokes (borders)
   */
  private mapStrokes(node: FigmaNode): string[] {
    const classes: string[] = [];

    if (!node.strokes || node.strokes.length === 0) return classes;

    const stroke = node.strokes[0];
    if (!stroke || stroke.visible === false) return classes;

    // Border width
    if (node.strokeWeight) {
      const weight = Math.round(node.strokeWeight);
      if (weight === 1) {
        classes.push('border');
      } else {
        classes.push(`border-[${weight}px]`);
      }
    }

    // Border color
    if (stroke.color) {
      classes.push(this.mapColor(stroke.color, 'border'));
    }

    return classes;
  }

  /**
   * Map border radius
   */
  private mapBorderRadius(node: FigmaNode): string[] {
    // Individual corner radii
    if (node.rectangleCornerRadii) {
      const [tl, tr, br, bl] = node.rectangleCornerRadii;
      if (tl === tr && tr === br && br === bl) {
        return [this.getRadiusClass(tl)];
      }
      // TODO: Handle individual corners (requires custom CSS)
      return [`rounded-[${tl}px]`];
    }

    // Uniform radius
    if (node.cornerRadius !== undefined) {
      return [this.getRadiusClass(node.cornerRadius)];
    }

    return [];
  }

  /**
   * Map typography styles
   */
  private mapTypography(node: FigmaNode): string[] {
    const classes: string[] = [];
    const style = node.style;

    if (!style) return classes;

    // Font size
    if (style.fontSize) {
      classes.push(`text-[${Math.round(style.fontSize)}px]`);
    }

    // Font weight
    if (style.fontWeight && FONT_WEIGHT_MAP[style.fontWeight]) {
      classes.push(FONT_WEIGHT_MAP[style.fontWeight]);
    }

    // Line height
    if (style.lineHeightPx) {
      classes.push(`leading-[${Math.round(style.lineHeightPx)}px]`);
    }

    // Text alignment
    if (style.textAlignHorizontal && TEXT_ALIGN_MAP[style.textAlignHorizontal]) {
      classes.push(TEXT_ALIGN_MAP[style.textAlignHorizontal]);
    }

    // Text decoration
    if (style.textDecoration === 'UNDERLINE') {
      classes.push('underline');
    } else if (style.textDecoration === 'STRIKETHROUGH') {
      classes.push('line-through');
    }

    // Text color (from fills)
    if (node.fills) {
      const textColor = this.mapFills(node.fills);
      // Replace bg- with text-
      const colorClass = textColor[0]?.replace('bg-', 'text-');
      if (colorClass) classes.push(colorClass);
    }

    return classes;
  }

  /**
   * Map effects (shadows, blur)
   */
  private mapEffects(effects: FigmaNode['effects']): string[] {
    if (!effects || effects.length === 0) return [];

    const classes: string[] = [];

    for (const effect of effects) {
      if (effect.visible === false) continue;

      if (effect.type === 'DROP_SHADOW') {
        classes.push('shadow-lg');
      } else if (effect.type === 'INNER_SHADOW') {
        classes.push('shadow-inner');
      }
    }

    return classes;
  }

  /**
   * Map opacity
   */
  private mapOpacity(opacity: number): string {
    const percentage = Math.round(opacity * 100);
    return `opacity-${percentage}`;
  }

  /**
   * Map color to Tailwind class
   */
  private mapColor(color: Color, prefix: 'bg' | 'text' | 'border'): string {
    const hex = this.colorToHex(color);
    return `${prefix}-[${hex}]`;
  }

  /**
   * Convert Figma color (0-1) to hex
   */
  private colorToHex(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Map spacing value to Tailwind class
   */
  private mapSpacing(px: number, prefix: string): string {
    const rounded = Math.round(px);

    // Try to match Tailwind scale
    if (SPACING_MAP[rounded]) {
      return SPACING_MAP[rounded].replace('gap-', `${prefix}-`);
    }

    // Use arbitrary value
    return `${prefix}-[${rounded}px]`;
  }

  /**
   * Get border radius class
   */
  private getRadiusClass(radius: number): string {
    const rounded = Math.round(radius);

    if (BORDER_RADIUS_MAP[rounded]) {
      return BORDER_RADIUS_MAP[rounded];
    }

    return `rounded-[${rounded}px]`;
  }
}
