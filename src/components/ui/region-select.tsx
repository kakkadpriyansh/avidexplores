'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RegionSelect({ value, onChange, placeholder = "Select or enter region" }: RegionSelectProps) {
  const [regions, setRegions] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRegion, setCustomRegion] = useState('');

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/admin/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const handleCustomRegionAdd = () => {
    if (customRegion.trim()) {
      onChange(customRegion.trim());
      setCustomRegion('');
      setShowCustomInput(false);
      // Add to regions list if not already present
      if (!regions.includes(customRegion.trim())) {
        setRegions(prev => [...prev, customRegion.trim()].sort());
      }
    }
  };

  if (showCustomInput) {
    return (
      <div className="flex gap-2">
        <Input
          value={customRegion}
          onChange={(e) => setCustomRegion(e.target.value)}
          placeholder="Enter new region"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCustomRegionAdd();
            }
          }}
        />
        <Button type="button" onClick={handleCustomRegionAdd} size="sm">
          Add
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowCustomInput(false)} size="sm">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => setShowCustomInput(true)}
        title="Add new region"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}