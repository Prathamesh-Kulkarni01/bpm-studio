import React from 'react';
import { TabConfig } from '@/lib/propertyPanelConfig';
import { PropertyField } from './PropertyField';
import { isPropertyVisible } from '@/lib/propertyPanelConfig';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertyTabProps {
  tab: TabConfig;
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
}

/**
 * Component to render a tab of properties in the properties panel
 */
export function PropertyTab({ tab, values, onChange, disabled = false }: PropertyTabProps) {
  // Filter properties based on conditions
  const visibleProperties = tab.properties.filter(property => 
    isPropertyVisible(property, values)
  );

  if (visibleProperties.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No properties available for this element
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4 py-2">
      {visibleProperties.map(property => (
        <PropertyField 
          key={property.id}
          property={property}
          value={values[property.id]}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </ScrollArea>
  );
}