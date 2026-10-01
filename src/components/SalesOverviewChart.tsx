'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Sparkles, 
  Flame, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  BarChart2, 
  Activity, 
  Eye
} from 'lucide-react';
import { ChartHour } from '@/lib/salesContext';

interface SalesOverviewChartProps {
  vendasTotais: number;
  saldoDisponivel: number;
  pedidos: number;
  hourlyData: ChartHour[];
  onNavigate?: (view: any) => void;
}

export type PeriodType = 'hoje' | '7d' | '30d' | 'tudo';

interface DataPoint {
  label: string;
  sublabel?: string;
  current: number;
  previous: number;
  orders: number;
  commission: number;
}

export default function SalesOverviewChart({
  vendasTotais,
  saldoDisponivel,
  pedidos,
  hourlyData,
  onNavigate
}: SalesOverviewChartProps) {
  const [period, setPeriod] = useState<PeriodType>('hoje');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(560);

  // Resize listener for responsive SVG
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setSvgWidth(containerRef.current.clientWidth || 560);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute dataset based on selected period
  const data: DataPoint[] = useMemo(() => {
    const baseTotal = Math.max(vendasTotais, 0);

    if (period === 'hoje') {
      const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
      const currentHour = new Date().getHours();
      const currentBracket = String(Math.floor(currentHour / 2) * 2).padStart(2, '0');
      const currentBracketNum = parseInt(currentBracket, 10);
      
      const totalTodaySales = hourlyData.reduce((acc, item) => acc + (item.valHoje || 0), 0);

      return hours.map((h) => {
        const hNum = parseInt(h, 10);
        const isFuture = hNum > currentBracketNum;
        const ctxHour = hourlyData.find(item => item.hour === h);
        
        // Future hours are strictly 0 (not occurred yet today)
        const currentVal = isFuture ? 0 : (ctxHour ? (ctxHour.valHoje || 0) : 0);
        const prevVal = ctxHour ? (ctxHour.valOntem || 0) : 0;
        const pointOrders = currentVal > 0 
          ? (totalTodaySales > 0 ? Math.max(1, Math.round((currentVal / totalTodaySales) * pedidos)) : 1)
          : 0;

        return {
          label: `${h}h`,
          sublabel: isFuture ? `Hoje, ${h}:00 (Aguardando)` : `Hoje, ${h}:00`,
          current: Math.round(currentVal * 100) / 100,
          previous: Math.round(prevVal * 100) / 100,
          orders: pointOrders,
          commission: Math.round(currentVal * 0.32 * 100) / 100
        };
      });
    }

    if (period === '7d') {
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const today = new Date();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const isToday = i === 0;
        const dayLabel = isToday ? 'Hoje' : dayNames[d.getDay()];
        const fullDayName = isToday ? 'Hoje' : `${dayNames[d.getDay()]}-feira (${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')})`;
        days.push({ dayLabel, fullDayName, isToday, daysAgo: i });
      }

      const todayTotal = hourlyData.reduce((acc, item) => acc + (item.valHoje || 0), 0);
      const yesterdayTotal = hourlyData.reduce((acc, item) => acc + (item.valOntem || 0), 0);

      // Histórico diário para conta Gerente (faturamento entre R$ 3.000 e R$ 5.000 por dia)
      const pastDaysValues: Record<number, { val: number; orders: number }> = {
        6: { val: 3480.00, orders: 23 }, // 6 dias atrás
        5: { val: 4250.00, orders: 28 }, // 5 dias atrás
        4: { val: 3790.00, orders: 25 }, // 4 dias atrás
        3: { val: 4890.00, orders: 33 }, // 3 dias atrás
        2: { val: 3620.00, orders: 24 }, // 2 dias atrás
      };

      return days.map((item, idx) => {
        let currentVal = 0;
        let pointOrders = 0;

        if (item.isToday) {
          currentVal = todayTotal;
          pointOrders = todayTotal > 0 
            ? Math.max(1, Math.round((todayTotal / (baseTotal || 1)) * pedidos)) 
            : (baseTotal >= 15000 ? 14 : 0);
        } else if (idx === days.length - 2) {
          // Ontem
          currentVal = yesterdayTotal > 0 ? yesterdayTotal : (baseTotal >= 15000 ? 4380.00 : 0);
          pointOrders = yesterdayTotal > 0 
            ? Math.max(1, Math.round((yesterdayTotal / (baseTotal || 1)) * pedidos)) 
            : (baseTotal >= 15000 ? 29 : 0);
        } else if (baseTotal >= 15000) {
          // Dias anteriores da semana para conta Gerente (3k a 5k/dia)
          const past = pastDaysValues[item.daysAgo] || { val: 3800.00, orders: 25 };
          currentVal = past.val;
          pointOrders = past.orders;
        }

        return {
          label: item.dayLabel,
          sublabel: item.fullDayName,
          current: Math.round(currentVal * 100) / 100,
          previous: 0,
          orders: pointOrders,
          commission: Math.round(currentVal * 0.32 * 100) / 100
        };
      });
    }

    if (period === '30d') {
      const todayTotal = hourlyData.reduce((acc, item) => acc + (item.valHoje || 0), 0);
      const now = new Date();
      const buckets = [];
      for (let i = 9; i >= 0; i--) {
        const isToday = i === 0;
        const d = new Date(now.getTime() - i * 3 * 86400000);
        const dayStr = d.getDate().toString().padStart(2, '0');
        const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
        const label = isToday ? 'Hoje' : `D-${(i * 3).toString().padStart(2, '0')}`;
        const sublabel = isToday ? 'Hoje (Acumulado)' : `Período ${dayStr}/${monthStr}`;
        buckets.push({ label, sublabel, isToday, stepIndex: i });
      }

      return buckets.map((b) => {
        let currentVal = 0;
        let pointOrders = 0;

        if (b.isToday) {
          currentVal = todayTotal > 0 ? todayTotal : Math.round(baseTotal * 0.15);
          pointOrders = Math.max(1, Math.round(pedidos * 0.1));
        } else if (baseTotal >= 15000) {
          if (b.stepIndex === 1) {
            currentVal = 12350.00;
            pointOrders = 82;
          } else if (b.stepIndex === 2) {
            currentVal = 11520.00;
            pointOrders = 76;
          } else if (b.stepIndex <= 5) {
            currentVal = Math.round(baseTotal * (0.35 - b.stepIndex * 0.04));
            pointOrders = Math.round(pedidos * (0.35 - b.stepIndex * 0.04));
          }
        }

        return {
          label: b.label,
          sublabel: b.sublabel,
          current: Math.round(currentVal * 100) / 100,
          previous: 0,
          orders: pointOrders,
          commission: Math.round(currentVal * 0.32 * 100) / 100
        };
      });
    }

    // 'tudo' (All Time / Últimos 6 Meses dinâmicos baseados na data real de hoje)
    const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthNamesFull = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const isCurrent = i === 0;
      const mIdx = d.getMonth();
      const shortName = isCurrent ? 'Hoje' : monthNamesShort[mIdx];
      const fullName = isCurrent 
        ? `Mês Atual (${monthNamesFull[mIdx]})` 
        : `Mês de ${monthNamesFull[mIdx]} de ${d.getFullYear()}`;
      months.push({ shortName, fullName, isCurrent, monthsAgo: i });
    }

    return months.map((m) => {
      let currentVal = m.isCurrent ? baseTotal : 0;
      let pointOrders = m.isCurrent ? pedidos : 0;

      if (!m.isCurrent && baseTotal >= 15000) {
        // Escala realista de crescimento nos meses anteriores da loja
        const multipliers: Record<number, number> = {
          1: 0.92, // 1 mês atrás (Setembro)
          2: 0.78, // 2 meses atrás (Agosto)
          3: 0.62, // 3 meses atrás (Julho)
          4: 0.45, // 4 meses atrás (Junho)
          5: 0.28, // 5 meses atrás (Maio)
        };
        const factor = multipliers[m.monthsAgo] || 0.3;
        currentVal = Math.round(baseTotal * factor);
        pointOrders = Math.round(pedidos * factor);
      }

      return {
        label: m.shortName,
        sublabel: m.fullName,
        current: Math.round(currentVal * 100) / 100,
        previous: 0,
        orders: pointOrders,
        commission: Math.round(currentVal * 0.32 * 100) / 100
      };
    });
  }, [period, vendasTotais, hourlyData, pedidos]);

  // Totals, Peaks and Averages
  const periodTotal = useMemo(() => {
    if (period === 'tudo') return Math.round(Math.max(vendasTotais, 0) * 100) / 100;
    return Math.round(data.reduce((acc, d) => acc + d.current, 0) * 100) / 100;
  }, [data, period, vendasTotais]);

  const prevPeriodTotal = useMemo(() => {
    return data.reduce((acc, d) => acc + d.previous, 0);
  }, [data]);

  const peakPoint = useMemo(() => {
    return data.reduce((max, d) => d.current > max.current ? d : max, data[0] || { current: 0, label: '-' });
  }, [data]);

  const growthPercentage = useMemo(() => {
    if (prevPeriodTotal === 0) return periodTotal > 0 ? 100 : 0;
    return Math.round(((periodTotal - prevPeriodTotal) / prevPeriodTotal) * 100 * 10) / 10;
  }, [periodTotal, prevPeriodTotal]);

  // Coordinate Calculations
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const usableWidth = Math.max(280, 560 - paddingLeft - paddingRight);
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    const highest = Math.max(...data.map(d => Math.max(d.current, d.previous)), 10);
    return highest * 1.25;
  }, [data]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * usableWidth;
      const yCurrent = paddingTop + usableHeight - (d.current / maxVal) * usableHeight;
      const yPrevious = paddingTop + usableHeight - (d.previous / maxVal) * usableHeight;
      return { x, yCurrent, yPrevious, data: d, index: i };
    });
  }, [data, maxVal, usableWidth, usableHeight]);

  // Catmull-Rom Bézier spline generator for smooth organic curve
  const currentSpline = useMemo(() => {
    if (points.length < 2) return '';
    const bottomY = paddingTop + usableHeight;
    let path = `M ${points[0].x} ${points[0].yCurrent}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;

      let cp1y = p1.yCurrent + (p2.yCurrent - p0.yCurrent) / 6;
      let cp2y = p2.yCurrent - (p3.yCurrent - p1.yCurrent) / 6;

      // Se ambos os pontos são zero, força linha reta no chão (evita qualquer overshoot)
      if (p1.data.current === 0 && p2.data.current === 0) {
        cp1y = bottomY;
        cp2y = bottomY;
      } else {
        cp1y = Math.min(bottomY, Math.max(paddingTop, cp1y));
        cp2y = Math.min(bottomY, Math.max(paddingTop, cp2y));
      }

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.yCurrent.toFixed(1)}`;
    }
    return path;
  }, [points, paddingTop, usableHeight]);

  // Previous period spline (dashed reference line)
  const previousSpline = useMemo(() => {
    if (points.length < 2) return '';
    const bottomY = paddingTop + usableHeight;
    let path = `M ${points[0].x} ${points[0].yPrevious}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;

      let cp1y = p1.yPrevious + (p2.yPrevious - p0.yPrevious) / 6;
      let cp2y = p2.yPrevious - (p3.yPrevious - p1.yPrevious) / 6;

      if (p1.data.previous === 0 && p2.data.previous === 0) {
        cp1y = bottomY;
        cp2y = bottomY;
      } else {
        cp1y = Math.min(bottomY, Math.max(paddingTop, cp1y));
        cp2y = Math.min(bottomY, Math.max(paddingTop, cp2y));
      }

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.yPrevious.toFixed(1)}`;
    }
    return path;
  }, [points, paddingTop, usableHeight]);

  // Latest active point with sales > 0 to place pulsing indicator
  const latestActivePoint = useMemo(() => {
    const reversed = [...points].reverse();
    return reversed.find(p => p.data.current > 0) || points[points.length - 1];
  }, [points]);

  // Area under current spline
  const currentAreaPath = useMemo(() => {
    if (!currentSpline || points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = paddingTop + usableHeight;
    return `${currentSpline} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [currentSpline, points, usableHeight]);

  // Y-Axis Reference ticks
  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }).map((_, i) => {
      const val = (maxVal * (count - i)) / count;
      const y = paddingTop + (i / count) * usableHeight;
      let label = 'R$ 0';
      if (val >= 1000) {
        label = `R$ ${(val / 1000).toFixed(1).replace('.0', '')}k`;
      } else if (val > 0) {
        label = `R$ ${Math.round(val)}`;
      }
      return { val, y, label };
    });
  }, [maxVal, usableHeight]);

  // Mouse / Touch interaction handlers
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = 560 / rect.width;
    const svgMouseX = mouseX * scaleX;

    let closestIdx = 0;
    let minDistance = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgMouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const scaleX = 560 / rect.width;
    const svgTouchX = touchX * scaleX;

    let closestIdx = 0;
    let minDistance = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgTouchX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div 
      ref={containerRef}
      className="relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 bg-gradient-to-b from-[#0e1424] via-[#0b101c] to-[#070b13] border border-white/10 hover:border-[#22c55e]/40 shadow-2xl shadow-black/60 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 group"
    >
      {/* Top Header & Period Selector */}
      <div className="space-y-3 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]">
              <Activity size={15} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>Visão Geral de Vendas</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 font-extrabold uppercase">
                  {period === 'hoje' ? 'Hoje' : period === '7d' ? 'Últimos 7 Dias' : period === '30d' ? 'Últimos 30 Dias' : 'Geral'}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Monitoramento dinâmico com métricas e projeção em tempo real
              </p>
            </div>
          </div>

          {/* Controls: Chart Type + Period Pills */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Toggle Line / Bar */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 mr-1">
              <button
                onClick={() => setChartType('line')}
                title="Gráfico em Linha Suave"
                className={`p-1 sm:p-1.5 rounded-lg transition-all ${chartType === 'line' ? 'bg-[#22c55e] text-black font-black shadow-md shadow-[#22c55e]/30' : 'hover:text-white'}`}
              >
                <Activity size={12} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                title="Gráfico em Barras Neon"
                className={`p-1 sm:p-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-[#22c55e] text-black font-black shadow-md shadow-[#22c55e]/30' : 'hover:text-white'}`}
              >
                <BarChart2 size={12} />
              </button>
            </div>

            {/* Period Pills */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10">
              {(['hoje', '7d', '30d', 'tudo'] as PeriodType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setPeriod(tab);
                    setHoveredIndex(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all uppercase ${
                    period === tab
                      ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/25 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'hoje' ? 'Hoje' : tab === '7d' ? '7D' : tab === '30d' ? '30D' : 'Tudo'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Metric KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
          {/* Total Faturado */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
              Faturamento ({period === 'hoje' ? 'Hoje' : period.toUpperCase()})
            </span>
            <div className="text-sm sm:text-base font-black text-white truncate">
              R$ {periodTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Comparativo vs Anterior */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
              Vs. Período Anterior
            </span>
            <div className={`text-xs sm:text-sm font-black flex items-center gap-1 ${growthPercentage >= 0 ? 'text-[#4ade80]' : 'text-rose-400'}`}>
              {growthPercentage >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{growthPercentage >= 0 ? `+${growthPercentage}%` : `${growthPercentage}%`}</span>
            </div>
          </div>

          {/* Pico Máximo */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
              <Flame size={10} className="text-amber-400" /> Pico Registrado
            </span>
            <div className="text-xs sm:text-sm font-black text-white truncate">
              R$ {peakPoint.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-[10px] text-slate-400 font-semibold ml-1">({peakPoint.label})</span>
            </div>
          </div>

          {/* Comissão Média Estimada */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
              Comissão do Período
            </span>
            <div className="text-xs sm:text-sm font-black text-[#4ade80] truncate">
              R$ {(periodTotal * 0.32).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
              <span className="text-slate-200 font-bold">
                {period === 'hoje' ? 'Faturamento Hoje' : 'Período Atual'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 rounded-full bg-slate-500 border-t border-dashed border-slate-400" />
              <span className="text-slate-400 font-medium">
                {period === 'hoje' ? 'Ontem' : 'Período Anterior'}
              </span>
            </div>
          </div>

          <span className="hidden sm:inline text-[9px] text-slate-500 font-semibold">
            Passe o mouse ou toque para inspecionar
          </span>
        </div>
      </div>

      {/* Main SVG Chart with Interactive Hover */}
      <div className="relative w-full h-44 sm:h-52 md:h-56 select-none">
        <svg 
          viewBox="0 0 560 220" 
          className="w-full h-full overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Neon Green Area Gradient */}
            <linearGradient id="decolaChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>

            {/* Bar Gradient */}
            <linearGradient id="decolaBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.3" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line 
                x1={paddingLeft} 
                y1={tick.y} 
                x2={paddingLeft + usableWidth} 
                y2={tick.y} 
                stroke="rgba(255,255,255,0.06)" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={tick.y + 3.5} 
                textAnchor="end" 
                fill="#64748b" 
                fontSize="8.5" 
                fontWeight="700"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Chart Content (Line or Bar) */}
          {chartType === 'line' ? (
            <>
              {/* Previous Period Dashed Curve */}
              {previousSpline && (
                <path
                  d={previousSpline}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              )}

              {/* Current Period Area Gradient */}
              {currentAreaPath && (
                <path
                  d={currentAreaPath}
                  fill="url(#decolaChartGradient)"
                />
              )}

              {/* Current Period Glowing Neon Line */}
              {currentSpline && (
                <path
                  d={currentSpline}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonGlow)"
                  className="transition-all duration-300"
                />
              )}

              {/* Pulsing Dot on Latest Active Data Point with Sales */}
              {latestActivePoint && latestActivePoint.data.current > 0 && (
                <g>
                  <circle
                    cx={latestActivePoint.x}
                    cy={latestActivePoint.yCurrent}
                    r="7"
                    fill="#22c55e"
                    opacity="0.3"
                    className="animate-ping"
                  />
                  <circle
                    cx={latestActivePoint.x}
                    cy={latestActivePoint.yCurrent}
                    r="4.5"
                    fill="#4ade80"
                    stroke="#080c14"
                    strokeWidth="2"
                  />
                </g>
              )}
            </>
          ) : (
            /* Bar Chart View */
            <g>
              {points.map((p, idx) => {
                const barWidth = Math.max(12, usableWidth / points.length - 10);
                const barHeight = p.data.current > 0 ? Math.max(3, (p.data.current / maxVal) * usableHeight) : 0;
                const prevBarHeight = p.data.previous > 0 ? Math.max(3, (p.data.previous / maxVal) * usableHeight) : 0;
                const barX = p.x - barWidth / 2;
                const barY = paddingTop + usableHeight - barHeight;
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Previous period bar outline */}
                    {prevBarHeight > 0 && (
                      <rect
                        x={barX + barWidth * 0.15}
                        y={paddingTop + usableHeight - prevBarHeight}
                        width={barWidth * 0.7}
                        height={prevBarHeight}
                        rx="3"
                        fill="rgba(100, 116, 139, 0.2)"
                        stroke="#475569"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    {/* Current period bar */}
                    {barHeight > 0 ? (
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={isHovered ? '#4ade80' : 'url(#decolaBarGradient)'}
                        filter={isHovered ? 'url(#neonGlow)' : undefined}
                        className="transition-all duration-200"
                      />
                    ) : (
                      /* Minimal baseline marker when hovering zero-value bar */
                      isHovered && (
                        <circle
                          cx={p.x}
                          cy={paddingTop + usableHeight}
                          r="2.5"
                          fill="#475569"
                        />
                      )
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Interactive Laser Crosshair & Highlight Points on Hover */}
          {activePoint && (
            <g>
              {/* Vertical Laser Line */}
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + usableHeight}
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Previous period point marker */}
              <circle
                cx={activePoint.x}
                cy={activePoint.yPrevious}
                r="3.5"
                fill="#64748b"
                stroke="#0f172a"
                strokeWidth="2"
              />

              {/* Active current point marker */}
              <circle
                cx={activePoint.x}
                cy={activePoint.yCurrent}
                r="7"
                fill="#22c55e"
                opacity="0.4"
                className="animate-pulse"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.yCurrent}
                r="4.5"
                fill="#4ade80"
                stroke="#080c14"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X-Axis Tick Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={paddingTop + usableHeight + 18}
              textAnchor="middle"
              fill={hoveredIndex === idx ? '#4ade80' : '#64748b'}
              fontSize="9"
              fontWeight={hoveredIndex === idx ? '800' : '600'}
              className="transition-colors"
            >
              {p.data.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && (
          <div 
            className="absolute pointer-events-none z-30 transition-all duration-150 transform -translate-y-full"
            style={{
              left: `${Math.min(Math.max(activePoint.x, 80), 480) * (svgWidth / 560)}px`,
              top: `${Math.max(20, activePoint.yCurrent * (svgWidth / 560) * 0.7 - 10)}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-[#0b101d]/95 backdrop-blur-xl border border-[#22c55e]/50 rounded-2xl p-3 shadow-2xl shadow-[#22c55e]/20 text-white min-w-[190px] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1.5">
                <span className="font-bold flex items-center gap-1 text-slate-200">
                  <Clock size={11} className="text-[#22c55e]" />
                  {activePoint.data.sublabel || activePoint.data.label}
                </span>
                <span className="font-black text-[#4ade80] text-[9px] bg-[#22c55e]/15 px-1.5 py-0.5 rounded">
                  {activePoint.data.orders} {activePoint.data.orders === 1 ? 'venda' : 'vendas'}
                </span>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Faturamento:</div>
                <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#4ade80]">
                  R$ {activePoint.data.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-white/5">
                <div>
                  <span className="text-slate-400 text-[9px] block">Comissão:</span>
                  <span className="font-extrabold text-[#4ade80]">
                    R$ {activePoint.data.commission.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">Anterior:</span>
                  <span className="font-semibold text-slate-400">
                    R$ {activePoint.data.previous.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-slate-400">
        <span>
          Atualizado em tempo real via Webhook e Mineração IA
        </span>
        {onNavigate && (
          <button 
            onClick={() => onNavigate('financeiro')}
            className="text-[#4ade80] hover:underline font-extrabold flex items-center gap-1"
          >
            <span>Ver Relatório Completo</span>
            <ArrowUpRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
