import * as ss from "simple-statistics";

//! inflation

/**
 * gets inflation/deflation rate; +0 == inflation -0 == deflation
 *
 * @export
 * @param {*} currentCPI current consumer price index
 * @param {*} previousCPI previous consumer price index
 * @returns {number}
 */
export function getInflationRate(currentCPI, previousCPI) {
  return (currentCPI / previousCPI - 1) * 100;
}

export function cumulativeInflation(ratesArray) {
  let part = (r) => `(1 + ${r})`;
  let parts = [];
  for (let p of ratesArray) {
    parts.push(part(p));
  }
  let calc = `((${parts.join(" * ")}) - 1) * 100`;
  return eval(calc);
}

console.log(cumulativeInflation([0.01, 0.02, 0.03, 0.04]));

export function nextPriceIndex(previousIndex, inflationRate) {
  return previousIndex * (1 + inflationRate);
}

export function realValueAfterInflation(
  nominalValue,
  priceIndexNow,
  priceIndexThen,
) {
  return nominalValue * (priceIndexThen / priceIndexNow);
}

export function purchasingPowerChange(inflationRate) {
  return 1 / (1 + inflationRate) - 1;
}

export function inflationChange(currentInflation, previousInflation) {
  return currentInflation - previousInflation;
}

export function inflationVolatilitySTDDev(ratesArray) {
  return ss.standardDeviation(ratesArray)
}

//! government debt

export function debtToGDP(governmentDebt, GDP){
    return (governmentDebt / GDP) * 100
}

console.log(debtToGDP(100, 150))

export function debtGrowth(currentDebt, previousDebt){
    return ((currentDebt / previousDebt) -1) * 100
}

export function debtPerCapita(governmentDebt, population){
    return governmentDebt / population
}

console.log(debtPerCapita(1000000000000, 38000000))

export function debtToRevenue(governmentDebt, governmentRevenue){
    return (governmentDebt / governmentRevenue) * 100
}

//! fiscal deficit

export function fiscalBalance(governmentRevenue, governmentSpending){
    return governmentRevenue - governmentSpending
}

export function fiscalDeficitToPercentageOfGDP(fiscalDeficit, GDP){
    return (fiscalDeficit / GDP) * 100
}

export function fiscalBalanceToPercentageOfGDP(fiscalBalance, GDP){
    return (fiscalBalance / GDP) * 100
}


/**
 * gets primary fiscal balance
 *
 * @export
 * @param {*} revenue money coming in
 * @param {*} spending money going out
 * @param {*} interestPayments any interest payments
 * @param {boolean} [isNonInterest=true] default true, presumes no interest payments
 * @returns {number} 
 */
export function primaryFiscalBalance(revenue, spending, interestPayments, isNonInterest = true){
    if(!isNonInterest){
        return revenue - (spending - interestPayments)
    }
    else{
        return revenue - spending
    }
}

