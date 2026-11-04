import { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import MusicPlayer from './MusicPlayer';
import { apologyConfig } from '../../../config/apologyConfig';
import { loadState, saveState } from '../../../utils/storage';

interface LoveNote {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

const DEFAULT_NOTES: LoveNote[] = [
  {
    id: 'note-1',
    name: 'Your Boyfriend',
    message: 'I built this entire operating system just to say sorry and make you smile. You deserve the world!',
    timestamp: '1995-10-24 10:00:00',
  },
  {
    id: 'note-2',
    name: 'Cupid Service v1.0',
    message: 'System Diagnostic: Relationship compatibility is 100%. Stubbornness level reduced to 0%.',
    timestamp: '1995-10-24 10:15:00',
  },
];

export const HomePage = () => {
  const { couple } = apologyConfig;
  const [notes, setNotes] = useState<LoveNote[]>(() =>
    loadState<LoveNote[]>('apology_portal_notes', DEFAULT_NOTES)
  );
  const [visitorCount] = useState<number>(() => {
    const prev = loadState<number>('apology_portal_visits', 0);
    const next = prev + 1;
    saveState('apology_portal_visits', next);
    return next;
  });
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim().length < 2 || formMessage.trim().length < 3) return;

    const newNote: LoveNote = {
      id: `note-${Date.now()}`,
      name: formName.trim(),
      message: formMessage.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveState('apology_portal_notes', updated);
    setFormName('');
    setFormMessage('');
    setShowForm(false);
    setSuccessMessage('Note posted to our cyber scrapbook! ❤️');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSuccessMessage(null), 4000);
  };

  const formatVisitorCount = (count: number) => String(count).padStart(6, '0');

  return (
    <PageContainer>
      {/* 90s Marquee Header */}
      <Header>
        <WelcomeBanner>
          <MarqueeText>
            *** WELCOME TO THE SORRY COMPUTER CYBERSPACE PORTAL! *** BUILT EXCLUSIVELY FOR {couple.girlfriendName.toUpperCase()} *** 100% CONTRITION, 0% EXCUSES ***
          </MarqueeText>
        </WelcomeBanner>

        <TitleSection>
          <AnimatedFire>{'🔥'.repeat(12)}</AnimatedFire>
          <MainTitle>
            <RainbowText>THE SORRY COMPUTER</RainbowText>
            <GlowText>PORTAL 95</GlowText>
          </MainTitle>
          <Subtitle>~ Dedicated Exclusively to {couple.girlfriendName} ~</Subtitle>
          <AnimatedFire>{'🔥'.repeat(12)}</AnimatedFire>
        </TitleSection>

        <HitCounter>
          <CounterLabel>You are visitor #</CounterLabel>
          <CounterDigits>{formatVisitorCount(visitorCount)}</CounterDigits>
        </HitCounter>
      </Header>

      <MusicPlayer />

      <MainContent>
        {/* Welcome Section */}
        <ContentSection>
          <SectionTitle>🌟 WELCOME TO YOUR PERSONAL COMPUTER</SectionTitle>
          <IntroCard>
            <p>
              <strong>Dear {couple.girlfriendName},</strong>
            </p>
            <p>
              Welcome to cyberspace! You are currently browsing the official apology station.
              Every corner, application, and file on this computer was coded from scratch to say
              I am truly sorry for my mistakes and stubbornness.
            </p>
            <p>
              Explore the five custom apology programs installed on your desktop:
            </p>
            <ProgramsList>
              <li>☎️ <strong>Sorry Hotline:</strong> Dial into 24/7 contrition voicemails and explanations.</li>
              <li>⚖️ <strong>The Court of Her Name:</strong> Preside as sole Judge and enter your final decree.</li>
              <li>🍫 <strong>Sorry Vending Machine:</strong> Dispense apologies, treats, and redemption coupons.</li>
              <li>⚔️ <strong>Boss Fight: My Ego:</strong> Deflate my stubborn pride in an arcade battle.</li>
              <li>📦 <strong>Sorry Is Out for Delivery:</strong> Track the real-time arrival of my sincere apology.</li>
            </ProgramsList>
          </IntroCard>
        </ContentSection>

        {/* Love Notes / Guestbook Section */}
        <ContentSection>
          <SectionTitle>📖 MEMORY SCRAPBOOK & GUESTBOOK</SectionTitle>
          <ScrapbookIntro>
            Leave your thoughts, forgiveness notes, or demands for extra snacks below!
          </ScrapbookIntro>

          {!showForm && (
            <SignButton onClick={() => setShowForm(true)} type="button">
              ✍️ Sign Our Guestbook / Leave a Note
            </SignButton>
          )}

          {showForm && (
            <FormCard onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel htmlFor="name-input">Your Name:</FormLabel>
                <FormInput
                  id="name-input"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={`e.g. ${couple.girlfriendName}`}
                  maxLength={30}
                  required
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="msg-input">Message / Note:</FormLabel>
                <FormTextArea
                  id="msg-input"
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  placeholder="Leave a message for the computer records..."
                  maxLength={250}
                  required
                />
              </FormGroup>
              <ButtonGroup>
                <SubmitButton type="submit">❤️ Post Note</SubmitButton>
                <CancelButton type="button" onClick={() => setShowForm(false)}>Cancel</CancelButton>
              </ButtonGroup>
            </FormCard>
          )}

          {successMessage && <SuccessNotice>{successMessage}</SuccessNotice>}

          <NotesList>
            {notes.map(n => (
              <NoteCard key={n.id}>
                <NoteHeader>
                  <strong>{n.name}</strong>
                  <small>{n.timestamp}</small>
                </NoteHeader>
                <NoteBody>{n.message}</NoteBody>
              </NoteCard>
            ))}
          </NotesList>
        </ContentSection>

        {/* 90s Web Badges Footer */}
        <BadgesSection>
          <Badge>BEST VIEWED WITH NETSCAPE 3.0</Badge>
          <Badge>MADE WITH 100% LOVE & REMORSE</Badge>
          <Badge>800x600 RESOLUTION RECOMMENDED</Badge>
          <Badge>NO EXCUSES GUARANTEE</Badge>
        </BadgesSection>
      </MainContent>
    </PageContainer>
  );
};

// Animations
const marqueeAnim = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const rainbowAnim = keyframes`
  0% { color: #ff0000; }
  20% { color: #ff8000; }
  40% { color: #ffff00; }
  60% { color: #00ff00; }
  80% { color: #00ffff; }
  100% { color: #ff00ff; }
`;

const PageContainer = styled.div`
  background: #000033;
  color: #ffffff;
  font-family: 'Times New Roman', serif;
  min-height: 100%;
  padding: 12px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 16px;
`;

const WelcomeBanner = styled.div`
  background: #000080;
  border: 2px dashed #ffff00;
  padding: 6px;
  overflow: hidden;
  white-space: nowrap;
`;

const MarqueeText = styled.div`
  display: inline-block;
  color: #ffff00;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  animation: ${marqueeAnim} 22s linear infinite;
`;

const TitleSection = styled.div`
  margin: 14px 0;
`;

const AnimatedFire = styled.div`
  font-size: 16px;
  letter-spacing: 2px;
`;

const MainTitle = styled.h1`
  margin: 6px 0;
`;

const RainbowText = styled.span`
  display: block;
  font-size: 26px;
  animation: ${rainbowAnim} 4s linear infinite;
  font-family: 'Arial Black', sans-serif;
  letter-spacing: 2px;
`;

const GlowText = styled.span`
  display: block;
  font-size: 22px;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
  font-family: 'Arial Black', sans-serif;
`;

const Subtitle = styled.p`
  font-style: italic;
  color: #ff80ab;
  font-size: 13px;
  margin-top: 4px;
`;

const HitCounter = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #000000;
  border: 2px inset #808080;
  padding: 4px 10px;
  margin-top: 6px;
`;

const CounterLabel = styled.span`
  font-size: 11px;
  color: #00ff00;
  font-family: 'Courier New', monospace;
`;

const CounterDigits = styled.span`
  background: #111;
  color: #ff0000;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 3px;
  padding: 2px 6px;
  border: 1px solid #444;
`;

const MainContent = styled.main`
  max-width: 720px;
  margin: 0 auto;
`;

const ContentSection = styled.section`
  background: rgba(255, 255, 255, 0.08);
  border: 2px outset #808080;
  padding: 14px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  color: #ffff00;
  font-size: 16px;
  border-bottom: 2px groove #808080;
  padding-bottom: 4px;
  margin-bottom: 10px;
  font-family: 'Arial', sans-serif;
`;

const IntroCard = styled.div`
  font-size: 13px;
  line-height: 1.5;
  color: #e0e0e0;

  p {
    margin-bottom: 8px;
  }
`;

const ProgramsList = styled.ul`
  margin: 8px 0 8px 20px;
  font-size: 12px;
  line-height: 1.6;

  li {
    margin-bottom: 4px;
  }
`;

const ScrapbookIntro = styled.p`
  font-size: 12px;
  color: #b0bec5;
  margin-bottom: 10px;
`;

const SignButton = styled.button`
  background: #008080;
  color: #ffffff;
  border: 2px outset #ffffff;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    background: #00a0a0;
  }
`;

const FormCard = styled.form`
  background: #263238;
  border: 1px solid #90a4ae;
  padding: 10px;
  margin-bottom: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 8px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 11px;
  color: #ffeb3b;
  margin-bottom: 2px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 4px;
  font-size: 12px;
  background: #ffffff;
  color: #000000;
  border: 2px inset #808080;
  box-sizing: border-box;
`;

const FormTextArea = styled.textarea`
  width: 100%;
  height: 60px;
  padding: 4px;
  font-size: 12px;
  background: #ffffff;
  color: #000000;
  border: 2px inset #808080;
  box-sizing: border-box;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const SubmitButton = styled.button`
  background: #c2185b;
  color: #fff;
  border: 2px outset #fff;
  padding: 4px 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
`;

const CancelButton = styled.button`
  background: #616161;
  color: #fff;
  border: 2px outset #fff;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 11px;
`;

const SuccessNotice = styled.div`
  background: #1b5e20;
  color: #a5d6a7;
  padding: 6px 10px;
  border: 1px solid #4caf50;
  font-size: 11px;
  margin-bottom: 10px;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoteCard = styled.div`
  background: #1a237e;
  border: 1px solid #3f51b5;
  padding: 8px;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #ffd54f;
  margin-bottom: 4px;

  small {
    color: #9fa8da;
  }
`;

const NoteBody = styled.p`
  font-size: 12px;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
`;

const BadgesSection = styled.footer`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #546e7a;
`;

const Badge = styled.span`
  background: #000000;
  color: #00ff00;
  border: 1px solid #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  padding: 3px 6px;
  font-weight: bold;
`;

export default HomePage;
