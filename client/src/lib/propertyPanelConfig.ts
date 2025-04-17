import { ReactNode } from 'react';

// Types for property panel configuration
export type PropertyType = 
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'number'
  | 'color'
  | 'date'
  | 'datetime'
  | 'time'
  | 'slider'
  | 'radio'
  | 'tags'
  | 'combobox'
  | 'button'
  | 'card'
  | 'panel'
  | 'grid'
  | 'table'
  | 'file'
  | 'image'
  | 'custom';

// Types of conditions for property visibility and behavior
export type ConditionOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'notContains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'greaterThan' 
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'matches' // Regex matching
  | 'exists'
  | 'hasProperty'
  | 'hasXMLAttribute'; // For XML-specific conditions

// Basic property condition
export type PropertyCondition = {
  field: string;
  operator: ConditionOperator;
  value: any;
  // Optional context to look for the field (businessObject, parent, etc.)
  context?: 'element' | 'businessObject' | 'parent' | 'root' | 'xml' | string;
};

// Advanced compound condition with AND/OR logic
export type CompoundCondition = {
  type: 'and' | 'or';
  conditions: (PropertyCondition | CompoundCondition)[];
};

// Function based condition for more complex scenarios
export type FunctionCondition = {
  type: 'function';
  evaluate: (element: any, values: Record<string, any>, modeler: any) => boolean;
  description?: string; // For documentation
};

// Combined condition type
export type Condition = PropertyCondition | CompoundCondition | FunctionCondition;

// Property option for select, combobox, radio, etc.
export type PropertyOption = {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  color?: string;
  // Nested options for hierarchical selects
  children?: PropertyOption[];
  // Metadata for additional functionality
  meta?: Record<string, any>;
};

// Dynamic options source - can be static array, function, or API
export type OptionsSource = 
  | PropertyOption[]
  | {
      type: 'function';
      getter: (element: any, values: Record<string, any>, modeler: any) => PropertyOption[];
    }
  | {
      type: 'api';
      endpoint: string;
      method?: 'GET' | 'POST';
      params?: Record<string, string> | ((values: Record<string, any>) => Record<string, string>);
      body?: Record<string, any> | ((values: Record<string, any>) => Record<string, any>);
      headers?: Record<string, string>;
      responseMapping: {
        value: string; // Path to value in response object (e.g., "id")
        label: string; // Path to label in response object (e.g., "name")
        icon?: string; // Optional path to icon data
        disabled?: string; // Optional path to disabled state
      };
      // Dependencies that trigger a refresh of the API call
      dependencies?: string[];
      // Transform function to post-process the API response
      transform?: (data: any[], element: any, values: Record<string, any>) => PropertyOption[];
    };

// Validation rules for properties
export type ValidationRule = {
  type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom';
  value?: any; // Value for the rule (e.g., min value, pattern string)
  message: string; // Error message to display
  // For custom validation rules
  validate?: (value: any, element: any, values: Record<string, any>) => boolean;
};

// Action definition for buttons, etc.
export type PropertyAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  type?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  action: (element: any, values: Record<string, any>, modeler: any) => void;
  // Show/hide based on conditions
  conditions?: Condition[];
  // Disable based on conditions
  disableConditions?: Condition[];
  // Confirmation dialog before action
  confirmation?: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  };
};

// Style customization for properties
export type PropertyStyle = {
  width?: string | number;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  errorClassName?: string;
  // Conditional styling
  conditionalStyles?: Array<{
    conditions: Condition[];
    style: Partial<PropertyStyle>;
  }>;
};

// Layout configuration for properties
export type PropertyLayout = {
  colSpan?: number; // For grid layouts
  rowSpan?: number; // For grid layouts
  order?: number; // For ordering
  section?: string; // Group in a section
  indent?: number; // Indentation level
  // For panel type properties
  collapsed?: boolean;
  collapsible?: boolean;
};

// Dynamic default value resolution
export type DefaultValueSource = 
  | any // Static value
  | {
      type: 'function';
      getter: (element: any, modeler: any) => any;
    }
  | {
      type: 'property';
      path: string; // Path to another property (dot notation)
      transform?: (value: any, element: any) => any;
    }
  | {
      type: 'api';
      endpoint: string;
      method?: 'GET' | 'POST';
      params?: Record<string, string> | ((element: any) => Record<string, string>);
      responseMapping: string; // Path to value in response (e.g., "data.defaultValue")
    };

// Property change listener
export type PropertyChangeListener = {
  // Fields to watch
  watch: string[];
  // Handler for when watched fields change
  handler: (
    newValues: Record<string, any>,
    oldValues: Record<string, any>,
    element: any,
    modeler: any
  ) => void;
  // When to trigger: immediate or debounced
  trigger?: 'immediate' | 'debounced';
  debounceTime?: number; // In milliseconds
};

// Enhanced property configuration
export type PropertyConfig = {
  id: string;
  label: string | ((element: any, values: Record<string, any>) => string);
  type: PropertyType;
  description?: string | ((element: any, values: Record<string, any>) => string);
  tooltip?: string | ReactNode;
  placeholder?: string;
  readOnly?: boolean;
  hidden?: boolean;
  required?: boolean;
  
  // Conditions to show or hide the property
  conditions?: Condition[];
  
  // Options for select, radio, etc.
  options?: PropertyOption[] | OptionsSource;
  
  // Validation rules
  validation?: ValidationRule[];
  
  // Default value (static or dynamic)
  defaultValue?: any | DefaultValueSource;
  
  // Property layout and styling
  style?: PropertyStyle;
  layout?: PropertyLayout;
  
  // Change listeners
  changeListeners?: PropertyChangeListener[];
  
  // For custom property types
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
  
  // Child properties (for nested properties, panels, grids, etc.)
  properties?: PropertyConfig[];
  
  // Actions (for buttons, etc.)
  actions?: PropertyAction[];
  
  // For file uploads
  accept?: string; // File types
  maxSize?: number; // In bytes
  
  // For tables
  columns?: Array<{
    id: string;
    header: string;
    accessor: string | ((item: any) => any);
    width?: number | string;
    align?: 'left' | 'center' | 'right';
  }>;
  
  // Additional metadata for extensions
  meta?: Record<string, any>;
};

export type TabConfig = {
  id: string;
  label: string;
  icon?: ReactNode;
  properties: PropertyConfig[];
  // Control tab visibility based on element type
  showForTypes?: string[];
  // Additional condition to show tab
  condition?: (element: any) => boolean;
};

export type PropertyPanelConfig = {
  tabs: TabConfig[];
};

// Element type categories for easier configuration
export const ElementTypes = {
  ALL: '*',
  TASKS: [
    'bpmn:Task',
    'bpmn:UserTask',
    'bpmn:ServiceTask',
    'bpmn:SendTask',
    'bpmn:ReceiveTask',
    'bpmn:ManualTask',
    'bpmn:BusinessRuleTask',
    'bpmn:ScriptTask',
    'bpmn:CallActivity',
    'bpmn:SubProcess'
  ],
  EVENTS: [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:IntermediateCatchEvent',
    'bpmn:BoundaryEvent'
  ],
  GATEWAYS: [
    'bpmn:ExclusiveGateway',
    'bpmn:ParallelGateway',
    'bpmn:InclusiveGateway',
    'bpmn:EventBasedGateway',
    'bpmn:ComplexGateway'
  ],
  FLOWS: [
    'bpmn:SequenceFlow',
    'bpmn:MessageFlow'
  ],
  DATA: [
    'bpmn:DataObjectReference',
    'bpmn:DataStoreReference'
  ],
  CONTAINERS: [
    'bpmn:Participant',
    'bpmn:Lane',
    'bpmn:Process'
  ]
};

// Default property panel configuration
export const defaultPanelConfig: PropertyPanelConfig = {
  tabs: [
    {
      id: 'general',
      label: 'General',
      properties: [
        {
          id: 'id',
          label: 'ID',
          type: 'text',
          description: 'Unique identifier for this element',
          required: true
        },
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          description: 'Name of this element',
          placeholder: 'Enter name...'
        },
        {
          id: 'documentation',
          label: 'Documentation',
          type: 'textarea',
          description: 'Documentation for this element',
          placeholder: 'Add documentation...'
        }
      ]
    },
    {
      id: 'execution',
      label: 'Execution',
      showForTypes: [...ElementTypes.TASKS],
      properties: [
        {
          id: 'implementation',
          label: 'Implementation',
          type: 'select',
          options: [
            { label: 'Default', value: 'Default' },
            { label: 'Java Class', value: 'Java Class' },
            { label: 'Expression', value: 'Expression' },
            { label: 'Delegate Expression', value: 'Delegate Expression' }
          ]
        },
        {
          id: 'executionType',
          label: 'Execution Type',
          type: 'select',
          options: [
            { label: 'Sync', value: 'sync' },
            { label: 'Async', value: 'async' }
          ]
        },
        {
          id: 'retries',
          label: 'Retries',
          type: 'number',
          defaultValue: 3,
          validation: {
            min: 0,
            max: 10
          },
          conditions: [
            { field: 'executionType', operator: 'equals', value: 'async' }
          ]
        }
      ]
    },
    {
      id: 'eventDefinitions',
      label: 'Event',
      showForTypes: [...ElementTypes.EVENTS],
      properties: [
        {
          id: 'eventDefinitionType',
          label: 'Event Type',
          type: 'select',
          options: [
            { label: 'None', value: 'None' },
            { label: 'Message', value: 'Message' },
            { label: 'Timer', value: 'Timer' },
            { label: 'Conditional', value: 'Conditional' },
            { label: 'Signal', value: 'Signal' },
            { label: 'Error', value: 'Error' },
            { label: 'Escalation', value: 'Escalation' },
            { label: 'Compensation', value: 'Compensation' },
            { label: 'Link', value: 'Link' },
            { label: 'Terminate', value: 'Terminate' }
          ]
        },
        {
          id: 'isInterrupting',
          label: 'Is Interrupting',
          type: 'checkbox',
          defaultValue: true,
          conditions: [
            { field: 'type', operator: 'equals', value: 'bpmn:StartEvent' }
          ]
        },
        {
          id: 'timerDefinition',
          label: 'Timer Definition',
          type: 'text',
          placeholder: 'e.g., PT1H (1 hour)',
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Timer' }
          ]
        },
        {
          id: 'messageRef',
          label: 'Message Reference',
          type: 'text',
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Message' }
          ]
        },
        {
          id: 'signalRef',
          label: 'Signal Reference',
          type: 'text',
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Signal' }
          ]
        }
      ]
    },
    {
      id: 'flow',
      label: 'Flow',
      showForTypes: [...ElementTypes.FLOWS],
      properties: [
        {
          id: 'conditionExpression',
          label: 'Condition Expression',
          type: 'textarea',
          placeholder: 'e.g., ${amount > 1000}'
        },
        {
          id: 'sequenceFlowOrder',
          label: 'Sequence Flow Order',
          type: 'number',
          defaultValue: 0
        }
      ]
    },
    {
      id: 'gateway',
      label: 'Gateway',
      showForTypes: [...ElementTypes.GATEWAYS],
      properties: [
        {
          id: 'defaultFlow',
          label: 'Default Flow',
          type: 'select',
          options: [] // Dynamically populated based on outgoing flows
        },
        {
          id: 'gatewayDirection',
          label: 'Gateway Direction',
          type: 'select',
          options: [
            { label: 'Unspecified', value: 'Unspecified' },
            { label: 'Converging', value: 'Converging' },
            { label: 'Diverging', value: 'Diverging' },
            { label: 'Mixed', value: 'Mixed' }
          ]
        }
      ]
    },
    {
      id: 'forms',
      label: 'Forms',
      showForTypes: ['bpmn:UserTask'],
      properties: [
        {
          id: 'formKey',
          label: 'Form Key',
          type: 'text',
          placeholder: 'e.g., myForm'
        },
        {
          id: 'formFields',
          label: 'Form Fields',
          type: 'custom',
          component: undefined // Will be defined in a separate component
        }
      ]
    },
    {
      id: 'appearance',
      label: 'Appearance',
      properties: [
        {
          id: 'color',
          label: 'Color',
          type: 'color',
          defaultValue: '#22A699'
        },
        {
          id: 'textColor',
          label: 'Text Color',
          type: 'color',
          defaultValue: '#000000'
        }
      ]
    }
  ]
};

// Utility functions to work with property panel configuration
export function isPropertyVisible(property: PropertyConfig, values: Record<string, any>, element?: any, modeler?: any): boolean {
  if (!property.conditions || property.conditions.length === 0) {
    return !property.hidden;
  }

  return evaluateConditions(property.conditions, values, element, modeler) && !property.hidden;
}

// Utility to evaluate a single condition
function evaluateCondition(condition: Condition, values: Record<string, any>, element?: any, modeler?: any): boolean {
  // Handle function-based condition
  if ('type' in condition && condition.type === 'function') {
    return condition.evaluate(element, values, modeler);
  }
  
  // Handle compound condition
  if ('type' in condition && (condition.type === 'and' || condition.type === 'or')) {
    if (condition.type === 'and') {
      return condition.conditions.every(c => evaluateCondition(c, values, element, modeler));
    } else { // 'or'
      return condition.conditions.some(c => evaluateCondition(c, values, element, modeler));
    }
  }
  
  // Handle basic property condition
  const { field, operator, value, context = 'element' } = condition as PropertyCondition;
  
  // Get field value based on context
  let fieldValue;
  if (context === 'businessObject' && element) {
    fieldValue = element.businessObject[field];
  } else if (context === 'parent' && element && element.parent) {
    fieldValue = element.parent[field];
  } else if (context === 'root' && element && element.root) {
    fieldValue = element.root[field];
  } else if (context === 'xml' && element && element.businessObject) {
    // For XML context, we would need to access raw XML
    // This is a placeholder for XML-specific logic
    fieldValue = element.businessObject.$attrs?.[field];
  } else {
    // Default: look in values
    fieldValue = values[field];
  }
  
  // Compare based on operator
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(value);
    case 'notContains':
      return typeof fieldValue === 'string' && !fieldValue.includes(value);
    case 'startsWith':
      return typeof fieldValue === 'string' && fieldValue.startsWith(value);
    case 'endsWith':
      return typeof fieldValue === 'string' && fieldValue.endsWith(value);
    case 'greaterThan':
      return typeof fieldValue === 'number' && fieldValue > value;
    case 'lessThan':
      return typeof fieldValue === 'number' && fieldValue < value;
    case 'greaterThanOrEqual':
      return typeof fieldValue === 'number' && fieldValue >= value;
    case 'lessThanOrEqual':
      return typeof fieldValue === 'number' && fieldValue <= value;
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    case 'notIn':
      return Array.isArray(value) && !value.includes(fieldValue);
    case 'isEmpty':
      return fieldValue === undefined || fieldValue === null || fieldValue === '';
    case 'isNotEmpty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    case 'matches':
      return typeof fieldValue === 'string' && new RegExp(value).test(fieldValue);
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    case 'hasProperty':
      return typeof fieldValue === 'object' && fieldValue !== null && value in fieldValue;
    case 'hasXMLAttribute':
      return element && element.businessObject && element.businessObject.$attrs && value in element.businessObject.$attrs;
    default:
      return true;
  }
}

// Evaluate array of conditions
export function evaluateConditions(
  conditions: Condition[], 
  values: Record<string, any>, 
  element?: any, 
  modeler?: any
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  return conditions.every(condition => 
    evaluateCondition(condition, values, element, modeler)
  );
}

export function isTabVisible(tab: TabConfig, elementType: string, element: any): boolean {
  // Check if tab should be shown for this element type
  if (tab.showForTypes && tab.showForTypes.length > 0) {
    if (!tab.showForTypes.includes('*') && !tab.showForTypes.includes(elementType)) {
      return false;
    }
  }
  
  // Check additional condition if provided
  if (tab.condition && !tab.condition(element)) {
    return false;
  }
  
  return true;
}

// Function to get property value from business object
export function getPropertyValue(businessObject: any, propertyId: string): any {
  if (!businessObject) return undefined;
  
  // Handle special cases
  if (propertyId === 'documentation') {
    return businessObject.documentation && businessObject.documentation.length
      ? businessObject.documentation[0].text
      : '';
  }
  
  if (propertyId === 'eventDefinitionType') {
    if (businessObject.eventDefinitions && businessObject.eventDefinitions.length > 0) {
      const eventDef = businessObject.eventDefinitions[0];
      if (eventDef.$type === 'bpmn:MessageEventDefinition') return 'Message';
      if (eventDef.$type === 'bpmn:TimerEventDefinition') return 'Timer';
      if (eventDef.$type === 'bpmn:ConditionalEventDefinition') return 'Conditional';
      if (eventDef.$type === 'bpmn:SignalEventDefinition') return 'Signal';
      if (eventDef.$type === 'bpmn:ErrorEventDefinition') return 'Error';
      if (eventDef.$type === 'bpmn:EscalationEventDefinition') return 'Escalation';
      if (eventDef.$type === 'bpmn:CompensateEventDefinition') return 'Compensate';
      if (eventDef.$type === 'bpmn:LinkEventDefinition') return 'Link';
      if (eventDef.$type === 'bpmn:CancelEventDefinition') return 'Cancel';
      if (eventDef.$type === 'bpmn:TerminateEventDefinition') return 'Terminate';
    }
    return 'None';
  }
  
  // Handle regular properties
  return businessObject[propertyId];
}

// Function to set property value on business object through modeling
export function setPropertyValue(
  element: any, 
  propertyId: string, 
  value: any, 
  modeler: any
): void {
  if (!element || !modeler) return;
  
  const modeling = modeler.get('modeling');
  
  // Handle special cases
  if (propertyId === 'documentation') {
    const bo = element.businessObject;
    const documentation = bo.documentation && bo.documentation.length ? bo.documentation[0] : null;
    
    if (!documentation) {
      const bpmnFactory = modeler.get('bpmnFactory');
      const newDocumentation = bpmnFactory.create('bpmn:Documentation', { text: value });
      modeling.updateProperties(element, {
        documentation: [newDocumentation]
      });
    } else {
      modeling.updateProperties(element, {
        documentation: [{ ...documentation, text: value }]
      });
    }
    return;
  }
  
  if (propertyId === 'eventDefinitionType') {
    // This requires adding/removing event definitions - complex operation
    // For now, we're just updating state but not modifying the model
    return;
  }
  
  // For regular properties, simply update them
  modeling.updateProperties(element, { [propertyId]: value });
}