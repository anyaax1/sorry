import { test, expect, boot, openApp, expectInsideViewport } from './fixtures';

test.describe('Windows 95: The Sorry Computer — Application Suites', () => {

  test('all five apology desktop icons exist and are visible', async ({ page }) => {
    await boot(page);
    const iconsArea = page.getByRole('group', { name: 'Desktop icons' });

    const newApps = [
      'Sorry Hotline',
      'The Court of Her Name',
      'Sorry Vending Machine',
      'Boss Fight: My Ego',
      'Sorry Is Out for Delivery',
    ];

    for (const app of newApps) {
      const icon = iconsArea.getByRole('button', { name: app, exact: true });
      await expect(icon).toBeVisible();
    }
  });

  test('all five apology applications launch from desktop shortcuts and close cleanly', async ({ page }) => {
    await boot(page);

    const apps = [
      'Sorry Hotline',
      'The Court of Her Name',
      'Sorry Vending Machine',
      'Boss Fight: My Ego',
      'Sorry Is Out for Delivery',
    ];

    for (const app of apps) {
      const dialog = await openApp(page, app);
      await expectInsideViewport(page);
      await expect(dialog).toBeVisible();

      // Close the window
      await dialog.getByTitle('Close', { exact: true }).click();
      await expect(dialog).toHaveCount(0);
    }
  });

  test('all five applications can launch from the Start Menu -> Programs', async ({ page }) => {
    await boot(page);

    const apps = [
      { name: 'Sorry Hotline', selector: 'Sorry Hotline' },
      { name: 'The Court of Her Name', selector: 'The Court of Her Name' },
      { name: 'Sorry Vending Machine', selector: 'Sorry Vending Machine' },
      { name: 'Boss Fight: My Ego', selector: 'Boss Fight: My Ego' },
      { name: 'Sorry Is Out for Delivery', selector: 'Sorry Is Out for Delivery' },
    ];

    for (const app of apps) {
      const start = page.getByRole('button', { name: 'Start', exact: true });
      await start.click();
      await page.getByRole('menuitem', { name: 'Programs', exact: true }).hover();
      const submenu = page.getByRole('menu', { name: 'Programs', exact: true });
      await expect(submenu).toBeVisible();

      await submenu.getByRole('menuitem', { name: app.selector, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: app.name, exact: true });
      await expect(dialog).toBeVisible();

      // Close the dialog
      await dialog.getByTitle('Close', { exact: true }).click();
      await expect(dialog).toHaveCount(0);
    }
  });

  test('window management: minimize, maximize, restore, and taskbar switching', async ({ page }) => {
    await boot(page);

    // Open Hotline and Court
    const hotline = await openApp(page, 'Sorry Hotline');
    const court = await openApp(page, 'The Court of Her Name');

    // Minimize Court
    await court.getByTitle('Minimize', { exact: true }).click();
    await expect(court).toBeHidden();

    // Hotline should now be active
    await expect(hotline).toBeVisible();

    // Restore Court using taskbar button
    const courtTaskbarBtn = page.getByLabel('Taskbar').getByRole('button', { name: 'The Court of Her Name', exact: true });
    await courtTaskbarBtn.click();
    await expect(court).toBeVisible();

    // Maximize Court
    await court.getByTitle('Maximize', { exact: true }).click();
    await expectInsideViewport(page);

    // Restore Court
    await court.getByTitle('Restore', { exact: true }).click();
    await expectInsideViewport(page);

    // Close both
    await court.getByTitle('Close', { exact: true }).click();
    await hotline.getByTitle('Close', { exact: true }).click();
  });

  test('Application 1: Sorry Hotline interactive keypad, calling, and IVR flow', async ({ page }) => {
    await boot(page);
    const dialog = await openApp(page, 'Sorry Hotline');

    // Press digits on keypad
    await dialog.getByRole('button', { name: 'Key 1', exact: true }).click();
    await dialog.getByRole('button', { name: 'Key 0', exact: true }).click();
    await dialog.getByRole('button', { name: 'Key 1', exact: true }).click();

    // Dialed number should appear on LCD
    await expect(dialog.getByLabel('Dialed number display')).toHaveText('101');

    // Test backspace
    await dialog.getByRole('button', { name: 'Backspace', exact: true }).click();
    await expect(dialog.getByLabel('Dialed number display')).toHaveText('10');

    // Test clear
    await dialog.getByRole('button', { name: 'Clear display', exact: true }).click();
    await expect(dialog.getByLabel('Dialed number display')).toHaveText('ENTER EXT / NUMBER');

    // Start a call
    await dialog.getByRole('button', { name: 'Key 1', exact: true }).click();
    await dialog.getByRole('button', { name: 'Start Call', exact: true }).click();

    // State changes: DIALING -> RINGING -> CONNECTED
    await page.clock.runFor(1000);
    await page.clock.runFor(2000);

    // Call should now be connected
    await expect(dialog.getByText(/● CALL/)).toBeVisible();

    // Test in-call menu options
    await dialog.getByText('My Completely Unnecessary Excuses').click();
    await expect(dialog.getByText('Excuse Archive #102: Rejected Submissions', { exact: true })).toBeVisible();

    // Test Voice player transport button
    const playBtn = dialog.getByRole('button', { name: 'Play', exact: true });
    await expect(playBtn).toBeVisible();

    // End call
    await dialog.getByRole('button', { name: 'End Call', exact: true }).click();
    await page.clock.runFor(1500);

    await dialog.getByTitle('Close', { exact: true }).click();
  });

  test('Application 2: The Court of Her Name complete judicial flow & verdict', async ({ page }) => {
    await boot(page);
    const dialog = await openApp(page, 'The Court of Her Name');

    // 1. Bang Gavel
    await dialog.getByRole('button', { name: 'Bang Gavel' }).click();
    await expect(dialog.getByRole('alert')).toBeVisible();

    // 2. Docket tab
    await expect(dialog.getByText('Official Court Docket')).toBeVisible();
    await dialog.getByText('Proceed to Review Charges ▶').click();

    // 3. Charges tab
    await expect(dialog.getByText('The Formal Accusations')).toBeVisible();
    await expect(dialog.getByText('Count 1: Failure to Understand Her Feelings')).toBeVisible();
    await dialog.getByText('Examine Prosecution Evidence ▶').click();

    // 4. Evidence exhibits
    await expect(dialog.getByRole('heading', { name: /Evidence Exhibits/ })).toBeVisible();
    await dialog.getByText('Hear Defendant\'s Confession ▶').click();

    // 5. Apology statement
    await expect(dialog.getByText('Defendant\'s Sworn Testimony & Sincere Apology')).toBeVisible();
    await dialog.getByText('Deliver Judge\'s Verdict ▶').click();

    // 6. Verdict selection
    await expect(dialog.getByText('Enter Your Verdict, Your Honor')).toBeVisible();
    await dialog.getByRole('radio', { name: /GUILTY AS CHARGED/ }).click();

    // Sentence selection
    const movieCheckbox = dialog.getByLabel(/Dedicated Movie/);
    if (!(await movieCheckbox.isChecked())) {
      await movieCheckbox.check();
    }

    // Custom sentence
    const customInput = dialog.getByPlaceholder(/Must give me foot massages/);
    await customInput.fill('Must make breakfast in bed every Sunday.');

    // Deliver verdict
    await dialog.getByRole('button', { name: 'Confirm and Deliver Verdict' }).click();

    // 7. Official decree generated
    await expect(dialog.getByText('FINAL JUDICIAL DECREE')).toBeVisible();
    await expect(dialog.getByText(/Must make breakfast in bed every Sunday/)).toBeVisible();

    // Close and reopen to verify state restoration
    await dialog.getByTitle('Close', { exact: true }).click();
    const reopened = await openApp(page, 'The Court of Her Name');
    await reopened.getByRole('tab', { name: '★ Official Judgment' }).click();
    await expect(reopened.getByText('FINAL JUDICIAL DECREE')).toBeVisible();

    await reopened.getByTitle('Close', { exact: true }).click();
  });

  test('Application 3: Sorry Vending Machine coin insertion, selection, and dispensing', async ({ page }) => {
    await boot(page);
    const dialog = await openApp(page, 'Sorry Vending Machine');

    // Insert coin
    const insertCoinBtn = dialog.getByRole('button', { name: /INSERT COIN/ });
    await insertCoinBtn.click();
    await expect(dialog.getByText(/CREDITS:/)).toBeVisible();

    // Select Product A1
    await dialog.getByText('Mini Sorry').first().click();
    await expect(dialog.getByText(/Cost: 10/)).toBeVisible();

    // Press Enter to dispense
    await dialog.getByRole('button', { name: 'ENTER' }).click();

    // Wait for mechanical drop
    await page.clock.runFor(1500);

    // Collection tray door should now indicate an item dropped
    const tray = dialog.getByRole('button', { name: /Collect Mini Sorry from tray/i });
    await expect(tray).toBeVisible();

    // Click tray to open modal card
    await tray.click();
    await expect(dialog.getByText('DISPENSED ITEM: Mini Sorry')).toBeVisible();
    await expect(dialog.getByText('MINI-SRY-101')).toBeVisible();

    // Close modal card
    await dialog.getByRole('button', { name: 'Put in Keepsake Bag' }).click();

    // Check Receipt tab
    await dialog.getByRole('button', { name: /Receipt/ }).click();
    await expect(dialog.getByText('SORRY VENDING AUTOMAT')).toBeVisible();
    await expect(dialog.getByText('1x Mini Sorry')).toBeVisible();

    // Check History tab
    await dialog.getByRole('button', { name: /History/ }).click();
    await expect(dialog.getByText('Dispensed Keepsakes & Vouchers')).toBeVisible();

    await dialog.getByTitle('Close', { exact: true }).click();
  });

  test('Application 4: Boss Fight minigame loop, controls, and attack actions', async ({ page }) => {
    await boot(page);
    const dialog = await openApp(page, 'Boss Fight: My Ego');

    // Title screen
    await expect(dialog.getByRole('heading', { name: /BOSS FIGHT: MY EGO/ })).toBeVisible();

    // Start battle
    await dialog.getByRole('button', { name: 'START BATTLE' }).click();

    // Verify canvas exists
    const canvas = dialog.getByLabel('2D Arcade Game Arena');
    await expect(canvas).toBeVisible();

    // Verify HUD elements
    await expect(dialog.getByText('Player HP:')).toBeVisible();
    await expect(dialog.getByText('Boss Ego HP:')).toBeVisible();

    // Fire Empathy attack using on-screen button
    const empathyBtn = dialog.getByRole('button', { name: /Empathy/ });
    await empathyBtn.click();

    // Fire Truth attack using on-screen button
    const truthBtn = dialog.getByRole('button', { name: /Truth/ });
    await truthBtn.click();

    // Test pause
    const pauseBtn = dialog.getByRole('button', { name: '⏸' });
    await pauseBtn.click();
    await expect(dialog.getByText('GAME PAUSED')).toBeVisible();

    // Resume
    await dialog.getByRole('button', { name: 'RESUME BATTLE' }).click();

    await dialog.getByTitle('Close', { exact: true }).click();
  });

  test('Application 5: Sorry Is Out for Delivery tracking progression and acceptance', async ({ page }) => {
    await boot(page);
    const dialog = await openApp(page, 'Sorry Is Out for Delivery');

    // Initial stage
    await expect(dialog.getByText('Apology Order Placed', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Step 1 of 7')).toBeVisible();

    // Advance stages up to 7 (Delivered)
    const advanceBtn = dialog.getByRole('button', { name: 'Advance Stage ▶' });
    for (let step = 1; step < 7; step++) {
      await advanceBtn.click();
    }

    // Step 7: Delivered!
    await expect(dialog.getByText('Step 7 of 7')).toBeVisible();
    await expect(dialog.getByText('DELIVERED (Doorbell Rang!)')).toBeVisible();

    // Delivered parcel letter should be visible
    await expect(dialog.getByText('Formal Delivery Note & Apology Letter')).toBeVisible();

    // Fill signature and accept
    const signInput = dialog.getByPlaceholder(/Type your name/);
    await signInput.fill('Sweetheart');
    await dialog.getByRole('button', { name: 'Accept Apology' }).click();

    // Acceptance badge appears
    await expect(dialog.getByText('APOLOGY OFFICIALLY ACCEPTED!')).toBeVisible();
    await expect(dialog.getByText(/Signed by: Sweetheart/)).toBeVisible();

    // Close and reopen to verify persistence
    await dialog.getByTitle('Close', { exact: true }).click();
    const reopened = await openApp(page, 'Sorry Is Out for Delivery');
    await expect(reopened.getByText('APOLOGY OFFICIALLY ACCEPTED!')).toBeVisible();

    await reopened.getByTitle('Close', { exact: true }).click();
  });

  test('coexistence: all five applications can remain open simultaneously', async ({ page }) => {
    await boot(page);

    const apps = [
      'Sorry Hotline',
      'The Court of Her Name',
      'Sorry Vending Machine',
      'Boss Fight: My Ego',
      'Sorry Is Out for Delivery',
    ];

    // Open all 5
    for (const app of apps) {
      await openApp(page, app);
    }

    // Verify all 5 dialogs are mounted
    for (const app of apps) {
      await expect(page.getByRole('dialog', { name: app, exact: true })).toBeVisible();
    }

    // Taskbar should contain all 5 window buttons
    for (const app of apps) {
      await expect(page.getByLabel('Taskbar').getByRole('button', { name: app, exact: true })).toBeVisible();
    }

    // Close all 5 (in reverse order so top windows don't block bottom windows on narrow viewports)
    for (const app of [...apps].reverse()) {
      const dialog = page.getByRole('dialog', { name: app, exact: true });
      await dialog.getByTitle('Close', { exact: true }).click();
      await expect(dialog).toHaveCount(0);
    }
  });

});
