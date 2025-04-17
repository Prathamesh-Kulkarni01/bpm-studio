/**
 * Property Panel Configuration Schema
 * This file defines the schema for configuring the properties panel
 */
import { ReactNode } from 'react';

// Basic property types
export type PropertyValueType = 
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'Time'
  | 'DateTime'
  | 'Enum'
  | 'Array'
  | 'Object'
  | 'Expression'
  | 'Script'
  | 'Color'
  | 'Icon'
  | 'File'
  | 'Custom';

// Input component types for rendering
export type PropertyInputType = 
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'slider'
  | 'color'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'tags'
  | 'code'
  | 'expression'
  | 'table'
  | 'card'
  | 'custom';

// Validation rules
export interface PropertyValidation {
  required?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'email' | 'url' | 'alphanumeric' | 'numeric' | string;
  customValidator?: (value: any, element: any) => { valid: boolean; message?: string };
}

// Visibility condition
export interface PropertyVisibility {
  condition: string | ((element: any, values: Record<string, any>) => boolean);
  dependsOn?: string[];
}

// Option for select/multiselect
export interface PropertyOption {
  label: string;
  value: string | number | boolean;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  color?: string;
  children?: PropertyOption[];
}

// Configuration for a single property
export interface PropertyDefinition {
  name: string;
  type: PropertyValueType;
  inputType?: PropertyInputType;
  group: string;
  description?: string;
  placeholder?: string;
  tooltip?: string;
  defaultValue?: any;
  options?: PropertyOption[] | string; // Direct options or API endpoint
  fetchOptions?: boolean;
  optionsUrl?: string;
  optionsFilter?: string | ((element: any, values: Record<string, any>) => Record<string, any>);
  validation?: PropertyValidation;
  dependencies?: string[];
  visibility: PropertyVisibility;
  readOnly?: boolean;
  width?: string | number;
  height?: string | number;
  customComponent?: string;
  customProps?: Record<string, any>;
  onChange?: string | ((value: any, element: any, values: Record<string, any>) => void);
  customStyle?: Record<string, any>;
  mapping?: {
    sourceProperty?: string;
    targetProperty?: string;
    transform?: (value: any) => any;
  };
}

// Group configuration
export interface PropertyGroup {
  id: string;
  label: string;
  icon?: ReactNode;
  order?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  visibility?: PropertyVisibility;
  customStyle?: Record<string, any>;
}

// Tab configuration
export interface PropertyTab {
  id: string;
  label: string;
  icon?: ReactNode;
  order?: number;
  groups?: string[]; // References to group IDs
  visibility?: PropertyVisibility;
  customStyle?: Record<string, any>;
}

// Complete panel configuration
export interface PropertyPanelSchema {
  properties: PropertyDefinition[];
  groups?: PropertyGroup[];
  tabs?: PropertyTab[];
  defaultTab?: string;
  defaultGroup?: string;
}

/**
 * Evaluates a visibility condition for a property
 */
export function evaluateCondition(
  condition: string | ((element: any, values: Record<string, any>) => boolean),
  element: any,
  values: Record<string, any>
): boolean {
  if (typeof condition === 'function') {
    return condition(element, values);
  } else if (condition === 'always') {
    return true;
  } else if (condition === 'never') {
    return false;
  } else {
    try {
      // Use Function constructor to create a function from the string
      // This allows evaluating expressions like "element.type === 'bpmn:Task'"
      const evalFn = new Function('element', 'values', `return ${condition};`);
      return evalFn(element, values);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }
}

/**
 * Gets the appropriate input component type based on the property type
 */
export function getInputTypeForProperty(property: PropertyDefinition): PropertyInputType {
  if (property.inputType) {
    return property.inputType;
  }

  // Default mappings
  switch (property.type) {
    case 'String':
      return property.options ? 'select' : 'text';
    case 'Number':
      return 'text';
    case 'Boolean':
      return 'checkbox';
    case 'Date':
      return 'date';
    case 'Time':
      return 'time';
    case 'DateTime':
      return 'datetime';
    case 'Enum':
      return 'select';
    case 'Array':
      return property.options ? 'multiselect' : 'tags';
    case 'Object':
      return 'card';
    case 'Expression':
      return 'expression';
    case 'Script':
      return 'code';
    case 'Color':
      return 'color';
    case 'File':
      return 'file';
    default:
      return 'text';
  }
}

/**
 * Groups properties by their group field
 */
export function groupProperties(
  properties: PropertyDefinition[],
  element: any,
  values: Record<string, any>
): Record<string, PropertyDefinition[]> {
  const groupedProps: Record<string, PropertyDefinition[]> = {};

  // Filter visible properties and group them
  properties.filter(prop => {
    return evaluateCondition(prop.visibility.condition, element, values);
  }).forEach(prop => {
    if (!groupedProps[prop.group]) {
      groupedProps[prop.group] = [];
    }
    groupedProps[prop.group].push(prop);
  });

  return groupedProps;
}

/**
 * Organizes properties into tabs and groups
 */
export function organizeProperties(
  schema: PropertyPanelSchema,
  element: any,
  values: Record<string, any>
): {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    groups: Array<{
      id: string;
      label: string;
      icon?: ReactNode;
      properties: PropertyDefinition[];
      collapsible?: boolean;
      collapsed?: boolean;
    }>;
  }>;
} {
  // First group properties by their group field
  const groupedByKey = groupProperties(schema.properties, element, values);
  
  // Initialize result
  const result = {
    tabs: [] as Array<{
      id: string;
      label: string;
      icon?: ReactNode;
      groups: Array<{
        id: string;
        label: string;
        icon?: ReactNode;
        properties: PropertyDefinition[];
        collapsible?: boolean;
        collapsed?: boolean;
      }>;
    }>
  };

  // If tabs are defined in the schema
  if (schema.tabs && schema.tabs.length > 0) {
    // Filter tabs based on visibility
    const visibleTabs = schema.tabs.filter(tab => 
      !tab.visibility || evaluateCondition(tab.visibility.condition, element, values)
    );
    
    // Sort tabs by order if specified
    visibleTabs.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Create tab structure
    visibleTabs.forEach(tab => {
      const tabGroups: Array<{
        id: string;
        label: string;
        icon?: ReactNode;
        properties: PropertyDefinition[];
        collapsible?: boolean;
        collapsed?: boolean;
      }> = [];
      
      // If the tab specifies groups
      if (tab.groups && tab.groups.length > 0) {
        // Get the group configs
        const groupConfigs = schema.groups || [];
        
        // Filter and sort groups
        tab.groups.forEach(groupId => {
          const groupConfig = groupConfigs.find(g => g.id === groupId);
          if (!groupConfig) return;
          
          // Check group visibility
          if (groupConfig.visibility && 
              !evaluateCondition(groupConfig.visibility.condition, element, values)) {
            return;
          }
          
          // Get properties for this group
          const groupProperties = groupedByKey[groupId] || [];
          if (groupProperties.length === 0) return;
          
          tabGroups.push({
            id: groupConfig.id,
            label: groupConfig.label,
            icon: groupConfig.icon,
            properties: groupProperties,
            collapsible: groupConfig.collapsible,
            collapsed: groupConfig.collapsed
          });
        });
      } else {
        // If no groups specified, use all properties
        Object.entries(groupedByKey).forEach(([groupId, props]) => {
          const groupConfig = (schema.groups || []).find(g => g.id === groupId);
          
          tabGroups.push({
            id: groupId,
            label: groupConfig?.label || groupId,
            icon: groupConfig?.icon,
            properties: props,
            collapsible: groupConfig?.collapsible,
            collapsed: groupConfig?.collapsed
          });
        });
      }
      
      // Add the tab with its groups to the result
      result.tabs.push({
        id: tab.id,
        label: tab.label,
        icon: tab.icon,
        groups: tabGroups
      });
    });
  } else {
    // If no tabs defined, create a default tab with all groups
    const defaultTab = {
      id: 'default',
      label: 'Properties',
      groups: [] as Array<{
        id: string;
        label: string;
        icon?: ReactNode;
        properties: PropertyDefinition[];
        collapsible?: boolean;
        collapsed?: boolean;
      }>
    };
    
    // Create groups within the default tab
    Object.entries(groupedByKey).forEach(([groupId, props]) => {
      const groupConfig = (schema.groups || []).find(g => g.id === groupId);
      
      // Check group visibility
      if (groupConfig?.visibility && 
          !evaluateCondition(groupConfig.visibility.condition, element, values)) {
        return;
      }
      
      defaultTab.groups.push({
        id: groupId,
        label: groupConfig?.label || groupId,
        icon: groupConfig?.icon,
        properties: props,
        collapsible: groupConfig?.collapsible,
        collapsed: groupConfig?.collapsed
      });
    });
    
    // Sort groups by order if specified
    defaultTab.groups.sort((a, b) => {
      const groupA = (schema.groups || []).find(g => g.id === a.id);
      const groupB = (schema.groups || []).find(g => g.id === b.id);
      return (groupA?.order || 0) - (groupB?.order || 0);
    });
    
    result.tabs.push(defaultTab);
  }
  
  return result;
}

/**
 * Fetches options for a property from an API endpoint
 */
export async function fetchPropertyOptions(
  property: PropertyDefinition,
  element: any,
  values: Record<string, any>
): Promise<PropertyOption[]> {
  if (!property.fetchOptions) {
    return [];
  }
  
  let url = property.optionsUrl || `/api/${property.name.toLowerCase()}`;
  
  // Apply filters if specified
  let params: Record<string, string> = {};
  if (property.optionsFilter) {
    if (typeof property.optionsFilter === 'function') {
      params = property.optionsFilter(element, values);
    } else if (typeof property.optionsFilter === 'string') {
      try {
        const filterFn = new Function('element', 'values', `return ${property.optionsFilter};`);
        params = filterFn(element, values);
      } catch (error) {
        console.error('Error evaluating filter:', error);
      }
    }
  }
  
  // Convert params to query string
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  if (queryString) {
    url = `${url}?${queryString}`;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch options: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Normalize data to PropertyOption format
    return data.map((item: any) => {
      if (typeof item === 'string') {
        return { label: item, value: item };
      } else if (typeof item === 'object') {
        return {
          label: item.label || item.name || item.title || String(item.value),
          value: item.value || item.id,
          description: item.description,
          icon: item.icon,
          disabled: item.disabled,
          color: item.color
        };
      }
      return { label: String(item), value: item };
    });
  } catch (error) {
    console.error('Error fetching property options:', error);
    return [];
  }
}