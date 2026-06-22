import Chart from 'react-apexcharts';

export function ChartRenderer({ 
  type = 'bar', 
  data = [], 
  xColumn, 
  yColumn, 
  title,
  colors = ['#8b5cf6', '#eab308'] // Default violet and yellow
}) {
  if (!data || data.length === 0 || !xColumn || !yColumn) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        No data to display
      </div>
    );
  }

  const categories = data.map(item => item[xColumn]);
  const seriesData = data.map(item => Number(item[yColumn]) || 0);

  const series = [{
    name: yColumn,
    data: seriesData
  }];

  const options = {
    chart: {
      type,
      fontFamily: 'inherit',
      toolbar: { show: true },
      zoom: { enabled: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#0f172a'
      }
    },
    colors,
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: type === 'line' ? 3 : 0
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' },
        formatter: (value) => {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
          if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
          return value;
        }
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => val.toLocaleString()
      }
    }
  };

  return (
    <div className="w-full">
      <Chart
        options={options}
        series={series}
        type={type}
        height={350}
        width="100%"
      />
    </div>
  );
}
