import { test, expect, boot, openApp, expectInsideViewport } from './fixtures';

const DESKTOP_APPS = [
  'My Computer',
  'Recycle Bin',
  'Sorry Hotline',
  'The Court of Her Name',
  'Sorry Vending Machine',
  'Boss Fight: My Ego',
  'Sorry Is Out for Delivery',
];

test('boot artwork fits and all desktop icons remain visible', async ({ page }, info) => {
  await page.goto('/');
  const image = page.getByAltText('Windows 95', { exact: true });
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS('object-fit', 'contain');
  await page.screenshot({ path: info.outputPath('boot.png') });
  await page.clock.runFor(2100);
  for (const name of DESKTOP_APPS) {
    await expect(page.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name, exact: true })).toBeInViewport();
  }
  await page.screenshot({ path: info.outputPath('desktop.png') });
});

test('every primary desktop application opens within the viewport and closes', async ({ page }) => {
  await boot(page);
  for (const name of DESKTOP_APPS) {
    const dialog = await openApp(page, name);
    await expectInsideViewport(page);
    await dialog.getByTitle('Close', { exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test('maximize, rotate, restore, drag and resize keep controls reachable', async ({ page }) => {
  await boot(page);
  const dialog = await openApp(page, 'My Computer');
  await dialog.getByTitle('Maximize', { exact: true }).click();
  await expectInsideViewport(page);
  await page.setViewportSize({ width: 320, height: 390 });
  await page.clock.runFor(50);
  await expectInsideViewport(page);
  await dialog.getByTitle('Restore', { exact: true }).click();
  await expectInsideViewport(page);
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.clock.runFor(50);
  const bounds = (await dialog.boundingBox())!;
  await page.mouse.move(bounds.x + 50, bounds.y + 10);
  await page.mouse.down();
  await page.mouse.move(950, 650, { steps: 5 });
  await page.mouse.up();
  await expectInsideViewport(page);
  const moved = (await dialog.boundingBox())!;
  expect(moved.x).toBeGreaterThan(bounds.x);
  await page.mouse.move(moved.x + moved.width, moved.y + moved.height);
  await page.mouse.down();
  await page.mouse.move(999, 699, { steps: 5 });
  await page.mouse.up();
  await expectInsideViewport(page);
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeInViewport();
});

test('minimizing preserves Minesweeper and the taskbar restores it', async ({ page }) => {
  await boot(page);
  // Launch Minesweeper from Start Menu -> Programs
  const start = page.getByRole('button', { name: 'Start', exact: true });
  await start.click();
  await page.getByRole('menuitem', { name: 'Programs', exact: true }).hover();
  const submenu = page.getByRole('menu', { name: 'Programs', exact: true });
  await submenu.getByRole('menuitem', { name: 'Minesweeper', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'Minesweeper', exact: true });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Row 1, column 1', exact: true }).click({ button: 'right' });
  await expect(dialog.getByText('009', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Row 5, column 5', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Row 5, column 5, revealed', exact: true })).toBeVisible();
  await dialog.getByTitle('Minimize', { exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.locator('[aria-label="Taskbar"]').getByRole('button', { name: 'Minesweeper', exact: true }).click();
  await expect(dialog.getByText('009', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Row 5, column 5, revealed', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'New game' }).click();
  await expect(dialog.getByText('010', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Row 5, column 5', exact: true })).toBeVisible();
  await dialog.getByTitle('Close', { exact: true }).click();
});

test('Start menu works by keyboard and touch without clipping the Programs list', async ({ page }) => {
  await boot(page);
  const start = page.getByRole('button', { name: 'Start', exact: true });
  await start.press('Enter');
  await page.getByRole('menuitem', { name: 'Programs', exact: true }).press('Enter');
  const submenu = page.getByRole('menu', { name: 'Programs', exact: true });
  const rect = (await submenu.boundingBox())!;
  expect(rect.x + rect.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await submenu.getByRole('menuitem', { name: 'Minesweeper', exact: true }).press('Enter');
  await expect(page.getByRole('dialog', { name: 'Minesweeper', exact: true })).toBeVisible();
  await start.press('Enter');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', { name: 'Start menu' })).toBeHidden();
});

test('touch opens desktop icons and mute survives reload', async ({ page }, info) => {
  await boot(page);
  if (info.project.use.hasTouch) {
    await page.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name: 'Sorry Hotline', exact: true }).tap();
    await expect(page.getByRole('dialog', { name: 'Sorry Hotline', exact: true })).toBeVisible();
    await page.getByRole('dialog', { name: 'Sorry Hotline', exact: true }).getByTitle('Close', { exact: true }).click();
  }
  await page.getByTitle('Click to mute', { exact: true }).click();
  await expect(page.getByTitle('Click to unmute', { exact: true })).toBeVisible();
  await boot(page);
  await expect(page.getByTitle('Click to unmute', { exact: true })).toBeVisible();
});
