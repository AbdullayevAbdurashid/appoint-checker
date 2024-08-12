const puppeteer = require('puppeteer');
// const TelegramBot = require('node-telegram-bot-api'); // Assuming you have TelegramBot installed

// Replace with your Telegram bot token
const telegramToken = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_USER_ID = 'YOUR_TELEGRAM_USER_ID'; // Replace with your Telegram user ID

// Function to add a delay
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAppointmentAvailability() {
  try {
    const browser = await puppeteer.launch({ headless: false }); // Set headless to false for debugging
    const page = await browser.newPage();
    await page.goto('https://appointment.bmeia.gv.at/');

    // Wait for the page to load and elements to become available
    await page.waitForSelector('#Office');
    
    // Select "Maskau" from the dropdown
    await page.select('#Office', 'MOSKAU'); 
    await delay(1000); // Wait for 2 seconds

    await page.click('input[name="Command"]');
    await delay(1000); // Wait for 2 seconds

    await page.waitForSelector('#CalendarId');
    await page.select('#CalendarId', '40044915');
    await delay(1000); // Wait for 2 seconds

    await page.click('input[name="Command"]');
    await delay(2000); // Wait for 2 seconds

    await page.waitForSelector('input[name="Command"]');
    await page.click('input[value="дальше"]');
    await delay(2000); // Wait for 2 seconds

    await page.waitForSelector('input[name="Command"]');
    await page.click('input[value="дальше"]');
    await delay(2000); // Wait for 2 seconds


    // Wait for the response to load

    const errorMessage = await page.evaluate(() => {
      const errorElement = document.querySelector('.message-error');
      return errorElement ? errorElement.textContent.trim() : '';
    });

    if (errorMessage.includes('К сожалению, на выбранное Вами время на данный момент невозможно записаться    ')) {
      console.log('No appointments available.');
    } else {
      // Send notification via Telegram bot if appointments are available
      // const bot = new TelegramBot(telegramToken);
      // await bot.sendMessage(TELEGRAM_USER_ID, 'Appointments are available! Check the website for details.'); // Replace with your user ID
    }

    // await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAppointmentAvailability();
