import { test, expect } from '@playwright/test';
import { fitWindow, resizeWindow } from '../src/components/Windows/geometry';

test('an oversized window keeps its controls and taskbar inside a phone viewport', () => {
  expect(fitWindow({ x: 100, y: 50, width: 650, height: 500 }, { width: 390, height: 390 }))
    .toEqual({ x: 0, y: 0, width: 390, height: 360 });
});

test('restoring an old desktop position after rotation stays visible', () => {
  expect(fitWindow({ x: 1100, y: 500, width: 300, height: 450 }, { width: 390, height: 844 }))
    .toEqual({ x: 90, y: 364, width: 300, height: 450 });
});

test('resizing from each edge preserves the opposite edge and viewport limits', () => {
  const initial = { x: 100, y: 50, width: 400, height: 300 };
  const viewport = { width: 800, height: 600 };
  expect(resizeWindow(initial, 'nw', -1000, -1000, viewport)).toEqual({ x: 0, y: 0, width: 500, height: 350 });
  expect(resizeWindow(initial, 'se', 1000, 1000, viewport)).toEqual({ x: 100, y: 50, width: 700, height: 520 });
  expect(resizeWindow(initial, 'nw', 1000, 1000, viewport)).toEqual({ x: 300, y: 200, width: 200, height: 150 });
});
