import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CircleIcon,
  SquareIcon,
  DiamondIcon,
  InfoIcon,
  HelpCircleIcon,
  CalendarIcon,
  ClockIcon,
  CodeIcon,
  TagIcon,
  SlidersIcon,
  ListIcon
} from 'lucide-react';

import { 
  PropertyPanelSchema, 
  PropertyDefinition,
  organizeProperties,
  evaluateCondition,
  getInputTypeForProperty,
  fetchPropertyOptions,
  PropertyOption
} from '@/lib/propertyPanelSchema';

interface ConfigurablePropertyPanelProps {
  schema: PropertyPanelSchema;
  element: any;
  modeler: any;
  onValueChange?: (propName: string, value: any) => void;
}

export default function ConfigurablePropertyPanel({
  schema,
  element,
  modeler,
  onValueChange
}: ConfigurablePropertyPanelProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [propOptions, setPropOptions] = useState<Record<string, PropertyOption[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // Extract initial values from the element
  useEffect(() => {
    if (!element) return;
    
    const initialValues: Record<string, any> = {};
    
    // Get element ID and type as base values
    initialValues.id = element.id;
    initialValues.type = element.type;
    
    // Extract values for each property from the business object
    schema.properties.forEach(prop => {
      try {
        let value;
        // Handle nested properties (using dot notation)
        if (prop.name.includes('.')) {
          const parts = prop.name.split('.');
          let obj = element.businessObject;
          for (let i = 0; i < parts.length - 1; i++) {
            obj = obj?.[parts[i]];
            if (!obj) break;
          }
          value = obj?.[parts[parts.length - 1]];
        } else {
          // Direct properties
          value = element.businessObject?.[prop.name];
        }
        
        // If no value is found, use default
        initialValues[prop.name] = value !== undefined ? value : prop.defaultValue;
      } catch (error) {
        console.error(`Error extracting value for property ${prop.name}:`, error);
        initialValues[prop.name] = prop.defaultValue;
      }
    });
    
    setValues(initialValues);
    setLoading(false);
    
    // Set default active tab
    if (schema.tabs && schema.tabs.length > 0) {
      // Find the first tab that should be visible for this element
      const firstVisibleTab = schema.tabs.find(tab => 
        !tab.visibility || evaluateCondition(tab.visibility.condition, element, initialValues)
      );
      if (firstVisibleTab) {
        setActiveTab(firstVisibleTab.id);
      } else if (schema.defaultTab) {
        setActiveTab(schema.defaultTab);
      } else {
        setActiveTab(schema.tabs[0].id);
      }
    } else {
      setActiveTab('default');
    }
  }, [element, schema]);
  
  // Fetch options for properties that need them
  useEffect(() => {
    async function loadOptions() {
      const newOptions: Record<string, PropertyOption[]> = { ...propOptions };
      
      // Get properties that need options from an API
      const propsWithOptions = schema.properties.filter(prop => 
        prop.fetchOptions && 
        evaluateCondition(prop.visibility.condition, element, values)
      );
      
      // Fetch options for each property
      for (const prop of propsWithOptions) {
        try {
          const options = await fetchPropertyOptions(prop, element, values);
          newOptions[prop.name] = options;
        } catch (error) {
          console.error(`Error fetching options for ${prop.name}:`, error);
          newOptions[prop.name] = [];
        }
      }
      
      setPropOptions(newOptions);
    }
    
    if (element && !loading) {
      loadOptions();
    }
  }, [element, schema, values, loading]);
  
  // Organize properties into tabs and groups
  const organizedProperties = useMemo(() => {
    if (!element || loading) {
      return { tabs: [] };
    }
    
    return organizeProperties(schema, element, values);
  }, [schema, element, values, loading]);
  
  // Handle property value change
  const handleValueChange = (propName: string, value: any) => {
    // Update local state
    setValues(prev => {
      const newValues = { ...prev, [propName]: value };
      
      // Look for properties that depend on this one
      const dependentProps = schema.properties.filter(prop => 
        prop.visibility.dependsOn?.includes(propName)
      );
      
      // Re-evaluate visibility for dependent properties
      dependentProps.forEach(prop => {
        // If property has an onChange handler, call it
        if (prop.onChange) {
          if (typeof prop.onChange === 'function') {
            prop.onChange(value, element, newValues);
          } else if (typeof prop.onChange === 'string') {
            try {
              const onChangeFn = new Function('value', 'element', 'values', prop.onChange);
              onChangeFn(value, element, newValues);
            } catch (error) {
              console.error(`Error executing onChange for ${prop.name}:`, error);
            }
          }
        }
      });
      
      return newValues;
    });
    
    // Update the model if needed
    if (element && modeler) {
      try {
        // Get the modeling module
        const modeling = modeler.get('modeling');
        
        // Update the property
        // For nested properties (using dot notation)
        if (propName.includes('.')) {
          const parts = propName.split('.');
          const lastPart = parts[parts.length - 1];
          const propPath = parts.slice(0, -1).join('.');
          
          // Create update object with the nested structure
          const updateObj: any = {};
          let currentObj = updateObj;
          
          for (let i = 0; i < parts.length - 1; i++) {
            currentObj[parts[i]] = {};
            currentObj = currentObj[parts[i]];
          }
          
          currentObj[lastPart] = value;
          
          modeling.updateProperties(element, updateObj);
        } else {
          // For direct properties
          modeling.updateProperties(element, { [propName]: value });
        }
      } catch (error) {
        console.error(`Error updating property ${propName}:`, error);
      }
    }
    
    // Call the callback if provided
    if (onValueChange) {
      onValueChange(propName, value);
    }
  };
  
  // Render a property input based on its type
  const renderPropertyInput = (prop: PropertyDefinition) => {
    const inputType = getInputTypeForProperty(prop);
    const value = values[prop.name];
    const options = prop.options 
      ? (Array.isArray(prop.options) ? prop.options : propOptions[prop.name] || [])
      : [];
    
    switch (inputType) {
      case 'text':
        return (
          <Input
            id={`prop-${prop.name}`}
            value={value || ''}
            onChange={(e) => handleValueChange(prop.name, e.target.value)}
            placeholder={prop.placeholder}
            disabled={prop.readOnly}
            className="w-full"
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={`prop-${prop.name}`}
            value={value || ''}
            onChange={(e) => handleValueChange(prop.name, e.target.value)}
            placeholder={prop.placeholder}
            disabled={prop.readOnly}
            className="min-h-[80px]"
          />
        );
        
      case 'select':
        return (
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => handleValueChange(prop.name, newValue)}
            disabled={prop.readOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={prop.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value.toString()} 
                  value={option.value.toString()}
                  disabled={option.disabled}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`prop-${prop.name}`}
              checked={!!value}
              onCheckedChange={(checked) => handleValueChange(prop.name, checked)}
              disabled={prop.readOnly}
            />
            <label
              htmlFor={`prop-${prop.name}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {prop.placeholder || ''}
            </label>
          </div>
        );
        
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={`prop-${prop.name}`}
              checked={!!value}
              onCheckedChange={(checked) => handleValueChange(prop.name, checked)}
              disabled={prop.readOnly}
            />
            <Label htmlFor={`prop-${prop.name}`}>{prop.placeholder || ''}</Label>
          </div>
        );
        
      case 'tags':
        // For simple array rendering
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {(value || []).map((tag: string, idx: number) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {tag}
                  {!prop.readOnly && (
                    <button 
                      className="text-xs hover:bg-gray-200 rounded-full h-4 w-4 inline-flex items-center justify-center"
                      onClick={() => {
                        const newTags = [...value];
                        newTags.splice(idx, 1);
                        handleValueChange(prop.name, newTags);
                      }}
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {!prop.readOnly && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      const newTag = target.value.trim();
                      if (newTag) {
                        const newTags = [...(value || []), newTag];
                        handleValueChange(prop.name, newTags);
                        target.value = '';
                      }
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement)
                      .closest('div')
                      ?.querySelector('input') as HTMLInputElement;
                    if (input) {
                      const newTag = input.value.trim();
                      if (newTag) {
                        const newTags = [...(value || []), newTag];
                        handleValueChange(prop.name, newTags);
                        input.value = '';
                      }
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'multiselect':
        // This is a simplified version - would need a proper multi-select component
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value.toString()} className="flex items-center space-x-2">
                <Checkbox
                  id={`prop-${prop.name}-${option.value}`}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentVal = value || [];
                    const newVal = checked
                      ? [...currentVal, option.value]
                      : currentVal.filter((v: any) => v !== option.value);
                    handleValueChange(prop.name, newVal);
                  }}
                  disabled={prop.readOnly || option.disabled}
                />
                <label
                  htmlFor={`prop-${prop.name}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'date':
      case 'time':
      case 'datetime':
        // Would use date/time picker components in a real implementation
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={`prop-${prop.name}`}
              type={inputType === 'time' ? 'time' : (inputType === 'date' ? 'date' : 'datetime-local')}
              value={value || ''}
              onChange={(e) => handleValueChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              disabled={prop.readOnly}
              className="w-full"
            />
          </div>
        );
        
      case 'code':
      case 'expression':
        // Would use a code editor in a real implementation
        return (
          <Textarea
            id={`prop-${prop.name}`}
            value={value || ''}
            onChange={(e) => handleValueChange(prop.name, e.target.value)}
            placeholder={prop.placeholder || (inputType === 'code' ? 'Enter code...' : 'Enter expression...')}
            disabled={prop.readOnly}
            className="font-mono text-sm min-h-[100px]"
          />
        );
        
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={`prop-${prop.name}`}
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleValueChange(prop.name, e.target.value)}
              disabled={prop.readOnly}
              className="w-12 h-8 p-1"
            />
            <Input
              value={value || ''}
              onChange={(e) => handleValueChange(prop.name, e.target.value)}
              placeholder="#RRGGBB"
              disabled={prop.readOnly}
              className="flex-1"
            />
          </div>
        );
        
      case 'file':
        // Simplified file input
        return (
          <Input
            id={`prop-${prop.name}`}
            type="file"
            disabled={prop.readOnly}
            className="w-full"
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                // In a real implementation, would handle file upload
                handleValueChange(prop.name, file.name);
              }
            }}
          />
        );
        
      case 'card':
      case 'table':
      case 'custom':
        // Would implement complex components for these types
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{prop.name}</CardTitle>
              <CardDescription>Custom property rendering not implemented</CardDescription>
            </CardHeader>
          </Card>
        );
        
      default:
        return (
          <Input
            id={`prop-${prop.name}`}
            value={value || ''}
            onChange={(e) => handleValueChange(prop.name, e.target.value)}
            placeholder={prop.placeholder}
            disabled={prop.readOnly}
            className="w-full"
          />
        );
    }
  };
  
  // Render each property with label, description, and input
  const renderProperty = (prop: PropertyDefinition) => {
    return (
      <div key={prop.name} className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <Label 
            htmlFor={`prop-${prop.name}`}
            className="text-sm font-medium"
          >
            {prop.name}
            {prop.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {prop.tooltip && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 h-6 w-6">
                  <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{prop.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {prop.tooltip}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        
        {prop.description && (
          <p className="text-xs text-muted-foreground mb-2">{prop.description}</p>
        )}
        
        {renderPropertyInput(prop)}
      </div>
    );
  };
  
  // Render a group of properties
  const renderGroup = (group: {
    id: string;
    label: string;
    icon?: ReactNode;
    properties: PropertyDefinition[];
    collapsible?: boolean;
    collapsed?: boolean;
  }) => {
    if (group.properties.length === 0) {
      return null;
    }
    
    // If group is collapsible, use Accordion
    if (group.collapsible) {
      return (
        <Accordion
          key={group.id}
          type="single"
          defaultValue={group.collapsed ? undefined : group.id}
          className="mb-4"
        >
          <AccordionItem value={group.id} className="border-0">
            <AccordionTrigger className="py-2 px-4 hover:bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                {group.icon && <span className="flex-shrink-0">{group.icon}</span>}
                <span className="font-medium text-sm">{group.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              {group.properties.map(renderProperty)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }
    
    // Otherwise, use a simple group
    return (
      <div key={group.id} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {group.icon && <span className="flex-shrink-0">{group.icon}</span>}
          <h3 className="font-medium text-sm">{group.label}</h3>
        </div>
        <div className="space-y-4">
          {group.properties.map(renderProperty)}
        </div>
      </div>
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Loading properties...</div>
      </div>
    );
  }
  
  // Show empty state if no element is selected
  if (!element) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">No element selected</div>
      </div>
    );
  }
  
  // If no properties are available for this element
  if (organizedProperties.tabs.length === 0 || 
      organizedProperties.tabs.every(tab => tab.groups.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">
          No properties available for this element type
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Element type header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
              {element.type.includes('Task') || element.type.includes('Activity') ? (
                <SquareIcon className="h-5 w-5 text-white" />
              ) : element.type.includes('Gateway') ? (
                <DiamondIcon className="h-5 w-5 text-white" />
              ) : (
                <CircleIcon className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {element.type.replace('bpmn:', '')}
                {element.businessObject?.name && (
                  <Badge variant="outline" className="ml-1">
                    {element.businessObject.name}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">{element.type}</div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    {element.type.replace('bpmn:', '')} Information
                  </h4>
                  <Separator />
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{element.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{element.type}</span>
                    </div>
                    {element.businessObject?.documentation && element.businessObject.documentation.length > 0 && (
                      <div className="pt-2">
                        <span className="text-muted-foreground block mb-1">Documentation:</span>
                        <p className="text-xs bg-muted p-2 rounded">
                          {element.businessObject.documentation[0].text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
      
      {/* Tabs for property groups */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col"
      >
        {organizedProperties.tabs.length > 1 && (
          <TabsList className="px-2 justify-start border-b rounded-none">
            {organizedProperties.tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        
        {organizedProperties.tabs.map(tab => (
          <TabsContent 
            key={tab.id} 
            value={tab.id} 
            className="flex-1 mt-0 overflow-hidden"
          >
            <ScrollArea className="h-full px-4 py-4">
              {tab.groups.map(renderGroup)}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}