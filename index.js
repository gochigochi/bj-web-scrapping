import puppeteer from "puppeteer"
import { config } from "dotenv"

config()

const login = async () => {

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (
            interceptedRequest.url().endsWith('.png') ||
            // interceptedRequest.url().endsWith('.svg') ||
            interceptedRequest.url().endsWith('.jpg') ||
            ['font'].indexOf(interceptedRequest.resourceType()) !== -1
        )
            interceptedRequest.abort();
        else interceptedRequest.continue();
    })
    await page.goto("https://soysocio.bocajuniors.com.ar/")
    await page.setViewport({
        width: 1440,
        height: 990,
        deviceScaleFactor: 2
      })
    await page.waitForSelector("a[id='loginButton2']")
    await page.click("a[id='loginButton2']")

    const newWindowTarget = await browser.waitForTarget(
        target => target.url() === 'https://pgs-baas.bocajuniors.com.ar/baas/login.jsp?login_by=email'
    )

    const newPage = await newWindowTarget.page()
    await newPage.waitForSelector("#btnEntrar button")
    await newPage.type("input[id='email']", process.env.EMAIL, { delay: 50 })
    await newPage.type("input[id='password']", process.env.PSW, { delay: 50 })
    await newPage.click("#btnEntrar button")

    const loggedTarget = await browser.waitForTarget(
        target => target.url() === 'https://soysocio.bocajuniors.com.ar/inicio.php'
    )

    const loggedPage = await loggedTarget.page()
    await loggedPage.waitForSelector(".popup_imagen_close")
    await loggedPage.click(".popup_imagen_close")
    await new Promise(r => setTimeout(r, 2000))
    await loggedPage.waitForSelector("a[data-original-title='Comprar']")
    await loggedPage.click("a[data-original-title='Comprar']")
    await loggedPage.waitForSelector(".columna3 a")
    await loggedPage.click(".columna3 a")
    await loggedPage.waitForSelector("#btnPlatea")
    await loggedPage.click("#btnPlatea")

    //LOOP QUE SE ROMPE CUANDO ENCUENTRA EL ASIENTO
    while (true) {

        console.log("Empezando a buscar...")

        //LOOP QUE SE ROMPE CUANDO ENCUENTRA LA UBICACION
        while (true) {

            try {

                await loggedPage.waitForSelector(".enabled", { timeout: 500 })
                await loggedPage.click(".enabled")
                console.log("Entrada encontrada.")
                break

            } catch (error) {

                console.log("No hay entradas todavía. Recargando pagina.")
                await loggedPage.reload({ waitUntil: "domcontentloaded" })
            }
        }

        console.log("Reservar asiento")

        try {

            await loggedPage.waitForSelector(".d", { timeout: 5000 })
            // await loggedPage.waitForSelector(".d")
            await loggedPage.click(".d")
            console.log("Asiento clickeado, ahora clickear Boton Reservar")
            // await loggedPage.waitForSelector(".but_medium2", { timeout: 0 }) // TESTING FOR NOT REGULAR EVENT
            await loggedPage.waitForSelector("#btnReservar", { timeout: 0 }) // FOR PRODUCTION
            // WAIT UNTIL THE LOADER IS HIDDEN (ELSE, PUPPET WILL CLICK ON THE SECREEN AND ABORT THE LOADING AND RESET THE LOOP)
            await new Promise(response => setTimeout(response, 3000))
            await loggedPage.click("#btnReservar") // FOR PRODUCTION
            // await loggedPage.click(".but_medium2") // TESTING FOR NOT REGULAR EVENT
            console.log("Boton reservar clickeado")
            break

        } catch (err) {

            console.log("El asiento ya fue reservado por otro usuario. Buscando nuevamente...")
            console.log("Error: ", err)
            await loggedPage.goBack({ waitUntil: "domcontentloaded" })
        }
    }

    console.log("Entrada para reservar.")
    // browser?.close()
}

login()