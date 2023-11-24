const puppeteer = require('puppeteer');
const fse = require('fs-extra');
const notifier = require('node-notifier')

async function main() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://www.scrapingbee.com/');

    const html = await page.content();

    notifier.notify({
        title: 'Cita Previa Monitor',
        message: 'appointment found!',
        sound: true
    });

    try {
        const el = await page.waitForXPath('//*[contains(text(), "Tired of getting blockeda")]', 10000);
        if (el) {
            console.log("text found!");
            console.log(el);
        }

    } catch (err) {
        console.log("text not found!");
        process.exit(1);
    }

    // await fse.outputFile("./output/test00.html", html.toString());
    // await page.waitForTimeout(10000); // wait for 5 seconds
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

main();
// yelp();