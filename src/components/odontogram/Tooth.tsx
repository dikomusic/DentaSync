"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ToothProps {
  id: number;
  label: string;
  status?: 'healthy' | 'decayed' | 'missing' | 'filled';
  onClick?: (id: number) => void;
  className?: string;
}

export function Tooth({ id, label, status = 'healthy', onClick, className }: ToothProps) {
  const getFillColor = () => {
    switch (status) {
      case 'decayed': return 'fill-red-500';
      case 'missing': return 'fill-gray-200';
      case 'filled': return 'fill-blue-400';
      default: return 'fill-white';
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center cursor-pointer hover:scale-105 transition-transform",
        className
      )}
      onClick={() => onClick?.(id)}
    >
      <span className="text-[10px] font-bold text-muted-foreground mb-1">{label}</span>
      <svg
        width="32"
        height="40"
        viewBox="0 0 32 40"
        className={cn("stroke-primary stroke-[1.5px]", getFillColor())}
      >
        <path d="M4 8 C4 2, 28 2, 28 8 C28 15, 26 20, 24 30 C23 35, 9 35, 8 30 C6 20, 4 15, 4 8 Z" />
        <path d="M8 8 Q16 4 24 8" fill="none" />
      </svg>
    </div>
  );
}
