import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { apologyConfig } from '../../../config/apologyConfig';
import { retroAudio } from '../../../utils/retroAudio';
import { loadState, saveState } from '../../../utils/storage';
import { getAssetUrl } from '../../../utils/assetPath';

interface VendingItem {
  id: string;
  code: string;
  name: string;
  price: number;
  category: string;
  description: string;
  icon: string;
  color: string;
  dispensedContent: {
    headline: string;
    body: string;
    couponCode?: string;
    voucherText?: string;
    note?: string;
  };
}

interface DispensedRecord {
  item: VendingItem;
  timestamp: string;
  serialNumber: string;
}

interface SavedVendingState {
  credits: number;
  history: DispensedRecord[];
  pendingTrayItem: VendingItem | null;
}

export const SorryVending = () => {
  const { vending } = apologyConfig;

  // Persisted state
  const [persisted] = useState<SavedVendingState>(() =>
    loadState<SavedVendingState>('sorry_vending', {
      credits: vending.initialCredits,
      history: [],
      pendingTrayItem: null,
    })
  );

  const [credits, setCredits] = useState<number>(persisted.credits ?? vending.initialCredits);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'machine' | 'receipt' | 'history'>('machine');
  const [isDispensing, setIsDispensing] = useState(false);
  const [droppingItemId, setDroppingItemId] = useState<string | null>(null);
  const [trayItem, setTrayItem] = useState<VendingItem | null>(persisted.pendingTrayItem);
  const [openedItem, setOpenedItem] = useState<VendingItem | null>(null);
  const [history, setHistory] = useState<DispensedRecord[]>(persisted.history || []);
  const [statusMessage, setStatusMessage] = useState('READY: INSERT COIN OR SELECT A1-C1');
  const [lastReceipt, setLastReceipt] = useState<DispensedRecord | null>(
    persisted.history && persisted.history.length > 0 ? persisted.history[persisted.history.length - 1] : null
  );

  // Save to persistence
  useEffect(() => {
    saveState<SavedVendingState>('sorry_vending', {
      credits,
      history,
      pendingTrayItem: trayItem,
    });
  }, [credits, history, trayItem]);

  const selectedProduct = vending.products.find(p => p.code === selectedCode);

  const handleKeypadPress = (val: string) => {
    retroAudio.playClick();
    if (isDispensing) return;

    if (val === 'C') {
      setSelectedCode('');
      setStatusMessage('SELECTION CLEARED');
      return;
    }

    if (selectedCode.length >= 2) {
      setSelectedCode(val);
      setStatusMessage(`SELECTING: ${val}`);
    } else {
      const next = selectedCode + val;
      setSelectedCode(next);
      const match = vending.products.find(p => p.code === next);
      if (match) {
        setStatusMessage(`FOUND: ${match.name} (${match.price} CREDITS)`);
      } else {
        setStatusMessage(`CODE: ${next}`);
      }
    }
  };

  const handleInsertCoin = () => {
    retroAudio.playCoin();
    setCredits(prev => prev + vending.coinValue);
    setStatusMessage(`+${vending.coinValue} ${vending.currencyName} ADDED!`);
  };

  const handleSelectProduct = (product: VendingItem) => {
    if (isDispensing) return;
    retroAudio.playClick();
    setSelectedCode(product.code);
    setStatusMessage(`SELECTED: ${product.code} - ${product.name} (${product.price} CR)`);
  };

  const handleDispense = () => {
    if (isDispensing) return;
    if (!selectedProduct) {
      retroAudio.playBusyTone();
      setStatusMessage('ERROR: PLEASE ENTER VALID CODE (A1-C1)');
      return;
    }

    if (credits < selectedProduct.price) {
      retroAudio.playBusyTone();
      setStatusMessage(`INSUFFICIENT CREDITS! INSERT COIN (NEED ${selectedProduct.price})`);
      return;
    }

    // Begin dispensing
    setIsDispensing(true);
    setDroppingItemId(selectedProduct.id);
    setCredits(prev => prev - selectedProduct.price);
    setStatusMessage(`DISPENSING ${selectedProduct.name}...`);
    retroAudio.playVendingDrop();

    setTimeout(() => {
      setIsDispensing(false);
      setDroppingItemId(null);
      setTrayItem(selectedProduct);

      const record: DispensedRecord = {
        item: selectedProduct,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setHistory(prev => [record, ...prev]);
      setLastReceipt(record);
      setStatusMessage(`COLLECT ITEM FROM TRAY BELOW ⬇️`);
    }, 1200);
  };

  const handleOpenTray = () => {
    if (!trayItem) return;
    retroAudio.playClick();
    setOpenedItem(trayItem);
    setTrayItem(null);
    setStatusMessage('ITEM COLLECTED! ENJOY YOUR APOLOGY.');
  };

  return (
    <Container aria-label="Sorry Vending Machine Application">
      {/* Header bar */}
      <HeaderBar>
        <TitleText>
          <img
            src={getAssetUrl('/assets/generated/vending/vending-machine.png')}
            alt="Vending Machine"
            style={{ width: '20px', height: '20px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }}
          />
          APOLOGY VENDING AUTOMAT 1995
        </TitleText>
        <NavTabs>
          <NavTabButton
            $active={activeTab === 'machine'}
            onClick={() => { retroAudio.playClick(); setActiveTab('machine'); }}
          >
            Machine
          </NavTabButton>
          <NavTabButton
            $active={activeTab === 'receipt'}
            onClick={() => { retroAudio.playClick(); setActiveTab('receipt'); }}
            disabled={!lastReceipt}
          >
            Receipt {lastReceipt ? '★' : ''}
          </NavTabButton>
          <NavTabButton
            $active={activeTab === 'history'}
            onClick={() => { retroAudio.playClick(); setActiveTab('history'); }}
          >
            History ({history.length})
          </NavTabButton>
        </NavTabs>
      </HeaderBar>

      {/* Main Tab Views */}
      <BodyArea>
        {activeTab === 'machine' && (
          <MachineLayout>
            {/* Left: Glass Display Cabinet */}
            <GlassCabinet>
              <CabinetGlass>
                <GlassReflection />
                <ShelvesContainer>
                  {/* Shelf 1 */}
                  <Shelf>
                    <ShelfTrack />
                    <ProductsRow>
                      {vending.products.slice(0, 2).map(prod => (
                        <ProductSlot
                          key={prod.id}
                          $selected={selectedCode === prod.code}
                          $isDropping={droppingItemId === prod.id}
                          onClick={() => handleSelectProduct(prod)}
                        >
                          <ProductItemCard $color={prod.color}>
                            <ProductIcon>{prod.icon}</ProductIcon>
                            <ProductName>{prod.name}</ProductName>
                          </ProductItemCard>
                          <ProductTag>
                            <strong>{prod.code}</strong> | {prod.price} cr
                          </ProductTag>
                        </ProductSlot>
                      ))}
                    </ProductsRow>
                  </Shelf>

                  {/* Shelf 2 */}
                  <Shelf>
                    <ShelfTrack />
                    <ProductsRow>
                      {vending.products.slice(2, 4).map(prod => (
                        <ProductSlot
                          key={prod.id}
                          $selected={selectedCode === prod.code}
                          $isDropping={droppingItemId === prod.id}
                          onClick={() => handleSelectProduct(prod)}
                        >
                          <ProductItemCard $color={prod.color}>
                            <ProductIcon>{prod.icon}</ProductIcon>
                            <ProductName>{prod.name}</ProductName>
                          </ProductItemCard>
                          <ProductTag>
                            <strong>{prod.code}</strong> | {prod.price} cr
                          </ProductTag>
                        </ProductSlot>
                      ))}
                    </ProductsRow>
                  </Shelf>

                  {/* Shelf 3 */}
                  <Shelf>
                    <ShelfTrack />
                    <ProductsRow>
                      {vending.products.slice(4).map(prod => (
                        <ProductSlot
                          key={prod.id}
                          $selected={selectedCode === prod.code}
                          $isDropping={droppingItemId === prod.id}
                          onClick={() => handleSelectProduct(prod)}
                        >
                          <ProductItemCard $color={prod.color}>
                            <ProductIcon>{prod.icon}</ProductIcon>
                            <ProductName>{prod.name}</ProductName>
                          </ProductItemCard>
                          <ProductTag>
                            <strong>{prod.code}</strong> | {prod.price} cr
                          </ProductTag>
                        </ProductSlot>
                      ))}
                    </ProductsRow>
                  </Shelf>
                </ShelvesContainer>
              </CabinetGlass>

              {/* Bottom Dispense Chute / Collection Tray */}
              <CollectionChute>
                <ChuteDoor
                  $hasItem={!!trayItem}
                  onClick={handleOpenTray}
                  role="button"
                  aria-label={trayItem ? `Collect ${trayItem.name} from tray` : 'Collection tray is empty'}
                >
                  {trayItem ? (
                    <TrayFlashingItem>
                      🎁 CLICK TO COLLECT {trayItem.name.toUpperCase()}!
                    </TrayFlashingItem>
                  ) : (
                    <TrayEmptyText>PUSH TRAY FLAP (EMPTY)</TrayEmptyText>
                  )}
                </ChuteDoor>
              </CollectionChute>
            </GlassCabinet>

            {/* Right: Keypad, Coin Slot, & Product Info */}
            <ControlCabinet>
              {/* LED Credit Display */}
              <LedScreen>
                <LedRow>
                  <span>CREDITS:</span>
                  <LedCredits>{credits} {vending.currencyName}</LedCredits>
                </LedRow>
                <LedCodeRow>
                  <span>CODE:</span>
                  <LedCodeText>{selectedCode || '__'}</LedCodeText>
                </LedCodeRow>
                <LedMessage>{statusMessage}</LedMessage>
              </LedScreen>

              {/* Coin Slot */}
              <CoinSection>
                <InsertCoinButton onClick={handleInsertCoin} type="button">
                  🪙 INSERT COIN (+{vending.coinValue})
                </InsertCoinButton>
                <CoinSlotGraphic />
              </CoinSection>

              {/* Keypad Grid */}
              <KeypadWrapper>
                <KeypadLabel>KEYPAD SELECTION</KeypadLabel>
                <KeypadGrid>
                  {['A', 'B', 'C'].map(char => (
                    <KeyButton key={char} onClick={() => handleKeypadPress(char)} type="button">
                      {char}
                    </KeyButton>
                  ))}
                  {['1', '2', '3'].map(num => (
                    <KeyButton key={num} onClick={() => handleKeypadPress(num)} type="button">
                      {num}
                    </KeyButton>
                  ))}
                  <KeyButton $variant="clear" onClick={() => handleKeypadPress('C')} type="button">
                    CLEAR
                  </KeyButton>
                  <KeyButton $variant="dispense" onClick={handleDispense} type="button" disabled={isDispensing}>
                    {isDispensing ? '...' : 'ENTER'}
                  </KeyButton>
                </KeypadGrid>
              </KeypadWrapper>

              {/* Product Preview Card */}
              <PreviewCard>
                <PreviewTitle>Selected Item Preview</PreviewTitle>
                {selectedProduct ? (
                  <PreviewContent>
                    <strong>{selectedProduct.icon} {selectedProduct.name}</strong>
                    <p>{selectedProduct.description}</p>
                    <CostTag>Cost: {selectedProduct.price} {vending.currencyName}</CostTag>
                  </PreviewContent>
                ) : (
                  <PreviewPlaceholder>
                    Click any item in cabinet or enter code (e.g. A1, B2)
                  </PreviewPlaceholder>
                )}
              </PreviewCard>
            </ControlCabinet>
          </MachineLayout>
        )}

        {/* Tab 2: Printed Receipt */}
        {activeTab === 'receipt' && (
          <ReceiptView>
            {lastReceipt ? (
              <ReceiptPaper>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <img
                    src={getAssetUrl('/assets/generated/vending/vending-machine.png')}
                    alt="Vending Machine"
                    style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                  />
                </div>
                <ReceiptHeader>
                  <ReceiptStoreName>*** SORRY VENDING AUTOMAT ***</ReceiptStoreName>
                  <ReceiptStoreSub>Terminal #95-LOVE | Receipt of Contrition</ReceiptStoreSub>
                  <ReceiptDate>{lastReceipt.timestamp} | {lastReceipt.serialNumber}</ReceiptDate>
                </ReceiptHeader>

                <ReceiptDivider>--------------------------------</ReceiptDivider>

                <ReceiptLineItem>
                  <span>1x {lastReceipt.item.name}</span>
                  <span>{lastReceipt.item.price} CR</span>
                </ReceiptLineItem>
                <ReceiptCategory>Category: {lastReceipt.item.category}</ReceiptCategory>

                <ReceiptDivider>--------------------------------</ReceiptDivider>

                <ReceiptTotals>
                  <ReceiptRow><span>SUBTOTAL:</span><span>{lastReceipt.item.price} CR</span></ReceiptRow>
                  <ReceiptRow><span>DISCOUNT (BOYFRIEND APOLOGY):</span><span>-0.00 CR</span></ReceiptRow>
                  <ReceiptRow><strong>TOTAL CHARGED:</strong><strong>{lastReceipt.item.price} CR</strong></ReceiptRow>
                </ReceiptTotals>

                <ReceiptDivider>--------------------------------</ReceiptDivider>

                <ReceiptMessage>
                  <p>“{lastReceipt.item.dispensedContent.headline}”</p>
                  <p>{lastReceipt.item.dispensedContent.body}</p>
                  {lastReceipt.item.dispensedContent.couponCode && (
                    <ReceiptBarcodeBox>
                      <BarcodeGraphic>||| | |||| | || ||| || |||</BarcodeGraphic>
                      <CouponCodeText>COUPON: {lastReceipt.item.dispensedContent.couponCode}</CouponCodeText>
                    </ReceiptBarcodeBox>
                  )}
                </ReceiptMessage>

                <ReceiptFooter>
                  Return Policy: NON-REFUNDABLE.<br />
                  All apologies and love are 100% unconditional and eternal.
                </ReceiptFooter>
              </ReceiptPaper>
            ) : (
              <EmptyNotice>No items dispensed yet. Insert coin and dispense a treat!</EmptyNotice>
            )}
          </ReceiptView>
        )}

        {/* Tab 3: Dispense History */}
        {activeTab === 'history' && (
          <HistoryView>
            <h3>Dispensed Keepsakes & Vouchers ({history.length})</h3>
            {history.length === 0 ? (
              <EmptyNotice>Your keepsake bag is empty. Try dispensing items from the machine!</EmptyNotice>
            ) : (
              <HistoryList>
                {history.map((rec, i) => (
                  <HistoryItemCard key={i} onClick={() => setOpenedItem(rec.item)}>
                    <HistoryIcon>{rec.item.icon}</HistoryIcon>
                    <HistoryDetails>
                      <strong>{rec.item.name}</strong>
                      <span>Dispensed: {rec.timestamp}</span>
                      <small>{rec.item.dispensedContent.headline}</small>
                    </HistoryDetails>
                    <WinButtonSmall type="button">View Card ▶</WinButtonSmall>
                  </HistoryItemCard>
                ))}
              </HistoryList>
            )}
          </HistoryView>
        )}
      </BodyArea>

      {/* Dispensed Item Modal / Card Dialog */}
      {openedItem && (
        <ModalOverlay onClick={() => setOpenedItem(null)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🎉 DISPENSED ITEM: {openedItem.name}</ModalTitle>
              <CloseBtn onClick={() => setOpenedItem(null)}>×</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <img
                  src={getAssetUrl('/assets/generated/vending/snack-mini-sorry.png')}
                  alt="Dispensed Keepsake"
                  style={{ width: '84px', height: '84px', objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}
                />
              </div>
              <BigIcon>{openedItem.icon}</BigIcon>
              <CardHeadline>{openedItem.dispensedContent.headline}</CardHeadline>
              <CardBodyText>{openedItem.dispensedContent.body}</CardBodyText>

              {openedItem.dispensedContent.voucherText && (
                <VoucherPill>
                  <strong>VOUCHER:</strong> {openedItem.dispensedContent.voucherText}
                </VoucherPill>
              )}

              {openedItem.dispensedContent.note && (
                <NotePill>
                  <em>Note:</em> {openedItem.dispensedContent.note}
                </NotePill>
              )}

              {openedItem.dispensedContent.couponCode && (
                <CouponBox>
                  <span>REDEEM CODE:</span>
                  <CodeString>{openedItem.dispensedContent.couponCode}</CodeString>
                </CouponBox>
              )}
            </ModalBody>
            <ModalFooter>
              <WinButton onClick={() => setOpenedItem(null)}>
                Put in Keepsake Bag
              </WinButton>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Animations
const itemDropAnim = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  50% { transform: translateY(80px) rotate(15deg); opacity: 0.8; }
  100% { transform: translateY(220px) scale(0.6); opacity: 0; }
`;

const pulseGlow = keyframes`
  0% { background: #ffeb3b; }
  50% { background: #ff9800; }
  100% { background: #ffeb3b; }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  color: #000;
  overflow-y: auto;
`;

const HeaderBar = styled.div`
  background: #000080;
  color: #fff;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`;

const TitleText = styled.span`
  font-weight: bold;
  font-size: 12px;
`;

const NavTabs = styled.div`
  display: flex;
  gap: 2px;
`;

const NavTabButton = styled.button<{ $active: boolean }>`
  border: 2px solid;
  border-color: ${props => props.$active ? '#fff #808080 #808080 #fff' : '#c0c0c0 #404040 #404040 #c0c0c0'};
  background: ${props => props.$active ? '#c0c0c0' : '#808080'};
  color: ${props => props.$active ? '#000' : '#fff'};
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const BodyArea = styled.div`
  flex: 1;
  padding: 8px;
  overflow-y: auto;
`;

const MachineLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 8px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const GlassCabinet = styled.div`
  background: #2b2b2b;
  border: 4px outset #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: inset 2px 2px 0 #000;
`;

const CabinetGlass = styled.div`
  background: linear-gradient(135deg, rgba(230, 245, 255, 0.9) 0%, rgba(200, 225, 245, 0.85) 100%);
  border: 3px inset #404040;
  padding: 8px;
  position: relative;
  overflow: hidden;
  min-height: 250px;
`;

const GlassReflection = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  pointer-events: none;
`;

const ShelvesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
`;

const Shelf = styled.div`
  display: flex;
  flex-direction: column;
`;

const ShelfTrack = styled.div`
  height: 6px;
  background: #757575;
  border-top: 1px solid #9e9e9e;
  border-bottom: 2px solid #212121;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
`;

const ProductsRow = styled.div`
  display: flex;
  justify-content: space-around;
  padding-bottom: 4px;
`;

const ProductSlot = styled.div<{ $selected: boolean; $isDropping: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 4px;
  border: 2px solid ${props => props.$selected ? '#000080' : 'transparent'};
  background: ${props => props.$selected ? 'rgba(0, 0, 128, 0.1)' : 'transparent'};
  border-radius: 4px;
  animation: ${props => props.$isDropping ? css`${itemDropAnim} 1.2s forwards` : 'none'};

  &:hover {
    border-color: #000080;
  }
`;

const ProductItemCard = styled.div<{ $color: string }>`
  width: 90px;
  height: 48px;
  background: ${props => props.$color};
  border: 2px solid #000;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px;
`;

const ProductIcon = styled.span`
  font-size: 18px;
`;

const ProductName = styled.span`
  font-size: 8px;
  font-weight: bold;
  text-align: center;
  color: #000;
  line-height: 1.1;
`;

const ProductTag = styled.div`
  background: #ffff00;
  color: #000;
  font-size: 9px;
  padding: 1px 4px;
  border: 1px solid #000;
`;

const CollectionChute = styled.div`
  background: #1e1e1e;
  padding: 8px;
  border-top: 3px solid #000;
`;

const ChuteDoor = styled.div<{ $hasItem: boolean }>`
  background: ${props => props.$hasItem ? '#ffeb3b' : '#333333'};
  border: 3px inset ${props => props.$hasItem ? '#f57f17' : '#555555'};
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$hasItem ? 'pointer' : 'default'};
  animation: ${props => props.$hasItem ? pulseGlow : 'none'} 1s infinite;
`;

const TrayFlashingItem = styled.span`
  color: #000;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
`;

const TrayEmptyText = styled.span`
  color: #777777;
  font-size: 9px;
  letter-spacing: 1px;
`;

const ControlCabinet = styled.div`
  background: #d4d0c8;
  border: 3px outset #ffffff;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LedScreen = styled.div`
  background: #001a00;
  border: 3px inset #404040;
  padding: 6px;
  color: #00ff66;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const LedRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
`;

const LedCredits = styled.span`
  font-weight: bold;
  color: #ffff00;
`;

const LedCodeRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
`;

const LedCodeText = styled.span`
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
`;

const LedMessage = styled.div`
  font-size: 9px;
  color: #a3ffb8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px dotted #005500;
  padding-top: 2px;
`;

const CoinSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #b0b0b0;
  padding: 6px;
  border: 2px inset #ffffff;
`;

const InsertCoinButton = styled.button`
  background: #ffd700;
  color: #000;
  border: 2px outset #ffffff;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;

  &:active {
    border-style: inset;
  }
`;

const CoinSlotGraphic = styled.div`
  width: 6px;
  height: 22px;
  background: #000;
  border-left: 2px solid #555;
  border-right: 2px solid #555;
`;

const KeypadWrapper = styled.div`
  background: #c0c0c0;
  border: 2px inset #ffffff;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const KeypadLabel = styled.div`
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const KeyButton = styled.button<{ $variant?: 'clear' | 'dispense' }>`
  background: ${props =>
    props.$variant === 'dispense' ? '#2e7d32' :
    props.$variant === 'clear' ? '#c62828' : '#e0e0e0'};
  color: ${props => props.$variant ? '#fff' : '#000'};
  border: 2px outset #ffffff;
  padding: 5px;
  font-size: ${props => props.$variant ? '9px' : '12px'};
  font-weight: bold;
  cursor: pointer;

  grid-column: ${props => props.$variant === 'dispense' ? 'span 2' : 'auto'};

  &:active {
    border-style: inset;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewCard = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const PreviewTitle = styled.div`
  font-size: 9px;
  font-weight: bold;
  color: #000080;
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 2px;
`;

const PreviewContent = styled.div`
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  p {
    margin: 0;
    color: #444;
  }
`;

const CostTag = styled.span`
  color: #b71c1c;
  font-weight: bold;
  font-size: 10px;
`;

const PreviewPlaceholder = styled.div`
  font-size: 9px;
  color: #888;
  font-style: italic;
  padding: 4px 0;
`;

const ReceiptView = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px;
`;

const ReceiptPaper = styled.div`
  background: #fffff0;
  border: 1px solid #d3d3d3;
  width: 280px;
  padding: 14px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ReceiptHeader = styled.div`
  text-align: center;
`;

const ReceiptStoreName = styled.div`
  font-weight: bold;
  font-size: 12px;
`;

const ReceiptStoreSub = styled.div`
  font-size: 9px;
  color: #555;
`;

const ReceiptDate = styled.div`
  font-size: 9px;
  margin-top: 2px;
`;

const ReceiptDivider = styled.div`
  text-align: center;
  letter-spacing: -1px;
  color: #888;
`;

const ReceiptLineItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const ReceiptCategory = styled.div`
  font-size: 9px;
  color: #666;
`;

const ReceiptTotals = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ReceiptMessage = styled.div`
  background: #f7f7e8;
  padding: 6px;
  border: 1px dashed #c0c0c0;
  font-size: 10px;
  line-height: 1.3;

  p {
    margin: 2px 0;
  }
`;

const ReceiptBarcodeBox = styled.div`
  margin-top: 6px;
  text-align: center;
`;

const BarcodeGraphic = styled.div`
  font-family: monospace;
  font-size: 14px;
  letter-spacing: 2px;
`;

const CouponCodeText = styled.div`
  font-weight: bold;
  font-size: 10px;
`;

const ReceiptFooter = styled.div`
  font-size: 8px;
  color: #777;
  text-align: center;
  margin-top: 6px;
`;

const HistoryView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 12px;
    color: #000080;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HistoryItemCard = styled.div`
  background: #ffffff;
  border: 2px outset #ffffff;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  &:hover {
    background: #eef2ff;
  }
`;

const HistoryIcon = styled.span`
  font-size: 24px;
`;

const HistoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 11px;

  span {
    font-size: 9px;
    color: #666;
  }

  small {
    color: #333;
    font-style: italic;
  }
`;

const WinButtonSmall = styled.button`
  background: #c0c0c0;
  border: 2px outset #ffffff;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;

  &:active {
    border-style: inset;
  }
`;

const EmptyNotice = styled.div`
  text-align: center;
  padding: 24px;
  color: #666;
  font-style: italic;
  font-size: 11px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #c0c0c0;
  border: 3px outset #ffffff;
  box-shadow: 4px 4px 10px rgba(0,0,0,0.5);
  width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  background: #000080;
  color: #fff;
  padding: 3px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.span`
  font-size: 11px;
  font-weight: bold;
`;

const CloseBtn = styled.button`
  background: #c0c0c0;
  border: 1px outset #fff;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBody = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  margin: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

const BigIcon = styled.div`
  font-size: 40px;
`;

const CardHeadline = styled.h3`
  margin: 0;
  font-size: 13px;
  color: #000080;
`;

const CardBodyText = styled.p`
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  color: #333;
`;

const VoucherPill = styled.div`
  background: #e8f5e9;
  border: 1px solid #4caf50;
  color: #1b5e20;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 3px;
`;

const NotePill = styled.div`
  font-size: 10px;
  color: #666;
`;

const CouponBox = styled.div`
  background: #fff8e1;
  border: 1px dashed #f57f17;
  padding: 4px 8px;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CodeString = styled.span`
  font-family: monospace;
  font-weight: bold;
  font-size: 12px;
  color: #b71c1c;
`;

const ModalFooter = styled.div`
  padding: 6px;
  display: flex;
  justify-content: center;
`;

const WinButton = styled.button`
  background: #c0c0c0;
  border: 2px outset #ffffff;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;

  &:active {
    border-style: inset;
  }
`;

export default SorryVending;
