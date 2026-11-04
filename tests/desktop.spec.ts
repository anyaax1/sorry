import { test, expect, boot, openApp, expectInsideViewport } from './fixtures';

test('boot artwork fits and all desktop icons remain visible', async ({ page }, info) => {
  await page.goto('/');
  const image = page.getByAltText('Windows 95', { exact: true });
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS('object-fit', 'contain');
  await page.screenshot({ path: info.outputPath('boot.png') });
  await page.clock.runFor(2100);
  for (const name of ['My Computer', 'Recycle Bin', 'CV.doc', "Fonchi's Homepage", 'Minesweeper', 'ICQ']) {
    await expect(page.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name, exact: true })).toBeInViewport();
  }
  await page.screenshot({ path: info.outputPath('desktop.png') });
});

test('every application opens within the viewport and closes', async ({ page }, info) => {
  await boot(page);
  for (const name of ['My Computer', 'Recycle Bin', 'CV.doc', "Fonchi's Homepage", 'Minesweeper', 'ICQ']) {
    const dialog = await openApp(page, name);
    await expectInsideViewport(page);
    if (name === "Fonchi's Homepage") {
      await page.clock.runFor(2100);
      await expect(dialog.getByText('Greetings, fellow Netizen!')).toBeVisible();
      await page.screenshot({ path: info.outputPath('homepage.png') });
    }
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
  const dialog = await openApp(page, 'Minesweeper');
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
});

test('CV renders with the bundled worker, fits, paginates and retries failures', async ({ page, api }, info) => {
  api.failCV = true;
  await boot(page);
  await page.clock.resume();
  const dialog = await openApp(page, 'CV.doc');
  await expect(dialog.getByRole('alert')).toContainText('Failed to load CV');
  api.failCV = false;
  await dialog.getByRole('button', { name: 'Retry' }).click();
  await expect(dialog.getByText('of 2', { exact: true })).toBeVisible();
  await page.clock.resume();
  await expect(dialog.locator('canvas')).toBeVisible();
  const canvas = (await dialog.locator('canvas').boundingBox())!;
  const windowBounds = (await dialog.boundingBox())!;
  expect(canvas.x).toBeGreaterThanOrEqual(windowBounds.x);
  expect(canvas.x + canvas.width).toBeLessThanOrEqual(windowBounds.x + windowBounds.width);
  await dialog.getByTitle('Next Page', { exact: true }).click();
  await expect(dialog.getByLabel('Current page')).toHaveValue('2');
  await dialog.getByTitle('Previous Page', { exact: true }).click();
  await expect(dialog.getByLabel('Current page')).toHaveValue('1');
  await dialog.getByTitle('Zoom In', { exact: true }).click();
  await expect(dialog.getByText('110%', { exact: true })).toBeVisible();
  await dialog.getByTitle('Zoom Out', { exact: true }).click();
  await expect(dialog.getByTitle('Save', { exact: true })).toHaveAttribute('href', /fixture.pdf$/);
  // Wait for the final zoom render, and verify actual PDF ink, not an empty canvas.
  await expect(dialog.locator('canvas')).toBeVisible();
  await expect.poll(() => dialog.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0 && pixels[i] < 100 && pixels[i + 1] < 100 && pixels[i + 2] < 100) return true;
    }
    return false;
  }), { message: 'PDF text is painted on the canvas' }).toBe(true);
  await page.screenshot({ path: info.outputPath('cv.png') });
});

test('ICQ sends history, recovers from failure and does not duplicate on welcome timer', async ({ page, api }) => {
  await boot(page);
  const dialog = await openApp(page, 'ICQ');
  await dialog.getByRole('button', { name: /Alfonso/ }).click();
  const input = dialog.getByRole('textbox', { name: 'Message Alfonso' });
  // Sending immediately must not be overwritten by the delayed greeting.
  await input.fill('Hello');
  await input.press('Enter');
  await expect(dialog.getByText('Hello! This is the test reply.', { exact: true })).toBeVisible();
  await page.clock.runFor(20000);
  await expect(page.getByRole('dialog', { name: 'ICQ', exact: true })).toHaveCount(1);
  await expect(dialog.getByText('Hello', { exact: true })).toBeVisible();
  api.failChat = true;
  await input.fill('Second message');
  await input.press('Enter');
  await expect(dialog.getByText(/Oops! Connection lost/)).toBeVisible();
  await expect(input).toBeEnabled();
  expect(api.chats).toEqual([
    { message: 'Hello', history: [] },
    { message: 'Second message', history: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hello! This is the test reply.' }] },
  ]);
});

test('guestbook loads despite visit failure, validates, submits and handles rejection', async ({ page, api }) => {
  api.failVisits = true;
  await boot(page);
  const dialog = await openApp(page, "Fonchi's Homepage");
  await page.clock.runFor(2100);
  await expect(dialog.getByText('Hello from the test guestbook', { exact: true })).toBeAttached();
  const sign = dialog.getByRole('button', { name: /Sign My Guestbook/ });
  await sign.click();
  await dialog.getByRole('button', { name: /Submit Entry/ }).click();
  await expect(dialog.getByText(/Use at least 2 characters/)).toBeVisible();
  await dialog.getByLabel('Your Name:').fill('GUI Test');
  await dialog.getByLabel('Message:', { exact: true }).fill('A test entry, never sent to production.');
  api.failSubmit = true;
  await dialog.getByRole('button', { name: /Submit Entry/ }).click();
  await expect(dialog.getByText('Temporarily unavailable', { exact: true })).toBeVisible();
  api.failSubmit = false;
  await dialog.getByRole('button', { name: /Submit Entry/ }).click();
  await expect(dialog.getByText('A test entry, never sent to production.', { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Thanks for signing/)).toBeVisible();
});

test('homepage refresh counts one visit and guestbook failure is visible', async ({ page, api }) => {
  await boot(page);
  const dialog = await openApp(page, "Fonchi's Homepage");
  await page.clock.runFor(2100);
  await expect.poll(() => api.visits).toBe(1);
  await expect(dialog.getByText('Hello from the test guestbook', { exact: true })).toBeAttached();
  api.failGuestbook = true;
  await dialog.getByTitle('Refresh', { exact: true }).click();
  await page.clock.runFor(1100);
  await expect(dialog.getByRole('alert')).toContainText('Could not load guestbook');
  expect(api.visits).toBe(1);
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
    await page.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name: 'ICQ', exact: true }).tap();
    await expect(page.getByRole('dialog', { name: 'ICQ', exact: true })).toBeVisible();
  }
  await page.getByTitle('Click to mute', { exact: true }).click();
  await expect(page.getByTitle('Click to unmute', { exact: true })).toBeVisible();
  await boot(page);
  await expect(page.getByTitle('Click to unmute', { exact: true })).toBeVisible();
});
