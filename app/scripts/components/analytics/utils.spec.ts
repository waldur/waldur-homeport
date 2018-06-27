import { unsortedObjects, quotas, pieCharts, barCharts } from './fixture';
import * as utils from './utils';

describe('Analytics utils', () => {
  it('Sort objects by field value, locale is optional parameter', () => {
    const sorter = utils.sortObjecstByProp('name');
    expect(sorter(unsortedObjects.en, 'en')).toEqual([
      { name: 'Meter' },
      { name: 'Peter' },
      { name: 'Sven' },
    ]);
    expect(sorter(unsortedObjects.ru, 'ru')).toEqual([
      { name: 'Афродита' },
      { name: 'Птолемей' },
      { name: 'Ясон' },
    ]);
  });

  it('Filer qoutas by registry', () => {
    expect(utils.quotasRegitryFilter(quotas.quotasArr.unfiltered)).toEqual(quotas.quotasArr.registryFiltered);
  });

  it('Set quotas label', () => {
    expect(utils.setQuotasLabel(quotas.quotasArr.unfiltered)).toEqual(quotas.quotasArr.labeled);
  });

  it('Set history quota name to upper object level', () => {
    expect(utils.setHistoryQuotasName(quotas.historyQuotas.unnamed)).toEqual(quotas.historyQuotas.named);
  });

  it('Get pie chart options', () => {
    expect(utils.getPieChartsData(quotas.resultingQuotas.pieCharts)).toEqual([pieCharts.resulting]);
  });

  it('Get bar chart options', () => {
    expect(utils.getBarChartsData(quotas.resultingQuotas.barCharts)).toEqual([barCharts.resulting]);
  });

  it('Checks if qouata is exceeds', () => {
    expect(utils.isQuotaExceeds(quotas.exceeds)).toBe(true);
  });

  it('Getting exceeded quotas', () => {
    const testQuotas = [
      quotas.registeredLimited,
      quotas.registeredUnlimited,
      quotas.exceeds,
    ];
    expect(utils.getExceededQuotas(testQuotas)).toEqual([quotas.exceeds]);
  });

  it('Get if history quotas is loading', () => {
    expect(utils.getIsHistoryQuotasLoading(quotas.historyQuotas.isLoading)).toBe(true);
    expect(utils.getIsHistoryQuotasLoading(quotas.historyQuotas.named)).toBe(false);
  });

  it('Merge quotas', () => {
    expect(utils.mergeQuotas(quotas.registeredUnlimited, quotas.exceeds)).toEqual({
      url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
      uuid: [
        '049fab371f2844e79d2997eadfbb4cd6',
        '049fab371f2844e79d2997eadfbb4cd6',
      ],
      name: 'snapshots',
      label: 'Snapshots',
      limit: 26033,
      usage: 52066,
    });
  });

  it('Combine quotas', () => {
    expect(utils.combineQuotas(quotas.quotasArr.quotasBeforeCombine))
      .toEqual(quotas.quotasArr.quotasAfterCombine);
  });

  it('Combine history quotas', () => {
    expect(utils.combineHistoryQuotas(quotas.quotasArr.historyQuotasBeforeCombine))
      .toEqual(quotas.quotasArr.historyQuotasAfterCombine);
  });
});
