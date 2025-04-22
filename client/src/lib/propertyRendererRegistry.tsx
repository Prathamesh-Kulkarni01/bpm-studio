import React from 'react';
import { PropertyDefinition } from './propertyPanelSchema';

// Define the interface for property renderer components
export interface PropertyRendererProps {
  property: PropertyDefinition;
  value: any;
  onChange: (value: any) => void;
  element: any;
  values: Record<string, any>;
}

// Type for renderer components
export type PropertyRenderer = React.ComponentType<PropertyRendererProps>;

// Registry to store custom renderers
class PropertyRendererRegistry {
  private renderers: Record<string, PropertyRenderer> = {};

  // Register a new renderer
  register(name: string, component: PropertyRenderer): void {
    this.renderers[name] = component;
  }

  // Get a renderer by name
  get(name: string): PropertyRenderer | undefined {
    return this.renderers[name];
  }

  // Check if a renderer exists
  has(name: string): boolean {
    return !!this.renderers[name];
  }
}

import CustomNameRenderer from '@/components/editor/editors/CustomNameRenderer';
import ColorPicker from '@/components/editor/editors/ColorPicker';

// Create and export a singleton instance
export const propertyRendererRegistry = new PropertyRendererRegistry();

// Register the custom renderer
propertyRendererRegistry.register('CustomNameRenderer', CustomNameRenderer);
propertyRendererRegistry.register('ColorPicker', ColorPicker);

// Default export for convenience
export default propertyRendererRegistry;
