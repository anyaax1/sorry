export const TASKBAR_HEIGHT = 30;

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export function fitWindow(bounds: WindowBounds, viewport: Viewport): WindowBounds {
  const width = Math.min(bounds.width, viewport.width);
  const height = Math.min(bounds.height, Math.max(0, viewport.height - TASKBAR_HEIGHT));
  return {
    width,
    height,
    x: Math.max(0, Math.min(bounds.x, viewport.width - width)),
    y: Math.max(0, Math.min(bounds.y, viewport.height - TASKBAR_HEIGHT - height)),
  };
}

export function resizeWindow(bounds: WindowBounds, direction: string, dx: number, dy: number, viewport: Viewport): WindowBounds {
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;
  const minWidth = Math.min(200, viewport.width);
  const minHeight = Math.min(150, viewport.height - TASKBAR_HEIGHT);
  const next = { ...bounds };
  if (direction.includes('e')) next.width = Math.max(minWidth, Math.min(bounds.width + dx, viewport.width - bounds.x));
  if (direction.includes('s')) next.height = Math.max(minHeight, Math.min(bounds.height + dy, viewport.height - TASKBAR_HEIGHT - bounds.y));
  if (direction.includes('w')) {
    next.x = Math.max(0, Math.min(bounds.x + dx, right - minWidth));
    next.width = right - next.x;
  }
  if (direction.includes('n')) {
    next.y = Math.max(0, Math.min(bounds.y + dy, bottom - minHeight));
    next.height = bottom - next.y;
  }
  return fitWindow(next, viewport);
}
