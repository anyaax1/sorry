import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('tests/screenshots');
const brainDir = 'C:\\Users\\devuu\\.gemini\\antigravity\\brain\\2cb85326-a435-4e0f-9c61-f4c6781530b3';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch();

  // Desktop Viewport (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5177');
  
  // Wait for boot screen to finish (2.2 seconds)
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Start', exact: true }).waitFor({ state: 'visible' });

  // 1. Desktop with custom wallpaper & all 5 icons
  await page.screenshot({ path: path.join(outDir, '01_desktop_overview.png') });
  console.log('✓ 01_desktop_overview.png');

  // 2. Start Menu open
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole('menuitem', { name: 'Programs', exact: true }).hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '02_start_menu_programs.png') });
  console.log('✓ 02_start_menu_programs.png');
  await page.getByRole('button', { name: 'Start', exact: true }).click(); // close

  // Helper to open app via icon
  const openApp = async (name) => {
    const icon = page.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name, exact: true });
    await icon.press('Enter');
    const dialog = page.getByRole('dialog', { name, exact: true });
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  };

  // 3. Sorry Hotline open & call connected
  const hotline = await openApp('Sorry Hotline');
  await hotline.getByRole('button', { name: 'Key 1', exact: true }).click();
  await hotline.getByRole('button', { name: 'Start Call', exact: true }).click();
  await page.waitForTimeout(3000); // wait for dialing + ringing + connect
  await page.screenshot({ path: path.join(outDir, '03_sorry_hotline_connected.png') });
  console.log('✓ 03_sorry_hotline_connected.png');
  await hotline.getByTitle('Close', { exact: true }).click();

  // 4. The Court of Her Name
  const court = await openApp('The Court of Her Name');
  await court.getByRole('button', { name: 'Bang Gavel' }).click();
  await page.waitForTimeout(400);
  await court.getByRole('tab', { name: /The Charges/i }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '04_court_charges.png') });
  console.log('✓ 04_court_charges.png');
  await court.getByTitle('Close', { exact: true }).click();

  // 5. Sorry Vending Machine
  const vending = await openApp('Sorry Vending Machine');
  await vending.getByRole('button', { name: /INSERT COIN/i }).click();
  await vending.getByRole('button', { name: /INSERT COIN/i }).click();
  await vending.getByText('Mini Sorry').first().click();
  await vending.getByRole('button', { name: 'ENTER' }).click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, '05_vending_machine_active.png') });
  console.log('✓ 05_vending_machine_active.png');
  await vending.getByTitle('Close', { exact: true }).click();

  // 6. Boss Fight: My Ego
  const boss = await openApp('Boss Fight: My Ego');
  await page.screenshot({ path: path.join(outDir, '06_boss_fight_title.png') });
  console.log('✓ 06_boss_fight_title.png');
  await boss.getByRole('button', { name: /START BATTLE/i }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '06_boss_fight_battle.png') });
  console.log('✓ 06_boss_fight_battle.png');
  await boss.getByTitle('Close', { exact: true }).click();

  // 7. Sorry Is Out for Delivery
  const delivery = await openApp('Sorry Is Out for Delivery');
  await delivery.getByRole('button', { name: /Advance Stage/i }).click();
  await delivery.getByRole('button', { name: /Advance Stage/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '07_delivery_tracking.png') });
  console.log('✓ 07_delivery_tracking.png');
  await delivery.getByTitle('Close', { exact: true }).click();

  // 8. Coexistence (All 5 open at once)
  await openApp('Sorry Hotline');
  await openApp('The Court of Her Name');
  await openApp('Sorry Vending Machine');
  await openApp('Boss Fight: My Ego');
  await openApp('Sorry Is Out for Delivery');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '08_multitasking_coexistence.png') });
  console.log('✓ 08_multitasking_coexistence.png');

  // 9. Mobile Viewport (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await mobilePage.goto('http://127.0.0.1:5177');
  await mobilePage.waitForTimeout(2500);
  await mobilePage.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name: 'Sorry Hotline', exact: true }).click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, '09_mobile_layout.png') });
  console.log('✓ 09_mobile_layout.png');

  await browser.close();

  // Copy screenshots to brain artifact folder
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(outDir, f), path.join(brainDir, f));
    }
  }

  console.log(`Captured and copied ${files.length} screenshots successfully.`);
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
