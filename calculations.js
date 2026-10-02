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
  return ss.standardDeviation(ratesArray);
}

//! government debt

export function debtToGDP(governmentDebt, GDP) {
  return (governmentDebt / GDP) * 100;
}

console.log(debtToGDP(100, 150));

export function debtGrowth(currentDebt, previousDebt) {
  return (currentDebt / previousDebt - 1) * 100;
}

export function debtPerCapita(governmentDebt, population) {
  return governmentDebt / population;
}

console.log(debtPerCapita(1000000000000, 38000000));

export function debtToRevenue(governmentDebt, governmentRevenue) {
  return (governmentDebt / governmentRevenue) * 100;
}

//! fiscal deficit

export function fiscalBalance(governmentRevenue, governmentSpending) {
  return governmentRevenue - governmentSpending;
}

export function fiscalDeficitToPercentageOfGDP(fiscalDeficit, GDP) {
  return (fiscalDeficit / GDP) * 100;
}

export function fiscalBalanceToPercentageOfGDP(fiscalBalance, GDP) {
  return (fiscalBalance / GDP) * 100;
}

/**
 * gets primary fiscal balance
 *
 * @export
 * @param {*} revenue money coming in
 * @param {*} spending money going out
 * @param {*} interestPayments any interest payments
 * @returns {number}
 */
export function primaryFiscalBalance(revenue, spending, interestPayments) {
  if (interestPayments == undefined) {
    return revenue - (spending - interestPayments);
  } else if (interestPayments != undefined) {
    return revenue - spending;
  }
}

export function debtServiceRatio(debtService, governmentRevenue) {
  return (debtService / governmentRevenue) * 100;
}

/**
 * burden of interest on x revenue source
 *
 * @export
 * @param {*} interestPayments $ value of interest payments
 * @param {*} burdeningRevenue gdp, government revenue, etc
 * @returns {number}
 */
export function interestBurden(interestPayments, burdeningRevenue) {
  return (interestPayments / burdeningRevenue) * 100;
}

//! foreign currency debt

export function foreignDebtShare(foreignCurrencyDebt, totalGovernmentDebt) {
  return (foreignCurrencyDebt / totalGovernmentDebt) * 100;
}

export function foreignDebtIncrease(debt, depreciationRate) {
  return debt * depreciationRate;
}

//! external debt

/**
 * % of external debt to x revenue
 *
 * @export
 * @param {*} externalDebt
 * @param {*} burdeningRevenue GDP, exports, etc
 * @returns {number}
 */
export function externalDebt(externalDebt, burdeningRevenue) {
  return (externalDebt / burdeningRevenue) * 100;
}

//! currency volatility

/**
 * max appreciation or drawdown
 *
 * @export
 * @param {*} ratesArray
 * @param {boolean} [asPercent=true]
 * @param {boolean} [isDepreciation=false]
 * @returns {*}
 */
export function maximumAppreciationOrDepreciation(
  ratesArray,
  asPercent = true,
  isDepreciation = false,
) {
  let a = [];
  let isd = isDepreciation ? "min" : "max";

  for (let i = 1; i < ratesArray.length; i++) {
    let currI = ratesArray[i];
    let prevI = ratesArray[i - 1];
    a.push(currI / prevI - 1);
  }
  return asPercent ? ss[isd](a) * 100 : ss[isd](a);
}

export function appreciationOrDepreciationMagnitude(
  ratesArray,
  asPercent = true,
  isDepreciation = false,
) {
  return Math.abs(
    maximumAppreciationOrDepreciation(ratesArray, asPercent, isDepreciation),
  );
}

let a = [18, 23, 11, 9, 12, 32, 23, 41];
export function maxDrawdown(ratesArray) {
  let peak = 0;
  let maxDrawdown = 0;

  for (let i = 0; i < ratesArray.length; i++) {
    if (ratesArray[i] > peak) peak = ratesArray[i];
    let drawdown = ratesArray[i] / peak - 1;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}

console.log(maxDrawdown(a));


/**
 * volatility of annual returns
 *
 * @export
 * @param {*} ratesArray 
 * @param {*} periodsPerYear 4 = quarters, 12 = monthly, 252 = daily(depending on work day count annually)
 * @returns {number} 
 */
export function annualisedVolatility(ratesArray, periodsPerYear){
  let a = []

  for(let i = 1; i < ratesArray.length; i++){
    a.push((ratesArray[i] / ratesArray[i-1]) -1)
  }
  
  return ss.standardDeviation(a) * Math.sqrt(periodsPerYear)
}

