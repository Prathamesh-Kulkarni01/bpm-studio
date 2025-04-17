import React from 'react';
import { PropertyConfig } from '@/lib/propertyPanelConfig';
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

interface PropertyFieldProps {
  property: PropertyConfig;
  value: any;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
}

/**
 * Component that dynamically renders a form field based on property configuration
 */
export function PropertyField({ property, value, onChange, disabled = false }: PropertyFieldProps) {
  const handleChange = (newValue: any) => {
    onChange(property.id, newValue);
  };

  const renderField = () => {
    switch (property.type) {
      case 'text':
        return (
          <Input 
            id={property.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={property.placeholder}
            disabled={disabled || property.id === 'id'} // ID is typically read-only
            required={property.required}
          />
        );
        
      case 'textarea':
        return (
          <Textarea 
            id={property.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={property.placeholder}
            disabled={disabled}
            required={property.required}
            rows={3}
          />
        );
        
      case 'select':
        return (
          <Select
            value={value || property.defaultValue || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={property.placeholder || `Select ${property.label}`} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={property.id} 
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
          </div>
        );
        
      case 'number':
        return (
          <Input 
            id={property.id}
            type="number"
            value={value === undefined ? property.defaultValue || '' : value}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            min={property.validation?.min}
            max={property.validation?.max}
            disabled={disabled}
            required={property.required}
          />
        );
        
      case 'color':
        return (
          <div className="flex space-x-2">
            <Input 
              id={property.id}
              type="color"
              value={value || property.defaultValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-10 p-1"
            />
            <Input 
              value={value || property.defaultValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
          </div>
        );
      
      case 'date':
        return (
          <Input 
            id={property.id}
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            required={property.required}
          />
        );
        
      case 'custom':
        if (property.component) {
          const CustomComponent = property.component;
          return (
            <CustomComponent 
              value={value} 
              onChange={handleChange} 
              disabled={disabled}
              {...property.props}
            />
          );
        }
        return <div className="text-gray-500">Custom component not provided</div>;
        
      default:
        return <div className="text-red-500">Unknown property type: {property.type}</div>;
    }
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <Label htmlFor={property.id} className="text-sm font-medium">
          {property.label}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {property.description && (
          <span className="text-xs text-gray-500" title={property.description}>ⓘ</span>
        )}
      </div>
      {renderField()}
      {property.description && (
        <p className="mt-1 text-xs text-gray-500">{property.description}</p>
      )}
    </div>
  );
}