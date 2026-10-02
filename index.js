import { currencies } from "./currencies.js";

console.log(currencies.length)
for(let c of currencies){
    console.log(c.country);
}