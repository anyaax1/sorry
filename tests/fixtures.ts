import { test as base, expect, type Page } from '@playwright/test';

// A real, two-page PDF generated for tests, containing no personal information.
export function samplePDF() {
  const stream = 'BT /F1 24 Tf 40 720 Td (CV test document) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

export const test = base.extend<{ api: { failCV: boolean; failChat: boolean; failVisits: boolean; failGuestbook: boolean; failSubmit: boolean; visits: number; chats: unknown[]; entries: { id: string; name: string; message: string; timestamp: string; formattedDate: string }[] } }>({
  api: [async ({ page }, use) => {
    const api = { failCV: false, failChat: false, failVisits: false, failGuestbook: false, failSubmit: false, visits: 0, chats: [] as unknown[], entries: [{ id: 'fixture', name: 'Test visitor', message: 'Hello from the test guestbook', timestamp: '2026-10-28', formattedDate: '10/28/2026' }] };
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const ok = (json: unknown) => route.fulfill({ json });
      const fail = () => route.fulfill({ status: 503, json: { error: 'Temporarily unavailable' } });
      if (url.pathname === '/api/log') return ok({ ok: true });
      if (url.hostname === 'api.ipify.org') return ok({ ip: '192.0.2.1' });
      if (url.pathname === '/api/cv') return api.failCV ? fail() : ok({ url: `${url.origin}/fixture.pdf` });
      if (url.pathname === '/fixture.pdf') return route.fulfill({ contentType: 'application/pdf', body: samplePDF() });
      if (url.pathname === '/api/chat') {
        api.chats.push(request.postDataJSON());
        return api.failChat ? fail() : ok({ response: 'Hello! This is the test reply.' });
      }
      if (url.pathname === '/api/guestbook') {
        if (request.method() === 'GET') return api.failGuestbook ? fail() : ok({ entries: api.entries, visitorCount: 42 });
        const body = request.postDataJSON();
        if (body.action === 'visit') { api.visits++; return api.failVisits ? fail() : ok({ visitorCount: 43 }); }
        if (api.failSubmit) return fail();
        const entry = { ...body, id: String(api.entries.length), timestamp: '2026-10-28', formattedDate: '10/28/2026' };
        api.entries.unshift(entry);
        return ok({ success: true, entry });
      }
      if (url.hostname === 'www.youtube.com') return route.fulfill({ contentType: 'text/javascript', body: '' });
      if (url.hostname !== '127.0.0.1') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"/>' });
      return route.continue();
    });
    // Pause ahead of installation time so real time between these calls cannot
    // make pauseAt attempt to move the clock backwards. The app is not loaded yet.
    await page.clock.install({ time: new Date('2026-10-28T11:00:00Z') });
    await page.clock.pauseAt(new Date('2026-10-28T12:00:00Z'));
    await use(api);
    expect(errors, 'Uncaught browser errors').toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function boot(page: Page) {
  await page.goto('/');
  await page.getByAltText('Windows 95', { exact: true }).waitFor();
  await page.clock.runFor(2100);
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
}

export async function openApp(page: Page, name: string) {
  await page.getByRole('group', { name: 'Desktop icons' }).getByRole('button', { name, exact: true }).press('Enter');
  const dialog = page.getByRole('dialog', { name, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function expectInsideViewport(page: Page) {
  const viewport = page.viewportSize()!;
  await expect.poll(async () => {
    const bounds = await page.getByRole('dialog').evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }));
    return bounds.every(b => b.x >= 0 && b.y >= 0 && b.right <= viewport.width + 1 && b.bottom <= viewport.height - 29);
  }, { message: 'All windows fit above the taskbar' }).toBe(true);
  for (const dialog of await page.getByRole('dialog').all()) {
    await expect(dialog.getByTitle('Close', { exact: true })).toBeInViewport();
  }
}
