import { currencies } from "./currencies.js";

/**
 * get percentage of base
 *
 * @param {*} percentage 0.5 = 0.5%, 150 = 150% 
 * @param {*} base number to derive the percentage from
 */
function getPercent(percentage, base){
    percentage = percentage/100;
    return percentage * base;
}

console.log(currencies)