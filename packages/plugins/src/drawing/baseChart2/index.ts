import * as vega from 'vega';
import { compile as vegaLiteCompile, TopLevelSpec } from 'vega-lite';
import { SystemPluginSpecialResponse } from '../../../type';

// Types
interface Props {
  title: string;
  xAxis: string;
  yAxis: string;
  chartType: string;
}

type Response = Promise<{
  result: SystemPluginSpecialResponse;
}>;

// Helper Functions
const parseChartData = (xAxis: string, yAxis: string) => {
  try {
    const parsedXAxis = xAxis.split(',').map((x) => x.trim());
    const parsedYAxis = yAxis.split(',').map((x) => Number(x.trim()));
    return {
      xAxis: parsedXAxis,
      yAxis: parsedYAxis
    };
  } catch (error: any) {
    console.error('数据解析错误:', error);
    throw new Error(`数据解析错误: ${error.message}`);
  }
};

const generateVegaSpec = (
  data: { xAxis: string[]; yAxis: number[] },
  title: string,
  chartType: string
) => {
  const baseSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    background: '#f5f5f5',
    title: {
      text: title,
      fontSize: 16,
      color: '#333',
      anchor: 'middle',
      dy: -10
    },
    data: {
      values: data.xAxis.map((x, i) => ({
        category: x,
        value: data.yAxis[i]
      }))
    },
    width: 400,
    height: 300,
    padding: { left: 50, right: 50, top: 50, bottom: 50 },
    config: {
      axis: {
        labelFontSize: 12,
        titleFontSize: 14,
        labelColor: '#333',
        titleColor: '#333'
      },
      view: {
        stroke: 'transparent'
      }
    }
  };

  switch (chartType) {
    case '柱状图':
      return {
        ...baseSpec,
        mark: {
          type: 'bar',
          color: '#1890ff',
          tooltip: true
        },
        encoding: {
          x: {
            field: 'category',
            type: 'nominal',
            axis: {
              title: '',
              labelAngle: -45
            }
          },
          y: {
            field: 'value',
            type: 'quantitative',
            axis: { title: '' },
            scale: { zero: true }
          }
        }
      };
    case '折线图':
      return {
        ...baseSpec,
        mark: {
          type: 'line',
          color: '#1890ff',
          point: true,
          tooltip: true,
          strokeWidth: 2
        },
        encoding: {
          x: {
            field: 'category',
            type: 'nominal',
            axis: {
              title: '',
              labelAngle: -45
            }
          },
          y: {
            field: 'value',
            type: 'quantitative',
            axis: { title: '' },
            scale: { zero: true }
          }
        }
      };
    case '饼图':
      return {
        ...baseSpec,
        mark: {
          type: 'arc',
          innerRadius: 0,
          stroke: '#fff',
          strokeWidth: 2
        },
        encoding: {
          theta: {
            field: 'value',
            type: 'quantitative',
            stack: true
          },
          color: {
            field: 'category',
            type: 'nominal',
            scale: {
              range: [
                '#1890ff',
                '#2fc25b',
                '#facc14',
                '#223273',
                '#8543e0',
                '#13c2c2',
                '#3436c7',
                '#f04864'
              ]
            },
            legend: {
              orient: 'right',
              title: null
            }
          }
        },
        view: { stroke: null }
      };
    default:
      throw new Error('不支持的图表类型');
  }
};

const generateChart = async (
  data: { xAxis: string[]; yAxis: number[] },
  title: string,
  chartType: string
) => {
  try {
    console.log('Creating Vega spec...');
    const vegaLiteSpec = generateVegaSpec(data, title, chartType) as TopLevelSpec;

    console.log('Compiling Vega spec...');
    const compiledSpec = vegaLiteCompile(vegaLiteSpec);
    const vegaSpec = compiledSpec.spec;

    console.log('Creating Vega view...');
    const view = new vega.View(vega.parse(vegaSpec), { renderer: 'none' });

    console.log('Rendering to SVG...');
    const svg = await view.toSVG();

    console.log('Cleaning up...');
    view.finalize();

    // 将 SVG 转换为 base64
    const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    console.log('Converted to base64');

    return base64;
  } catch (error: any) {
    console.error('Error in generateChart:', error);
    throw error;
  }
};

async function main({ title, xAxis, yAxis, chartType }: Props): Response {
  try {
    console.log('Input data:', { title, xAxis, yAxis, chartType });

    const data = parseChartData(xAxis, yAxis);
    console.log('Parsed data:', data);

    const base64 = await generateChart(data, title, chartType);
    console.log('Chart generated');

    return {
      result: {
        type: 'SYSTEM_PLUGIN_BASE64',
        value: base64,
        extension: 'svg'
      }
    };
  } catch (error: any) {
    console.error('Error in main:', error);
    throw new Error(`图表生成失败: ${error.message}`);
  }
}

export default main;
