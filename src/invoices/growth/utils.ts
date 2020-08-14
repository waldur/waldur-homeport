import * as moment from 'moment-timezone';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Invoice } from '@waldur/invoices/types';

interface InvoiceData {
  name: string;
  paidPerPeriods: number[];
  totalPaid: number;
}

interface Period {
  monthIndex: number;
  monthName: string;
  year: number;
}

const eChartInitialOption = () => ({
  legend: {
    data: [translate('Total')],
  },
  toolbox: {
    feature: {
      saveAsImage: { title: translate('Save'), show: true },
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisPointer: {
        type: 'shadow',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: translate('Paid'),
      min: 0,
      max: null,
      interval: null,
      axisLabel: {
        formatter: `${ENV.currency}{value}`,
      },
    },
    {
      type: 'value',
      name: translate('Total'),
      min: 0,
      max: null,
      interval: null,
      axisLabel: {
        formatter: `${ENV.currency}{value}`,
      },
    },
  ],
  series: [
    {
      name: translate('Total'),
      type: 'line',
      yAxisIndex: 1,
      data: [],
    },
  ],
});

const getLastTwelveMonths = (): Period[] => {
  const lastTwelveMonths: Period[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = moment().subtract(i, 'months');
    const month = date.month() + 1;
    const year = date.year();
    lastTwelveMonths.push({
      monthIndex: month,
      monthName: date.format('MMMM'),
      year: year,
    });
  }
  return lastTwelveMonths;
};

const fillInvoicesData = (
  periods: Period[],
  invoices: Invoice[],
  customerNames: string[],
  invoicesData: InvoiceData[],
): void => {
  customerNames.forEach((customerName) => {
    const invoiceData = {
      name: customerName,
      paidPerPeriods: [],
      totalPaid: 0,
    };
    for (let i = 0; i < periods.length; i++) {
      for (let j = 0; j < invoices.length; j++) {
        if (
          customerName === invoices[j].customer_details.name &&
          periods[i].monthIndex === invoices[j].month &&
          periods[i].year === invoices[j].year
        ) {
          const paidInCurrentPeriod = Number(
            parseFloat(invoices[j].total).toFixed(0),
          );
          invoiceData.paidPerPeriods.push(paidInCurrentPeriod);
          invoiceData.totalPaid += paidInCurrentPeriod;
          break;
        }
        if (j === invoices.length - 1) {
          invoiceData.paidPerPeriods.push(0);
        }
      }
    }
    invoicesData.push(invoiceData);
  });
};

const getCustomerNames = (invoices): string[] => {
  const names = [];
  invoices.forEach((invoice) => {
    const name = invoice.customer_details.name;
    if (!names.includes(name)) {
      names.push(name);
    }
  });
  return names;
};

const sortInvoicesData = (invoicesData: InvoiceData[]) => {
  invoicesData.sort((a, b) =>
    a.totalPaid < b.totalPaid ? 1 : b.totalPaid < a.totalPaid ? -1 : 0,
  );
};

const fillTopFourHighestPayingCustomers = (
  option,
  invoicesData: InvoiceData[],
) => {
  for (let i = 0; i < 4; i++) {
    option.series.push({
      name: invoicesData[i].name,
      type: 'bar',
      data: [...invoicesData[i].paidPerPeriods],
      yAxisIndex: 0,
    });
    option.legend.data.push(invoicesData[i].name);
  }
};

const fillOtherCustomers = (
  option,
  invoicesData: InvoiceData[],
  periods: Period[],
) => {
  const othersCustomersPerPeriod = [];
  for (let i = 0; i < periods.length; i++) {
    let totalPerPeriod = 0;
    for (let j = 4; j < invoicesData.length; j++) {
      totalPerPeriod += invoicesData[j].paidPerPeriods[i];
    }
    othersCustomersPerPeriod.push(totalPerPeriod);
  }
  option.series.push({
    name: translate('Others'),
    type: 'bar',
    data: [...othersCustomersPerPeriod],
    yAxisIndex: 0,
  });
  option.legend.data.push(translate('Others'));
};

const fillLineForTotalPaid = (option, invoicesData: InvoiceData[]) => {
  const totalPaidPerPeriods = [];
  for (let i = 0; i < 12; i++) {
    let totalPaidPerPeriod = 0;
    for (let j = 0; j < invoicesData.length; j++) {
      totalPaidPerPeriod += invoicesData[j].paidPerPeriods[i];
    }
    totalPaidPerPeriods.push(totalPaidPerPeriod);
  }
  option.series[0].data.push(...totalPaidPerPeriods);
};

export const getEChartOptions = (invoices: Invoice[]) => {
  const option = eChartInitialOption();

  // filling periods
  const lastTwelveMonths: Period[] = getLastTwelveMonths();
  option.xAxis[0].data = lastTwelveMonths.map((period, index) =>
    index === lastTwelveMonths.length - 1
      ? `${period.monthName}, ${period.year} (${translate('estimated')})`
      : `${period.monthName}, ${period.year}`,
  );

  const invoicesData: InvoiceData[] = [];
  const customerNames = getCustomerNames(invoices);
  fillInvoicesData(lastTwelveMonths, invoices, customerNames, invoicesData);
  sortInvoicesData(invoicesData);

  fillLineForTotalPaid(option, invoicesData);
  fillTopFourHighestPayingCustomers(option, invoicesData);
  fillOtherCustomers(option, invoicesData, lastTwelveMonths);

  return option;
};
