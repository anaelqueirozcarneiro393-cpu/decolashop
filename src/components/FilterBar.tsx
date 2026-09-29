'use client';

import React from 'react';
import { Filter, Calendar, BarChart3, ChevronDown } from 'lucide-react';

const filters = [
  { name: 'Categoria', icon: Filter, options: ['Eletrônicos', 'Moda', 'Casa', 'Beleza'] },
  { name: 'Data de Descoberta', icon: Calendar, options: ['Hoje', 'Esta Semana', 'Este Mês'] },
  { name: 'Volume de Busca', icon: BarChart3, options: ['Alto', 'Médio', 'Baixo'] },
];

export default function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {filters.map((filter) => (
        <div key={filter.name} className="relative group">
          <button className="flex items-center gap-2 bg-secondary/40 border border-border px-4 py-2 rounded-xl text-sm font-medium hover:border-primary/50 hover:bg-secondary/60 transition-all">
            <filter.icon className="w-4 h-4 text-muted-foreground" />
            <span>{filter.name}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      ))}
      
      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span>Mostrando 48 produtos encontrados nas últimas 24h</span>
      </div>
    </div>
  );
}
