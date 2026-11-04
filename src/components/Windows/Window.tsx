import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fitWindow, resizeWindow, TASKBAR_HEIGHT } from './geometry';

export interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  isActive: boolean;
  isMinimized: boolean;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  zIndex: number;
  children?: React.ReactNode;
  showMenuBar?: boolean;
  showStatusBar?: boolean;
  statusText?: string;
  resizable?: boolean;
  noPadding?: boolean;
}

const Window = ({
  id,
  title,
  icon,
  isActive,
  isMinimized,
  initialPosition = { x: 100, y: 50 },
  initialSize = { width: 400, height: 300 },
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  children,
  showMenuBar = true,
  showStatusBar = true,
  statusText = '',
  resizable = true,
  noPadding = false,
}: WindowProps) => {
  const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });
  const [bounds, setBounds] = useState(() => fitWindow({ ...initialPosition, ...initialSize }, viewport()));
  const position = { x: bounds.x, y: bounds.y };
  const size = { width: bounds.width, height: bounds.height };
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ pointerX: 0, pointerY: 0, ...bounds });
  const windowRef = useRef<HTMLDivElement>(null);
  const restoreBounds = useRef(bounds);

  // Keep window within viewport on resize
  useEffect(() => {
    const handleWindowResize = () => {
      setBounds(prev => isMaximized
        ? { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT }
        : fitWindow(prev, viewport()));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [isMaximized]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && !isMaximized) {
        setBounds(prev => fitWindow({ ...prev, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }, viewport()));
      }
      if (isResizing && !isMaximized) {
        setBounds(resizeWindow(resizeStart, resizeDirection, e.clientX - resizeStart.pointerX, e.clientY - resizeStart.pointerY, viewport()));
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeDirection, isMaximized]);

  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (e.button !== 0 || target.closest('button')) return;
    onFocus(id);
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setBounds(fitWindow(restoreBounds.current, viewport()));
    } else {
      restoreBounds.current = bounds;
      setBounds({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT });
    }
    setIsMaximized(!isMaximized);
  };

  const handleResizeStart = (direction: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(id);
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      pointerX: e.clientX,
      pointerY: e.clientY,
      ...bounds,
    });
  };

  return (
    <WindowContainer
      ref={windowRef}
      role="dialog"
      aria-label={title}
      data-window-id={id}
      aria-hidden={isMinimized}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        display: isMinimized ? 'none' : 'flex',
      }}
      onPointerDown={() => onFocus(id)}
    >
      {/* Title Bar */}
      <TitleBar $isActive={isActive} onPointerDown={handleHeaderPointerDown} onDoubleClick={handleMaximize}>
        <TitleBarLeft>
          {icon && <TitleBarIcon src={icon} alt="" />}
          <TitleBarText>{title}</TitleBarText>
        </TitleBarLeft>
        <TitleBarButtons onDoubleClick={e => e.stopPropagation()}>
          <TitleButton onClick={() => onMinimize(id)} title="Minimize">
            <MinimizeSvg />
          </TitleButton>
          <TitleButton onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            <MaximizeSvg />
          </TitleButton>
          <TitleButton onClick={() => onClose(id)} title="Close">
            <CloseSvg />
          </TitleButton>
        </TitleBarButtons>
      </TitleBar>

      {/* Menu Bar */}
      {showMenuBar && (
        <MenuBar>
          <MenuItem>File</MenuItem>
          <MenuItem>Edit</MenuItem>
          <MenuItem>View</MenuItem>
          <MenuItem>Help</MenuItem>
        </MenuBar>
      )}

      {/* Content */}
      <WindowContent $noPadding={noPadding}>{children}</WindowContent>

      {/* Status Bar */}
      {showStatusBar && (
        <StatusBar>
          <StatusText>{statusText}</StatusText>
        </StatusBar>
      )}

      {/* Resize Handles */}
      {resizable && !isMaximized && (
        <>
          <ResizeHandle $direction="n" onPointerDown={handleResizeStart('n')} />
          <ResizeHandle $direction="s" onPointerDown={handleResizeStart('s')} />
          <ResizeHandle $direction="e" onPointerDown={handleResizeStart('e')} />
          <ResizeHandle $direction="w" onPointerDown={handleResizeStart('w')} />
          <ResizeHandle $direction="ne" onPointerDown={handleResizeStart('ne')} />
          <ResizeHandle $direction="nw" onPointerDown={handleResizeStart('nw')} />
          <ResizeHandle $direction="se" onPointerDown={handleResizeStart('se')} />
          <ResizeHandle $direction="sw" onPointerDown={handleResizeStart('sw')} />
        </>
      )}
    </WindowContainer>
  );
};

// SVG Icons for buttons
const MinimizeSvg = () => (
  <svg width="8" height="7" viewBox="0 0 8 7">
    <rect x="0" y="5" width="6" height="2" fill="black" />
  </svg>
);

const MaximizeSvg = () => (
  <svg width="9" height="9" viewBox="0 0 9 9">
    <rect x="0" y="0" width="9" height="9" fill="none" stroke="black" strokeWidth="1" />
    <rect x="0" y="0" width="9" height="2" fill="black" />
  </svg>
);

const CloseSvg = () => (
  <svg width="8" height="7" viewBox="0 0 8 7">
    <line x1="0" y1="0" x2="8" y2="7" stroke="black" strokeWidth="1.5" />
    <line x1="8" y1="0" x2="0" y2="7" stroke="black" strokeWidth="1.5" />
  </svg>
);

const WindowContainer = styled.div`
  position: absolute;
  background-color: #c0c0c0;
  border: 2px solid;
  border-top-color: #dfdfdf;
  border-left-color: #dfdfdf;
  border-right-color: #404040;
  border-bottom-color: #404040;
  box-shadow: 1px 1px 0 #000;
  display: flex;
  flex-direction: column;
`;

const TitleBar = styled.div<{ $isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 18px;
  flex-shrink: 0;
  touch-action: none;
  padding: 2px 2px 2px 3px;
  background: ${props => props.$isActive
    ? 'linear-gradient(90deg, #000080, #1084d0)'
    : 'linear-gradient(90deg, #808080, #b0b0b0)'};
  cursor: move;
  user-select: none;
`;

const TitleBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const TitleBarIcon = styled.img`
  width: 14px;
  height: 14px;
  image-rendering: pixelated;
`;

const TitleBarText = styled.span`
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TitleBarButtons = styled.div`
  display: flex;
  gap: 2px;
`;

const TitleButton = styled.button`
  width: 16px;
  height: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #c0c0c0;
  border: none;
  outline: none;
  cursor: pointer;
  box-shadow:
    inset -1px -1px 0 #404040,
    inset 1px 1px 0 #fff,
    inset -2px -2px 0 #808080,
    inset 2px 2px 0 #dfdfdf;

  &:active {
    box-shadow:
      inset 1px 1px 0 #404040,
      inset -1px -1px 0 #fff,
      inset 2px 2px 0 #808080,
      inset -2px -2px 0 #dfdfdf;
    padding-top: 1px;
    padding-left: 1px;
  }
`;

const MenuBar = styled.div`
  display: flex;
  background-color: #c0c0c0;
  padding: 2px 0;
  border-bottom: 1px solid #808080;
`;

const MenuItem = styled.span`
  padding: 2px 8px;
  font-size: 11px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  cursor: pointer;

  &:hover {
    background-color: #000080;
    color: #fff;
  }
`;

const WindowContent = styled.div<{ $noPadding?: boolean }>`
  flex: 1;
  min-width: 0;
  min-height: 0;
  background-color: ${props => props.$noPadding ? '#c0c0c0' : '#fff'};
  border: ${props => props.$noPadding ? 'none' : '2px solid'};
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #dfdfdf;
  border-bottom-color: #dfdfdf;
  margin: ${props => props.$noPadding ? '0' : '2px'};
  overflow: ${props => props.$noPadding ? 'hidden' : 'auto'};
  padding: ${props => props.$noPadding ? '0' : '4px'};
`;

const StatusBar = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 18px;
  padding: 2px 4px;
  background-color: #c0c0c0;
  border-top: 1px solid #dfdfdf;
`;

const StatusText = styled.span`
  font-size: 11px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  padding: 1px 4px;
  border: 1px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #fff;
  border-bottom-color: #fff;
  flex: 1;
`;

const getCursor = (direction: string) => {
  switch (direction) {
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    default:
      return 'default';
  }
};

const getPosition = (direction: string) => {
  const positions: Record<string, string> = {
    n: 'top: -3px; left: 4px; right: 4px; height: 6px;',
    s: 'bottom: -3px; left: 4px; right: 4px; height: 6px;',
    e: 'right: -3px; top: 4px; bottom: 4px; width: 6px;',
    w: 'left: -3px; top: 4px; bottom: 4px; width: 6px;',
    ne: 'top: -3px; right: -3px; width: 10px; height: 10px;',
    nw: 'top: -3px; left: -3px; width: 10px; height: 10px;',
    se: 'bottom: -3px; right: -3px; width: 10px; height: 10px;',
    sw: 'bottom: -3px; left: -3px; width: 10px; height: 10px;',
  };
  return positions[direction] || '';
};

const ResizeHandle = styled.div<{ $direction: string }>`
  position: absolute;
  ${props => getPosition(props.$direction)}
  cursor: ${props => getCursor(props.$direction)};
  z-index: 10;
  touch-action: none;
`;

export default Window;
