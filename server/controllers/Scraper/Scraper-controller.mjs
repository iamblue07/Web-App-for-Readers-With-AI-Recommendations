import models from "../../models/index.mjs";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";
import getGenre from "./genres.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, "logs");

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

import puppeteer from "puppeteer";

const now = new Date();
const logFileName = path.join(
    logsDir,
    `log-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.txt`
);
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });

const TOTAL_PAGES = 1650;
const BOOKS_PER_PAGE = 30;
const REQUEST_DELAY = 2000;
const PAGE_DELAY = 1000;
const USER_AGENT = "Scraping project for my bachelor's degree. Sorry for the trouble.";

let currentPage = 1601;
let totalBooksScraped = 0;
let shouldContinue = true;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const calculateProgress = () => {
    const totalBooks = TOTAL_PAGES * BOOKS_PER_PAGE;
    return ((totalBooksScraped / totalBooks) * 100).toFixed(2);
}

const logError = async (error, context, url = null) => {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ERROR (${context}): ${error.message}${url ? ` | URL: ${url}` : ''}\n`;
    logStream.write(message);
    console.error(message.trim());
}


const postAddCarte = async (data) => {
    let { imgSrc, title, author, genre, description, fullPrice, isbn, url } = data;
    try{
        if(title != null) {
            if(author == null) author = 'Necunoscut';
            if(genre == null) genre = 'Necunoscut';
            if(description == null) description = 'Fara descriere...';

            const newGenre = await getGenre(genre);
            const newBook = await models.Carte.create({
               isbn: isbn,
               titlu: title,
               autor: author,
               descriere: description,
               genLiterar: newGenre,
               caleImagine: imgSrc
            });
            await models.OfertaCarte.create({
                idCarte: newBook.id,
                magazin: 'Carturesti',
                linkOferta: url,
                pretOferta: fullPrice
            });
            return{message:"Success"};
        }
        return{message:"Failure", error:"Title not found", url};
    }catch(error){
        return{message:"Failure", error:error, url};
    }
};

const scrapeBook = async (url, browser) => {
    const page = await browser.newPage();
    try {
        await page.setUserAgent(USER_AGENT);
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const imgSrc = await page.evaluate(() => {
            const img = document.querySelector('.imageSlider img');
            return img ? img.src : null;
        });

        const title = await page.evaluate(() => {
            const t = document.querySelector('.titluProdus');
            return t ? t.textContent.replace(/\s+/g, ' ').trim() : null;
        });

        const author = await page.evaluate(() => {
            const a = document.querySelector('.autorProdus > a:nth-child(1)');
            return a ? a.textContent.replace(/\s+/g, ' ').trim() : null;
        });

        const genre = await page.evaluate(() => {
            const g = document.querySelector('.linkuriCategorii > a:nth-child(1)');
            return g ? g.textContent.replace(/\s+/g, ' ').trim() : null;
        });

        const description = await page.evaluate(() => {
            const article = document.querySelector('article[itemprop="description"]');
            if (!article) return null;
            const paragraphs = Array.from(article.querySelectorAll('p'));
            return paragraphs.map(p => {
                return p.textContent
                    .replace(/\s+/g, ' ')
                    .trim()
                    .replace(/[\u0103\u00E2\u00EE\u0219\u021B\u0102\u00C2\u00CE\u0218\u021A]/g, 
                        m => ({
                            '\u0103': 'a',
                            '\u00E2': 'a',
                            '\u00EE': 'i',
                            '\u0219': 's',
                            '\u021B': 't',
                            '\u0102': 'A',
                            '\u00C2': 'A',
                            '\u00CE': 'I',
                            '\u0218': 'S',
                            '\u021A': 'T'
                        }[m] || m));
            }).filter(text => text).join('\n');
        });

        const absPrice = await page.evaluate(() => {
            const priceContainer = document.querySelector('.pret');
            if (!priceContainer || !priceContainer.firstChild) return null;
            return priceContainer.firstChild.textContent.replace(/\s+/g, ' ').trim();
        });

        const fracPrice = await page.evaluate(() => {
            const g = document.querySelector('span.bani:nth-child(1)');
            return g ? g.textContent.replace(/\s+/g, ' ').trim() : null;
        });

        const isbn = await page.evaluate(() => {
            const xpathExpr = "//div[@class='productAttr'][span[contains(text(),'ISBN')]]/div[1]";
            const result = document.evaluate(
                xpathExpr,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            return result ? result.textContent.trim() : null;
        });

        const absPriceValue = parseFloat(absPrice) || 0;
        const fracPriceValue = (parseFloat(fracPrice) || 0) / 100;
        const fullPrice = absPriceValue + fracPriceValue;

        const result = await postAddCarte({ imgSrc, title, author, genre, description, fullPrice, isbn, url });
        if(result.message === 'Failure') {
            logError(result.error, 'adding to DB', result.url);
        }
    } catch (error) {
        logError(error, 'book scraping', url);
        return null;
    } finally {
        await page.close();
    }
}

const getBookLinks = async (browser, pageNumber) => {
    const page = await browser.newPage();
    try {
        await page.setUserAgent(USER_AGENT);
        await page.goto(`https://carturesti.ro/raft/carte-109?page=${pageNumber}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForSelector('div.products-container-grid:nth-child(2)', { timeout: 15000 });

        return await page.evaluate(() => {
            const grid = document.querySelector('div.products-container-grid:nth-child(2)');
            return grid ? Array.from(grid.querySelectorAll('.cartu-grid-tile a.clean-a'))
                .map(a => a.href) : [];
        });
    } catch (error) {
        logError(error, 'page links retrieval', `page ${pageNumber}`);
        return [];
    } finally {
        await page.close();
    }
}

const processGroup = async (group, browser, bookUrlsLength) => {
    for (const item of group) {
        if (!shouldContinue) break;
        try {
            const bookData = await scrapeBook(item.url, browser);
            if (bookData) {
                totalBooksScraped++;
                console.log(`[${calculateProgress()}%] Scraped: ${bookData.title} (${item.originalIndex + 1}/${bookUrlsLength})`);
            }
            await sleep(REQUEST_DELAY);
        } catch (error) {
            logError(error, 'book processing', item.url);
        }
    }
};

const processPage = async (browser, pageNumber) => {
    try {
        console.log(`\nProcessing page ${pageNumber}/${TOTAL_PAGES}...`);
        const bookUrls = await getBookLinks(browser, pageNumber);
        const bookUrlsWithIndex = bookUrls.map((url, index) => ({ url, originalIndex: index }));
        const odds = bookUrlsWithIndex.filter(item => item.originalIndex % 2 === 0);
        const evens = bookUrlsWithIndex.filter(item => item.originalIndex % 2 === 1);
        await Promise.all([
            processGroup(odds, browser, bookUrls.length),
            processGroup(evens, browser, bookUrls.length)
        ]);
    } catch (error) {
        logError(error, 'page processing', `page ${pageNumber}`);
    }
}

let shouldScrape = false;

const startScraping = async() => {
    if(shouldScrape) {
        shouldScrape = false;
        logStream.write(`Scraping started at ${new Date().toISOString()}\n`);
        const browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox']
        });
    
        try {
            for (; currentPage <= TOTAL_PAGES && shouldContinue; currentPage++) {
                const startTime = Date.now();
                await processPage(browser, currentPage);
                console.log(`\nOverall Progress: ${calculateProgress()}%`);
                console.log(`Page ${currentPage} completed in ${Math.round((Date.now() - startTime)/1000)}s`);
                if (currentPage < TOTAL_PAGES) {
                    await sleep(PAGE_DELAY);
                }
            }
            console.log(`\nScraping complete! Processed ${totalBooksScraped}/${TOTAL_PAGES * BOOKS_PER_PAGE} books`);
            logStream.write(`Scraping completed at ${new Date().toISOString()}\n`);
        } catch (error) {
            logError(error, 'main execution');
            console.error("Fatal error:", error);
        } finally {
            await browser.close();
            logStream.end();
        }
    }
}

export default {
    startScraping
}