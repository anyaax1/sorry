import { useState } from 'react';
import styled from 'styled-components';

interface DesktopIconProps {
  id: string;
  icon: string;
  label: string;
  onDoubleClick: (id: string, label: string) => void;
}

const DesktopIcon = ({ id, icon, label, onDoubleClick }: DesktopIconProps) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(id, label);
  };

  const handleBlur = () => {
    setIsSelected(false);
  };

  return (
    <Container
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      tabIndex={0}
      role="button"
      aria-label={label}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDoubleClick(id, label); }
      }}
      onPointerUp={e => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') onDoubleClick(id, label);
      }}
      $selected={isSelected}
    >
      <IconWrapper $selected={isSelected}>
        <IconImage src={icon} alt={label} draggable={false} />
      </IconWrapper>
      <Label $selected={isSelected}>{label}</Label>
    </Container>
  );
};

const Container = styled.div<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 75px;
  flex: 0 0 auto;
  padding: 4px;
  cursor: default;
  outline: none;

  &:focus-visible {
    outline: 1px dotted #fff;
  }
`;

const IconWrapper = styled.div<{ $selected: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$selected ? 'rgba(0, 0, 128, 0.5)' : 'transparent'};
`;

const IconImage = styled.img`
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
`;

const Label = styled.span<{ $selected: boolean }>`
  font-size: 11px;
  color: #fff;
  text-align: center;
  margin-top: 4px;
  padding: 1px 2px;
  background-color: ${props => props.$selected ? '#000080' : 'transparent'};
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  text-shadow: ${props => props.$selected ? 'none' : '1px 1px 1px #000'};
  word-wrap: break-word;
  max-width: 70px;
`;

export default DesktopIcon;
