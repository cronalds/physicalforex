---
title: "Currency Investing Considerations"
source: "https://chatgpt.com/c/6abcb37a-c858-83ec-b714-eacced8136e9"
author:
published:
created: 2026-10-02
description: "ChatGPT conversation with 5 messages"
tags:
  - "clippings"
---
**ChatGPT said**

Yes — the cumulative inflation equation is **correct**:

```javascript
(((1 + 0.1) * (1 + 0.2) * (1 + 0.3) * (1 + 0.4)) - 1) * 100
```

It gives **128.864% cumulative inflation**.

I'd recommend keeping rates as **decimals internally**:

```javascript
0.10  // 10%
0.20  // 20%
0.30  // 30%
```

and only converting to `* 100` when displaying the result.

That makes composition with other functions much cleaner:

```javascript
cumulativeInflation = 1.10 * 1.20 * 1.30 * 1.40 - 1;
// 1.28864
```

Then:

```javascript
cumulativeInflation * 100
// 128.864%
```

So I'd generally make your functions return decimals by default and have an `asPercent` option only for presentation.

---

## Your primaryFiscalBalance

There is a logic problem in the current conditions.

You have:

```javascript
if((!isNonInterest && interestPayments == undefined) || interestPayments == undefined)
```

The `|| interestPayments == undefined` makes the first condition effectively:

```javascript
if(interestPayments == undefined)
```

And your second condition:

```javascript
else if((isNonInterest && interestPayments != undefined) || interestPayments != undefined)
```

effectively becomes:

```javascript
else if(interestPayments != undefined)
```

So `isNonInterest` isn't actually controlling anything.

More importantly, the semantic distinction should be:

- `spending` = **total spending including interest**
- `spending` = **non-interest spending**

If `spending` already excludes interest, you don't need `interestPayments`.

I'd simplify it to:

```javascript
export function primaryFiscalBalance(
    revenue,
    spending,
    interestPayments = 0,
    isNonInterest = false
) {
    return isNonInterest
        ? revenue - spending
        : revenue - (spending - interestPayments);
}
```

Meaning:

```javascript
primaryFiscalBalance(100, 90, 10, false)
// 20
```

because:

```
total spending = 90
interest = 10
non-interest spending = 80

100 - 80 = 20
```

Whereas:

```javascript
primaryFiscalBalance(100, 80, undefined, true)
// 20
```

because you've told it that `80` is already non-interest spending.

### I'd actually rename the parameter

`isNonInterest` is slightly ambiguous. Something like:

```javascript
spendingIsNonInterest
```

makes the function much easier to read:

```javascript
export function primaryFiscalBalance(
    revenue,
    spending,
    interestPayments = 0,
    spendingIsNonInterest = false
) {
    return spendingIsNonInterest
        ? revenue - spending
        : revenue - (spending - interestPayments);
}
```

That's much closer to the semantic style you're aiming for.

---

## Your combined appreciation/drawdown function

The basic return calculation is right:

```javascript
(currI / prevI) - 1
```

But there are **two bugs/issues**.

### 1\. Your loop stops one element too early

You have:

```javascript
i < ratesArray.length - 1
```

It should be:

```javascript
i < ratesArray.length
```

For:

```javascript
[100, 110, 120, 90]
```

you currently calculate:

```
100 → 110
110 → 120
```

but miss:

```
120 → 90
```

So:

```javascript
for (let i = 1; i < ratesArray.length; i++)
```

---

### 2\. This isn't actually drawdown

Your current `isDrawdown` option changes:

```javascript
max
```

to:

```javascript
min
```

but that gives you **maximum single-period depreciation**, not maximum drawdown.

These are different concepts.

Suppose:

```
100
120
115
110
105
```

Your function sees:

```
+20%
-4.17%
-4.35%
-4.55%
```

So maximum depreciation is approximately:

```
-4.55%
```

But the **maximum drawdown** is:

```
100 → 120 → 105

(105 / 120) - 1
= -12.5%
```

Drawdown measures decline from a **previous peak**, not simply the biggest one-period fall.

---

## Combined appreciation / depreciation

Your existing function can cleanly handle **maximum appreciation vs maximum depreciation**:

```javascript
export function maximumAppreciationOrDepreciation(
    ratesArray,
    asPercent = true,
    isDepreciation = false
) {
    let changes = [];

    for (let i = 1; i < ratesArray.length; i++) {
        let currRate = ratesArray[i];
        let prevRate = ratesArray[i - 1];

        changes.push((currRate / prevRate) - 1);
    }

    let result = isDepreciation
        ? ss.min(changes)
        : ss.max(changes);

    return asPercent ? result * 100 : result;
}
```

Then:

```javascript
maximumAppreciationOrDepreciation(rates)
// maximum appreciation
```

or:

```javascript
maximumAppreciationOrDepreciation(rates, true, true)
// maximum one-period depreciation
```

I'd call it **Depreciation**, though, rather than drawdown.

---

## Separate maximum drawdown function

I'd keep this separate because the underlying calculation is fundamentally different:

```javascript
export function maximumDrawdown(ratesArray, asPercent = true) {

    let peak = ratesArray[0];
    let maxDrawdown = 0;

    for (let i = 1; i < ratesArray.length; i++) {

        if (ratesArray[i] > peak) {
            peak = ratesArray[i];
        }

        let drawdown = (ratesArray[i] / peak) - 1;

        if (drawdown < maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return asPercent
        ? maxDrawdown * 100
        : maxDrawdown;
}
```

This gives you the actual concept:

```
current value / previous peak - 1
```

rather than:

```
current value / previous value - 1
```

---

### So I'd structure your little math library as

```javascript
inflationRate()
cumulativeInflation()

primaryFiscalBalance()

maximumAppreciationOrDepreciation()
maximumDrawdown()

annualisedVolatility()
rollingVolatility()

frequencyAbove()
```

And **keep all internal rates as decimals**:

```
0.05 = 5%
0.10 = 10%
-0.20 = -20%
```

Only convert to percentages at the display boundary. That'll save you a lot of annoying `* 100` / `/ 100` conversions once these functions start feeding into one another.

---

**You said**

yeah fair enough with the flag bools i just checked for == and!= undefined; and as for the loop yeah i wasnt using <= so youre right oh yep drawdown uses the previous highest value not just the previous rate, yeah ok i get where i went wrong; so starting at index 1, the previous peak is 0, then for index 2 its either 0 or 1 depending on whats higher, then that continues; should i make a nested array like \[\[index1, prevpeak1\],...\] and then use that or should i just get the indices of the highest number at the indices before length-1 and then get the lowest number at any indices after that for the drawdown?

---

**ChatGPT said**

Yep, you've got the algorithm now. 👍

You **don't need a nested array or to calculate peak indices separately**. The simplest approach is exactly what you described conceptually: maintain one `previousPeak` variable as you walk through the array.

For each index:

```
index 0 → establish initial peak
index 1 → compare current value to peak
index 2 → compare current value to peak
index 3 → compare current value to peak
...
```

So for:

```
[100, 110, 105, 120, 90, 95]
```

you'd conceptually have:

```
index    rate    previousPeak
0        100     100
1        110     110
2        105     110
3        120     120
4         90     120
5         95     120
```

Then calculate:

```
drawdown = currentRate / previousPeak - 1
```

giving:

```
index 1: 110 / 100 - 1 =  10%
index 2: 105 / 110 - 1 =  -4.55%
index 3: 120 / 120 - 1 =   0%
index 4:  90 / 120 - 1 = -25%
index 5:  95 / 120 - 1 = -20.83%
```

Therefore:

```
maximum drawdown = -25%
```

### Why I wouldn't use the nested array

You *could* make:

```javascript
[
    [100, 100],
    [110, 110],
    [105, 110],
    [120, 120],
    [90, 120],
    [95, 120]
]
```

but that's intermediate data you don't actually need.

You only care about:

1. the current peak
2. the current drawdown
3. the largest drawdown encountered

So you can calculate it in **one pass, O(n) time and O(1) additional memory**.

Conceptually:

```
peak = first rate
maximumDrawdown = 0

for each rate after first:

    if rate > peak:
        peak = rate

    drawdown = rate / peak - 1

    if drawdown < maximumDrawdown:
        maximumDrawdown = drawdown
```

And there's another nice property: **you don't need to explicitly find the lowest value after a peak either.**

Your idea of:

> find highest previous value → find lowest value after it

is mathematically related, but the rolling approach handles **every possible peak-to-trough period simultaneously**.

For example:

```
[100, 150, 140, 160, 80, 130]
```

There are multiple candidate peaks:

```
100
150
160
```

The algorithm automatically tests the relevant drawdowns:

```
150 → 140
160 → 80   ← -50%
160 → 130
```

without having to build or search separate ranges.

So for your library, I'd definitely use the **rolling `peak` approach**. It's simpler, faster, and directly expresses what maximum drawdown means.

---

**You said**

export function drawdown(ratesArray) { let peak = 0; let maxDrawdown = 0; for (let i = 0; i < ratesArray.length; i++) { ratesArray\[i\] > peak? (peak = ratesArray\[i\]): (peak = peak); let drawdown = ratesArray\[i\] / peak - 1; drawdown < maxDrawdown? (maxDrawdown = drawdown): (maxDrawdown = maxDrawdown); } }

---

**ChatGPT said**

Yep, the logic is basically there. Two things are missing:

1. You don't return `maxDrawdown`.
2. The `: (peak = peak)` and `: (maxDrawdown = maxDrawdown)` branches do nothing, so you can omit them.

Your version:

```javascript
export function drawdown(ratesArray) {

  let peak = 0;
  let maxDrawdown = 0;

  for (let i = 0; i < ratesArray.length; i++) {

    ratesArray[i] > peak ? (peak = ratesArray[i]) : (peak = peak);

    let drawdown = ratesArray[i] / peak - 1;

    drawdown < maxDrawdown
      ? (maxDrawdown = drawdown)
      : (maxDrawdown = maxDrawdown);

  }

}
```

I'd simplify it to:

```javascript
export function drawdown(ratesArray) {

  let peak = 0;
  let maxDrawdown = 0;

  for (let i = 0; i < ratesArray.length; i++) {

    if (ratesArray[i] > peak) {
      peak = ratesArray[i];
    }

    let drawdown = ratesArray[i] / peak - 1;

    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }

  }

  return maxDrawdown;
}
```

Or, if you specifically want the ternary style you're using:

```javascript
export function drawdown(ratesArray) {

  let peak = 0;
  let maxDrawdown = 0;

  for (let i = 0; i < ratesArray.length; i++) {

    ratesArray[i] > peak
      ? peak = ratesArray[i]
      : null;

    let drawdown = ratesArray[i] / peak - 1;

    drawdown < maxDrawdown
      ? maxDrawdown = drawdown
      : null;

  }

  return maxDrawdown;
}
```

But honestly, **the `if` version is cleaner semantic sugar here**. A ternary is most useful when you're actually choosing between two values:

```javascript
let x = condition ? valueA : valueB;
```

You're using it purely for side effects, so `if` communicates the intent better.

One other thing: I'd probably start `peak` at the first element rather than `0` if these are exchange rates:

```javascript
let peak = ratesArray[0];
```

Then start the loop at `1`:

```javascript
export function drawdown(ratesArray) {

  let peak = ratesArray[0];
  let maxDrawdown = 0;

  for (let i = 1; i < ratesArray.length; i++) {

    if (ratesArray[i] > peak) {
      peak = ratesArray[i];
    }

    let drawdown = ratesArray[i] / peak - 1;

    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }

  }

  return maxDrawdown;
}
```

That makes the algorithm map almost exactly onto the definition:

```
start with first rate as peak
        ↓
look at next rate
        ↓
is it a new peak?
        ↓
calculate decline from peak
        ↓
is it the largest decline?
        ↓
repeat
```

And because you're keeping rates as decimals, the result would be:

```javascript
drawdown([100, 120, 110, 90])
// -0.25
```

rather than `-25`. Then your presentation layer can do:

```javascript
drawdown(rates) * 100
// -25
```

which fits nicely with the convention you're establishing for the rest of your math functions.