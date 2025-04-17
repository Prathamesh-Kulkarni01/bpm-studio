import React from 'react';
import { 
  PropertyPanelConfig, 
  Condition, 
  PropertyConfig,
  CompoundCondition,
  FunctionCondition
} from './propertyPanelConfig';
import { 
  CircleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  CreditCardIcon,
  TimerIcon,
  SignalIcon,
  MessageSquareIcon,
  AlertTriangleIcon, 
  ClockIcon,
  InfoIcon
} from 'lucide-react';

/**
 * Example panel configuration that showcases advanced conditional logic
 */
export const advancedPanelConfig: PropertyPanelConfig = {
  tabs: [
    // Basic Properties Tab
    {
      id: 'general',
      label: 'General',
      properties: [
        {
          id: 'id',
          label: 'ID',
          type: 'text',
          description: 'Unique identifier for this element',
          required: true,
          readOnly: true
        },
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          description: 'Name of this element',
          placeholder: 'Enter name...',
          validation: [
            { type: 'required', message: 'Name is required' },
            { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
          ]
        },
        {
          id: 'documentation',
          label: 'Documentation',
          type: 'textarea',
          description: 'Documentation for this element',
          placeholder: 'Add documentation...'
        },
        // Example of dynamic label based on element type
        {
          id: 'elementCategory',
          label: (element) => element.type.includes('Task') ? 'Task Category' : 'Element Category',
          type: 'select',
          options: [
            { label: 'Process', value: 'process' },
            { label: 'System', value: 'system' },
            { label: 'User', value: 'user' },
            { label: 'External', value: 'external' }
          ],
          description: (element) => 
            `Categorizes this ${element.type.includes('Task') ? 'task' : 'element'} for organizational purposes`,
        }
      ]
    },

    // Advanced Task Properties Tab - Only visible for Task-type elements
    {
      id: 'taskConfig',
      label: 'Task Configuration',
      showForTypes: [
        'bpmn:Task', 'bpmn:UserTask', 'bpmn:ServiceTask', 'bpmn:SendTask', 
        'bpmn:ReceiveTask', 'bpmn:BusinessRuleTask', 'bpmn:ScriptTask'
      ],
      properties: [
        // Example of a property with sections and compound conditions
        {
          id: 'taskType',
          label: 'Task Type',
          type: 'select',
          layout: { section: 'Task Behavior' },
          options: [
            { label: 'User Task', value: 'user' },
            { label: 'Automated Task', value: 'automated' },
            { label: 'Manual Task', value: 'manual' },
            { label: 'Service Task', value: 'service' }
          ],
          description: 'Determines how this task is processed'
        },
        // This property only shows when taskType is 'service' - simple condition
        {
          id: 'serviceEndpoint',
          label: 'Service Endpoint',
          type: 'text',
          layout: { section: 'Task Behavior' },
          placeholder: 'https://...',
          conditions: [
            { field: 'taskType', operator: 'equals', value: 'service' }
          ]
        },
        // Example of API-powered dropdown - only shown for service tasks
        {
          id: 'serviceOperation',
          label: 'Operation',
          type: 'select',
          layout: { section: 'Task Behavior' },
          conditions: [
            { field: 'taskType', operator: 'equals', value: 'service' }
          ],
          // This demonstrates a dynamic options source that would call an API
          options: {
            type: 'api',
            endpoint: '/api/services',
            method: 'GET',
            // Pass the endpoint as a parameter to filter operations by endpoint
            params: (values) => ({ 
              endpoint: values.serviceEndpoint 
            }),
            // Map API response to options format
            responseMapping: {
              value: 'id',
              label: 'name',
              disabled: 'deprecated'
            },
            // We want to refresh this dropdown when serviceEndpoint changes
            dependencies: ['serviceEndpoint'],
            // Transform the results
            transform: (data, element, values) => {
              // Add a default option at the beginning
              return [
                { label: 'Select an operation...', value: '', disabled: true },
                ...data
              ];
            }
          }
        },
        // Example of compound conditions - this shows for non-automated tasks with advanced mode
        {
          id: 'assignee',
          label: 'Assigned To',
          type: 'select',
          layout: { section: 'Assignment' },
          conditions: {
            type: 'and',
            conditions: [
              { field: 'taskType', operator: 'notEquals', value: 'automated' },
              { field: 'advancedMode', operator: 'equals', value: true }
            ]
          },
          options: [
            { label: 'User', value: 'user' },
            { label: 'Role', value: 'role' },
            { label: 'Group', value: 'group' }
          ]
        },
        // Complex nested conditions example
        {
          id: 'assigneeId',
          label: 'User ID',
          type: 'text',
          layout: { section: 'Assignment' },
          conditions: {
            type: 'and',
            conditions: [
              { 
                type: 'and',
                conditions: [
                  { field: 'taskType', operator: 'notEquals', value: 'automated' },
                  { field: 'advancedMode', operator: 'equals', value: true }
                ]
              },
              { field: 'assignee', operator: 'equals', value: 'user' }
            ]
          },
          placeholder: 'Enter user ID...'
        },
        // Example of OR condition - this shows if task is manual OR user has set advancedMode
        {
          id: 'priority',
          label: 'Priority',
          type: 'select',
          layout: { section: 'Task Behavior', order: 2 },
          conditions: {
            type: 'or',
            conditions: [
              { field: 'taskType', operator: 'equals', value: 'manual' },
              { field: 'advancedMode', operator: 'equals', value: true }
            ]
          },
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' }
          ]
        },
        // Toggle for advanced mode - always shown
        {
          id: 'advancedMode',
          label: 'Enable Advanced Options',
          type: 'checkbox',
          layout: { section: 'Settings', order: 1 },
          defaultValue: false
        },
        // Example of property with change listeners
        {
          id: 'dueDate',
          label: 'Due Date',
          type: 'date',
          layout: { section: 'Timing', order: 1 },
          conditions: [
            { field: 'advancedMode', operator: 'equals', value: true }
          ],
          // This will trigger the function when dueDate changes
          changeListeners: [
            {
              watch: ['dueDate'],
              trigger: 'immediate',
              handler: (newValues, oldValues, element, modeler) => {
                // Calculate SLA based on due date
                const today = new Date();
                const dueDate = new Date(newValues.dueDate);
                const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                // Update SLA category
                if (daysDiff < 1) {
                  return { slaCategory: 'urgent' };
                } else if (daysDiff < 3) {
                  return { slaCategory: 'soon' };
                } else {
                  return { slaCategory: 'normal' };
                }
              }
            }
          ]
        },
        // This field's visibility depends on the SLA category calculated above
        {
          id: 'escalationContact',
          label: 'Escalation Contact',
          type: 'text',
          layout: { section: 'Timing', order: 2 },
          conditions: {
            type: 'or',
            conditions: [
              { field: 'slaCategory', operator: 'equals', value: 'urgent' },
              { field: 'slaCategory', operator: 'equals', value: 'soon' }
            ]
          },
          // The style changes based on SLA category
          style: {
            conditionalStyles: [
              {
                conditions: [{ field: 'slaCategory', operator: 'equals', value: 'urgent' }],
                style: { inputClassName: 'border-red-500 bg-red-50' }
              },
              {
                conditions: [{ field: 'slaCategory', operator: 'equals', value: 'soon' }],
                style: { inputClassName: 'border-yellow-500 bg-yellow-50' }
              }
            ]
          }
        },
        // Example of function-based condition
        {
          id: 'reminderSettings',
          label: 'Reminder Settings',
          type: 'panel',
          layout: { section: 'Timing', order: 3 },
          conditions: {
            type: 'function',
            evaluate: (element, values, modeler) => {
              // This demonstrates a custom function condition that checks
              // for multiple conditions that would be hard to express declaratively
              return (
                values.advancedMode === true && 
                values.dueDate && 
                new Date(values.dueDate) > new Date() &&
                (values.taskType === 'user' || values.taskType === 'manual')
              );
            },
            description: 'Show reminder settings for future user/manual tasks in advanced mode'
          },
          // Sub-properties for the panel
          properties: [
            {
              id: 'reminderEnabled',
              label: 'Enable Reminders',
              type: 'checkbox',
              defaultValue: false
            },
            {
              id: 'reminderDays',
              label: 'Days Before Due Date',
              type: 'number',
              defaultValue: 1,
              conditions: [
                { field: 'reminderEnabled', operator: 'equals', value: true }
              ],
              validation: [
                { type: 'min', value: 1, message: 'Must be at least 1 day' },
                { type: 'max', value: 30, message: 'Cannot exceed 30 days' }
              ]
            }
          ]
        }
      ]
    },

    // Event Configuration Tab - Only for event elements
    {
      id: 'eventConfig',
      label: 'Event Configuration',
      icon: React.createElement(CircleIcon, { className: "h-4 w-4" }),
      showForTypes: [
        'bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:IntermediateThrowEvent', 
        'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent'
      ],
      properties: [
        // Main event type selector
        {
          id: 'eventDefinitionType',
          label: 'Event Type',
          type: 'select',
          options: [
            { 
              label: 'None', 
              value: 'None',
              icon: React.createElement(CircleIcon, { className: "h-4 w-4" }),
              description: 'Default event with no special behavior' 
            },
            { 
              label: 'Message', 
              value: 'Message',
              icon: React.createElement(MessageSquareIcon, { className: "h-4 w-4" }),
              description: 'Triggered by a message arrival' 
            },
            { 
              label: 'Timer', 
              value: 'Timer',
              icon: React.createElement(ClockIcon, { className: "h-4 w-4" }),
              description: 'Triggered at specific time or interval' 
            },
            { 
              label: 'Signal', 
              value: 'Signal',
              icon: React.createElement(SignalIcon, { className: "h-4 w-4" }),
              description: 'Triggered by a broadcast signal'
            },
            { 
              label: 'Error', 
              value: 'Error',
              icon: React.createElement(AlertTriangleIcon, { className: "h-4 w-4" }),
              description: 'Handles errors in the process'
            }
          ]
        },
        
        // Timer-specific configurations
        {
          id: 'timerDefinitionType',
          label: 'Timer Type',
          type: 'select',
          tooltip: 'Determines how the timer is triggered',
          layout: { section: 'Timer Configuration' },
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Timer' }
          ],
          options: [
            { label: 'Date', value: 'date', description: 'Triggers at specific date and time' },
            { label: 'Duration', value: 'duration', description: 'Triggers after a specified time period' },
            { label: 'Cycle', value: 'cycle', description: 'Triggers repeatedly at specified intervals' }
          ]
        },
        // Fields for different timer types
        {
          id: 'timerDate',
          label: 'Date',
          type: 'datetime',
          layout: { section: 'Timer Configuration' },
          conditions: {
            type: 'and',
            conditions: [
              { field: 'eventDefinitionType', operator: 'equals', value: 'Timer' },
              { field: 'timerDefinitionType', operator: 'equals', value: 'date' }
            ]
          },
          description: 'Exact date and time when the timer should fire'
        },
        {
          id: 'timerDuration',
          label: 'Duration',
          type: 'text',
          layout: { section: 'Timer Configuration' },
          conditions: {
            type: 'and',
            conditions: [
              { field: 'eventDefinitionType', operator: 'equals', value: 'Timer' },
              { field: 'timerDefinitionType', operator: 'equals', value: 'duration' }
            ]
          },
          placeholder: 'PT1H (ISO 8601: 1 hour)',
          description: 'Time period to wait before triggering (e.g., PT1H = 1 hour)'
        },
        {
          id: 'timerCycle',
          label: 'Cycle',
          type: 'text',
          layout: { section: 'Timer Configuration' },
          conditions: {
            type: 'and',
            conditions: [
              { field: 'eventDefinitionType', operator: 'equals', value: 'Timer' },
              { field: 'timerDefinitionType', operator: 'equals', value: 'cycle' }
            ]
          },
          placeholder: 'R3/PT10M (ISO 8601: repeat 3 times every 10 minutes)',
          description: 'Repeating time interval pattern'
        },
        
        // Message-specific configurations
        {
          id: 'messageRef',
          label: 'Message Reference',
          type: 'select',
          layout: { section: 'Message Configuration' },
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Message' }
          ],
          // This would normally call an API to get available message definitions
          options: {
            type: 'function',
            getter: (element, values, modeler) => [
              { label: 'NewCustomerMessage', value: 'msg_new_customer' },
              { label: 'PaymentReceivedMessage', value: 'msg_payment' },
              { label: 'ShipmentNotificationMessage', value: 'msg_shipment' },
              { label: 'ErrorMessage', value: 'msg_error' }
            ]
          }
        },
        {
          id: 'messagePayload',
          label: 'Message Payload',
          type: 'card',
          layout: { section: 'Message Configuration' },
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Message' },
            { field: 'messageRef', operator: 'isNotEmpty', value: null }
          ],
          properties: [
            {
              id: 'correlationKey',
              label: 'Correlation Key',
              type: 'text',
              description: 'Key to correlate incoming messages'
            },
            {
              id: 'dataMapping',
              label: 'Data Mapping',
              type: 'textarea',
              description: 'JSON mapping for message payload',
              placeholder: '{ "sourceField": "targetField" }'
            }
          ]
        },
        
        // Signal-specific configurations
        {
          id: 'signalRef',
          label: 'Signal Reference',
          type: 'text',
          layout: { section: 'Signal Configuration' },
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Signal' }
          ],
          placeholder: 'Enter signal name...'
        },
        
        // Error-specific configurations
        {
          id: 'errorRef',
          label: 'Error Reference',
          type: 'text',
          layout: { section: 'Error Configuration' },
          conditions: [
            { field: 'eventDefinitionType', operator: 'equals', value: 'Error' }
          ],
          placeholder: 'Enter error code...'
        },
        
        // For boundary events - only visible if element is a boundary event
        {
          id: 'isInterrupting',
          label: 'Is Interrupting',
          type: 'checkbox',
          defaultValue: true,
          description: 'When enabled, interrupts the activity when triggered',
          // Using a function-based condition to check element type
          conditions: {
            type: 'function',
            evaluate: (element) => element.type === 'bpmn:BoundaryEvent',
            description: 'Only shown for boundary events'
          } 
        }
      ]
    },
    
    // Flow & Sequence Tab - For connections and sequence flows
    {
      id: 'flowConfig',
      label: 'Flow',
      showForTypes: ['bpmn:SequenceFlow', 'bpmn:MessageFlow'],
      properties: [
        {
          id: 'conditionType',
          label: 'Condition Type',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Expression', value: 'expression' },
            { label: 'Default Flow', value: 'default' }
          ],
          description: 'Determines when this flow is followed'
        },
        // Condition expression - only shown when condition type is 'expression'
        {
          id: 'conditionExpression',
          label: 'Condition Expression',
          type: 'textarea',
          conditions: [
            { field: 'conditionType', operator: 'equals', value: 'expression' }
          ],
          placeholder: '${amount > 1000}',
          description: 'JUEL expression that determines when this flow is taken'
        },
        // Flow metrics panel - shown conditionally
        {
          id: 'flowMetrics',
          label: 'Flow Metrics',
          type: 'panel',
          conditions: [
            { field: 'advancedMetrics', operator: 'equals', value: true }
          ],
          properties: [
            {
              id: 'processingTime',
              label: 'Avg. Processing Time',
              type: 'text',
              placeholder: 'e.g., PT5M (5 minutes)'
            },
            {
              id: 'costPerExecution',
              label: 'Cost Per Execution',
              type: 'number',
              defaultValue: 0
            },
            {
              id: 'resourceConsumption',
              label: 'Resource Consumption',
              type: 'select',
              options: [
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' }
              ]
            }
          ]
        },
        {
          id: 'advancedMetrics',
          label: 'Show Advanced Metrics',
          type: 'checkbox',
          defaultValue: false
        }
      ]
    },
    
    // Extended Attributes Tab - Example of a tab with XML attribute-based conditions
    {
      id: 'extendedAttributes',
      label: 'Extended',
      // This tab is shown for all element types but has a secondary condition
      showForTypes: ['*'],
      // Additional condition to only show when advanced mode is enabled
      condition: (element) => {
        // For illustration, check if element has any custom attributes
        return element.businessObject && element.businessObject.$attrs && 
          Object.keys(element.businessObject.$attrs).some(key => key.startsWith('custom:'));
      },
      properties: [
        // Custom attributes table
        {
          id: 'customAttributes',
          label: 'Custom Attributes',
          type: 'table',
          columns: [
            { id: 'name', header: 'Name', accessor: 'name' },
            { id: 'value', header: 'Value', accessor: 'value' }
          ],
          // This would be populated from XML custom attributes
          defaultValue: []
        },
        // Action buttons for attributes
        {
          id: 'attributeActions',
          label: 'Attribute Actions',
          type: 'button',
          actions: [
            {
              id: 'addAttribute',
              label: 'Add Attribute',
              type: 'primary',
              action: (element, values, modeler) => {
                // Would open a dialog to add attributes
                console.log('Adding attribute to element:', element.id);
              }
            },
            {
              id: 'clearAttributes',
              label: 'Clear All',
              type: 'danger',
              action: (element, values, modeler) => {
                // Would clear all custom attributes
                console.log('Clearing attributes from element:', element.id);
              },
              // Only enable clear button if there are attributes to clear
              disableConditions: {
                type: 'function',
                evaluate: (element, values) => {
                  return !values.customAttributes || values.customAttributes.length === 0;
                }
              },
              // Show confirmation dialog
              confirmation: {
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete all custom attributes?',
                confirmText: 'Delete All',
                cancelText: 'Cancel'
              }
            }
          ]
        }
      ]
    },
    
    // Appearance Tab - Styling options
    {
      id: 'appearance',
      label: 'Appearance',
      properties: [
        {
          id: 'colorScheme',
          label: 'Color Scheme',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Danger', value: 'danger' },
            { label: 'Info', value: 'info' },
            { label: 'Custom', value: 'custom' }
          ]
        },
        // Only show color picker for custom color scheme
        {
          id: 'customColor',
          label: 'Custom Color',
          type: 'color',
          conditions: [
            { field: 'colorScheme', operator: 'equals', value: 'custom' }
          ],
          defaultValue: '#22A699'
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ],
          defaultValue: 'medium'
        },
        {
          id: 'fontWeight',
          label: 'Font Weight',
          type: 'select',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Bold', value: 'bold' }
          ],
          defaultValue: 'normal'
        },
        {
          id: 'borderStyle',
          label: 'Border Style',
          type: 'select',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' }
          ],
          defaultValue: 'solid'
        }
      ]
    }
  ]
};

/**
 * This API mocks a server response with a list of services
 * It conditionally returns different services based on the endpoint provided
 */
export function mockServiceOperationsApi(endpoint: string): Promise<any[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return different operations based on the endpoint
      if (!endpoint || endpoint.trim() === '') {
        resolve([]);
      } else if (endpoint.includes('payment')) {
        resolve([
          { id: 'process_payment', name: 'Process Payment', deprecated: false },
          { id: 'refund_payment', name: 'Refund Payment', deprecated: false },
          { id: 'verify_payment', name: 'Verify Payment', deprecated: false }
        ]);
      } else if (endpoint.includes('notification')) {
        resolve([
          { id: 'send_email', name: 'Send Email', deprecated: false },
          { id: 'send_sms', name: 'Send SMS', deprecated: false },
          { id: 'send_push', name: 'Send Push Notification', deprecated: true }
        ]);
      } else if (endpoint.includes('order')) {
        resolve([
          { id: 'create_order', name: 'Create Order', deprecated: false },
          { id: 'update_order', name: 'Update Order', deprecated: false },
          { id: 'cancel_order', name: 'Cancel Order', deprecated: false },
          { id: 'ship_order', name: 'Ship Order', deprecated: false }
        ]);
      } else {
        // Default operations for any other endpoints
        resolve([
          { id: 'get_data', name: 'Get Data', deprecated: false },
          { id: 'update_data', name: 'Update Data', deprecated: false },
          { id: 'delete_data', name: 'Delete Data', deprecated: false }
        ]);
      }
    }, 500); // Simulate 500ms delay
  });
}

/**
 * Example XML attribute getter function
 * This would extract custom attributes from the BPMN XML
 */
export function getCustomAttributes(element: any): { name: string, value: string }[] {
  if (!element || !element.businessObject || !element.businessObject.$attrs) {
    return [];
  }
  
  const attrs = element.businessObject.$attrs;
  return Object.keys(attrs)
    .filter(key => key.startsWith('custom:'))
    .map(key => ({
      name: key.replace('custom:', ''),
      value: attrs[key]
    }));
}

/**
 * Example XML attribute setter function
 * This would add a custom attribute to the BPMN XML
 */
export function setCustomAttribute(element: any, attributeName: string, attributeValue: string, modeler: any): void {
  if (!element || !element.businessObject || !modeler) {
    return;
  }
  
  const modeling = modeler.get('modeling');
  const business = element.businessObject;
  
  // Create a proper update object
  const updateObj: any = {};
  updateObj[`custom:${attributeName}`] = attributeValue;
  
  // Update the element with the new attribute
  modeling.updateProperties(element, updateObj);
}

/**
 * Example timer conversion helper
 * This would convert various time formats to an ISO 8601 duration
 */
export function convertToIsoDuration(value: any, unit: string): string {
  // Basic conversion to ISO 8601 duration format
  if (!value) return '';
  
  switch (unit) {
    case 'seconds':
      return `PT${value}S`;
    case 'minutes':
      return `PT${value}M`;
    case 'hours':
      return `PT${value}H`;
    case 'days':
      return `P${value}D`;
    case 'months':
      return `P${value}M`;
    case 'years':
      return `P${value}Y`;
    default:
      return value;
  }
}