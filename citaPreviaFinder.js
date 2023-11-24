require('dotenv').config();


const puppeteer = require('puppeteer');
const fse = require('fs-extra');
const luxon = require('luxon');
const notifier = require("node-notifier");


async function poll() {
    console.log(">... initiating scrape ...");
    const currentDate = luxon.DateTime.now();
    // console.log("current time: " + currentDate.toLocaleString('en-GB'));
    console.log("current time: " + currentDate.toFormat("yyMMdd_HHmm"));

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
        
        // next page
        const btn_enter = await page.waitForSelector('#btnEntrar');
        await btn_enter.evaluate(b => b.click());
        
        // enter personal information page
        
        console.log(">... Filling in form ...");
        // select passport as type
        await page.waitForSelector('#rdbTipoDocPas');
        await page.click('#rdbTipoDocPas');
    
        // enter passport number, name and birth year
        await page.waitForSelector('#txtIdCitado');
        await page.type('#txtIdCitado', process.env.ID);
        await page.waitForSelector('#txtDesCitado');
        await page.type('#txtDesCitado', process.env.NAME);
        await page.waitForSelector('#txtAnnoCitado');
        await page.type('#txtAnnoCitado', process.env.BIRTHYEAR);
    

/**
 * <input id="btnEnviar" type="button" class="mf-button primary" value="Aceptar" onclick="envia()"></input>
 */
        
        await page.waitForSelector('#btnEnviar');
        // await page.waitForSelector('[name="tramiteGrupo[0]"]');

        await page.waitForTimeout(500); // wait for 60 seconds

        // console.log(btn_submit);
        // await btn_submit.evaluate(b => b.click());
        await page.evaluate(() => {
            document.querySelector('#btnEnviar').click();
            return;
        });
        page.waitForTimeout(500); // wait for 60 seconds
        await page.waitForNavigation();

    
  

        
     

        if ((await page.content()).includes("En este momento no hay citas disponibles")) {
            console.log("no appointments available");
            notifier.notify({
                title: 'Cita Previa Monitor',
                message: 'No appointments found!',
                sound: true
            });
        } else {
            console.log("appointment found!");
            notifier.notify({
                title: 'Cita Previa Monitor',
                message: 'appointment found!',
                sound: true
            });
        }
        

        console.log("> ... saving html content to file ...")
        const html = await page.content();
        await fse.outputFile(`./output/test${currentDate.toFormat("yyMMdd_HHmm")}.html`, html.toString());
        
    
        await page.waitForTimeout(60000); // wait for 60 seconds
        await browser.close();
    } catch (err) {
        var caller_line = err.stack.split("\n")[4];
        var index = caller_line.indexOf("at ");
        var clean = caller_line.slice(index + 2, caller_line.length);
        console.log(`An error has occured:\n${err}, ${index}, ${clean}`);
        return (-1);
    }
    
}

poll();