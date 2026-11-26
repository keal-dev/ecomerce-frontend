'use client';

import React, { useMemo, useState } from 'react';
import {
  TbChartBar,
  TbChartAreaLine,
  TbChartPie,
  TbTrendingUp,
  TbTrendingDown,
  TbAward,
  TbPackage,
} from 'react-icons/tb';
import { Order } from '@/types/order.types';

interface SalesAnalyticsSectionProps {
  orders: Order[];
  currencySymbol: string;
  isLoading?: boolean;
}

type MetricKey = 'revenue' | 'orders' | 'avgTicket';
type ChartType = 'bar' | 'area';
type RightTab = 'channels' | 'statuses' | 'topProducts';

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const FULL_MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const FLUENT_PALETTE = [
  '#de2a2a',
  '#111111',
  '#2e9e7b',
  '#ca5010',
  '#6f719b',
];

interface MonthStat {
  monthIndex: number;
  label: string;
  fullLabel: string;
  revenue: number;
  orderCount: number;
  avgTicket: number;
  growthPct: number | null;
}

function formatCompactAxis(value: number, isCurrency: boolean, symbol: string): string {
  const prefix = isCurrency ? `${symbol} ` : '';
  if (value >= 1_000_000) {
    return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${prefix}${k >= 10 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${prefix}${Math.round(value)}`;
}

function formatMetricValue(
  value: number,
  metric: MetricKey,
  symbol: string,
): string {
  if (metric === 'orders') {
    return `${Math.round(value).toLocaleString('es-PE')}`;
  }
  return `${symbol} ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildSmoothAreaPaths(
  points: { x: number; y: number }[],
  baselineY: number,
): { linePath: string; areaPath: string } {
  if (points.length === 0) {
    return { linePath: '', areaPath: '' };
  }
  if (points.length === 1) {
    const p = points[0];
    return {
      linePath: `M ${p.x} ${p.y}`,
      areaPath: `M ${p.x} ${baselineY} L ${p.x} ${p.y} L ${p.x} ${baselineY} Z`,
    };
  }

  let line = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const ctrlX = (curr.x + next.x) / 2;
    line += ` C ${ctrlX.toFixed(2)} ${curr.y.toFixed(2)}, ${ctrlX.toFixed(2)} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const area = `${line} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;

  return { linePath: line, areaPath: area };
}

export function SalesAnalyticsSection({
  orders,
  currencySymbol,
  isLoading = false,
}: SalesAnalyticsSectionProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([currentYear]);
    orders.forEach((o) => {
      const y = new Date(o.createdAt).getFullYear();
      if (!isNaN(y) && y > 2000) {
        yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [orders, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('channels');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const effectiveYear = availableYears.includes(selectedYear)
    ? selectedYear
    : availableYears[0];

  const yearOrdersAll = useMemo(() => {
    return orders.filter(
      (o) => new Date(o.createdAt).getFullYear() === effectiveYear,
    );
  }, [orders, effectiveYear]);

  const yearValidOrders = useMemo(() => {
    return yearOrdersAll.filter((o) => o.orderStatus !== 'cancelled');
  }, [yearOrdersAll]);

  // Monthly breakdown
  const monthlyStats: MonthStat[] = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, idx) => ({
      monthIndex: idx,
      label: MONTH_LABELS[idx],
      fullLabel: FULL_MONTH_LABELS[idx],
      revenue: 0,
      orderCount: 0,
    }));

    yearValidOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const m = d.getMonth();
      if (m >= 0 && m < 12) {
        buckets[m].revenue += Number(o.total) || 0;
        buckets[m].orderCount += 1;
      }
    });

    const getVal = (b: { revenue: number; orderCount: number }) => {
      const avg = b.orderCount > 0 ? b.revenue / b.orderCount : 0;
      if (metric === 'orders') return b.orderCount;
      if (metric === 'avgTicket') return avg;
      return b.revenue;
    };

    return buckets.map((b, idx) => {
      const avgTicket = b.orderCount > 0 ? b.revenue / b.orderCount : 0;
      let growthPct: number | null = null;
      if (idx > 0) {
        const prevVal = getVal(buckets[idx - 1]);
        const currVal = getVal(b);
        if (prevVal > 0) {
          growthPct = ((currVal - prevVal) / prevVal) * 100;
        }
      }
      return {
        ...b,
        avgTicket,
        growthPct,
      };
    });
  }, [yearValidOrders, metric]);

  const getStatValue = (st: MonthStat) => {
    if (metric === 'orders') return st.orderCount;
    if (metric === 'avgTicket') return st.avgTicket;
    return st.revenue;
  };

  // Summary metrics for selected year
  const yearSummary = useMemo(() => {
    const totalRevenue = monthlyStats.reduce((acc, m) => acc + m.revenue, 0);
    const totalOrders = monthlyStats.reduce((acc, m) => acc + m.orderCount, 0);
    const overallAvgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const totalAnnual =
      metric === 'orders'
        ? totalOrders
        : metric === 'avgTicket'
        ? overallAvgTicket
        : totalRevenue;

    const activeMonths = monthlyStats.filter((m) => m.orderCount > 0);
    const divisor =
      activeMonths.length > 0
        ? activeMonths.length
        : effectiveYear === currentYear
        ? currentMonth + 1
        : 12;

    const monthlyAverage =
      metric === 'avgTicket'
        ? activeMonths.length > 0
          ? activeMonths.reduce((acc, m) => acc + m.avgTicket, 0) /
            activeMonths.length
          : 0
        : totalAnnual / Math.max(divisor, 1);

    let bestMonth: MonthStat = monthlyStats[0];
    monthlyStats.forEach((m) => {
      if (getStatValue(m) > getStatValue(bestMonth)) {
        bestMonth = m;
      }
    });

    const refIndex =
      effectiveYear === currentYear
        ? currentMonth
        : activeMonths.length > 0
        ? activeMonths[activeMonths.length - 1].monthIndex
        : 11;

    const refStat = monthlyStats[refIndex];
    const refGrowth = refStat?.growthPct ?? null;

    return {
      totalAnnual,
      monthlyAverage,
      bestMonth,
      bestValue: getStatValue(bestMonth),
      refMonthLabel: refStat?.label || '',
      refGrowth,
      hasAnyData: totalOrders > 0,
    };
  }, [monthlyStats, metric, effectiveYear, currentYear, currentMonth]);

  // SVG Chart geometry
  const svgW = 720;
  const svgH = 250;
  const padL = 56;
  const padR = 16;
  const padT = 22;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const plotBottom = padT + plotH;

  const rawMax = Math.max(...monthlyStats.map(getStatValue), 0);
  const safeMax = rawMax > 0 ? rawMax * 1.15 : 1;

  const colW = plotW / 12;
  const barW = Math.min(34, colW * 0.56);

  const chartPoints = monthlyStats.map((st, i) => {
    const val = getStatValue(st);
    const ratio = Math.min(1, Math.max(0, val / safeMax));
    const x = padL + i * colW + colW / 2;
    const y = plotBottom - ratio * plotH;
    return { x, y, val, stat: st };
  });

  const avgRatio = Math.min(
    1,
    Math.max(0, yearSummary.monthlyAverage / safeMax),
  );
  const avgLineY = plotBottom - avgRatio * plotH;

  const { linePath, areaPath } = useMemo(
    () =>
      buildSmoothAreaPaths(
        chartPoints.map((p) => ({ x: p.x, y: p.y })),
        plotBottom,
      ),
    [chartPoints, plotBottom],
  );

  // Right Panel: Channels, Statuses, Top Products
  const channelData = useMemo(() => {
    let onlineTotal = 0;
    let onlineCount = 0;
    let posTotal = 0;
    let posCount = 0;

    yearValidOrders.forEach((o) => {
      const isPos =
        (o.orderNumber || '').toUpperCase().startsWith('POS-') ||
        (o.paymentMethod || '').toUpperCase().includes('POS');
      if (isPos) {
        posTotal += Number(o.total) || 0;
        posCount += 1;
      } else {
        onlineTotal += Number(o.total) || 0;
        onlineCount += 1;
      }
    });

    const totalVal = onlineTotal + posTotal;
    return [
      {
        label: 'Tienda Online',
        value: onlineTotal,
        count: onlineCount,
        pct: totalVal > 0 ? (onlineTotal / totalVal) * 100 : 0,
        color: FLUENT_PALETTE[0],
      },
      {
        label: 'Punto de Venta (POS)',
        value: posTotal,
        count: posCount,
        pct: totalVal > 0 ? (posTotal / totalVal) * 100 : 0,
        color: FLUENT_PALETTE[1],
      },
    ];
  }, [yearValidOrders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      preparing: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };

    yearOrdersAll.forEach((o) => {
      const key = o.orderStatus in counts ? o.orderStatus : 'pending';
      counts[key] += 1;
    });

    const total = yearOrdersAll.length;
    const defs = [
      { key: 'delivered', label: 'Entregados', color: '#2e9e7b' },
      { key: 'pending', label: 'Confirmados', color: '#111111' },
      { key: 'preparing', label: 'En Preparación', color: '#ca5010' },
      { key: 'shipping', label: 'En Camino', color: '#6f719b' },
      { key: 'cancelled', label: 'Cancelados', color: '#de2a2a' },
    ];

    return defs
      .map((d) => ({
        label: d.label,
        value: counts[d.key],
        count: counts[d.key],
        pct: total > 0 ? (counts[d.key] / total) * 100 : 0,
        color: d.color,
      }))
      .filter((d) => d.count > 0);
  }, [yearOrdersAll]);

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { title: string; units: number; revenue: number }
    >();

    yearValidOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.productId || it.productTitle;
        const prev = map.get(key) || {
          title: it.productTitle,
          units: 0,
          revenue: 0,
        };
        prev.units += Number(it.quantity) || 0;
        prev.revenue += Number(it.subtotal) || 0;
        map.set(key, prev);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue || b.units - a.units)
      .slice(0, 5);
  }, [yearValidOrders]);

  const activeDonutSlices = rightTab === 'channels' ? channelData : statusData;
  const donutTotal = activeDonutSlices.reduce((acc, s) => acc + s.value, 0);
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;

  let cumulativeFraction = 0;
  const donutSegments = activeDonutSlices.map((slice, idx) => {
    const fraction = donutTotal > 0 ? slice.value / donutTotal : 0;
    const dashLength = fraction * donutCircumference;
    const dashOffset = -cumulativeFraction * donutCircumference;
    cumulativeFraction += fraction;
    return {
      ...slice,
      idx,
      dashLength,
      dashOffset,
    };
  });

  const activeSlice =
    hoveredSlice !== null && donutSegments[hoveredSlice]
      ? donutSegments[hoveredSlice]
      : null;

  const activeMonthStat =
    hoveredMonth !== null ? monthlyStats[hoveredMonth] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT PANEL: Evolución de Ventas Mensuales */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-[#e0e0e0] shadow-2xs p-5 flex flex-col justify-between">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#de2a2a]/10 text-[#de2a2a] flex items-center justify-center shrink-0">
              <TbChartBar size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#242424] text-base leading-tight">
                Evolución de Ventas Mensuales
              </h2>
              <p className="text-xs text-[#5c5c5c] mt-0.5">
                Comportamiento mes a mes (excluye pedidos cancelados)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Métrica */}
            <div className="inline-flex items-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md p-0.5 text-xs">
              {(
                [
                  { key: 'revenue', label: 'Ingresos' },
                  { key: 'orders', label: 'Pedidos' },
                  { key: 'avgTicket', label: 'Ticket' },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMetric(item.key)}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                    metric === item.key
                      ? 'bg-white text-[#de2a2a] shadow-2xs'
                      : 'text-[#5c5c5c] hover:text-[#242424]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Selector Barras / Área */}
            <div className="inline-flex items-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                title="Gráfico de barras"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white text-[#de2a2a] shadow-2xs'
                    : 'text-[#5c5c5c] hover:text-[#242424]'
                }`}
              >
                <TbChartBar size={15} />
              </button>
              <button
                type="button"
                onClick={() => setChartType('area')}
                title="Gráfico de área"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-white text-[#de2a2a] shadow-2xs'
                    : 'text-[#5c5c5c] hover:text-[#242424]'
                }`}
              >
                <TbChartAreaLine size={15} />
              </button>
            </div>

            {/* Selector de Año */}
            <select
              aria-label="Seleccionar año"
              value={effectiveYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="!min-h-[30px] !py-1 !pl-2.5 !pr-7 !text-xs font-semibold w-22"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mini Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <span className="text-[11px] font-medium text-[#5c5c5c] block">
              {metric === 'orders'
                ? 'Total Pedidos'
                : metric === 'avgTicket'
                ? 'Ticket Prom. Anual'
                : 'Total Anual'}
            </span>
            <span className="text-sm font-bold text-[#242424] mt-0.5 block">
              {formatMetricValue(yearSummary.totalAnnual, metric, currencySymbol)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <span className="text-[11px] font-medium text-[#5c5c5c] block">
              Promedio Mensual
            </span>
            <span className="text-sm font-bold text-[#242424] mt-0.5 block">
              {formatMetricValue(
                yearSummary.monthlyAverage,
                metric,
                currencySymbol,
              )}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <span className="text-[11px] font-medium text-[#5c5c5c] flex items-center gap-1">
              <TbAward size={13} className="text-[#de2a2a]" />
              <span>Mejor Mes</span>
            </span>
            <span className="text-sm font-bold text-[#242424] mt-0.5 block truncate">
              {yearSummary.hasAnyData
                ? `${yearSummary.bestMonth.label} (${formatCompactAxis(
                    yearSummary.bestValue,
                    metric !== 'orders',
                    currencySymbol,
                  )})`
                : '—'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <span className="text-[11px] font-medium text-[#5c5c5c] block">
              Variación ({yearSummary.refMonthLabel})
            </span>
            <div className="mt-0.5">
              {yearSummary.refGrowth === null ? (
                <span className="text-sm font-semibold text-[#707070]">
                  Sin base previa
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    yearSummary.refGrowth >= 0
                      ? 'bg-emerald-50 text-[#107c10]'
                      : 'bg-rose-50 text-[#d13438]'
                  }`}
                >
                  {yearSummary.refGrowth >= 0 ? (
                    <TbTrendingUp size={13} />
                  ) : (
                    <TbTrendingDown size={13} />
                  )}
                  {yearSummary.refGrowth >= 0 ? '+' : ''}
                  {yearSummary.refGrowth.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative w-full">
          {isLoading && orders.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-xs text-[#5c5c5c]">
              Cargando estadísticas mensuales...
            </div>
          ) : (
            <>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-auto overflow-visible select-none"
                role="img"
                aria-label="Gráfico de evolución de ventas mensuales"
              >
                <defs>
                  <linearGradient id="fluentBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#3f3f46" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient
                    id="fluentBarHoverGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#b91c1c" />
                    <stop offset="100%" stopColor="#de2a2a" />
                  </linearGradient>
                  <linearGradient id="fluentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#de2a2a" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#de2a2a" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y Axis Labels */}
                {[0, 0.33, 0.66, 1].map((step) => {
                  const yPos = plotBottom - step * plotH;
                  const labelVal = safeMax * step;
                  return (
                    <g key={step}>
                      <line
                        x1={padL}
                        x2={svgW - padR}
                        y1={yPos}
                        y2={yPos}
                        stroke="#ebebeb"
                        strokeWidth={1}
                      />
                      <text
                        x={padL - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        fontSize="10.5"
                        fill="#707070"
                      >
                        {rawMax === 0 && step > 0
                          ? ''
                          : formatCompactAxis(
                              labelVal,
                              metric !== 'orders',
                              currencySymbol,
                            )}
                      </text>
                    </g>
                  );
                })}

                {/* Average Dashed Line */}
                {yearSummary.hasAnyData && yearSummary.monthlyAverage > 0 && (
                  <g>
                    <line
                      x1={padL}
                      x2={svgW - padR}
                      y1={avgLineY}
                      y2={avgLineY}
                      stroke="#ca5010"
                      strokeWidth={1.25}
                      strokeDasharray="4 4"
                    />
                    <rect
                      x={svgW - padR - 38}
                      y={avgLineY - 14}
                      width={38}
                      height={14}
                      rx={3}
                      fill="#fff4ce"
                    />
                    <text
                      x={svgW - padR - 19}
                      y={avgLineY - 4}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#ca5010"
                    >
                      Prom.
                    </text>
                  </g>
                )}

                {/* Chart Geometry */}
                {chartType === 'bar' ? (
                  <g>
                    {chartPoints.map((pt, i) => {
                      const barHeight = Math.max(
                        pt.val > 0 ? 4 : 0,
                        plotBottom - pt.y,
                      );
                      const barY = plotBottom - barHeight;
                      const barX = pt.x - barW / 2;
                      const isHovered = hoveredMonth === i;
                      const isCurrent =
                        effectiveYear === currentYear && i === currentMonth;
                      const isPeak =
                        yearSummary.hasAnyData &&
                        yearSummary.bestMonth.monthIndex === i;

                      return (
                        <g key={pt.stat.label}>
                          {isHovered && (
                            <rect
                              x={padL + i * colW + 2}
                              y={padT}
                              width={colW - 4}
                              height={plotH}
                              rx={6}
                              fill="#de2a2a"
                              fillOpacity={0.05}
                            />
                          )}
                          {barHeight > 0 && (
                            <path
                              d={`M ${barX} ${plotBottom} L ${barX} ${barY + 4} Q ${barX} ${barY} ${barX + 4} ${barY} L ${barX + barW - 4} ${barY} Q ${barX + barW} ${barY} ${barX + barW} ${barY + 4} L ${barX + barW} ${plotBottom} Z`}
                              fill={
                                isHovered
                                  ? 'url(#fluentBarHoverGrad)'
                                  : 'url(#fluentBarGrad)'
                              }
                              opacity={
                                hoveredMonth !== null && !isHovered ? 0.55 : 1
                              }
                            />
                          )}
                          {(isHovered || isPeak) && pt.val > 0 && (
                            <text
                              x={pt.x}
                              y={Math.max(12, barY - 6)}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="700"
                              fill={isHovered ? '#b91c1c' : '#242424'}
                            >
                              {formatCompactAxis(
                                pt.val,
                                metric !== 'orders',
                                currencySymbol,
                              )}
                            </text>
                          )}
                          {isCurrent && (
                            <circle
                              cx={pt.x}
                              cy={plotBottom + 24}
                              r={2.5}
                              fill="#de2a2a"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                ) : (
                  <g>
                    {yearSummary.hasAnyData && (
                      <>
                        <path d={areaPath} fill="url(#fluentAreaGrad)" />
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#de2a2a"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                        />
                      </>
                    )}
                    {chartPoints.map((pt, i) => {
                      const isHovered = hoveredMonth === i;
                      const isCurrent =
                        effectiveYear === currentYear && i === currentMonth;
                      return (
                        <g key={pt.stat.label}>
                          {isHovered && (
                            <line
                              x1={pt.x}
                              x2={pt.x}
                              y1={padT}
                              y2={plotBottom}
                              stroke="#de2a2a"
                              strokeWidth={1}
                              strokeDasharray="3 3"
                              strokeOpacity={0.5}
                            />
                          )}
                          {(pt.val > 0 || isHovered) && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 5.5 : 3.5}
                              fill={isHovered ? '#de2a2a' : '#ffffff'}
                              stroke="#de2a2a"
                              strokeWidth={2}
                            />
                          )}
                          {isCurrent && (
                            <circle
                              cx={pt.x}
                              cy={plotBottom + 24}
                              r={2.5}
                              fill="#de2a2a"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* X-Axis Labels & Invisible Hit Columns */}
                {chartPoints.map((pt, i) => {
                  const isHovered = hoveredMonth === i;
                  const isCurrent =
                    effectiveYear === currentYear && i === currentMonth;
                  return (
                    <g key={`hit-${pt.stat.label}`}>
                      <text
                        x={pt.x}
                        y={plotBottom + 16}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isHovered || isCurrent ? '700' : '500'}
                        fill={
                          isHovered || isCurrent ? '#de2a2a' : '#5c5c5c'
                        }
                      >
                        {pt.stat.label}
                      </text>
                      <rect
                        x={padL + i * colW}
                        y={padT}
                        width={colW}
                        height={plotH + 22}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonth(i)}
                        onMouseLeave={() => setHoveredMonth(null)}
                        onClick={() =>
                          setHoveredMonth((prev) => (prev === i ? null : i))
                        }
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {activeMonthStat && (
                <div
                  className={`pointer-events-none absolute top-2 z-10 w-52 rounded-lg bg-[#242424] text-white p-3 shadow-lg text-xs transition-all ${
                    activeMonthStat.monthIndex >= 7 ? 'left-3' : 'right-3'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
                    <span className="font-bold">
                      {activeMonthStat.fullLabel} {effectiveYear}
                    </span>
                    {activeMonthStat.growthPct !== null && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          activeMonthStat.growthPct >= 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {activeMonthStat.growthPct >= 0 ? '+' : ''}
                        {activeMonthStat.growthPct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ingresos:</span>
                      <span className="font-bold">
                        {currencySymbol}{' '}
                        {activeMonthStat.revenue.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Pedidos:</span>
                      <span className="font-bold">
                        {activeMonthStat.orderCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ticket Promedio:</span>
                      <span className="font-bold">
                        {currencySymbol}{' '}
                        {activeMonthStat.avgTicket.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!yearSummary.hasAnyData && (
                <p className="text-center text-xs text-[#707070] mt-2">
                  No hay ventas registradas para el año {effectiveYear} con el filtro actual.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Distribución y Rendimiento */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-[#e0e0e0] shadow-2xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#de2a2a]/10 text-[#de2a2a] flex items-center justify-center shrink-0">
                <TbChartPie size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-[#242424] text-sm leading-tight">
                  Distribución y Rendimiento
                </h2>
                <p className="text-[11px] text-[#5c5c5c]">
                  Año {effectiveYear}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded-md p-0.5 text-[11px] my-3.5">
            {(
              [
                { key: 'channels', label: 'Canales' },
                { key: 'statuses', label: 'Estados' },
                { key: 'topProducts', label: 'Top 5' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setRightTab(t.key);
                  setHoveredSlice(null);
                }}
                className={`py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                  rightTab === t.key
                    ? 'bg-white text-[#de2a2a] shadow-2xs'
                    : 'text-[#5c5c5c] hover:text-[#242424]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {rightTab === 'topProducts' ? (
          <div className="flex-1 flex flex-col justify-center">
            {topProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#707070] space-y-2">
                <TbPackage size={28} className="mx-auto text-gray-300" />
                <p>Aún no hay productos vendidos en {effectiveYear}.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {topProducts.map((prod, idx) => {
                  const maxRev = Math.max(topProducts[0]?.revenue || 1, 1);
                  const pct = Math.max(6, (prod.revenue / maxRev) * 100);
                  return (
                    <div key={`${prod.title}-${idx}`} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-[#242424] truncate">
                          {idx + 1}. {prod.title}
                        </span>
                        <span className="font-bold text-[#de2a2a] shrink-0">
                          {currencySymbol} {prod.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#f0f0f0] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#de2a2a] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[#707070] block">
                        {prod.units} {prod.units === 1 ? 'unidad vendida' : 'unidades vendidas'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between gap-4">
            {donutTotal <= 0 ? (
              <div className="py-12 text-center text-xs text-[#707070] space-y-2">
                <TbChartPie size={28} className="mx-auto text-gray-300" />
                <p>Sin datos registrados en {effectiveYear}.</p>
              </div>
            ) : (
              <>
                {/* Donut Chart */}
                <div className="relative flex items-center justify-center py-1">
                  <svg
                    viewBox="0 0 148 148"
                    className="w-40 h-40 -rotate-90"
                    role="img"
                    aria-label="Distribución de ventas"
                  >
                    <circle
                      cx="74"
                      cy="74"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#f0f0f0"
                      strokeWidth="18"
                    />
                    {donutSegments.map((seg) => {
                      const isActive = hoveredSlice === seg.idx;
                      return (
                        <circle
                          key={seg.label}
                          cx="74"
                          cy="74"
                          r={donutRadius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth={isActive ? 22 : 18}
                          strokeDasharray={`${seg.dashLength} ${donutCircumference}`}
                          strokeDashoffset={seg.dashOffset}
                          opacity={
                            hoveredSlice !== null && !isActive ? 0.45 : 1
                          }
                          className="transition-all duration-200 cursor-pointer"
                          onMouseEnter={() => setHoveredSlice(seg.idx)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Center Label */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    {activeSlice ? (
                      <>
                        <span className="text-[10px] font-semibold text-[#5c5c5c] leading-tight line-clamp-1">
                          {activeSlice.label}
                        </span>
                        <span className="text-base font-black text-[#242424] mt-0.5">
                          {activeSlice.pct.toFixed(0)}%
                        </span>
                        <span className="text-[10px] font-bold text-[#de2a2a]">
                          {rightTab === 'channels'
                            ? formatCompactAxis(
                                activeSlice.value,
                                true,
                                currencySymbol,
                              )
                            : `${activeSlice.count} ped.`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-semibold text-[#5c5c5c]">
                          {rightTab === 'channels' ? 'Ingresos' : 'Total'}
                        </span>
                        <span className="text-sm font-black text-[#242424] mt-0.5">
                          {rightTab === 'channels'
                            ? formatCompactAxis(
                                donutTotal,
                                true,
                                currencySymbol,
                              )
                            : `${donutTotal} ped.`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Synchronized Legend */}
                <div className="space-y-2">
                  {donutSegments.map((seg) => {
                    const isActive = hoveredSlice === seg.idx;
                    return (
                      <div
                        key={seg.label}
                        onMouseEnter={() => setHoveredSlice(seg.idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isActive ? 'bg-[#f5f5f5]' : 'hover:bg-[#fafafa]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="font-medium text-[#242424] truncate">
                            {seg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-[#242424]">
                            {rightTab === 'channels'
                              ? `${currencySymbol} ${seg.value.toFixed(0)}`
                              : seg.count}
                          </span>
                          <span className="text-[10px] font-semibold text-[#5c5c5c] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                            {seg.pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
