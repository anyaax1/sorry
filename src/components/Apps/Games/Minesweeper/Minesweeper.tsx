import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type GameState = 'playing' | 'won' | 'lost';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

const createEmptyBoard = (): CellState[][] => {
  return Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
};

const placeMines = (board: CellState[][], firstRow: number, firstCol: number): void => {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    // Don't place mine on first click or adjacent to it
    const isNearFirstClick = Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1;
    if (!board[row][col].isMine && !isNearFirstClick) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }
};

const calculateAdjacent = (board: CellState[][]): void => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[row][col].adjacentMines = count;
    }
  }
};

function revealCell(row: number, col: number, currentBoard: CellState[][]) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
  const cell = currentBoard[row][col];
  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;

  if (cell.adjacentMines === 0 && !cell.isMine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        revealCell(row + dr, col + dc, currentBoard);
      }
    }
  }
}

const Minesweeper = () => {
  const [board, setBoard] = useState<CellState[][]>(createEmptyBoard);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [minesLeft, setMinesLeft] = useState(MINES);
  const [time, setTime] = useState(0);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || isFirstClick) return;
    const timer = setInterval(() => {
      setTime(t => Math.min(t + 1, 999));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, isFirstClick]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setGameState('playing');
    setMinesLeft(MINES);
    setTime(0);
    setIsFirstClick(true);
  }, []);



  const checkWin = useCallback((currentBoard: CellState[][]): boolean => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = currentBoard[row][col];
        if (!cell.isMine && !cell.isRevealed) return false;
      }
    }
    return true;
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (isFirstClick) {
      placeMines(newBoard, row, col);
      calculateAdjacent(newBoard);
      setIsFirstClick(false);
    }

    if (newBoard[row][col].isMine) {
      // Game over - reveal all mines
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }
      setBoard(newBoard);
      setGameState('lost');
      return;
    }

    revealCell(row, col, newBoard);
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameState('won');
    }
  }, [board, gameState, isFirstClick, checkWin]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    const cell = board[row][col];
    if (cell.isRevealed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !cell.isFlagged;
    setBoard(newBoard);
    setMinesLeft(m => cell.isFlagged ? m + 1 : m - 1);
  }, [board, gameState]);

  const formatNumber = (n: number): string => {
    return String(Math.max(0, Math.min(999, n))).padStart(3, '0');
  };

  const getSmiley = (): string => {
    if (gameState === 'won') return '😎';
    if (gameState === 'lost') return '😵';
    if (isMouseDown) return '😮';
    return '🙂';
  };

  const getCellContent = (cell: CellState): React.ReactNode => {
    if (cell.isFlagged && !cell.isRevealed) return '🚩';
    if (!cell.isRevealed) return null;
    if (cell.isMine) return '💣';
    if (cell.adjacentMines === 0) return null;
    return cell.adjacentMines;
  };

  const getNumberColor = (n: number): string => {
    const colors: Record<number, string> = {
      1: '#0000ff',
      2: '#008000',
      3: '#ff0000',
      4: '#000080',
      5: '#800000',
      6: '#008080',
      7: '#000000',
      8: '#808080',
    };
    return colors[n] || '#000';
  };

  return (
    <GameContainer>
      <Header>
        <Counter>{formatNumber(minesLeft)}</Counter>
        <SmileyButton
          aria-label="New game"
          onClick={resetGame}
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          {getSmiley()}
        </SmileyButton>
        <Counter>{formatNumber(time)}</Counter>
      </Header>
      <Board
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {board.map((row, rowIndex) => (
          <Row key={rowIndex}>
            {row.map((cell, colIndex) => (
              <Cell
                key={colIndex}
                role="button"
                tabIndex={0}
                aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}${cell.isFlagged ? ', flagged' : cell.isRevealed ? ', revealed' : ''}`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCellClick(rowIndex, colIndex); } }}
                $revealed={cell.isRevealed}
                $mine={cell.isMine && cell.isRevealed}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
              >
                <CellContent $color={getNumberColor(cell.adjacentMines)}>
                  {getCellContent(cell)}
                </CellContent>
              </Cell>
            ))}
          </Row>
        ))}
      </Board>
      {gameState === 'won' && <WinMessage>You Win!</WinMessage>}
    </GameContainer>
  );
};

const GameContainer = styled.div`
  background: #c0c0c0;
  padding: 6px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #c0c0c0;
  padding: 4px 6px;
  margin-bottom: 6px;
  border: 2px inset #808080;
`;

const Counter = styled.div`
  background: #000;
  color: #ff0000;
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  padding: 2px 4px;
  min-width: 50px;
  text-align: center;
  border: 1px inset #808080;
`;

const SmileyButton = styled.button`
  width: 36px;
  height: 36px;
  font-size: 20px;
  border: 3px outset #fff;
  background: #c0c0c0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    border-style: inset;
  }
`;

const Board = styled.div`
  border: 3px inset #808080;
  background: #c0c0c0;
`;

const Row = styled.div`
  display: flex;
`;

const Cell = styled.div<{ $revealed: boolean; $mine: boolean }>`
  width: 24px;
  flex-shrink: 0;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  font-weight: bold;
  border: ${props => props.$revealed
    ? '1px solid #808080'
    : '3px outset #fff'};
  background: ${props => {
    if (props.$mine) return '#ff0000';
    if (props.$revealed) return '#c0c0c0';
    return '#c0c0c0';
  }};
  box-sizing: border-box;

  &:active {
    ${props => !props.$revealed && `
      border-style: inset;
    `}
  }
`;

const CellContent = styled.span<{ $color: string }>`
  color: ${props => props.$color};
`;

const WinMessage = styled.div`
  text-align: center;
  margin-top: 8px;
  font-weight: bold;
  color: #008000;
  font-size: 14px;
`;

export default Minesweeper;
