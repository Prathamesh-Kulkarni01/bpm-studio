import { PropertyPanelSchema } from './propertyPanelSchema';
import { 
  CircleIcon, 
  MessageSquareIcon, 
  ClockIcon, 
  UserIcon, 
  CodeIcon, 
  ServerIcon, 
  DatabaseIcon, 
  RepeatIcon, 
  LayersIcon,
  ListIcon,
  GaugeIcon,
  FileTextIcon,
  BookIcon,
  DiamondIcon
} from 'lucide-react';
import React from 'react';

/**
 * Default BPMN Property Panel Configuration
 * 
 * This configuration follows the structure provided in the JSON example,
 * but is enhanced with React components and functions for more flexibility.
 */
export const bpmnPropertyPanelConfig: PropertyPanelSchema = {
  properties: [
    {
      name: "id",
      type: "String",
      group: "General",
      description: "Unique identifier for the BPMN element.",
      fetchOptions: false,
      validation: {
        required: true,
        unique: true,
        format: "alphanumeric"
      },
      dependencies: [],
      visibility: {
        condition: "always"
      },
      readOnly: true
    },
    {
      name: "name",
      type: "String",
      group: "General",
      description: "Display name of the BPMN element.",
      placeholder: "Enter a name...",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "always"
      },
      renderer: "CustomNameRenderer"
    },
    {
      name: "color",
      type: "color",
      group: "General",
      description: "Color of the BPMN element.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "always"
      },
      renderer: "ColorPicker"
    },
    {
      name: "documentation",
      type: "String",
      inputType: "textarea",
      group: "General",
      description: "Documentation for the BPMN element.",
      placeholder: "Enter documentation...",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "always"
      }
    },
    {
      name: "isExecutable",
      type: "Boolean",
      group: "General",
      description: "Indicates whether the process is executable.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:Process' || element.type === 'bpmn:Participant'"
      }
    },
    // Task specific properties
    {
      name: "script",
      type: "String",
      inputType: "code",
      group: "Configuration",
      description: "Script content for script tasks.",
      placeholder: "Enter script code...",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ScriptTask'"
      }
    },
    {
      name: "scriptFormat",
      type: "Enum",
      group: "Configuration",
      description: "Format of the script (e.g., JavaScript, Groovy).",
      fetchOptions: false,
      options: [
        { label: "JavaScript", value: "javascript" },
        { label: "Groovy", value: "groovy" },
        { label: "Python", value: "python" },
        { label: "Ruby", value: "ruby" },
        { label: "Java", value: "java" }
      ],
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ScriptTask'"
      }
    },
    {
      name: "implementation",
      type: "Enum",
      group: "Configuration",
      description: "Implementation type for service tasks.",
      fetchOptions: false,
      options: [
        { label: "Java Class", value: "java" },
        { label: "Expression", value: "expression" },
        { label: "Delegate Expression", value: "delegateExpression" },
        { label: "External", value: "external" }
      ],
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ServiceTask'"
      }
    },
    {
      name: "class",
      type: "String",
      group: "Configuration",
      description: "Java class implementation for service tasks.",
      placeholder: "com.example.MyServiceTask",
      fetchOptions: false,
      validation: {
        required: false,
        pattern: "^[a-zA-Z_$][a-zA-Z0-9_$.]*$"
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ServiceTask' && values.implementation === 'java'"
      }
    },
    {
      name: "expression",
      type: "String",
      inputType: "expression",
      group: "Configuration",
      description: "Expression implementation for service tasks.",
      placeholder: "${myService.execute()}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ServiceTask' && values.implementation === 'expression'"
      }
    },
    {
      name: "delegateExpression",
      type: "String",
      group: "Configuration",
      description: "Delegate expression for service tasks.",
      placeholder: "${myServiceFactory.createService()}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ServiceTask' && values.implementation === 'delegateExpression'"
      }
    },
    {
      name: "topic",
      type: "String",
      group: "Configuration",
      description: "Topic for external tasks.",
      placeholder: "my-external-task-topic",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:ServiceTask' && values.implementation === 'external'"
      }
    },
    // Job configuration
    {
      name: "jobPriority",
      type: "String",
      group: "Job Configuration",
      description: "Priority of the job.",
      placeholder: "50",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Task')"
      }
    },
    {
      name: "retryTimeCycle",
      type: "String",
      group: "Job Configuration",
      description: "Retry time cycle for failed jobs.",
      placeholder: "R3/PT10M",
      tooltip: "ISO-8601 format: R{retries}/P{period} or R{retries}/PT{time}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Task')"
      }
    },
    {
      name: "async",
      type: "Boolean",
      group: "Job Configuration",
      description: "Enable asynchronous continuation.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Task')"
      }
    },
    // Multi-instance properties
    {
      name: "isMultiInstance",
      type: "Boolean",
      group: "Multi-Instance",
      description: "Configure as multi-instance activity.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Task') || element.type === 'bpmn:SubProcess'"
      }
    },
    {
      name: "multiInstanceType",
      type: "Enum",
      group: "Multi-Instance",
      description: "Type of multi-instance execution.",
      fetchOptions: false,
      options: [
        { label: "Sequential", value: "sequential" },
        { label: "Parallel", value: "parallel" }
      ],
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "values.isMultiInstance === true"
      }
    },
    {
      name: "loopCardinality",
      type: "String",
      group: "Multi-Instance",
      description: "Number of iterations for the loop.",
      placeholder: "${numberOfItems}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "values.isMultiInstance === true"
      }
    },
    {
      name: "collection",
      type: "String",
      group: "Multi-Instance",
      description: "Collection for multi-instance execution.",
      placeholder: "${itemCollection}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "values.isMultiInstance === true"
      }
    },
    {
      name: "elementVariable",
      type: "String",
      group: "Multi-Instance",
      description: "Variable for the current element in the loop.",
      placeholder: "item",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "values.isMultiInstance === true"
      }
    },
    // User task specific properties
    {
      name: "assignee",
      type: "String",
      group: "Assignment",
      description: "User assigned to the task.",
      placeholder: "${currentUser.id}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:UserTask'"
      }
    },
    {
      name: "candidateUsers",
      type: "Array",
      group: "Assignment",
      description: "Users that can claim the task.",
      fetchOptions: true,
      optionsUrl: "/api/users/search",
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:UserTask'"
      }
    },
    {
      name: "candidateGroups",
      type: "Array",
      group: "Assignment",
      description: "Groups that can claim the task.",
      fetchOptions: true,
      optionsUrl: "/api/roles",
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:UserTask'"
      }
    },
    {
      name: "dueDate",
      type: "String",
      group: "Assignment",
      description: "Due date for the task.",
      placeholder: "${now() + duration('P1D')}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:UserTask'"
      }
    },
    {
      name: "priority",
      type: "Number",
      group: "Assignment",
      description: "Priority of the task.",
      placeholder: "50",
      fetchOptions: false,
      validation: {
        required: false,
        min: 0,
        max: 100
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:UserTask'"
      }
    },
    // Form properties
    {
      name: "formKey",
      type: "String",
      group: "Form",
      description: "Key for the form to display.",
      placeholder: "my-form",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "(element.type === 'bpmn:UserTask') || (element.type === 'bpmn:StartEvent' && values.useCustomModel !== true)",
        dependsOn: ["useCustomModel"]
      }
    },
    {
      name: "formFields",
      type: "Array",
      inputType: "custom",
      group: "Form",
      description: "Form fields defined inline.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "(element.type === 'bpmn:UserTask') || (element.type === 'bpmn:StartEvent' && values.useCustomModel !== true)",
        dependsOn: ["useCustomModel"]
      }
    },
    // Gateway specific properties
    {
      name: "defaultFlow",
      type: "String",
      group: "Gateway",
      description: "Default sequence flow.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Gateway')"
      }
    },
    {
      name: "exclusive",
      type: "Boolean",
      group: "Gateway",
      description: "Whether the gateway is exclusive.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:InclusiveGateway' || element.type === 'bpmn:ParallelGateway'"
      }
    },
    // Conditional sequence flow
    {
      name: "conditionExpression",
      type: "String",
      inputType: "expression",
      group: "Conditional",
      description: "Expression for conditional flows.",
      placeholder: "${amount > 1000}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:SequenceFlow'"
      }
    },
    // Custom model settings for Start Event and End Event
    {
      name: "useCustomModel",
      type: "Boolean",
      group: "Model Configuration",
      description: "Use a custom model for this event.",
      defaultValue: false,
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:StartEvent' || element.type === 'bpmn:EndEvent'"
      }
    },
    {
      name: "modelType",
      type: "Enum",
      group: "Model Configuration",
      description: "Select the model type for this event.",
      placeholder: (element, values) => {
        return values.useCustomModel ? "Select custom model..." : "Select real model...";
      },
      fetchOptions: true,
      optionsUrl: "/api/custom-models",
      optionsFilter: (element, values) => {
        // Send the useCustomModel value to filter the models
        return { useCustom: values.useCustomModel };
      },
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:StartEvent' || element.type === 'bpmn:EndEvent'",
        dependsOn: ["useCustomModel"]
      }
    },
    {
      name: "modelId",
      type: "String",
      group: "Model Configuration",
      description: "Unique identifier for this model instance.",
      placeholder: "Enter model ID...",
      fetchOptions: false,
      validation: {
        required: true,
        pattern: "^[a-zA-Z0-9_-]+$"
      },
      dependencies: [],
      visibility: {
        condition: "(element.type === 'bpmn:StartEvent' || element.type === 'bpmn:EndEvent') && values.useCustomModel === true",
        dependsOn: ["modelType", "useCustomModel"]
      }
    },
    // Event specific properties
    {
      name: "eventDefinitionType",
      type: "Enum",
      group: "Event Definition",
      description: "Type of event definition.",
      fetchOptions: false,
      options: [
        { label: "None", value: "none" },
        { label: "Message", value: "message" },
        { label: "Timer", value: "timer" },
        { label: "Signal", value: "signal" },
        { label: "Error", value: "error" },
        { label: "Escalation", value: "escalation" },
        { label: "Compensation", value: "compensation" },
        { label: "Link", value: "link" },
        { label: "Terminate", value: "terminate" }
      ],
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event')"
      }
    },
    // Timer event properties
    {
      name: "timerDefinitionType",
      type: "Enum",
      group: "Timer",
      description: "Type of timer definition.",
      fetchOptions: false,
      options: [
        { label: "Date", value: "timeDate" },
        { label: "Duration", value: "timeDuration" },
        { label: "Cycle", value: "timeCycle" }
      ],
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'timer'"
      }
    },
    {
      name: "timerDefinition",
      type: "String",
      group: "Timer",
      description: "Timer definition value.",
      placeholder: "${dateTime('2023-12-31T23:59:59Z')}",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'timer' && values.timerDefinitionType === 'timeDate'"
      }
    },
    {
      name: "timerDuration",
      type: "String",
      group: "Timer",
      description: "Timer duration value.",
      placeholder: "P1D",
      tooltip: "ISO-8601 duration format: P[nY][nM][nD]T[nH][nM][nS]",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'timer' && values.timerDefinitionType === 'timeDuration'"
      }
    },
    {
      name: "timerCycle",
      type: "String",
      group: "Timer",
      description: "Timer cycle value.",
      placeholder: "R3/PT10M",
      tooltip: "ISO-8601 repeating interval format: R[n]/PT[time]",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'timer' && values.timerDefinitionType === 'timeCycle'"
      }
    },
    // Message event properties
    {
      name: "messageRef",
      type: "String",
      group: "Message",
      description: "Reference to a message definition.",
      placeholder: "myMessage",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'message'"
      }
    },
    {
      name: "messageExpression",
      type: "String",
      inputType: "expression",
      group: "Message",
      description: "Expression to determine the message.",
      placeholder: "${execution.getVariable('messageName')}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'message'"
      }
    },
    // Signal event properties
    {
      name: "signalRef",
      type: "String",
      group: "Signal",
      description: "Reference to a signal definition.",
      placeholder: "mySignal",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'signal'"
      }
    },
    {
      name: "signalExpression",
      type: "String",
      inputType: "expression",
      group: "Signal",
      description: "Expression to determine the signal.",
      placeholder: "${execution.getVariable('signalName')}",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'signal'"
      }
    },
    // Error event properties
    {
      name: "errorRef",
      type: "String",
      group: "Error",
      description: "Reference to an error definition.",
      placeholder: "myError",
      fetchOptions: false,
      validation: {
        required: true
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'error'"
      }
    },
    {
      name: "errorCode",
      type: "String",
      group: "Error",
      description: "Error code used for matching.",
      placeholder: "ERROR_CODE_1",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Event') && values.eventDefinitionType === 'error'"
      }
    },
    // Boundary event specific properties
    {
      name: "cancelActivity",
      type: "Boolean",
      group: "Boundary",
      description: "Whether the boundary event cancels the activity.",
      defaultValue: true,
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:BoundaryEvent'"
      }
    },
    // Variables
    {
      name: "inputVariables",
      type: "Array",
      group: "Variables",
      description: "Input variables for the element.",
      fetchOptions: true,
      optionsUrl: "/api/process/variables",
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Task') || element.type === 'bpmn:StartEvent'"
      }
    },
    {
      name: "outputVariables",
      type: "Array",
      group: "Variables",
      description: "Output variables from the element.",
      fetchOptions: true,
      optionsUrl: "/api/process/variables",
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type.includes('Task') || element.type === 'bpmn:EndEvent'"
      }
    },
    // Listeners
    {
      name: "executionListeners",
      type: "Array",
      group: "Listeners",
      description: "Listeners triggered during execution.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "always"
      }
    },
    {
      name: "taskListeners",
      type: "Array",
      group: "Listeners",
      description: "Listeners triggered during task lifecycle.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:UserTask'"
      }
    },
    // Documentation
    {
      name: "comments",
      type: "Array",
      group: "Documentation",
      description: "Comments associated with the BPMN element.",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "always"
      }
    },
    // History configuration
    {
      name: "historyTimeToLive",
      type: "String",
      group: "History",
      description: "Time to live for historical data.",
      placeholder: "P30D",
      tooltip: "ISO-8601 duration format: P[nY][nM][nD]",
      fetchOptions: false,
      validation: {
        required: false
      },
      dependencies: [],
      visibility: {
        condition: "element.type === 'bpmn:Process' || element.type === 'bpmn:Participant'"
      }
    }
  ],
  // Define groups with icons and organization
  groups: [
    {
      id: "General",
      label: "General",
      icon: React.createElement(FileTextIcon, { className: "h-4 w-4" }),
      order: 10,
      collapsible: false
    },
    {
      id: "Model Configuration",
      label: "Model Configuration",
      icon: React.createElement(DatabaseIcon, { className: "h-4 w-4" }),
      order: 15,
      collapsible: true,
      collapsed: false,
      visibility: {
        condition: "element.type === 'bpmn:StartEvent' || element.type === 'bpmn:EndEvent'"
      }
    },
    {
      id: "Configuration",
      label: "Configuration",
      icon: React.createElement(ServerIcon, { className: "h-4 w-4" }),
      order: 20,
      collapsible: true
    },
    {
      id: "Job Configuration",
      label: "Job Configuration",
      icon: React.createElement(GaugeIcon, { className: "h-4 w-4" }),
      order: 30,
      collapsible: true,
      collapsed: true
    },
    {
      id: "Multi-Instance",
      label: "Multi-Instance",
      icon: React.createElement(RepeatIcon, { className: "h-4 w-4" }),
      order: 40,
      collapsible: true,
      collapsed: true
    },
    {
      id: "Assignment",
      label: "Assignment",
      icon: React.createElement(UserIcon, { className: "h-4 w-4" }),
      order: 50,
      collapsible: true
    },
    {
      id: "Form",
      label: "Form",
      icon: React.createElement(ListIcon, { className: "h-4 w-4" }),
      order: 60,
      collapsible: true
    },
    {
      id: "Gateway",
      label: "Gateway Configuration",
      icon: React.createElement(DiamondIcon, { className: "h-4 w-4" }),
      order: 70,
      collapsible: true
    },
    {
      id: "Conditional",
      label: "Condition",
      icon: React.createElement(CodeIcon, { className: "h-4 w-4" }),
      order: 80,
      collapsible: true
    },
    {
      id: "Event Definition",
      label: "Event Definition",
      icon: React.createElement(CircleIcon, { className: "h-4 w-4" }),
      order: 90,
      collapsible: true
    },
    {
      id: "Timer",
      label: "Timer",
      icon: React.createElement(ClockIcon, { className: "h-4 w-4" }),
      order: 100,
      collapsible: true
    },
    {
      id: "Message",
      label: "Message",
      icon: React.createElement(MessageSquareIcon, { className: "h-4 w-4" }),
      order: 110,
      collapsible: true
    },
    {
      id: "Signal",
      label: "Signal",
      icon: React.createElement(CircleIcon, { className: "h-4 w-4" }),
      order: 120,
      collapsible: true
    },
    {
      id: "Error",
      label: "Error",
      icon: React.createElement(CircleIcon, { className: "h-4 w-4" }),
      order: 130,
      collapsible: true
    },
    {
      id: "Boundary",
      label: "Boundary Configuration",
      icon: React.createElement(CircleIcon, { className: "h-4 w-4" }),
      order: 140,
      collapsible: true
    },
    {
      id: "Variables",
      label: "Variables",
      icon: React.createElement(DatabaseIcon, { className: "h-4 w-4" }),
      order: 150,
      collapsible: true
    },
    {
      id: "Listeners",
      label: "Execution Listeners",
      icon: React.createElement(LayersIcon, { className: "h-4 w-4" }),
      order: 160,
      collapsible: true,
      collapsed: true
    },
    {
      id: "Documentation",
      label: "Documentation",
      icon: React.createElement(BookIcon, { className: "h-4 w-4" }),
      order: 170,
      collapsible: true
    },
    {
      id: "History",
      label: "History",
      icon: React.createElement(ClockIcon, { className: "h-4 w-4" }),
      order: 180,
      collapsible: true,
      collapsed: true
    }
  ],
  // Organize properties into tabs
  tabs: [
    {
      id: "general",
      label: "General",
      order: 10,
      groups: ["General", "Model Configuration", "Configuration", "Assignment", "Form", "Gateway", "Conditional"]
    },
    {
      id: "advanced",
      label: "Advanced",
      order: 20,
      groups: ["Job Configuration", "Multi-Instance", "Variables", "Listeners", "History"]
    },
    {
      id: "events",
      label: "Events",
      order: 30,
      groups: ["Event Definition", "Timer", "Message", "Signal", "Error", "Boundary"],
      visibility: {
        condition: "element.type.includes('Event')"
      }
    },
    {
      id: "documentation",
      label: "Documentation",
      order: 40,
      groups: ["Documentation"]
    }
  ],
  defaultTab: "general",
  defaultGroup: "General"
};