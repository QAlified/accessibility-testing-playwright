// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const Login = require('../helpers/Login.js');
const fs = require('fs');

const param = {
  "urlCuraDemo": "https://katalon-demo-cura.herokuapp.com"
};

function formatResult(result){
  delete result.testEngine;
  delete result.testRunner;
  delete result.testEnvironment;
  delete result.toolOptions;
  delete result.inapplicable;
  delete result.passes;
  delete result.incomplete;
  result.violations.forEach((elem,index,arr) => {
    // delete elem.tags;
    elem.nodes.forEach(element => {
      delete element.any;
      delete element.all;
      delete element.none;
      delete element.failureSummary;
      delete element.impact;
    });
  });
}

function JSONtoCSV(json){
  var csv = "";
  json.violations.forEach(elem => {
      csv = csv+json.url+','+elem.id+','+elem.impact+','+elem.description+','+elem.help+','+elem.helpUrl+'\n';
      elem.nodes.forEach(element => {
        csv = csv+',';
        element.target.forEach(el => {
          csv = csv+el+',';
        })
        csv = csv+'\n';
      })
  });
  return csv;
}

test('Verificar un flujo de un caso de prueba funcional', async ({ page }, testInfo) => {
  
    var csv = 'URL,Id,Impact,Description,Help,HelpUrl\n';
  
    await page.goto(param.urlCuraDemo);  
  
    //Se invocan varias funciones referente al módulo Login
    await Login.clickMakeAppointment(page)
    await Login.setUsername(page)
    await Login.setPassword(page)
    await Login.clickLogin(page)
    await Login.clickMenu(page) 
    
    //Se verifica que el elemento buttonLogout sea visible
    await Login.verifyLogin(page)
    await Login.clickMenu(page)
  
    // escanea la pagina y devuelve el reporte
    const accessibilityScanResults = await new AxeBuilder({ page }).options({ runOnly: ['wcag2a','wcag2aa','wcag2aaa','wcag21a','wcag21aa','wcag22aa'] }).analyze();
    formatResult(accessibilityScanResults);
  
    formatResult(accessibilityScanResults);
      csv = csv+JSONtoCSV(accessibilityScanResults);
  
      // agrega los errores a testInfo para luego verlo en el reporte de test
      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(accessibilityScanResults, null, 2),
        contentType: 'application/json'
      });
  
      fs.writeFile('archivo2.csv', csv, (err) => { // guarda el csv en archivo.csv
        if (err) {
          console.error('Error al guardar el archivo CSV:', err);
          return;
        }
        console.log('El archivo CSV ha sido guardado exitosamente.');
      });
      
      // verifica que no haya encontrado errores
      expect.soft(accessibilityScanResults.violations).toEqual([]);
  
    await testInfo.attach('accessibility-scan-results-csv', {
      body: csv
    });
   
  });