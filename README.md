# Playwright Accessibility

El proyecto consiste en ejemplos de cómo utilizar las características básicas de accesibilidad automatizada de Playwright más concretamente en el paquete @axe-core/playwright.

## Comenzando 🚀

Estas instrucciones te permitirán obtener una copia local del proyecto en funcionamiento para propósitos de desarrollo y pruebas.

### Pre-requisitos 📋

Requisitos necesarios para el correcto funcionamiento del template y cómo instalarlos.

* [Visual Studio Code](https://code.visualstudio.com/docs/?dv=win)
* [Nodejs](https://nodejs.org/en/download)
* Extensión 'Playwright Test for VSCode' en Visual Studio Code (Opcional)


### Instalación 🔧

A continuación se describen los pasos para descargar e instalar el template y visualizarlo desde Visual Studio Code.

1. Descargar una copia o clonar el código del repositorio desde GitHub.
2. Importar el proyecto en Code.
3. Desde la barra de herramientas superior, dirigirse a _Terminal > New Terminal_
4. Desde la terminal, ejecutar el comando _npm install playwright_
5. Desde la terminal, ejecutar el comando _npm install @axe-core/playwright_

Este proceso también se puede realizar desde una terminal nativa de su sistema operativo.

## Explicación ⚙️

Se crearon 3 escenarios para la ilustración de los posibles usos de la herramienta.

### Escenario 1. Verificar una web completa - Pasandole una URL

En este escenario se muestra el uso básico de la herramienta, con un agregado para facilitar el reporte de los casos probados/pasados/fallados.

```javascript
test('Verificar una web completa - Pasandole una URL', async ({ page }, testInfo /* * */) => {
  
  // 1
  await page.goto(param.url);

  // 2
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  // 3
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json'
  });
  
  // 4
  expect(accessibilityScanResults.violations).toEqual([]);

});
```

1. Se dirige a la página que se desea analizar.
2. En este paso se realiza el análisis y se crea el reporte de los casos probados/pasados/fallados. (Para información más detallada de el objeto que se devuelve https://github.com/dequelabs/axe-core/blob/master/doc/API.md#results-object)
3. Aquí se anexa el reporte generado por Axe al reporte que genera playwright al final de las pruebas. (Esto se puede encontrar al final del reporte de cada prueba como un anexo)
4. Verifica si hay algún caso fallado del reporte generado por Axe.

### Escenario 2. Verificar una serie de webs - Pasandole una lista de URLs

En este escenario se verifica un conjunto pre-cargado de URLs. Este escenario es relevante en un proyecto donde es necesario verificar una gran cantidad de URLs sin ningún caso especial. En el ejemplo, las URLs se hardcodean al comienzo del archivo.

```javascript
test('Verificar una serie de webs - Pasandole una lista de URLs', async ({ page }, testInfo) => {
  
  for (const url of param.urls){
    await page.goto(url);

    // escanea la pagina y devuelve el reporte
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // agrega los errores a testInfo para luego verlo en el reporte de test
    await testInfo.attach('accessibility-scan-results of ' + url, {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: 'application/json'
    });
    
    // verifica que no haya encontrado errores
    expect.soft(accessibilityScanResults.violations).toEqual([]);
  }

});
```

Este escenario es igual que el 1 con el agregado de que se itera por cada URL del array.

### Escenario 3. Verificar una web completa - Cambiando la configuración del análisis

En este escenario se da un vistazo a las opciones de configuración del análisis. Esto es relevante en el caso en donde el análisis no es necesario en el completo de la página o no es necesario el análisis de todas las reglas por defecto de Axe. Es útil para saltarse errores ya conocidos.

```javascript
  const accessibilityScanResults = await new AxeBuilder({ page })
    .options({ runOnly: ['wcag2a','wcag2aa','wcag2aaa','wcag21a','wcag21aa','wcag22aa'] }) // 1
    .exclude('.hero-texto > h3') // 2
    .disableRules(['color-contrast','duplicate-id-active','region']) // 3
    .analyze();
```

Para cambiar la configuración del análisis es tan sencillo como agregar condiciones como se muestra.

1. .options se agrega en este caso para excluir las pruebas con tag "best-practice". Para mas información de .options ir a: https://github.com/dequelabs/axe-core/blob/master/doc/API.md
2. Excluye del análisis el elemento y todos sus descendientes identificados por el css.
3. Excluye del análisis las reglas con los id's del array.
4. Para mas informacion sobre la configuracion: https://www.npmjs.com/package/@axe-core/playwright

## Reporte de incidentes

Se crearon 2 funciones formatResult(result) y JSONtoCSV(json) para facilitar la lectura y entendimiento del reporte.

### formatResult(result)

Esta función toma el JSON que genera Axe automaticamente y lo modifica para generar un JSON más entendible y con los datos más importantes.

### JSONtoCSV(json)

Esta función toma el JSON (puede ser el generado por Axe o el devuelto por formatResult(result)) y genera un CSV útil para generar un reporte de todas las URL's testeadas donde se guardan los datos de la forma

Las columnas son de la forma: URL,Id,Impact,Description,Help,HelpUrl

Por cada incidente se genera una fila e inmediatamente debajo de cada incidente se genera una fila por cada elemento detectado con ese incidente. La forma de identificar el elemento es con un CSS selector, en caso de haber múltiples ítems cada ítem corresponde a un nivel de iframe o frame.

La función se integra en el test _Verificar una serie de webs - Pasandole una lista de URLs_ para generar un CSV que contenga todos los incidentes de todas las URL's.

## Construido con 🛠️

* [Playwright](https://playwright.dev/) - El framework de automatización.
* [Visual Studio Code](https://code.visualstudio.com/docs/?dv=win) - Editor de código.

## Autores ✒️

* [**QAlified**](https://qalified.com/)

## Contacto 📢

info@qalified.com

---
⌨️ con ❤️ por QAlified