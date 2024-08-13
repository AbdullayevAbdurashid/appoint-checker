const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');

// Replace with your Telegram bot token
const telegramToken = '6051605197:AAGsf2rHujh_8W8GAEayNSRnyliGnNFH18A';
const bot = new TelegramBot(telegramToken);
const userIds = ["1215214465"];

async function sendMessageToAllUsers(message) {
  for (const userId of userIds) {
    try {
      await bot.sendMessage(userId, message);
    } catch (error) {
      console.error(`Failed to send message to ${userId}:`, error);
    }
  }
}

async function sendPhotoToAllUsers(photoPath, caption) {
  for (const userId of userIds) {
    try {
      await bot.sendPhoto(userId, photoPath, { caption });
    } catch (error) {
      console.error(`Failed to send photo to ${userId}:`, error);
    }
  }
}

// Function to add a delay
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAppointmentAvailability() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://appointment.bmeia.gv.at/');

    // Set language to Russian
    await page.waitForSelector('#Language');
    await page.select('#Language', 'ru');
    await page.click('input[name="Command"]');
    await delay(1000);

    // Proceed with the rest of the form interaction

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
    await delay(500); // Wait for 2 seconds

    await page.waitForSelector('input[name="Command"]');
    await page.click('input[value="дальше"]');
    await delay(1000); // 

    // Check if the table with class 'no-border' exists
    const errorMessage = await page.evaluate(() => {
      const errorElement = document.querySelector('.message-error');
      return errorElement ? errorElement.textContent.trim() : '';
    });

    if (errorMessage.includes('К сожалению, на выбранное Вами время на данный момент невозможно записаться')) {
      await sendMessageToAllUsers('Just checked for appointments. There is not a single one :(');
    } else {
      await sendMessageToAllUsers('Appointments are available! Finally, check the website for details.');
    }

    const screenshotPath = 'debug_screenshot.png';
    await page.screenshot({ path: screenshotPath });

    // Send the screenshot
    await sendPhotoToAllUsers(screenshotPath, 'Here is the latest screenshot from the appointment check.');

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAppointmentAvailability();
