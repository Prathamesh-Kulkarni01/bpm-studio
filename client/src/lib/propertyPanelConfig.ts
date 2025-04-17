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
  | 'custom';

export type PropertyCondition = {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: any;
};

export type PropertyOption = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export type PropertyConfig = {
  id: string;
  label: string;
  type: PropertyType;
  description?: string;
  defaultValue?: any;
  placeholder?: string;
  required?: boolean;
  options?: PropertyOption[];
  conditions?: PropertyCondition[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
  };
  // For custom property types
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
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
export function isPropertyVisible(property: PropertyConfig, values: Record<string, any>): boolean {
  if (!property.conditions || property.conditions.length === 0) {
    return true;
  }

  return property.conditions.every(condition => {
    const fieldValue = values[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
      case 'startsWith':
        return typeof fieldValue === 'string' && fieldValue.startsWith(condition.value);
      case 'endsWith':
        return typeof fieldValue === 'string' && fieldValue.endsWith(condition.value);
      case 'greaterThan':
        return typeof fieldValue === 'number' && fieldValue > condition.value;
      case 'lessThan':
        return typeof fieldValue === 'number' && fieldValue < condition.value;
      default:
        return true;
    }
  });
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