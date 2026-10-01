import * as cheerio from 'cheerio';
import * as fs from "node:fs/promises";

let html = await fs.readFile("./currencies.html");

let curr = [];

const $ = cheerio.load(html);

$("table.codes tbody tr").each((_, row) => {
    let cells = $(row).find("td");

    if(cells.length !== 3) return;// if not all fields in a row are present then return nothing

    curr.push({
        country: $(cells[0]).text().trim(),
        currency: $(cells[1]).text().trim(),
        code: $(cells[2]).text().trim(),
    })
})

function currJoined(){
    let s = [];
    for(let item of curr){
        s.push(JSON.stringify(item));
    }
    return s.join(",");
}
let toWrite = `export let currencies = [
${currJoined()}
]`;

await fs.writeFile("./currencies.js", toWrite);