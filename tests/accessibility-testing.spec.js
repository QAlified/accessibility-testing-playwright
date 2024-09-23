// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

const param = {
  "url": "https://qalified.com/",
  "urls": [
      "https://qalified.com/",
      "https://qalified.com/success-stories/"
  ]
};

//Se elimino datos del json que no interesa en este momento
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

test('Verificar una web completa - Pasandole una URL', async ({ page }, testInfo) => {
  
  await page.goto(param.url);

  // escanea la pagina y devuelve el reporte
  const accessibilityScanResults = await new AxeBuilder({ page }).options({ runOnly: ['wcag2a','wcag2aa','wcag2aaa','wcag21a','wcag21aa','wcag22aa'] }).analyze();

  formatResult(accessibilityScanResults);

  // agrega los errores a testInfo para luego verlo en el reporte de test
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json'
  });
  
  // verifica que no haya encontrado errores
  expect(accessibilityScanResults.violations).toEqual([]);

});

test('Verificar una serie de webs - Pasandole una lista de URLs', async ({ page }, testInfo) => {
  
  var csv = 'URL,Id,Impact,Description,Help,HelpUrl\n';

  for (const url of param.urls){
    await page.goto(url);

    //escanea la pagina y devuelve el reporte
    //verificando la accesibilidad con la librería de axe-core
    const accessibilityScanResults = await new AxeBuilder({ page }).options({ runOnly: ['wcag2a','wcag2aa','wcag2aaa','wcag21a','wcag21aa','wcag22aa'] }).analyze();

    formatResult(accessibilityScanResults);
    csv = csv+JSONtoCSV(accessibilityScanResults);

    // agrega los errores a testInfo para luego verlo en el reporte de test
    await testInfo.attach('accessibility-scan-results of ' + url, {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: 'application/json'
    });

    fs.writeFile('archivo.csv', csv, (err) => { // guarda el csv en archivo.csv
      if (err) {
        console.error('Error al guardar el archivo CSV:', err);
        return;
      }
      console.log('El archivo CSV ha sido guardado exitosamente.');
    });
    
    // verifica que no haya encontrado errores
    expect.soft(accessibilityScanResults.violations).toEqual([]);
  }

  await testInfo.attach('accessibility-scan-results-csv', {
    body: csv
  });

});

test('Verificar una web completa - Cambiando la configuración del analisis', async ({ page }, testInfo) => {
  
  await page.goto(param.url);

  // escanea la pagina y devuelve el reporte
  const accessibilityScanResults = await new AxeBuilder({ page }) // excluir elementos y deshabilitar reglas puede ser util para no detectar incidentes conocidos
    .options({ runOnly: ['wcag2a','wcag2aa','wcag2aaa','wcag21a','wcag21aa','wcag22aa'] }) // se agrega para excluir las reglas 'best-practice'
    .exclude('.hero-texto > h3') // excluye del analisis el elemento y todos sus descendientes identificado por el css
    .disableRules(['color-contrast','duplicate-id-active','region']) // excluye la regla del analisis. Para mas informacion: https://www.npmjs.com/package/@axe-core/playwright
    .analyze();

  formatResult(accessibilityScanResults);

  // agrega los errores a testInfo para luego verlo en el reporte de test
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json'
  });
  
  // verifica que no haya encontrado errores
  expect(accessibilityScanResults.violations).toEqual([]);

});
