import React from 'react';
import { Input } from "@/components/ui/input";

interface CustomNameRendererProps {
  property: any;
  value: any;
  onChange: (newValue: any) => void;
  element: any;
  values: any;
}

const CustomNameRenderer: React.FC<CustomNameRendererProps> = ({
  property,
  value,
  onChange,
  element,
  values
}) => {
  return (
    <div className="flex items-center space-x-2">
        Heeloo
      <Input
        id={`prop-${property.name}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={property.placeholder || 'Enter a name...'}
        disabled={property.readOnly}
        className="w-full"
      />
      <span>Custom Renderer</span>
    </div>
  );
};

export default CustomNameRenderer;