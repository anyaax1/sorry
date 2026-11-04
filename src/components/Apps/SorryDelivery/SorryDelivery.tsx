import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { apologyConfig } from '../../../config/apologyConfig';
import { retroAudio } from '../../../utils/retroAudio';
import { loadState, saveState } from '../../../utils/storage';
import { getAssetUrl } from '../../../utils/assetPath';

interface SavedDeliveryState {
  currentStep: number;
  isAccepted: boolean;
  acceptedSignature: string;
}

export const SorryDelivery = () => {
  const { delivery, couple } = apologyConfig;

  // Persisted state
  const [persisted] = useState<SavedDeliveryState>(() =>
    loadState<SavedDeliveryState>('sorry_delivery', {
      currentStep: 1,
      isAccepted: false,
      acceptedSignature: '',
    })
  );

  const [currentStep, setCurrentStep] = useState<number>(persisted.currentStep || 1);
  const [isAccepted, setIsAccepted] = useState<boolean>(persisted.isAccepted || false);
  const [acceptedSignature, setAcceptedSignature] = useState<string>(persisted.acceptedSignature || '');
  const [signatureInput, setSignatureInput] = useState('');
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isPackageOpened, setIsPackageOpened] = useState(persisted.currentStep >= 7);

  const autoTimerRef = useRef<number | null>(null);

  // Save state
  useEffect(() => {
    saveState<SavedDeliveryState>('sorry_delivery', {
      currentStep,
      isAccepted,
      acceptedSignature,
    });
  }, [currentStep, isAccepted, acceptedSignature]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, []);

  const totalSteps = delivery.stages.length;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  const advanceStep = () => {
    if (currentStep >= totalSteps) return;
    retroAudio.playClick();
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    const stage = delivery.stages.find(s => s.step === nextStep);
    if (stage) {
      showToast(`🚚 Update: ${stage.title}!`);
    }

    if (nextStep === totalSteps) {
      // Delivered!
      retroAudio.playDoorbell();
      setIsPackageOpened(true);
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
        setIsAutoSimulating(false);
      }
    }
  };

  const previousStep = () => {
    if (currentStep <= 1) return;
    retroAudio.playClick();
    setCurrentStep(prev => prev - 1);
  };

  const toggleAutoSimulate = () => {
    retroAudio.playClick();
    if (isAutoSimulating) {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      setIsAutoSimulating(false);
    } else {
      if (currentStep >= totalSteps) {
        setCurrentStep(1);
        setIsPackageOpened(false);
      }
      setIsAutoSimulating(true);
      autoTimerRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= totalSteps) {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current);
            autoTimerRef.current = null;
            setIsAutoSimulating(false);
            retroAudio.playDoorbell();
            setIsPackageOpened(true);
            return prev;
          }
          const next = prev + 1;
          const stage = delivery.stages.find(s => s.step === next);
          if (stage) {
            showToast(`📦 Transit: ${stage.title}`);
          }
          if (next === totalSteps) {
            retroAudio.playDoorbell();
            setIsPackageOpened(true);
            if (autoTimerRef.current) {
              clearInterval(autoTimerRef.current);
              autoTimerRef.current = null;
            }
            setIsAutoSimulating(false);
          }
          return next;
        });
      }, 2500);
    }
  };

  const handleAcceptApology = () => {
    retroAudio.playClick();
    const sig = signatureInput.trim() || couple.girlfriendName;
    setAcceptedSignature(sig);
    setIsAccepted(true);
    retroAudio.playVictoryFanfare();
    showToast(`💝 Apology accepted by ${sig}!`);
  };

  const handleResetDelivery = () => {
    retroAudio.playClick();
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = null;
    setIsAutoSimulating(false);
    setCurrentStep(1);
    setIsAccepted(false);
    setAcceptedSignature('');
    setIsPackageOpened(false);
    showToast('Reset delivery tracking to beginning.');
  };

  const currentStage = delivery.stages.find(s => s.step === currentStep) || delivery.stages[0];

  return (
    <Container aria-label="Sorry Is Out for Delivery Application">
      {/* Top Banner */}
      <HeaderBar>
        <CarrierTitle>📦 {delivery.carrierName}</CarrierTitle>
        <TrackingBadge>TRACKING: {delivery.trackingNumber}</TrackingBadge>
      </HeaderBar>

      {/* Floating Retro Toast Notification */}
      {toastNotification && (
        <ToastNotification role="status">
          ℹ️ {toastNotification}
        </ToastNotification>
      )}

      {/* Order Summary Header Card */}
      <SummaryCard>
        <SummaryGrid>
          <div>
            <Label>Package Contents:</Label>
            <ValueText>{delivery.itemDescription}</ValueText>
          </div>
          <div>
            <Label>Courier Assigned:</Label>
            <ValueText>{delivery.courierName}</ValueText>
          </div>
          <div>
            <Label>Recipient:</Label>
            <ValueText>{couple.girlfriendName} (The Love of My Life)</ValueText>
          </div>
          <div>
            <Label>Estimated Time of Arrival:</Label>
            <ValueHighlight>
              {currentStep >= totalSteps ? 'DELIVERED (Doorbell Rang!)' : 'APPROACHING RAPIDLY'}
            </ValueHighlight>
          </div>
        </SummaryGrid>

        {/* Win95 Progress Bar */}
        <ProgressSection>
          <ProgressInfoRow>
            <span>Progress: {progressPercentage}%</span>
            <span>Step {currentStep} of {totalSteps}</span>
          </ProgressInfoRow>
          <ProgressBarContainer>
            <ProgressBarFill $pct={progressPercentage} />
          </ProgressBarContainer>
        </ProgressSection>

        {/* Transit Control Buttons */}
        <ControlsRow>
          <WinBtn onClick={previousStep} disabled={currentStep <= 1}>
            ◀ Previous Stage
          </WinBtn>
          <WinBtn
            $primary
            onClick={advanceStep}
            disabled={currentStep >= totalSteps}
          >
            Advance Stage ▶
          </WinBtn>
          <WinBtn onClick={toggleAutoSimulate}>
            {isAutoSimulating ? '⏸ Stop Auto-Transit' : '🚀 Auto-Simulate Transit'}
          </WinBtn>
          <WinBtn onClick={handleResetDelivery}>
            ↺ Reset
          </WinBtn>
        </ControlsRow>
      </SummaryCard>

      {/* Main Content: Timeline & Delivered Parcel */}
      <ContentArea>
        {/* Left Column: Interactive Timeline */}
        <TimelineColumn>
          <SectionHeader>Live Logistics Timeline</SectionHeader>
          <TimelineList>
            {delivery.stages.map(stage => {
              const isPast = stage.step < currentStep;
              const isCurrent = stage.step === currentStep;

              return (
                <TimelineItem key={stage.step} $isCurrent={isCurrent} $isPast={isPast}>
                  <TimelineIconCol>
                    <StepBadge $isCurrent={isCurrent} $isPast={isPast}>
                      {isPast ? '✓' : stage.step}
                    </StepBadge>
                    {stage.step < totalSteps && <StepConnector $isPast={isPast} />}
                  </TimelineIconCol>

                  <TimelineContent>
                    <StageHeader>
                      <StageTitle $isCurrent={isCurrent}>
                        {stage.icon} {stage.title}
                      </StageTitle>
                      <StageTime>{stage.timestampOffset}</StageTime>
                    </StageHeader>
                    <StageStatusBadge $isCurrent={isCurrent}>
                      {stage.status}
                    </StageStatusBadge>
                    <StageDetails>{stage.details}</StageDetails>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </TimelineList>
        </TimelineColumn>

        {/* Right Column: Parcel Status / Unboxing / Receipt */}
        <ParcelColumn>
          <SectionHeader>Package Inspection</SectionHeader>

          {currentStep < totalSteps ? (
            <InTransitBox>
              <VanGraphic>
                <img
                  src={getAssetUrl('/assets/generated/delivery/delivery-scooter.png')}
                  alt="Delivery in transit"
                  style={{ width: '130px', height: '130px', objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
                />
              </VanGraphic>
              <InTransitTitle>Apology Is On The Move</InTransitTitle>
              <p>Current Stage: <strong>{currentStage.title}</strong></p>
              <p>{currentStage.details}</p>
              <TransitNote>
                The courier has been instructed to deliver maximum tenderness and sincere apologies upon arrival.
              </TransitNote>
            </InTransitBox>
          ) : (
            <DeliveredParcelBox>
              {!isPackageOpened ? (
                <ClosedParcelPrompt onClick={() => setIsPackageOpened(true)}>
                  <ParcelIcon>
                    <img
                      src={getAssetUrl('/assets/generated/delivery/apology-parcel.png')}
                      alt="Apology Parcel"
                      style={{ width: '140px', height: '140px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                    />
                  </ParcelIcon>
                  <PromptTitle>PACKAGE DELIVERED!</PromptTitle>
                  <p>Click here to open and inspect your parcel.</p>
                </ClosedParcelPrompt>
              ) : (
                <OpenedLetterCard>
                  <LetterHeader>
                    <HeartStamp>❤️ DELIVERED WITH LOVE</HeartStamp>
                    <LetterTitle>Formal Delivery Note & Apology Letter</LetterTitle>
                    <LetterMeta>
                      Signed by: {couple.boyfriendName} | To: {couple.girlfriendName}
                    </LetterMeta>
                  </LetterHeader>

                  <LetterBody>
                    <p>
                      <strong>Dear {couple.girlfriendName},</strong>
                    </p>
                    <p>
                      {delivery.receiptClosingMessage}
                    </p>
                    <p>
                      I promise to cherish our bond, listen to your words and feelings with all my heart,
                      and never let stubbornness get between us. You mean the world to me.
                    </p>
                  </LetterBody>

                  {/* Acceptance & Signature Section */}
                  <SignatureSection>
                    {isAccepted ? (
                      <AcceptedBadge>
                        ✅ APOLOGY OFFICIALLY ACCEPTED!
                        <AcceptedBy>Signed by: <u>{acceptedSignature}</u></AcceptedBy>
                        <HeartFooter>“Distance closed. Hugs restored.”</HeartFooter>
                      </AcceptedBadge>
                    ) : (
                      <SignForm>
                        <label htmlFor="girlfriend-signature">
                          <strong>Sign to accept this delivery & apology:</strong>
                        </label>
                        <SignInputRow>
                          <SignInput
                            id="girlfriend-signature"
                            type="text"
                            placeholder={`Type your name (e.g. ${couple.girlfriendName})`}
                            value={signatureInput}
                            onChange={e => setSignatureInput(e.target.value)}
                            maxLength={40}
                          />
                          <AcceptButton onClick={handleAcceptApology}>
                            💝 Accept Apology
                          </AcceptButton>
                        </SignInputRow>
                      </SignForm>
                    )}
                  </SignatureSection>

                  <PrintReceiptBtn onClick={() => window.print()}>
                    🖨️ Print Delivery Certificate
                  </PrintReceiptBtn>
                </OpenedLetterCard>
              )}
            </DeliveredParcelBox>
          )}
        </ParcelColumn>
      </ContentArea>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  color: #000;
  overflow-y: auto;
  user-select: none;
`;

const HeaderBar = styled.div`
  background: #1b5e20;
  color: #fff;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  flex-wrap: wrap;
  gap: 4px;
`;

const CarrierTitle = styled.span`
  font-weight: bold;
  letter-spacing: 0.5px;
`;

const TrackingBadge = styled.span`
  background: #e8f5e9;
  color: #1b5e20;
  padding: 1px 6px;
  font-family: monospace;
  font-size: 11px;
  font-weight: bold;
`;

const ToastNotification = styled.div`
  background: #fff9c4;
  border-bottom: 2px solid #fbc02d;
  color: #f57f17;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
`;

const SummaryCard = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  margin: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  font-size: 11px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.div`
  font-size: 9px;
  color: #666;
  font-weight: bold;
`;

const ValueText = styled.div`
  font-size: 11px;
  color: #000;
`;

const ValueHighlight = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: #2e7d32;
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ProgressInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  height: 14px;
  background: #e0e0e0;
  border: 2px inset #808080;
  padding: 1px;
`;

const ProgressBarFill = styled.div<{ $pct: number }>`
  width: ${props => props.$pct}%;
  height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    #000080,
    #000080 8px,
    #1084d0 8px,
    #1084d0 16px
  );
  transition: width 0.3s ease;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const WinBtn = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#000080' : '#c0c0c0'};
  color: ${props => props.$primary ? '#fff' : '#000'};
  border: 2px outset #ffffff;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;

  &:active {
    border-style: inset;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-style: solid;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 6px 6px 6px;
  flex: 1;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const SectionHeader = styled.div`
  font-weight: bold;
  font-size: 11px;
  color: #000080;
  border-bottom: 1px solid #c0c0c0;
  padding-bottom: 2px;
  margin-bottom: 6px;
`;

const TimelineColumn = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 8px;
  overflow-y: auto;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimelineItem = styled.div<{ $isCurrent: boolean; $isPast: boolean }>`
  display: flex;
  gap: 8px;
  opacity: ${props => props.$isCurrent || props.$isPast ? 1 : 0.45};
`;

const TimelineIconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22px;
`;

const StepBadge = styled.div<{ $isCurrent: boolean; $isPast: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${props =>
    props.$isCurrent ? '#ff9800' :
    props.$isPast ? '#4caf50' : '#bdbdbd'};
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

const StepConnector = styled.div<{ $isPast: boolean }>`
  width: 2px;
  flex: 1;
  min-height: 24px;
  background: ${props => props.$isPast ? '#4caf50' : '#e0e0e0'};
  margin: 2px 0;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding-bottom: 10px;
  font-size: 11px;
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StageTitle = styled.span<{ $isCurrent: boolean }>`
  font-weight: bold;
  color: ${props => props.$isCurrent ? '#e65100' : '#000'};
`;

const StageTime = styled.span`
  font-size: 9px;
  color: #777;
`;

const StageStatusBadge = styled.span<{ $isCurrent: boolean }>`
  display: inline-block;
  background: ${props => props.$isCurrent ? '#fff3e0' : '#f5f5f5'};
  color: ${props => props.$isCurrent ? '#ef6c00' : '#616161'};
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  margin: 2px 0;
  font-weight: bold;
`;

const StageDetails = styled.p`
  margin: 2px 0 0 0;
  font-size: 10px;
  color: #444;
  line-height: 1.3;
`;

const ParcelColumn = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const InTransitBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 10px;
  gap: 8px;
  background: #f1f8e9;
  border: 1px dashed #7cb342;
  margin-top: 10px;
  font-size: 11px;
`;

const VanGraphic = styled.div`
  font-size: 40px;
`;

const InTransitTitle = styled.h3`
  margin: 0;
  color: #2e7d32;
  font-size: 13px;
`;

const TransitNote = styled.p`
  font-style: italic;
  color: #558b2f;
  font-size: 10px;
  margin: 0;
`;

const DeliveredParcelBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ClosedParcelPrompt = styled.div`
  background: #fff8e1;
  border: 2px dashed #f57f17;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 100%;
  text-align: center;
  gap: 8px;

  &:hover {
    background: #ffecb3;
  }
`;

const ParcelIcon = styled.div`
  font-size: 48px;
`;

const PromptTitle = styled.h3`
  margin: 0;
  color: #e65100;
  font-size: 14px;
`;

const OpenedLetterCard = styled.div`
  background: #fffef8;
  border: 2px solid #8d6e63;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
`;

const LetterHeader = styled.div`
  text-align: center;
  border-bottom: 1px solid #d7ccc8;
  padding-bottom: 6px;
`;

const HeartStamp = styled.div`
  color: #c2185b;
  font-weight: bold;
  font-size: 9px;
  letter-spacing: 1px;
`;

const LetterTitle = styled.h4`
  margin: 3px 0;
  font-size: 12px;
  color: #3e2723;
`;

const LetterMeta = styled.div`
  font-size: 9px;
  color: #795548;
`;

const LetterBody = styled.div`
  font-size: 11px;
  line-height: 1.4;
  color: #212121;

  p {
    margin: 4px 0;
  }
`;

const SignatureSection = styled.div`
  background: #fdfdfd;
  border: 1px inset #c0c0c0;
  padding: 8px;
  margin-top: 4px;
`;

const SignForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
`;

const SignInputRow = styled.div`
  display: flex;
  gap: 6px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const SignInput = styled.input`
  flex: 1;
  padding: 4px;
  font-size: 11px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  border: 2px inset #808080;
`;

const AcceptButton = styled.button`
  background: #c2185b;
  color: #fff;
  border: 2px outset #ffffff;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;

  &:active {
    border-style: inset;
  }
`;

const AcceptedBadge = styled.div`
  background: #e8f5e9;
  border: 2px solid #4caf50;
  color: #1b5e20;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
`;

const AcceptedBy = styled.div`
  margin-top: 4px;
  font-size: 11px;
  color: #2e7d32;
`;

const HeartFooter = styled.div`
  margin-top: 4px;
  font-size: 10px;
  font-style: italic;
  color: #43a047;
`;

const PrintReceiptBtn = styled.button`
  background: #c0c0c0;
  border: 2px outset #ffffff;
  padding: 4px;
  font-size: 10px;
  cursor: pointer;

  &:active {
    border-style: inset;
  }
`;

export default SorryDelivery;
