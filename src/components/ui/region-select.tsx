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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      // Use public regions API instead of admin-only endpoint
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data.data || []);
      } else {
        console.error('RegionSelect: Failed to fetch regions:', response.status);
      }
    } catch (error) {
      console.error('RegionSelect: Error fetching regions:', error);
    } finally {
      setLoading(false);
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
          <SelectValue placeholder={loading ? "Loading regions..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="__loading__" disabled>Loading regions...</SelectItem>
          ) : regions.length === 0 ? (
            <SelectItem value="__no_regions__" disabled>No regions found</SelectItem>
          ) : (
            regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => setShowCustomInput(true)}
        title="Add new region"
        disabled={loading}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}