import { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function getPast12Hours() {
    const currentTime = new Date();
    const past12Hours = Array.from({ length: 12 }, (_, index) => {
      const hour = currentTime.getHours() - index - 1;
      return hour < 0 ? hour + 24 : hour; // Handle negative hours (previous day)
    });
  
    // Format the hours as "HH:00"
    const formattedHours = past12Hours.map(hour => {
      const formattedHour = hour < 10 ? `0${hour}` : hour;
      return `${formattedHour}:00`;
    });
  
    return formattedHours.reverse();
}

const WeatherChart = ({ rain_data, temp_data, index }) => {
  const containerId = `container${index}`;

  useEffect(() => {
    const chartOptions = {
      chart: {
        zoomType: 'xy',
      },
      title: {
        text: 'Temperature & Rain Data',
        align: 'center',
      },
      subtitle: {
        text: 'last 12 hours',
        align: 'center',
      },
      xAxis: [{
        categories: getPast12Hours(),
        crosshair: true,
      }],
      yAxis: [
        {
          labels: {
            format: '{value}°C',
            style: {
              color: '#778da9',
            },
          },
          title: {
            text: 'Temperature',
            style: {
              color: '#778da9',
            },
          },
        },
        {
          title: {
            text: 'Precipitation',
            style: {
              color: '#778da9',
            },
          },
          labels: {
            format: '{value} mm',
            style: {
              color: '#778da9',
            },
          },
          opposite: true,
        },
      ],
      tooltip: {
        shared: true,
      },
      legend: {
        align: 'right',
        x: 0,
        verticalAlign: 'top',
        y: 0,
        floating: true,
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor ||
          'rgba(255,255,255,0.25)',
      },
      series: [
        {
          name: 'Precipitation',
          type: 'column',
          yAxis: 1,
          data: rain_data,
          tooltip: {
            valueSuffix: ' mm',
          },
        },
        {
          name: 'Temperature',
          type: 'spline',
          data: temp_data,
          tooltip: {
            valueSuffix: '°C',
          },
        },
      ],
    };

    Highcharts.chart(containerId, chartOptions);
  }, [temp_data, rain_data, containerId]);

  return (
    <div id={containerId}>
      <HighchartsReact highcharts={Highcharts} options={{}} />
    </div>
  );
};

export default WeatherChart;
