"use client";

import React from 'react';
import { Tooth } from './Tooth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Odontogram() {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  return (
    <Card className="w-full border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Odontograma Digital
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-10">
          {/* Jaw Superior */}
          <div className="flex justify-between items-end gap-2 overflow-x-auto pb-4">
            {upperTeeth.map((id) => (
              <Tooth 
                key={id} 
                id={id} 
                label={id.toString()} 
                status={id === 4 ? 'decayed' : id === 8 ? 'filled' : 'healthy'}
              />
            ))}
          </div>

          <div className="border-t border-dashed border-muted mx-10" />

          {/* Jaw Inferior */}
          <div className="flex justify-between items-start gap-2 overflow-x-auto pt-4">
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

        <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-bold justify-center border-t pt-6 uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-primary rounded-sm" /> Sano
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm" /> Caries
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded-sm" /> Obturación
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-muted rounded-sm" /> Ausencia
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
