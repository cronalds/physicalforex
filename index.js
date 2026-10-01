import { currencies } from "./currencies.js";
import * as cheerio from 'cheerio';

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

console.log(currencies.length)

console.log(getPercent(0.2, 170));
console.log(getPercent(23.2, 140));
console.log(getPercent(48, 260));