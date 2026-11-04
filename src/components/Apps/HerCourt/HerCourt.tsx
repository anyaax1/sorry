import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { apologyConfig } from '../../../config/apologyConfig';
import { retroAudio } from '../../../utils/retroAudio';
import { loadState, saveState } from '../../../utils/storage';
import { getAssetUrl } from '../../../utils/assetPath';

type CourtTab = 'case' | 'charges' | 'evidence' | 'apology' | 'verdict' | 'judgment';

interface SavedCourtState {
  selectedVerdict: 'guilty' | 'dismissed' | 'need_time' | null;
  selectedSentences: string[];
  customSentence: string;
  isVerdictDelivered: boolean;
  activeEvidenceId: string;
}

export const HerCourt = () => {
  const { court } = apologyConfig;

  // Load persisted state safely
  const [persisted] = useState<SavedCourtState>(() =>
    loadState<SavedCourtState>('her_court', {
      selectedVerdict: null,
      selectedSentences: ['sent-movie'],
      customSentence: '',
      isVerdictDelivered: false,
      activeEvidenceId: court.evidence[0]?.id || '',
    })
  );

  const [activeTab, setActiveTab] = useState<CourtTab>('case');
  const [selectedVerdict, setSelectedVerdict] = useState<'guilty' | 'dismissed' | 'need_time' | null>(
    persisted.selectedVerdict
  );
  const [selectedSentences, setSelectedSentences] = useState<string[]>(
    persisted.selectedSentences || []
  );
  const [customSentence, setCustomSentence] = useState(persisted.customSentence || '');
  const [isVerdictDelivered, setIsVerdictDelivered] = useState(persisted.isVerdictDelivered || false);
  const [activeEvidenceId, setActiveEvidenceId] = useState(persisted.activeEvidenceId || court.evidence[0]?.id);
  const [gavelBanging, setGavelBanging] = useState(false);
  const [orderInCourtNotice, setOrderInCourtNotice] = useState<string | null>(null);

  // Persist state updates
  useEffect(() => {
    saveState<SavedCourtState>('her_court', {
      selectedVerdict,
      selectedSentences,
      customSentence,
      isVerdictDelivered,
      activeEvidenceId,
    });
  }, [selectedVerdict, selectedSentences, customSentence, isVerdictDelivered, activeEvidenceId]);

  const handleBangGavel = () => {
    retroAudio.playGavel();
    setGavelBanging(true);
    setOrderInCourtNotice('ORDER IN THE COURT! The Judge commands full attention.');
    setTimeout(() => {
      setGavelBanging(false);
    }, 400);
    setTimeout(() => {
      setOrderInCourtNotice(null);
    }, 3000);
  };

  const handleSentenceToggle = (id: string) => {
    retroAudio.playClick();
    setSelectedSentences(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleDeliverVerdict = () => {
    if (!selectedVerdict) return;
    handleBangGavel();
    setIsVerdictDelivered(true);
    setActiveTab('judgment');
  };

  const handleResetCase = () => {
    retroAudio.playClick();
    setSelectedVerdict(null);
    setSelectedSentences([]);
    setCustomSentence('');
    setIsVerdictDelivered(false);
    setActiveTab('case');
  };

  const activeEvidence = court.evidence.find(e => e.id === activeEvidenceId) || court.evidence[0];

  return (
    <Container aria-label="The Court of Her Name">
      {/* Top Courtroom Banner */}
      <CourtHeader>
        <HeaderTop>
          <CourtTitle>
            <img
              src={getAssetUrl('/assets/generated/court/gavel.png')}
              alt="Court emblem"
              style={{ width: '22px', height: '22px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '8px' }}
            />
            {court.courtName}
          </CourtTitle>
          <GavelButton
            onClick={handleBangGavel}
            $isBanging={gavelBanging}
            aria-label="Bang Gavel"
            title="Bang the gavel!"
          >
            <img
              src={getAssetUrl('/assets/generated/court/gavel.png')}
              alt="Gavel"
              style={{ width: '18px', height: '18px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '5px' }}
            />
            BANG GAVEL!
          </GavelButton>
        </HeaderTop>
        <BenchInfo>
          <span>⚖️ <strong>Presiding:</strong> {court.judgeName}</span>
          <span>📜 <strong>Case:</strong> {court.caseNumber}</span>
          <span>👤 <strong>Defendant:</strong> {court.defendantName}</span>
        </BenchInfo>
      </CourtHeader>

      {orderInCourtNotice && (
        <OrderBanner role="alert">
          ⚖️ {orderInCourtNotice}
        </OrderBanner>
      )}

      {/* Navigation Tabs */}
      <TabBar role="tablist">
        <TabButton
          role="tab"
          aria-selected={activeTab === 'case'}
          $active={activeTab === 'case'}
          onClick={() => { retroAudio.playClick(); setActiveTab('case'); }}
        >
          1. The Docket
        </TabButton>
        <TabButton
          role="tab"
          aria-selected={activeTab === 'charges'}
          $active={activeTab === 'charges'}
          onClick={() => { retroAudio.playClick(); setActiveTab('charges'); }}
        >
          2. The Charges ({court.charges.length})
        </TabButton>
        <TabButton
          role="tab"
          aria-selected={activeTab === 'evidence'}
          $active={activeTab === 'evidence'}
          onClick={() => { retroAudio.playClick(); setActiveTab('evidence'); }}
        >
          3. Evidence Exhibits
        </TabButton>
        <TabButton
          role="tab"
          aria-selected={activeTab === 'apology'}
          $active={activeTab === 'apology'}
          onClick={() => { retroAudio.playClick(); setActiveTab('apology'); }}
        >
          4. Defendant's Plea
        </TabButton>
        <TabButton
          role="tab"
          aria-selected={activeTab === 'verdict'}
          $active={activeTab === 'verdict'}
          onClick={() => { retroAudio.playClick(); setActiveTab('verdict'); }}
        >
          5. Verdict & Sentence
        </TabButton>
        {isVerdictDelivered && (
          <TabButton
            role="tab"
            aria-selected={activeTab === 'judgment'}
            $active={activeTab === 'judgment'}
            onClick={() => { retroAudio.playClick(); setActiveTab('judgment'); }}
          >
            ★ Official Judgment
          </TabButton>
        )}
      </TabBar>

      {/* Main Tab Content */}
      <ContentBody>
        {/* Tab 1: The Docket */}
        {activeTab === 'case' && (
          <TabPane>
            <ParchmentBox>
              <SectionHeading>📜 Official Court Docket</SectionHeading>
              <ClerkStatement>
                <strong>The Court Clerk announces:</strong>
                <p>"{court.clerkIntroduction}"</p>
              </ClerkStatement>

              <CaseSummaryCard>
                <SummaryRow>
                  <strong>Case ID:</strong> <span>{court.caseNumber}</span>
                </SummaryRow>
                <SummaryRow>
                  <strong>Plaintiff:</strong> <span>Her Heart & Feelings</span>
                </SummaryRow>
                <SummaryRow>
                  <strong>Defendant:</strong> <span>{court.defendantName} (Clueless & Stubborn)</span>
                </SummaryRow>
                <SummaryRow>
                  <strong>Allegations:</strong> <span>Obstruction of cuddles, severe stubbornness, delayed apology.</span>
                </SummaryRow>
                <SummaryRow>
                  <strong>Current Status:</strong> <StatusPill>HEARING IN PROGRESS</StatusPill>
                </SummaryRow>
              </CaseSummaryCard>

              <NextActionRow>
                <WinButton onClick={() => { retroAudio.playClick(); setActiveTab('charges'); }}>
                  Proceed to Review Charges ▶
                </WinButton>
              </NextActionRow>
            </ParchmentBox>
          </TabPane>
        )}

        {/* Tab 2: The Charges */}
        {activeTab === 'charges' && (
          <TabPane>
            <SectionHeading>⚖️ The Formal Accusations</SectionHeading>
            <ChargesList>
              {court.charges.map((charge, idx) => (
                <ChargeCard key={charge.id}>
                  <ChargeTitleRow>
                    <ChargeNumber>#{idx + 1}</ChargeNumber>
                    <div>
                      <ChargeName>{charge.title}</ChargeName>
                      <SeverityTag>{charge.severity}</SeverityTag>
                    </div>
                  </ChargeTitleRow>
                  <ChargeDesc>{charge.description}</ChargeDesc>
                  <ArgumentBox>
                    <strong>Prosecution Argument:</strong> {charge.prosecutionArgument}
                  </ArgumentBox>
                  <PleaBox>
                    <strong>Defendant's Formal Plea:</strong> {charge.defendantPlea}
                  </PleaBox>
                </ChargeCard>
              ))}
            </ChargesList>
            <NextActionRow>
              <WinButton onClick={() => { retroAudio.playClick(); setActiveTab('evidence'); }}>
                Examine Prosecution Evidence ▶
              </WinButton>
            </NextActionRow>
          </TabPane>
        )}

        {/* Tab 3: Evidence Exhibits */}
        {activeTab === 'evidence' && (
          <TabPane>
            <SectionHeading>📂 Evidence Exhibits</SectionHeading>
            <EvidenceLayout>
              <EvidenceSidebar>
                {court.evidence.map(exhibit => (
                  <EvidenceItemButton
                    key={exhibit.id}
                    $active={activeEvidenceId === exhibit.id}
                    onClick={() => {
                      retroAudio.playClick();
                      setActiveEvidenceId(exhibit.id);
                    }}
                  >
                    <span>{exhibit.type === 'document' ? '📄' : exhibit.type === 'chart' ? '📊' : exhibit.type === 'statement' ? '💬' : '🖼️'}</span>
                    <span>{exhibit.title}</span>
                  </EvidenceItemButton>
                ))}
              </EvidenceSidebar>

              <EvidenceViewer>
                <EvidenceHeader>
                  <EvidenceTitle>{activeEvidence.title}</EvidenceTitle>
                  <EvidenceTypeBadge>{activeEvidence.type.toUpperCase()}</EvidenceTypeBadge>
                </EvidenceHeader>
                <EvidenceDesc>{activeEvidence.description}</EvidenceDesc>
                <EvidenceContentBox>
                  <pre>{activeEvidence.content}</pre>
                </EvidenceContentBox>
              </EvidenceViewer>
            </EvidenceLayout>
            <NextActionRow>
              <WinButton onClick={() => { retroAudio.playClick(); setActiveTab('apology'); }}>
                Hear Defendant's Confession ▶
              </WinButton>
            </NextActionRow>
          </TabPane>
        )}

        {/* Tab 4: Defendant's Confession */}
        {activeTab === 'apology' && (
          <TabPane>
            <SectionHeading>🗣️ Defendant's Sworn Testimony & Sincere Apology</SectionHeading>
            <DefendantSpeechBox>
              <DefendantAvatar>🙇‍♂️</DefendantAvatar>
              <SpeechText>
                <h4>Testimony of {court.defendantName}:</h4>
                <p>"{court.defendantApologyStatement}"</p>
                <ApologyPledges>
                  <strong>What I solemnly swear to do moving forward:</strong>
                  <ul>
                    <li>Listen to you without debating, interrupting, or deflecting.</li>
                    <li>Acknowledge your emotions instantly because your peace of mind is my priority.</li>
                    <li>Deflate my ego immediately whenever you are upset.</li>
                    <li>Make you feel safe, loved, cherished, and spoiled every day.</li>
                  </ul>
                </ApologyPledges>
              </SpeechText>
            </DefendantSpeechBox>
            <NextActionRow>
              <WinButton onClick={() => { retroAudio.playClick(); setActiveTab('verdict'); }}>
                Deliver Judge's Verdict ▶
              </WinButton>
            </NextActionRow>
          </TabPane>
        )}

        {/* Tab 5: Verdict & Sentence */}
        {activeTab === 'verdict' && (
          <TabPane>
            <SectionHeading>⚖️ Enter Your Verdict, Your Honor</SectionHeading>
            <VerdictDescription>
              As the sole presiding Judge of this relationship, select the outcome that aligns with your heart.
              No verdict is forced upon you.
            </VerdictDescription>

            <VerdictOptionsGrid role="radiogroup" aria-label="Verdict selection">
              {court.verdicts.map(verdict => (
                <VerdictCard
                  key={verdict.id}
                  $selected={selectedVerdict === verdict.id}
                  onClick={() => {
                    retroAudio.playClick();
                    setSelectedVerdict(verdict.id);
                  }}
                  role="radio"
                  aria-checked={selectedVerdict === verdict.id}
                  tabIndex={0}
                >
                  <VerdictBadge>{verdict.statusBadge}</VerdictBadge>
                  <VerdictTitle>{verdict.title}</VerdictTitle>
                  <VerdictText>{verdict.description}</VerdictText>
                </VerdictCard>
              ))}
            </VerdictOptionsGrid>

            {/* Sentence Selection (applicable for guilty or dismissed with conditions) */}
            <SentenceSection>
              <SentenceHeader>
                <strong>Sentence & Consequences:</strong> Select all penances the defendant must perform:
              </SentenceHeader>

              <SentenceList>
                {court.defaultSentences.map(sent => (
                  <SentenceItem key={sent.id}>
                    <input
                      type="checkbox"
                      id={sent.id}
                      checked={selectedSentences.includes(sent.id)}
                      onChange={() => handleSentenceToggle(sent.id)}
                    />
                    <SentenceLabel htmlFor={sent.id}>
                      <strong>{sent.label}</strong> — {sent.description}
                    </SentenceLabel>
                  </SentenceItem>
                ))}
              </SentenceList>

              <CustomSentenceBox>
                <label htmlFor="custom-sentence">
                  <strong>✍️ Add a Custom Sentence / Consequence:</strong>
                </label>
                <CustomInput
                  id="custom-sentence"
                  type="text"
                  placeholder="e.g. Must give me foot massages for 3 days and buy me boba..."
                  value={customSentence}
                  onChange={e => setCustomSentence(e.target.value)}
                  maxLength={150}
                />
              </CustomSentenceBox>
            </SentenceSection>

            <SubmitVerdictRow>
              <WinButton
                $primary
                disabled={!selectedVerdict}
                onClick={handleDeliverVerdict}
                aria-label="Confirm and Deliver Verdict"
              >
                🔨 DELIVER VERDICT & ISSUE DECREE
              </WinButton>
            </SubmitVerdictRow>
          </TabPane>
        )}

        {/* Tab 6: Official Judgment Document */}
        {activeTab === 'judgment' && (
          <TabPane>
            <JudgmentDocument>
              <DocHeader>
                <img
                  src={getAssetUrl('/assets/generated/court/gavel.png')}
                  alt="Official Seal Gavel"
                  style={{ width: '48px', height: '48px', objectFit: 'contain', margin: '0 auto 6px auto', display: 'block' }}
                />
                <DocSeal>★ OFFICIAL SEAL OF THE COURT OF HER HEART ★</DocSeal>
                <DocTitle>FINAL JUDICIAL DECREE</DocTitle>
                <DocSub>{court.caseNumber} | Filed & Sealed in Open Court</DocSub>
              </DocHeader>

              <DocBody>
                <p>
                  <strong>UPON FULL REVIEW</strong> of all charges, evidence, and the defendant's sincere plea of contrition,
                  the Honorable Judge <u>{court.judgeName}</u> hereby decrees:
                </p>

                <DecreeVerdictBox $verdict={selectedVerdict}>
                  {selectedVerdict === 'guilty' && '🔴 THE DEFENDANT IS FOUND GUILTY OF LOVING TOO CLUELESSLY AND IS SENTENCED ACCORDINGLY.'}
                  {selectedVerdict === 'dismissed' && '🟢 THE COURT DISMISSES THE CHARGES WITH CONDITIONS OF TENDER CARE & EXTRA AFFECTION.'}
                  {selectedVerdict === 'need_time' && '⏳ THE COURT GRANTS A RECESS. THE DEFENDANT MUST REMAIN PATIENT, GENTLE, AND ATTENTIVE.'}
                </DecreeVerdictBox>

                <DecreeSentences>
                  <strong>MANDATED PENANCE & PROMISES:</strong>
                  <ul>
                    {selectedSentences.map(id => {
                      const item = court.defaultSentences.find(s => s.id === id);
                      return item ? <li key={id}>{item.label}: {item.description}</li> : null;
                    })}
                    {customSentence.trim() && (
                      <li><strong>Special Judge's Order:</strong> {customSentence.trim()}</li>
                    )}
                  </ul>
                </DecreeSentences>

                <DocSignatures>
                  <SignBox>
                    <SignLine>Presiding Judge: {court.judgeName}</SignLine>
                    <SignLabel>Presiding Magistrate Signature</SignLabel>
                  </SignBox>
                  <SignBox>
                    <SignLine>Defendant: {court.defendantName} (Submitting to Judgment)</SignLine>
                    <SignLabel>Defendant Signature</SignLabel>
                  </SignBox>
                </DocSignatures>
              </DocBody>

              <DocFooter>
                <span>Dated: {new Date().toLocaleDateString()}</span>
                <StampBadge>APPROVED BY THE JUDGE</StampBadge>
              </DocFooter>
            </JudgmentDocument>

            <ResetRow>
              <WinButton onClick={() => window.print()} title="Print or save decree">
                🖨️ Print Decree
              </WinButton>
              <WinButton onClick={handleResetCase}>
                🔄 Review Case Again
              </WinButton>
            </ResetRow>
          </TabPane>
        )}
      </ContentBody>
    </Container>
  );
};

// Animations
const gavelSwing = keyframes`
  0% { transform: rotate(0deg); }
  50% { transform: rotate(-35deg); }
  100% { transform: rotate(0deg); }
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

const CourtHeader = styled.div`
  background: #3e2723;
  color: #fff;
  padding: 6px 10px;
  border-bottom: 2px solid #8d6e63;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

const CourtTitle = styled.h2`
  font-size: 13px;
  letter-spacing: 1px;
  color: #ffd54f;
  margin: 0;
`;

const GavelButton = styled.button<{ $isBanging: boolean }>`
  background: #d7ccc8;
  border: 2px outset #ffffff;
  font-size: 11px;
  font-weight: bold;
  padding: 3px 8px;
  cursor: pointer;
  animation: ${props => props.$isBanging ? gavelSwing : 'none'} 0.3s ease;

  &:active {
    border-style: inset;
  }
`;

const BenchInfo = styled.div`
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #ffecb3;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const OrderBanner = styled.div`
  background: #b71c1c;
  color: #fff;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
`;

const TabBar = styled.div`
  display: flex;
  background: #d4d0c8;
  padding: 4px 4px 0 4px;
  gap: 2px;
  border-bottom: 2px solid #808080;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  border: 2px solid;
  border-color: ${props => props.$active ? '#fff #808080 #c0c0c0 #fff' : '#fff #808080 #808080 #fff'};
  background: ${props => props.$active ? '#c0c0c0' : '#b0b0b0'};
  padding: 4px 8px;
  font-size: 11px;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: 1px dotted #000;
  }
`;

const ContentBody = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
`;

const TabPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeading = styled.h3`
  font-size: 12px;
  border-bottom: 2px groove #fff;
  padding-bottom: 4px;
  margin: 0;
  color: #000080;
`;

const ParchmentBox = styled.div`
  background: #fffdf5;
  border: 2px inset #808080;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ClerkStatement = styled.div`
  background: #f5f0e1;
  border-left: 4px solid #8d6e63;
  padding: 8px;
  font-size: 11px;
  line-height: 1.4;
`;

const CaseSummaryCard = styled.div`
  background: #ffffff;
  border: 1px solid #dcdcdc;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dotted #e0e0e0;
  padding-bottom: 3px;
`;

const StatusPill = styled.span`
  background: #fff9c4;
  color: #f57f17;
  padding: 1px 6px;
  font-weight: bold;
  font-size: 10px;
  border: 1px solid #fbc02d;
`;

const ChargesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChargeCard = styled.div`
  background: #ffffff;
  border: 2px outset #ffffff;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.1);
`;

const ChargeTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChargeNumber = styled.span`
  background: #b71c1c;
  color: #fff;
  font-weight: bold;
  padding: 2px 6px;
  font-size: 11px;
`;

const ChargeName = styled.span`
  font-weight: bold;
  font-size: 12px;
  color: #000;
`;

const SeverityTag = styled.span`
  font-size: 10px;
  color: #c62828;
  font-style: italic;
  display: block;
`;

const ChargeDesc = styled.p`
  font-size: 11px;
  line-height: 1.3;
  margin: 0;
`;

const ArgumentBox = styled.div`
  background: #fbe9e7;
  padding: 5px;
  font-size: 10px;
  border-left: 3px solid #ff5722;
`;

const PleaBox = styled.div`
  background: #ede7f6;
  padding: 5px;
  font-size: 10px;
  border-left: 3px solid #673ab7;
`;

const EvidenceLayout = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 8px;

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const EvidenceSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EvidenceItemButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#000080' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  border: 1px solid #808080;
  padding: 6px;
  text-align: left;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  gap: 6px;
  align-items: center;

  &:hover {
    background: ${props => props.$active ? '#000080' : '#e3f2fd'};
  }
`;

const EvidenceViewer = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EvidenceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #c0c0c0;
  padding-bottom: 4px;
`;

const EvidenceTitle = styled.h4`
  margin: 0;
  font-size: 12px;
`;

const EvidenceTypeBadge = styled.span`
  background: #cfd8dc;
  font-size: 9px;
  padding: 1px 4px;
  font-weight: bold;
`;

const EvidenceDesc = styled.p`
  font-size: 11px;
  font-style: italic;
  color: #555;
  margin: 0;
`;

const EvidenceContentBox = styled.div`
  background: #fdfae6;
  border: 1px solid #d4c68d;
  padding: 8px;
  font-family: monospace;
  font-size: 11px;
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: 180px;
  overflow-y: auto;
`;

const DefendantSpeechBox = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 12px;
  display: flex;
  gap: 12px;
`;

const DefendantAvatar = styled.div`
  font-size: 36px;
`;

const SpeechText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 11px;
  line-height: 1.4;

  h4 {
    margin: 0;
    color: #000080;
  }
`;

const ApologyPledges = styled.div`
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
  padding: 6px 10px;
  font-size: 11px;

  ul {
    padding-left: 18px;
    margin-top: 4px;
  }

  li {
    margin-bottom: 2px;
  }
`;

const VerdictDescription = styled.p`
  font-size: 11px;
  margin: 0;
  color: #333;
`;

const VerdictOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const VerdictCard = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#e8eaf6' : '#ffffff'};
  border: 2px ${props => props.$selected ? 'inset #000080' : 'outset #ffffff'};
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  box-shadow: ${props => props.$selected ? 'inset 0 0 4px #3f51b5' : 'none'};

  &:hover {
    background: #f5f5f5;
  }

  &:focus-visible {
    outline: 2px dotted #000080;
  }
`;

const VerdictBadge = styled.span`
  font-size: 9px;
  font-weight: bold;
`;

const VerdictTitle = styled.h4`
  margin: 0;
  font-size: 11px;
  color: #000080;
`;

const VerdictText = styled.p`
  font-size: 10px;
  color: #444;
  margin: 0;
  line-height: 1.3;
`;

const SentenceSection = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SentenceHeader = styled.div`
  font-size: 11px;
`;

const SentenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SentenceItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
`;

const SentenceLabel = styled.label`
  cursor: pointer;
  line-height: 1.3;
`;

const CustomSentenceBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
`;

const CustomInput = styled.input`
  padding: 4px 6px;
  font-size: 11px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  border: 2px inset #808080;
`;

const SubmitVerdictRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 0;
`;

const NextActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
`;

const WinButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#000080' : '#c0c0c0'};
  color: ${props => props.$primary ? '#fff' : '#000'};
  border: 2px outset #ffffff;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: ${props => props.$primary ? '#1084d0' : '#d4d0c8'};
  }

  &:active {
    border-style: inset;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-style: solid;
  }

  &:focus-visible {
    outline: 1px dotted #000;
  }
`;

const JudgmentDocument = styled.div`
  background: #fffef2;
  border: 3px double #8d6e63;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
`;

const DocHeader = styled.div`
  text-align: center;
  border-bottom: 2px solid #8d6e63;
  padding-bottom: 8px;
`;

const DocSeal = styled.div`
  font-size: 10px;
  letter-spacing: 2px;
  color: #b71c1c;
  font-weight: bold;
`;

const DocTitle = styled.h2`
  font-family: 'Times New Roman', serif;
  font-size: 18px;
  letter-spacing: 2px;
  margin: 4px 0;
  color: #3e2723;
`;

const DocSub = styled.div`
  font-size: 10px;
  color: #666;
`;

const DocBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
  line-height: 1.4;
`;

const DecreeVerdictBox = styled.div<{ $verdict: 'guilty' | 'dismissed' | 'need_time' | null }>`
  background: ${props =>
    props.$verdict === 'guilty' ? '#ffebee' :
    props.$verdict === 'dismissed' ? '#e8f5e9' : '#fffde7'};
  border: 2px solid ${props =>
    props.$verdict === 'guilty' ? '#c62828' :
    props.$verdict === 'dismissed' ? '#2e7d32' : '#f9a825'};
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
`;

const DecreeSentences = styled.div`
  font-size: 11px;

  ul {
    padding-left: 20px;
    margin-top: 4px;
  }

  li {
    margin-bottom: 4px;
  }
`;

const DocSignatures = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px dashed #c0c0c0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SignBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const SignLine = styled.div`
  font-family: 'Times New Roman', cursive, serif;
  font-style: italic;
  font-size: 13px;
  color: #000080;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
`;

const SignLabel = styled.span`
  font-size: 9px;
  color: #777;
  margin-top: 2px;
`;

const DocFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #888;
  border-top: 1px solid #dcdcdc;
  padding-top: 6px;
`;

const StampBadge = styled.span`
  border: 2px solid #b71c1c;
  color: #b71c1c;
  padding: 2px 6px;
  font-size: 9px;
  font-weight: bold;
  transform: rotate(-3deg);
`;

const ResetRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

export default HerCourt;
