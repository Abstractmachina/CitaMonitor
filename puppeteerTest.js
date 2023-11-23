const puppeteer = require('puppeteer');

async function main() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://www.scrapingbee.com/');
    await page.waitForTimeout(10000); // wait for 5 seconds
    // await browser.close();
}

async function yelp() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://www.yelp.com/');
    await page.type('.pseudo-input--find__09f24__fVIx2', 'Pizza Delivery');
    // await page.type('#dropperText_Mast', 'Toronto, ON');
    await page.click('.buttons-arrange-unit__09f24__T2sfx');
    await page.waitForTimeout(20000); // wait for 5 seconds
    await browser.close();
}

// main();
yelp();