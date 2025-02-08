"use client";

import {
  Chart as ChartJS,
  registerables,
  ChartOptions,
  Tooltip,
  TooltipModel
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

ChartJS.register(...registerables);

interface ChartDataPoint {
  name: string;
  total: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  customersData: ChartDataPoint[];
}

type ChartOptionsType = ChartOptions<'line'> & {
  scales: {
    y: {
      type: 'linear';
      display: true;
      position: 'left';
      title: {
        display: true;
        text: string;
        color: string;
      };
      grid: {
        color: string;
      };
      ticks: {
        color: string;
      };
    };
    y1: {
      type: 'linear';
      display: boolean;
      position: 'right';
      title: {
        display: true;
        text: string;
        color: string;
      };
      grid: {
        drawOnChartArea: boolean;
      };
      ticks: {
        color: string;
      };
    };
    x: {
      grid: {
        color: string;
      };
      ticks: {
        color: string;
      };
    };
  };
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  customersData,
}) => {
  const getOrCreateTooltip = (chart: ChartJS) => {
    let tooltipEl = chart.canvas.parentNode?.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'custom-tooltip bg-background border rounded-lg shadow-lg p-4';
      
      const table = document.createElement('table');
      table.style.margin = '0px';
      
      tooltipEl.appendChild(table);
      chart.canvas.parentNode?.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context: { chart: ChartJS; tooltip: TooltipModel<"line"> }) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(b => b.lines[0]);

      const tableRoot = tooltipEl.querySelector('table');
      if (!tableRoot) return;

      tableRoot.innerHTML = '';

      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.className = 'text-muted-foreground text-sm font-medium mb-2';
      th.textContent = titleLines[0] || '';
      tr.appendChild(th);
      thead.appendChild(tr);
      tableRoot.appendChild(thead);

      const tbody = document.createElement('tbody');
      bodyLines.forEach((body) => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.className = 'text-base font-bold';
        td.textContent = body;
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
      tableRoot.appendChild(tbody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    const tooltipWidth = tooltipEl.offsetWidth;

    tooltipEl.style.opacity = '1';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = positionX + tooltip.caretX - tooltipWidth / 2 + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY - tooltip.height - 10 + 'px';
    tooltipEl.style.pointerEvents = 'none';
  };

  const options: ChartOptionsType = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      title: {
        display: true,
        text: 'Revenue & Customer Growth',
        color: 'rgb(156, 163, 175)',
        font: {
          size: 16,
          weight: 500
        },
        padding: {
          bottom: 30
        }
      },
      tooltip: {
        enabled: false,
        external: externalTooltipHandler,
        callbacks: {
          title: (items) => String(items[0].label || ''),
          label: (item) => {
            return `${item.dataset.label}: ${item.dataset.label === 'Revenue' ? '$' : ''}${item.formattedValue}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Customers',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    },
  };

  const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    return gradient;
  };

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        type: 'line' as const,
        label: 'Revenue',
        data: data.map((item) => item.total),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(ctx, 'rgba(99, 102, 241, 0.2)');
        },
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        yAxisID: 'y',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
        pointHoverBorderWidth: 2,
      },
      {
        type: 'line' as const,
        label: 'Total Customers',
        data: customersData.map((item) => item.total),
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(ctx, 'rgba(244, 63, 94, 0.2)');
        },
        borderWidth: 2,
        yAxisID: 'y1',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(244, 63, 94)',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: 'rgb(244, 63, 94)',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <Tabs defaultValue="mixed" className="space-y-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analytics Overview</CardTitle>
            <TabsList className="grid w-[300px] grid-cols-3">
              <TabsTrigger value="mixed">
                Combined View
              </TabsTrigger>
              <TabsTrigger value="revenue">
                Revenue
              </TabsTrigger>
              <TabsTrigger value="customers">
                Customers
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="mixed" className="space-y-4 mt-4">
            <div className="relative h-[400px]">
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none opacity-10">
                <div className="w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
              </div>
              <Chart 
                type="line"
                data={chartData}
                options={options}
              />
            </div>
          </TabsContent>
          <TabsContent value="revenue" className="space-y-4">
            <div className="h-[400px]">
              <Chart 
                type="line"
                data={{
                  ...chartData,
                  datasets: [chartData.datasets[0]]
                }}
                options={{
                  ...options,
                  scales: {
                    ...options.scales,
                    y1: {
                      ...options.scales.y1,
                      display: false
                    }
                  }
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="customers" className="space-y-4">
            <div className="h-[400px]">
              <Chart 
                type="line"
                data={{
                  ...chartData,
                  datasets: [chartData.datasets[1]]
                }}
                options={{
                  ...options,
                  scales: {
                    ...options.scales,
                    y1: {
                      ...options.scales.y1,
                      display: false
                    }
                  }
                }}
              />
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
