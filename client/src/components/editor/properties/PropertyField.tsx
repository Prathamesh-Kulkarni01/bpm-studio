import React, { useState, useEffect } from 'react';
import { PropertyConfig, OptionsSource, PropertyOption } from '@/lib/propertyPanelConfig';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

interface PropertyFieldProps {
  property: PropertyConfig;
  value: any;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
  element?: any;
  values?: Record<string, any>;
  modeler?: any;
}

/**
 * Component that dynamically renders a form field based on property configuration
 */
export function PropertyField({ 
  property, 
  value, 
  onChange, 
  disabled = false,
  element,
  values = {},
  modeler
}: PropertyFieldProps) {
  const [dynamicOptions, setDynamicOptions] = useState<PropertyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle change events
  const handleChange = (newValue: any) => {
    onChange(property.id, newValue);
    
    // Execute change listeners
    if (property.changeListeners) {
      property.changeListeners.forEach(listener => {
        if (listener.trigger === 'immediate') {
          const watchedValues: Record<string, any> = {};
          const oldValues: Record<string, any> = {};
          
          listener.watch.forEach(field => {
            watchedValues[field] = field === property.id ? newValue : values[field];
            oldValues[field] = values[field];
          });
          
          listener.handler(watchedValues, oldValues, element, modeler);
        }
      });
    }
  };
  
  // Fetch options from API endpoint if needed
  useEffect(() => {
    if (property.type === 'select' || property.type === 'combobox' || property.type === 'radio') {
      const options = property.options;
      
      if (options && typeof options === 'object' && 'type' in options) {
        if (options.type === 'function' && element && modeler) {
          // Get options from function
          try {
            const result = options.getter(element, values, modeler);
            setDynamicOptions(result);
          } catch (err) {
            console.error('Error getting options from function:', err);
            setError('Failed to load options');
            setDynamicOptions([]);
          }
        } else if (options.type === 'api') {
          // Get options from API
          setIsLoading(true);
          setError(null);
          
          const apiOptions = options;
          const endpoint = apiOptions.endpoint;
          const method = apiOptions.method || 'GET';
          
          // Prepare params
          let params: Record<string, string> = {};
          if (apiOptions.params) {
            if (typeof apiOptions.params === 'function') {
              params = apiOptions.params(values);
            } else {
              params = apiOptions.params;
            }
          }
          
          // Convert params to query string
          const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
          
          const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
          
          // Prepare body if needed
          let body: string | undefined;
          if (method === 'POST' && apiOptions.body) {
            if (typeof apiOptions.body === 'function') {
              body = JSON.stringify(apiOptions.body(values));
            } else {
              body = JSON.stringify(apiOptions.body);
            }
          }
          
          // Make the API request
          fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(apiOptions.headers || {})
            },
            body
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              // Transform data to options format
              let options: PropertyOption[] = [];
              
              if (Array.isArray(data)) {
                options = data.map(item => ({
                  value: String(getNestedValue(item, apiOptions.responseMapping.value)),
                  label: String(getNestedValue(item, apiOptions.responseMapping.label)),
                  ...(apiOptions.responseMapping.icon ? 
                      { icon: getNestedValue(item, apiOptions.responseMapping.icon) } : {}),
                  ...(apiOptions.responseMapping.disabled ? 
                      { disabled: Boolean(getNestedValue(item, apiOptions.responseMapping.disabled)) } : {})
                }));
              }
              
              // Apply transform if provided
              if (apiOptions.transform) {
                options = apiOptions.transform(options, element, values);
              }
              
              setDynamicOptions(options);
              setIsLoading(false);
            })
            .catch(err => {
              console.error('Error fetching options from API:', err);
              setError('Failed to load options');
              setDynamicOptions([]);
              setIsLoading(false);
            });
        }
      }
    }
  }, [property.type, property.options, element, modeler, values]);
  
  // Helper to get nested values from objects using dot notation
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  };
  
  // Get validation min/max values
  const getValidationValue = (type: string): any => {
    if (!property.validation) return undefined;
    
    const rule = property.validation.find(rule => rule.type === type);
    return rule ? rule.value : undefined;
  };
  
  // Determine if field is required
  const isRequired = property.required || 
    (property.validation?.some(rule => rule.type === 'required') ?? false);
  
  // Handle different property types
  const renderField = () => {
    // Check if disabled specifically by conditions
    const fieldDisabled = disabled || property.readOnly || false;
    
    // Determine field options
    const options = Array.isArray(property.options) 
      ? property.options 
      : dynamicOptions;

    // Get field properties based on layout/style
    const fieldClasses = property.style?.className || '';
    const fieldWidth = property.style?.width || '100%';
    
    switch (property.type) {
      case 'text':
        return (
          <Input 
            id={property.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={property.placeholder}
            disabled={fieldDisabled || property.id === 'id'} // ID is typically read-only
            required={isRequired}
            className={fieldClasses}
            style={{width: fieldWidth}}
          />
        );
        
      case 'textarea':
        return (
          <Textarea 
            id={property.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={property.placeholder}
            disabled={fieldDisabled}
            required={isRequired}
            rows={3}
            className={fieldClasses}
            style={{width: fieldWidth}}
          />
        );
        
      case 'select':
        return (
          <div className={isLoading ? 'opacity-70' : ''}>
            <Select
              value={value || ''}
              onValueChange={handleChange}
              disabled={fieldDisabled || isLoading}
            >
              <SelectTrigger className={`w-full ${fieldClasses}`} style={{width: fieldWidth}}>
                <SelectValue placeholder={property.placeholder || `Select ${property.label}`} />
              </SelectTrigger>
              <SelectContent>
                {error ? (
                  <div className="p-2 text-red-500 text-sm">{error}</div>
                ) : isLoading ? (
                  <div className="p-2 text-center">Loading...</div>
                ) : (
                  options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      {option.label}
                      {option.description && (
                        <span className="ml-2 text-gray-500 text-xs">{option.description}</span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={property.id} 
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={fieldDisabled}
              className={fieldClasses}
            />
          </div>
        );
        
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch 
              id={property.id} 
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={fieldDisabled}
              className={fieldClasses}
            />
          </div>
        );
        
      case 'number':
        return (
          <Input 
            id={property.id}
            type="number"
            value={value === undefined ? '' : value}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            min={getValidationValue('min')}
            max={getValidationValue('max')}
            disabled={fieldDisabled}
            required={isRequired}
            className={fieldClasses}
            style={{width: fieldWidth}}
          />
        );
        
      case 'slider':
        const min = getValidationValue('min') || 0;
        const max = getValidationValue('max') || 100;
        return (
          <div className="py-4">
            <Slider
              min={min}
              max={max}
              step={1}
              value={[value !== undefined ? value : (property.defaultValue || min)]}
              onValueChange={(values) => handleChange(values[0])}
              disabled={fieldDisabled}
              className={fieldClasses}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{min}</span>
              <span>{value !== undefined ? value : (property.defaultValue || min)}</span>
              <span>{max}</span>
            </div>
          </div>
        );
        
      case 'color':
        return (
          <div className="flex space-x-2">
            <Input 
              id={property.id}
              type="color"
              value={value || property.defaultValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={fieldDisabled}
              className={`w-12 h-10 p-1 ${fieldClasses}`}
            />
            <Input 
              value={value || property.defaultValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={fieldDisabled}
              className={`flex-1 ${fieldClasses}`}
              style={{width: fieldWidth}}
            />
          </div>
        );
      
      case 'date':
      case 'datetime':
      case 'time':
        return (
          <Input 
            id={property.id}
            type={property.type === 'time' ? 'time' : property.type === 'datetime' ? 'datetime-local' : 'date'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={fieldDisabled}
            required={isRequired}
            className={fieldClasses}
            style={{width: fieldWidth}}
          />
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={handleChange}
            disabled={fieldDisabled}
            className={fieldClasses}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${property.id}-${option.value}`} />
                <Label htmlFor={`${property.id}-${option.value}`} className="cursor-pointer">
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'tags':
        // For simplicity, we'll show tags as badges with a text input to add new ones
        const tags = value ? (Array.isArray(value) ? value : [value]) : [];
        return (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    className="w-4 h-4 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center"
                    onClick={() => {
                      const newTags = [...tags];
                      newTags.splice(index, 1);
                      handleChange(newTags);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const newTag = input.value.trim();
                    if (newTag) {
                      handleChange([...tags, newTag]);
                      input.value = '';
                    }
                  }
                }}
                disabled={fieldDisabled}
                className={fieldClasses}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousSibling as HTMLInputElement;
                  const newTag = input.value.trim();
                  if (newTag) {
                    handleChange([...tags, newTag]);
                    input.value = '';
                  }
                }}
                disabled={fieldDisabled}
              >
                Add
              </Button>
            </div>
          </div>
        );
      
      case 'button':
        // A button that can trigger actions
        return (
          <div className="flex gap-2">
            {property.actions?.map(action => (
              <Button
                key={action.id}
                type="button"
                variant={action.type as any || "default"}
                onClick={() => action.action(element, values, modeler)}
                disabled={fieldDisabled}
                className={fieldClasses}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        );
      
      case 'card':
        return (
          <Card className={fieldClasses}>
            <CardHeader>
              <CardTitle>{typeof property.label === 'function' ? property.label(element, values) : property.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {property.properties?.map(childProp => (
                <PropertyField
                  key={childProp.id}
                  property={childProp}
                  value={values[childProp.id]}
                  onChange={onChange}
                  disabled={fieldDisabled}
                  element={element}
                  values={values}
                  modeler={modeler}
                />
              ))}
            </CardContent>
          </Card>
        );
      
      case 'panel':
        // A collapsible panel
        const isCollapsed = property.layout?.collapsed ?? false;
        const isCollapsible = property.layout?.collapsible ?? true;
        
        return isCollapsible ? (
          <Collapsible
            defaultOpen={!isCollapsed}
            className={`border rounded-md ${fieldClasses}`}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-medium">
              {typeof property.label === 'function' ? property.label(element, values) : property.label}
              <span className="text-gray-400">▼</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              {property.properties?.map(childProp => (
                <PropertyField
                  key={childProp.id}
                  property={childProp}
                  value={values[childProp.id]}
                  onChange={onChange}
                  disabled={fieldDisabled}
                  element={element}
                  values={values}
                  modeler={modeler}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className={`border rounded-md ${fieldClasses}`}>
            <div className="p-4 font-medium border-b">
              {typeof property.label === 'function' ? property.label(element, values) : property.label}
            </div>
            <div className="p-4">
              {property.properties?.map(childProp => (
                <PropertyField
                  key={childProp.id}
                  property={childProp}
                  value={values[childProp.id]}
                  onChange={onChange}
                  disabled={fieldDisabled}
                  element={element}
                  values={values}
                  modeler={modeler}
                />
              ))}
            </div>
          </div>
        );
        
      case 'custom':
        if (property.component) {
          const CustomComponent = property.component;
          return (
            <CustomComponent 
              value={value} 
              onChange={handleChange} 
              disabled={fieldDisabled}
              element={element}
              values={values}
              modeler={modeler}
              {...property.props}
            />
          );
        }
        return <div className="text-gray-500">Custom component not provided</div>;
        
      default:
        return <div className="text-red-500">Unknown property type: {property.type}</div>;
    }
  };

  // Dynamically generate the label
  const fieldLabel = typeof property.label === 'function' 
    ? property.label(element, values) 
    : property.label;
  
  // Dynamically generate the description
  const fieldDescription = typeof property.description === 'function'
    ? property.description(element, values)
    : property.description;

  return (
    <div className={`mb-3 ${property.style?.containerClassName || ''}`} style={{ 
      marginLeft: property.layout?.indent ? `${property.layout.indent * 1.5}rem` : undefined 
    }}>
      <div className="flex justify-between mb-1">
        <Label 
          htmlFor={property.id} 
          className={`text-sm font-medium ${property.style?.labelClassName || ''}`}
        >
          {fieldLabel}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {/* Show tooltip if provided */}
        {property.tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                  <InfoIcon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {property.tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {renderField()}
      
      {fieldDescription && (
        <p className={`mt-1 text-xs text-gray-500 ${property.style?.errorClassName || ''}`}>
          {fieldDescription}
        </p>
      )}
    </div>
  );
}