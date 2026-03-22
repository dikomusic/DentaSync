"use client";

import React from 'react';
import { Tooth } from './Tooth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Odontogram() {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Odontograma Digital
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8">
          {/* Upper Jaw */}
          <div className="flex justify-between items-end gap-2 overflow-x-auto pb-2">
            {upperTeeth.map((id) => (
              <Tooth 
                key={id} 
                id={id} 
                label={id.toString()} 
                status={id === 4 ? 'decayed' : id === 8 ? 'filled' : 'healthy'}
              />
            ))}
          </div>

          <div className="border-t border-dashed border-muted-foreground/30" />

          {/* Lower Jaw */}
          <div className="flex justify-between items-start gap-2 overflow-x-auto pt-2">
            {lowerTeeth.map((id) => (
              <Tooth 
                key={id} 
                id={id} 
                label={id.toString()} 
                status={id === 19 ? 'missing' : 'healthy'}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium justify-center border-t pt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-primary rounded" /> Healthy
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" /> Caries
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded" /> Obturación
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 border border-muted rounded" /> Ausencia
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
