import puppeteer from "puppeteer"
import { config } from "dotenv"

config()

const login = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // slowMo: 1000,
    })
    const page = await browser.newPage()
    await page.goto("https://soysocio.bocajuniors.com.ar/")
    await page.waitForSelector("a[id='loginButton2']") // or use page.waitForNetworkIdle()
    await page.click("a[id='loginButton2']")

    const newWindowTarget = await browser.waitForTarget(
        target => target.url() === 'https://pgs-baas.bocajuniors.com.ar/baas/login.jsp?login_by=email'
    )

    const newPage = await newWindowTarget.page()
    await newPage.waitForSelector("#btnEntrar button")
    await newPage.type("input[id='email']", process.env.EMAIL, { delay: 100})
    await newPage.type("input[id='password']", process.env.PSW, { delay: 100})
    await newPage.click("#btnEntrar button")

    const loggedTarget = await browser.waitForTarget(
        target => target.url() === 'https://soysocio.bocajuniors.com.ar/inicio.php'
    )

    const loggedPage = await loggedTarget.page()
    await loggedPage.waitForSelector(".popup_imagen_close")
    await loggedPage.click(".popup_imagen_close")
    await new Promise(r => setTimeout(r, 1000))
    await loggedPage.waitForSelector("a[data-original-title='Comprar']")
    await loggedPage.click("a[data-original-title='Comprar']")
    

    //THIS IS USED TO JUST WAIT A BIT
    // await new Promise(response => setTimeout(response, 1000))


    // await browser.close()
}

login()