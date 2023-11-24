require('dotenv').config();


const puppeteer = require('puppeteer');
const fse = require('fs-extra');
const luxon = require('luxon');


async function poll() {
    console.log(">... initiating scrape ...");
    const currentDate = luxon.DateTime.now();
    // console.log("current time: " + currentDate.toLocaleString('en-GB'));
    console.log("current time: " + currentDate.toFormat("yyMMdd_hhmm"));

    try {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
    
        await page.goto('https://icp.administracionelectronica.gob.es/icpco/index', {
            waitUntil: 'networkidle0',
          });
    
        page.waitForNavigation({ waitUntil: 'networkidle0' });
    
        //select region
        await page.waitForSelector('#form');
        await page.select('#form', '/icpco/citar?p=7&locale=es')
        await page.click('#btnAceptar');
    
        // select office
        await page.waitForSelector('#sede'); 
        await page.select('#sede', '1');
    
        // select type of appointment
        await page.waitForSelector('[name="tramiteGrupo[0]"]'); 
        await page.select('[name="tramiteGrupo[0]"]', '4052');
    
        // accept selection
        const btn_accept = await page.waitForSelector('#btnAceptar'); 
        await btn_accept.evaluate(b => b.click());
        console.log("accept clicked?");
    
        // next page
        const btn_enter = await page.waitForSelector('#btnEntrar');
        await btn_enter.evaluate(b => b.click());
    
        // enter personal information page
    
        // select passport as type
        await page.waitForSelector('#rdbTipoDocPas');
        await page.click('#rdbTipoDocPas');
    
        // enter passport number, name and birth year
        await page.type('#txtIdCitado', process.env.ID);
        await page.type('#txtDesCitado', process.env.NAME);
        await page.waitForSelector('#txtAnnoCitado');
        await page.type('#txtAnnoCitado', process.env.BIRTHYEAR);
    
        const btn_submit = await page.waitForSelector('#btnEnviar'); 
        // await btn_submit.evaluate(b => b.click());
        await page.click('#btnEnviar');
    
    
        // next page
        const btn_final = await page.waitForSelector('#btnEnviar'); 
        // await btn_final.evaluate(b => b.click());
        await page.click('#btnEnviar');
        
        
        const html = await page.content();
        if (html.match('En este momento no hay citas disponibles')) {
            console.log("There are currently no appointsments available");
        }
        await fse.outputFile(`./output/test${currentDate.toFormat("yyMMdd_hhmm")}.html`, html.toString());
        
    
        await page.waitForTimeout(60000); // wait for 60 seconds
        await browser.close();
    } catch (error) {
        console.log(`An error has occured:\n${error}`);
        return (-1);
    }
    
}

poll();