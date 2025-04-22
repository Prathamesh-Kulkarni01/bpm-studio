import React from 'react';
import { Input } from "@/components/ui/input";

interface CustomNameRendererProps {
  property: any;
  value: any;
  onChange: (newValue: any) => void;
  element: any;
  values: any;
}

const ColorPicker: React.FC<CustomNameRendererProps> = ({
  property,
  value,
  onChange,
  element,
  values
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        id={`prop-${property.name}`}
        value={value || ''}
        type="color"
        onChange={(e) => onChange(e.target.value)}
        placeholder={property.placeholder || 'Enter a name...'}
        disabled={property.readOnly}
        className="w-full"
      />
    </div>
  );
};

export default ColorPicker;