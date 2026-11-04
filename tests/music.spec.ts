import { test, expect, boot, openApp } from './fixtures';

test('music advances from the current track, follows mute and disposes its player', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { created: 0, destroyed: 0, muted: false, loaded: [] as string[], finish: () => {} };
    const host = window as unknown as { musicTest: typeof state; YT: unknown };
    host.musicTest = state;
    class Player {
      events: { onReady: (event: { target: Player }) => void; onStateChange: (event: { target: Player; data: number }) => void };
      constructor(_target: HTMLElement, options: { events: Player['events'] }) {
        state.created++;
        this.events = options.events;
        state.finish = () => this.events.onStateChange({ target: this, data: 0 });
        queueMicrotask(() => this.events.onReady({ target: this }));
      }
      setVolume() {}
      mute() { state.muted = true; }
      unMute() { state.muted = false; }
      playVideo() { this.events.onStateChange({ target: this, data: 1 }); }
      pauseVideo() { this.events.onStateChange({ target: this, data: 2 }); }
      stopVideo() { this.events.onStateChange({ target: this, data: 2 }); }
      getCurrentTime() { return 10; }
      getDuration() { return 180; }
      seekTo() {}
      loadVideoById({ videoId }: { videoId: string }) { state.loaded.push(videoId); this.playVideo(); }
      destroy() { state.destroyed++; }
    }
    host.YT = { Player, PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 } };
  });
  await boot(page);
  const dialog = await openApp(page, "Fonchi's Homepage");
  await page.clock.runFor(2100);
  const next = dialog.getByTitle('Next', { exact: true });
  await next.click();
  await next.click();
  await page.evaluate(() => (window as unknown as { musicTest: { finish: () => void } }).musicTest.finish());
  await expect.poll(() => page.evaluate(() => (window as unknown as { musicTest: { loaded: string[] } }).musicTest.loaded)).toEqual(['2GIOuEBrXII', 'bKPwNhPiYJ4', 'O4irXQhgMqg']);
  await page.getByTitle('Click to mute', { exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { musicTest: { muted: boolean } }).musicTest.muted)).toBe(true);
  await dialog.getByTitle('Close', { exact: true }).click();
  const counts = await page.evaluate(() => {
    const { created, destroyed } = (window as unknown as { musicTest: { created: number; destroyed: number } }).musicTest;
    return { created, destroyed };
  });
  expect(counts.created).toBeGreaterThan(0);
  expect(counts.created).toBe(counts.destroyed);
});
