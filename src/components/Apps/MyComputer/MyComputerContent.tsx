import { useState } from 'react';
import styled from 'styled-components';

interface FileIconProps {
  id: string;
  icon: string;
  label: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const FileIcon = ({ id, icon, label, isSelected, onSelect }: FileIconProps) => {
  return (
    <IconContainer
      $isSelected={isSelected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      <IconImage src={icon} alt={label} $isSelected={isSelected} />
      <IconLabel $isSelected={isSelected}>{label}</IconLabel>
    </IconContainer>
  );
};

const MyComputerContent = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = [
    { id: 'floppy', icon: '/icons/floppy.svg', label: '3½ Floppy (A:)' },
    { id: 'c-drive', icon: '/icons/hard-drive.png', label: '(C:)' },
    { id: 'd-drive', icon: '/icons/cd-drive.png', label: 'New (D:)' },
    { id: 'control-panel', icon: '/icons/control-panel.svg', label: 'Control Panel' },
    { id: 'printers', icon: '/icons/printer.png', label: 'Printers' },
    { id: 'dialup', icon: '/icons/dialup.png', label: 'Dial-Up Networking' },
  ];

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const handleBackgroundClick = () => {
    setSelectedId(null);
  };

  return (
    <Container onClick={handleBackgroundClick}>
      <IconGrid>
        {items.map(item => (
          <FileIcon
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            isSelected={selectedId === item.id}
            onSelect={handleSelect}
          />
        ))}
      </IconGrid>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
`;

const IconGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  align-content: flex-start;
`;

const IconContainer = styled.div<{ $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 4px;
  cursor: pointer;
`;

const IconImage = styled.img<{ $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  background-color: ${props => props.$isSelected ? '#000080' : 'transparent'};
  padding: 2px;
`;

const IconLabel = styled.span<{ $isSelected: boolean }>`
  font-size: 11px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  text-align: center;
  margin-top: 2px;
  padding: 1px 2px;
  background-color: ${props => props.$isSelected ? '#000080' : 'transparent'};
  color: ${props => props.$isSelected ? '#fff' : '#000'};
  word-wrap: break-word;
  max-width: 68px;
`;

export default MyComputerContent;
