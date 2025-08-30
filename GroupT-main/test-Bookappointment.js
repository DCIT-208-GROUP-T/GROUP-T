const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file:///c:/Users/iamju/OneDrive/Desktop/Alex-Lawconnect/Bookappointment.html');

    // Step 1: Fill in case details
    await page.select('#case-type', 'Family Law');
    await page.type('#description', 'Need legal advice on family matters.');
    await page.click('#step1-next');

    // Step 2: Choose Lawyer
    await page.waitForSelector('#lawyer-grid', { timeout: 20000 }); // Wait for the lawyer grid to load
    await page.waitForSelector('#lawyer-grid');
    const lawyers = await page.$$('.lawyer-card');
    if (lawyers.length > 0) {
        await lawyers[0].click(); // Select the first lawyer
    }
    await page.click('#step2-next');

    // Step 3: Schedule Appointment
    await page.click('.calendar-day.available'); // Click on the first available day
    await page.click('#step3-next');

    // Step 4: Confirm Appointment
    await page.click('#book-appointment-btn');

    // Check for success message
    const successMessage = await page.$('#success-message');
    if (successMessage) {
        console.log('Appointment booked successfully!');
    } else {
        console.log('Failed to book appointment.');
    }

    await browser.close();
})();
