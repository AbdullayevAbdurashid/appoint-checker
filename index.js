const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api'); // Assuming you have TelegramBot installed

// Replace with your Telegram bot token
const telegramToken = '6051605197:AAGsf2rHujh_8W8GAEayNSRnyliGnNFH18A';
const bot = new TelegramBot(telegramToken);
const userIds = ["1215214465"];
function sendMessageToAllUsers(message) {
  userIds.forEach(async (userId) => {
    try {
      await bot.sendMessage(userId, message);
    } catch (error) {
      console.error(`Failed to send message to ${userId}:`, error);
    }
  });
}

// Function to add a delay
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAppointmentAvailability() {
  try {
    const browser = await puppeteer.launch({ headless: true }); // Set headless to false for debugging
    const page = await browser.newPage();
    await page.goto('https://appointment.bmeia.gv.at/');

    // Wait for the page to load and elements to become available
    await page.waitForSelector('#Office');
    
    // Select "Maskau" from the dropdown
    await page.select('#Office', 'MOSKAU'); 
    await delay(500); // Wait for 2 seconds

    await page.click('input[name="Command"]');
    await delay(500); // Wait for 2 seconds

    await page.waitForSelector('#CalendarId');
    await page.select('#CalendarId', '40044915');
    await delay(500); // Wait for 2 seconds

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
    if (errorMessage.includes('К сожалению, на выбранное Вами время на данный момент невозможно записаться')) {
      sendMessageToAllUsers('Just checked for appointments. There is not a single one :(');
    } else {
      sendMessageToAllUsers('Appointments are available! Finally, check the website for details.');
    }

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAppointmentAvailability();
