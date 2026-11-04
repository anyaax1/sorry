import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import MusicPlayer from './MusicPlayer';
import {
  getGuestbookEntries,
  submitGuestbookEntry,
  recordVisit,
  type GuestbookEntry
} from '../../../services/guestbookService';

const HomePage = () => {
  // Guestbook state
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (successTimer.current) clearTimeout(successTimer.current); }, []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch entries and record visit on mount
  useEffect(() => {
    let cancelled = false;
    void recordVisit().then(result => { if (!cancelled) setVisitorCount(result.visitorCount); }).catch(() => { /* Entries still load if visit tracking fails. */ });
    void getGuestbookEntries().then(data => {
      if (!cancelled) {
        setEntries(data.entries);
        setVisitorCount(count => count ?? data.visitorCount);
      }
    }).catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formName.trim().length < 2 || formMessage.trim().length < 3) {
      setError('Use at least 2 characters for your name and 3 for your message.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitGuestbookEntry(formName.trim(), formMessage.trim());
      setEntries(prev => [result.entry, ...prev]);
      setFormName('');
      setFormMessage('');
      setShowForm(false);
      setSuccessMessage('Thanks for signing my guestbook! You rock! 🎸');
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Try again!');
    } finally {
      setSubmitting(false);
    }
  };

  // Format visitor count with leading zeros (90s style!)
  const formatVisitorCount = (count: number | null) => {
    return count === null ? '------' : String(count).padStart(6, '0');
  };

  return (
    <PageContainer>
      {/* Header with animated text */}
      <Header>
        <WelcomeBanner>
          <MarqueeText>
            *** Welcome to Fonchi's Cyber Corner of the Information Superhighway! *** Your #1 Source for Coding, BTTF & Retro Awesomeness! *** Last Updated: December 31, 1999 ***
          </MarqueeText>
        </WelcomeBanner>

        <TitleSection>
          <AnimatedFire>
            {'🔥'.repeat(15)}
          </AnimatedFire>
          <MainTitle>
            <RainbowText>Fonchi's</RainbowText>
            <GlowText>HOMEPAGE</GlowText>
          </MainTitle>
          <Subtitle>~ Established 1995 ~</Subtitle>
          <AnimatedFire>
            {'🔥'.repeat(15)}
          </AnimatedFire>
        </TitleSection>

        <HitCounter>
          <CounterLabel>You are visitor #</CounterLabel>
          <CounterBox>
            <DigitDisplay>{formatVisitorCount(visitorCount)}</DigitDisplay>
          </CounterBox>
          <CounterLabel>since 1995!</CounterLabel>
        </HitCounter>

        <BadgeRow>
          <NetscapeBadge>
            <BadgeIcon>N</BadgeIcon>
            <BadgeText>Netscape<br/>NOW!</BadgeText>
          </NetscapeBadge>
          <IEBadge>
            <BadgeIcon>e</BadgeIcon>
            <BadgeText>Best with<br/>IE 4.0</BadgeText>
          </IEBadge>
          <ResolutionBadge>800x600</ResolutionBadge>
          <Y2KBadge>Y2K<br/>READY!</Y2KBadge>
        </BadgeRow>

        {/* Social Links - 90s style animated buttons */}
        <SocialRow>
          <Retro90sButton href="https://www.linkedin.com/in/alfonsoridao/" target="_blank" rel="noopener noreferrer">
            <ButtonGlow />
            <ButtonContent>
              <RetroIcon>👔</RetroIcon>
              <span>LinkedIn</span>
            </ButtonContent>
          </Retro90sButton>
          <StarDivider>✦ ✦ ✦</StarDivider>
          <Retro90sButton href="https://www.instagram.com/alfonsoridao/" target="_blank" rel="noopener noreferrer" $gradient>
            <ButtonGlow />
            <ButtonContent>
              <RetroIcon>📷</RetroIcon>
              <span>Instagram</span>
            </ButtonContent>
          </Retro90sButton>
        </SocialRow>
      </Header>

      {/* Navigation */}
      <NavTable>
        <NavTitle>*** NAVIGATION ***</NavTitle>
        <NavRow>
          <NavLink href="#about">[About Me]</NavLink>
          <NavLink href="#90sweb">[90s Web]</NavLink>
          <NavLink href="#bttf">[BTTF]</NavLink>
          <NavLink href="#coding">[Coding]</NavLink>
          <NavLink href="#gaming">[Gaming]</NavLink>
          <NavLink href="#music">[Music]</NavLink>
          <NavLink href="#guestbook">[Guestbook]</NavLink>
        </NavRow>
      </NavTable>

      <ContentArea>
        {/* About Me Section */}
        <Section id="about">
          <SectionHeader>
            <BlinkingNew>✦ NEW! ✦</BlinkingNew>
            <SectionTitle>About The Webmaster</SectionTitle>
            <BlinkingNew>✦ NEW! ✦</BlinkingNew>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <AboutContent>
            <AvatarBox>
              <PixelAvatar>
                {`  ▓▓▓▓▓▓
 ▓░░░░░░▓
▓░▓░░░░▓░▓
▓░░░░░░░░▓
▓░░▓▓▓▓░░▓
▓░░░░░░░░▓
 ▓░░░░░░▓
  ▓▓▓▓▓▓  `}
              </PixelAvatar>
              <AvatarLabel>~ Fonchi ~</AvatarLabel>
            </AvatarBox>
            <AboutText>
              <WelcomeText>Greetings, fellow Netizen!</WelcomeText>
              <p>Welcome to my little corner of cyberspace! I'm <strong>Fonchi</strong>, a software developer, BTTF superfan, and time-travel enthusiast from the future.</p>
              <p>I spend my days writing code in Pascal, C, and JavaScript, playing retro games, and dreaming about DeLoreans.</p>
              <EmailBox>
                <AnimatedEnvelope>✉</AnimatedEnvelope>
                <EmailText>E-Mail me at: <EmailLink href="mailto:alfonso@ridao.ar">alfonso@ridao.ar</EmailLink></EmailText>
              </EmailBox>
            </AboutText>
          </AboutContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* 90s Web Section */}
        <Section id="90sweb">
          <SectionHeader>
            <WebEmoji>🌐</WebEmoji>
            <SectionTitle>90s WEB NOSTALGIA</SectionTitle>
            <WebEmoji>🌐</WebEmoji>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <NostalgiaContent>
            <NostalgiaIntro>
              Remember when the internet was simple and fun?
            </NostalgiaIntro>
            <NostalgiaGrid>
              <NostalgiaItem>
                <NostalgiaIcon>📧</NostalgiaIcon>
                <NostalgiaTitle>You've Got Mail!</NostalgiaTitle>
                <NostalgiaDesc>AOL dialup sounds</NostalgiaDesc>
              </NostalgiaItem>
              <NostalgiaItem>
                <NostalgiaIcon>💬</NostalgiaIcon>
                <NostalgiaTitle>ICQ & MSN</NostalgiaTitle>
                <NostalgiaDesc>Uh-oh! messages</NostalgiaDesc>
              </NostalgiaItem>
              <NostalgiaItem>
                <NostalgiaIcon>🏠</NostalgiaIcon>
                <NostalgiaTitle>GeoCities</NostalgiaTitle>
                <NostalgiaDesc>Free homepages!</NostalgiaDesc>
              </NostalgiaItem>
              <NostalgiaItem>
                <NostalgiaIcon>🔍</NostalgiaIcon>
                <NostalgiaTitle>AltaVista</NostalgiaTitle>
                <NostalgiaDesc>Before Google</NostalgiaDesc>
              </NostalgiaItem>
            </NostalgiaGrid>
            <CoolSitesBox>
              <CoolSitesTitle>🌟 COOL SITES OF THE 90s 🌟</CoolSitesTitle>
              <CoolSitesSubtitle>Click to visit! (Opens in new window)</CoolSitesSubtitle>
              <CoolSitesList>
                <CoolSiteLink href="https://www.spacejam.com/1996/" target="_blank" rel="noopener noreferrer">
                  <SiteIcon>🏀</SiteIcon>
                  <SiteInfo>
                    <SiteName>Space Jam</SiteName>
                    <SiteDesc>Still online since 1996! The original site!</SiteDesc>
                  </SiteInfo>
                </CoolSiteLink>
                <CoolSiteLink href="https://www.oocities.org/" target="_blank" rel="noopener noreferrer">
                  <SiteIcon>🏠</SiteIcon>
                  <SiteInfo>
                    <SiteName>GeoCities Archive</SiteName>
                    <SiteDesc>Preserved GeoCities pages - explore the past!</SiteDesc>
                  </SiteInfo>
                </CoolSiteLink>
                <CoolSiteLink href="https://theoldnet.com/" target="_blank" rel="noopener noreferrer">
                  <SiteIcon>🌐</SiteIcon>
                  <SiteInfo>
                    <SiteName>TheOldNet</SiteName>
                    <SiteDesc>Browse the web like it's 1999!</SiteDesc>
                  </SiteInfo>
                </CoolSiteLink>
                <CoolSiteLink href="https://www.cameronsworld.net/" target="_blank" rel="noopener noreferrer">
                  <SiteIcon>✨</SiteIcon>
                  <SiteInfo>
                    <SiteName>Cameron's World</SiteName>
                    <SiteDesc>Beautiful GeoCities collage tribute</SiteDesc>
                  </SiteInfo>
                </CoolSiteLink>
                <CoolSiteLink href="https://poolsuite.net/" target="_blank" rel="noopener noreferrer">
                  <SiteIcon>🏖️</SiteIcon>
                  <SiteInfo>
                    <SiteName>Poolsuite FM</SiteName>
                    <SiteDesc>Retro vacation vibes & music</SiteDesc>
                  </SiteInfo>
                </CoolSiteLink>
                <CoolSiteLink href="https://wiby.me/" target="_blank" rel="noopener noreferrer">
                  <SiteIcon>🔍</SiteIcon>
                  <SiteInfo>
                    <SiteName>Wiby.me</SiteName>
                    <SiteDesc>Search engine for old-style websites</SiteDesc>
                  </SiteInfo>
                </CoolSiteLink>
              </CoolSitesList>
            </CoolSitesBox>
          </NostalgiaContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* BTTF Section */}
        <Section id="bttf">
          <SectionHeader>
            <Lightning>⚡</Lightning>
            <SectionTitle>BACK TO THE FUTURE FAN ZONE</SectionTitle>
            <Lightning>⚡</Lightning>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <BTTFContent>
            <BTTFImageRow>
              <BTTFGif src="https://media.giphy.com/media/7TZvWKVkm0xXi/giphy.gif" alt="DeLorean" />
              <BTTFGif src="https://media.giphy.com/media/xsF1FSDbjguis/giphy.gif" alt="Doc Brown" />
            </BTTFImageRow>
            <BTTFQuote>
              "Roads? Where we're going, we don't need roads."
            </BTTFQuote>
            <QuoteAuthor>- Dr. Emmett Brown</QuoteAuthor>
            <TimeCircuitsContainer>
              <TimeCircuitLabel>⚡ TIME CIRCUITS ⚡</TimeCircuitLabel>
              <TimeCircuit>
                <CircuitRow>
                  <CircuitLabel $color="#ff0000">DESTINATION TIME</CircuitLabel>
                  <CircuitValue $color="#ff0000">OCT 21 2015 04:29</CircuitValue>
                </CircuitRow>
                <CircuitRow>
                  <CircuitLabel $color="#00ff00">PRESENT TIME</CircuitLabel>
                  <CircuitValue $color="#00ff00">NOV 05 1955 06:15</CircuitValue>
                </CircuitRow>
                <CircuitRow>
                  <CircuitLabel $color="#ffff00">LAST TIME DEPARTED</CircuitLabel>
                  <CircuitValue $color="#ffff00">OCT 26 1985 01:21</CircuitValue>
                </CircuitRow>
              </TimeCircuit>
            </TimeCircuitsContainer>
            <GigawattsBox>
              <GigawattsText>1.21 GIGAWATTS!</GigawattsText>
            </GigawattsBox>
            <FluxCapacitor>
              <FluxOuter>
                <FluxArm style={{transform: 'rotate(0deg)'}} />
                <FluxArm style={{transform: 'rotate(120deg)'}} />
                <FluxArm style={{transform: 'rotate(240deg)'}} />
                <FluxCenter>Y</FluxCenter>
              </FluxOuter>
            </FluxCapacitor>
            <LegoSection>
              <LegoTitle>🧱 MY LEGO DELOREAN 🧱</LegoTitle>
              <LegoDesc>Check out my working LEGO Time Machine with light-up flux capacitor!</LegoDesc>
              <BTTFGif src="https://media.giphy.com/media/hGwvzBNwXDwlO/giphy.gif" alt="Time Travel" />
            </LegoSection>
            <BTTFLinks>
              <BTTFLinkTitle>🔗 BTTF LINKS 🔗</BTTFLinkTitle>
              <BTTFLinkAnchor href="https://www.backtothefuture.com/" target="_blank" rel="noopener noreferrer">
                ▶ Official BTTF Website
              </BTTFLinkAnchor>
              <BTTFLinkAnchor href="https://www.imdb.com/title/tt0088763/" target="_blank" rel="noopener noreferrer">
                ▶ BTTF on IMDB
              </BTTFLinkAnchor>
              <BTTFLinkAnchor href="https://delorean.com/" target="_blank" rel="noopener noreferrer">
                ▶ DeLorean Motor Company
              </BTTFLinkAnchor>
              <BTTFLinkAnchor href="https://www.lego.com/en-us/product/back-to-the-future-time-machine-10300" target="_blank" rel="noopener noreferrer">
                ▶ LEGO DeLorean Set
              </BTTFLinkAnchor>
              <BTTFLinkAnchor href="https://bttfcars.com/" target="_blank" rel="noopener noreferrer">
                ▶ Real BTTF DeLoreans
              </BTTFLinkAnchor>
            </BTTFLinks>
          </BTTFContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* Coding Section */}
        <Section id="coding">
          <SectionHeader>
            <CodeSymbol>&lt;/&gt;</CodeSymbol>
            <SectionTitle>CODING CORNER</SectionTitle>
            <CodeSymbol>&lt;/&gt;</CodeSymbol>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <CodingContent>
            <CodingIntro>Check out my pinned projects on GitHub!</CodingIntro>
            <LanguageButtons>
              <LangButton $bg="#61dafb" $border="#21a1cb" $dark>React</LangButton>
              <LangButton $bg="#3178c6" $border="#235a97">TypeScript</LangButton>
              <LangButton $bg="#f0db4f" $border="#c9b800" $dark>JavaScript</LangButton>
              <LangButton $bg="#b07219" $border="#8b5a00">Java</LangButton>
              <LangButton $bg="#178600" $border="#0d4d00">C#</LangButton>
            </LanguageButtons>
            <ProjectsGrid>
              <ProjectCard onClick={() => window.open('https://github.com/fonCki/terminal-site', '_blank')}>
                <ProjectIcon>💻</ProjectIcon>
                <ProjectTitle>terminal-site</ProjectTitle>
                <ProjectDesc>Retro CLI portfolio - execute commands to explore! Built with Blazor & APIs galore.</ProjectDesc>
                <ProjectLink>🔗 alfonso.ridao.ar</ProjectLink>
              </ProjectCard>
              <ProjectCard onClick={() => window.open('https://github.com/fonCki/eth-mcp', '_blank')}>
                <ProjectIcon>🎓</ProjectIcon>
                <ProjectTitle>eth-mcp</ProjectTitle>
                <ProjectDesc>MCP Server for ETH Zurich - query 2500+ classes with AI using natural language!</ProjectDesc>
                <ProjectLink>▶ View on GitHub</ProjectLink>
              </ProjectCard>
              <ProjectCard onClick={() => window.open('https://github.com/fonCki/mcp-security-linter', '_blank')}>
                <ProjectIcon>🔒</ProjectIcon>
                <ProjectTitle>mcp-security-linter</ProjectTitle>
                <ProjectDesc>Static analyzer for MCP repos - finds injection bugs & auth holes. DTU Security Research.</ProjectDesc>
                <ProjectLink>▶ View on GitHub</ProjectLink>
              </ProjectCard>
              <ProjectCard onClick={() => window.open('https://github.com/fonCki/shoulder-presentation-eval', '_blank')}>
                <ProjectIcon>📸</ProjectIcon>
                <ProjectTitle>shoulder-presentation-eval</ProjectTitle>
                <ProjectDesc>ID photo scorer - checks shoulder pose per ISO/IEC 39794-5. React + MediaPipe magic!</ProjectDesc>
                <ProjectLink>🔗 shoulder-presentation-eval.ridao.ar</ProjectLink>
              </ProjectCard>
              <ProjectCard onClick={() => window.open('https://github.com/fonCki/w3tl', '_blank')}>
                <ProjectIcon>🌐</ProjectIcon>
                <ProjectTitle>w3tl</ProjectTitle>
                <ProjectDesc>Decentralized social network - post, like, share on Web3. Bachelor thesis project!</ProjectDesc>
                <ProjectLink>🔗 w3tl.ridao.ar</ProjectLink>
              </ProjectCard>
              <ProjectCard onClick={() => window.open('https://github.com/fonCki/chappar', '_blank')}>
                <ProjectIcon>💘</ProjectIcon>
                <ProjectTitle>chappar</ProjectTitle>
                <ProjectDesc>Dating app with swipe matching, GPS discovery & AI icebreaker jokes. Find your crush!</ProjectDesc>
                <ProjectLink>▶ View on GitHub</ProjectLink>
              </ProjectCard>
            </ProjectsGrid>
            <GitHubButton onClick={() => window.open('https://github.com/fonCki', '_blank')}>
              <GitHubLogo>★</GitHubLogo>
              Visit My GitHub!
            </GitHubButton>
          </CodingContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* Gaming Section */}
        <Section id="gaming">
          <SectionHeader>
            <GameEmoji>🎮</GameEmoji>
            <SectionTitle>RETRO GAMING ZONE</SectionTitle>
            <GameEmoji>🎮</GameEmoji>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <GamingContent>
            <GameCards>
              <GameCardLink href="https://www.google.com/logos/2010/pacman10-i.html" target="_blank" rel="noopener noreferrer">
                <PacmanArt>
{`  ████████
 ██████████
███    █████
██████████
 █████████
  ████████`}
                </PacmanArt>
                <GameTitle>PAC-MAN</GameTitle>
                <HighScore>HI-SCORE: 999,999</HighScore>
                <GameLink>▶ Play Online!</GameLink>
              </GameCardLink>
              <GameCardLink href="https://tetris.com/play-tetris" target="_blank" rel="noopener noreferrer">
                <TetrisArt>
                  <TetrisRow>
                    <TetrisBlock $color="#ff0000" />
                    <TetrisBlock $color="#ff0000" />
                  </TetrisRow>
                  <TetrisRow>
                    <TetrisBlock $color="#00ff00" />
                    <TetrisBlock $color="#ff0000" />
                  </TetrisRow>
                  <TetrisRow>
                    <TetrisBlock $color="#00ff00" />
                    <TetrisBlock $color="#0000ff" />
                  </TetrisRow>
                  <TetrisRow>
                    <TetrisBlock $color="#ffff00" />
                    <TetrisBlock $color="#0000ff" />
                  </TetrisRow>
                </TetrisArt>
                <GameTitle>TETRIS</GameTitle>
                <HighScore>HI-SCORE: 500,000</HighScore>
                <GameLink>▶ Play Online!</GameLink>
              </GameCardLink>
            </GameCards>
            <DownloadBox>
              <DownloadTitle>📥 CLASSIC GAMES ARCHIVE 📥</DownloadTitle>
              <DownloadList>
                <DownloadLink href="https://archive.org/details/doom-shareware" target="_blank" rel="noopener noreferrer">▶ DOOM Shareware (Archive.org)</DownloadLink>
                <DownloadLink href="https://archive.org/details/DukeNukem3D1702Shareware1997" target="_blank" rel="noopener noreferrer">▶ Duke Nukem 3D Demo (Archive.org)</DownloadLink>
                <DownloadLink href="https://archive.org/details/CommanderKeen4" target="_blank" rel="noopener noreferrer">▶ Commander Keen 4 (Archive.org)</DownloadLink>
                <DownloadLink href="https://dos.zone/" target="_blank" rel="noopener noreferrer">▶ DOS.Zone - Play DOS games in browser!</DownloadLink>
              </DownloadList>
            </DownloadBox>
          </GamingContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* Music Section */}
        <Section id="music">
          <SectionHeader>
            <MusicNote>♪</MusicNote>
            <SectionTitle>MUSIC CORNER</SectionTitle>
            <MusicNote>♫</MusicNote>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <MusicContent>
            <StonesSection>
              <PixelTongue>
{`    ██████████████
  ████            ████
 ██    ████████    ██
██   ██        ██   ██
██  ██    ██    ██  ██
 ██  ██████████  ██
  ████  ████  ████
    ████    ████
      ████████
        ████
         ██         `}
              </PixelTongue>
              <BandName>THE ROLLING STONES</BandName>
            </StonesSection>
            <MusicPlayer />
          </MusicContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* Under Construction */}
        <Section id="construction">
          <SectionHeader>
            <ConstructionSign>🚧</ConstructionSign>
            <SectionTitle>UNDER CONSTRUCTION</SectionTitle>
            <ConstructionSign>🚧</ConstructionSign>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <ConstructionContent>
            <ConstructionWorker>
{`     _____
    /     \\
   | () () |
    \\  ^  /
     |||||
   __|   |__
  [__|___|__]
     |   |
     |   |
    _|   |_
   |_______|`}
            </ConstructionWorker>
            <ConstructionInfo>
              <BlinkingConstruction>*** COMING SOON! ***</BlinkingConstruction>
              <ConstructionList>
                <li>IRC Chat Room (#alfonso on EFnet)</li>
                <li>MIDI Jukebox (50+ songs!)</li>
                <li>Web Ring Links</li>
                <li>More ASCII Art!</li>
                <li>Secret Warez Page (shhh!)</li>
              </ConstructionList>
              <CheckBack>Check back soon!</CheckBack>
            </ConstructionInfo>
          </ConstructionContent>
        </Section>

        <FlamesDivider>
          <FlameBar />
        </FlamesDivider>

        {/* Guestbook */}
        <Section id="guestbook">
          <SectionHeader>
            <BookEmoji>📖</BookEmoji>
            <SectionTitle>GUESTBOOK</SectionTitle>
            <BookEmoji>📖</BookEmoji>
          </SectionHeader>
          <SectionDivider>{'═'.repeat(60)}</SectionDivider>
          <GuestbookContent>
            <GuestbookIntro>Sign my guestbook! Leave a message!</GuestbookIntro>

            {/* Success message */}
            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}

            {/* Sign Guestbook Form */}
            {showForm ? (
              <GuestbookForm onSubmit={handleSubmit}>
                <FormTitle>✍️ SIGN MY GUESTBOOK! ✍️</FormTitle>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <FormGroup>
                  <FormLabel htmlFor="guest-name">Your Name:</FormLabel>
                  <FormInput
                    id="guest-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    maxLength={50}
                    placeholder="Enter your name..."
                    disabled={submitting}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="guest-message">Message:</FormLabel>
                  <FormTextarea
                    id="guest-message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    maxLength={500}
                    placeholder="Leave a cool message!"
                    rows={3}
                    disabled={submitting}
                  />
                </FormGroup>
                <FormButtons>
                  <SubmitButton type="submit" disabled={submitting}>
                    {submitting ? '[ Sending... ]' : '[ Submit Entry ]'}
                  </SubmitButton>
                  <CancelButton type="button" onClick={() => setShowForm(false)} disabled={submitting}>
                    [ Cancel ]
                  </CancelButton>
                </FormButtons>
              </GuestbookForm>
            ) : (
              <SignButton onClick={() => setShowForm(true)}>
                [ ✍️ Sign My Guestbook! ]
              </SignButton>
            )}

            {/* Entries */}
            <GuestbookEntries>
              {loading ? (
                <LoadingText>Loading guestbook entries...</LoadingText>
              ) : loadError ? (
                <ErrorMessage role="alert">Could not load guestbook. Use Refresh to try again.</ErrorMessage>
              ) : entries.length === 0 ? (
                <EmptyMessage>Be the first to sign my guestbook!</EmptyMessage>
              ) : (
                entries.map((entry) => (
                  <GuestEntry key={entry.id}>
                    <GuestHeader>
                      <GuestName>{entry.name}</GuestName>
                      <GuestDate>{entry.formattedDate}</GuestDate>
                    </GuestHeader>
                    <GuestMessage>{entry.message}</GuestMessage>
                  </GuestEntry>
                ))
              )}
            </GuestbookEntries>
          </GuestbookContent>
        </Section>

        {/* Footer */}
        <Footer>
          <FooterDivider>{'═'.repeat(60)}</FooterDivider>
          <FooterContent>
            <CopyrightText>© 1995-1999 Fonchi's Homepage</CopyrightText>
            <CopyrightText>All Rights Reserved</CopyrightText>
            <LastUpdated>Last updated: December 31, 1999 at 11:59 PM</LastUpdated>
            <MadeWith>Made with Notepad and lots of ☕!</MadeWith>
          </FooterContent>
          <WebRing>
            <WebRingTitle>🕸️ WEB RING 🕸️</WebRingTitle>
            <WebRingNav>
              <WebRingLink>[ &lt;&lt; Prev ]</WebRingLink>
              <WebRingLink>[ 90s Retro Web Ring ]</WebRingLink>
              <WebRingLink>[ Random ]</WebRingLink>
              <WebRingLink>[ Next &gt;&gt; ]</WebRingLink>
            </WebRingNav>
          </WebRing>
          <EmailFooter>
            <AnimatedEnvelope>✉</AnimatedEnvelope>
            Questions? <EmailLink href="mailto:alfonso@ridao.ar">E-Mail the Webmaster!</EmailLink>
          </EmailFooter>
        </Footer>
      </ContentArea>
    </PageContainer>
  );
};

// Animations
const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff; }
  50% { text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff; }
`;

const rainbow = keyframes`
  0% { color: #ff0000; }
  17% { color: #ff7f00; }
  33% { color: #ffff00; }
  50% { color: #00ff00; }
  67% { color: #0000ff; }
  83% { color: #8b00ff; }
  100% { color: #ff0000; }
`;

const marquee = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

const fireFlicker = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const fluxPulse = keyframes`
  0%, 100% { opacity: 0.3; box-shadow: 0 0 5px #ff0; }
  50% { opacity: 1; box-shadow: 0 0 20px #ff0, 0 0 40px #ff0; }
`;

const envelopeBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

// Styled Components
const PageContainer = styled.div`
  overflow-wrap: anywhere;
  min-height: 100%;
  background-color: #000011;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 160px 120px, #fff, transparent),
    radial-gradient(2px 2px at 200px 50px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 230px 150px, #fff, transparent),
    radial-gradient(2px 2px at 280px 90px, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 320px 60px, #fff, transparent),
    radial-gradient(2px 2px at 360px 130px, rgba(255,255,255,0.8), transparent),
    linear-gradient(180deg, #000022 0%, #000044 50%, #000022 100%);
  background-size: 400px 200px;
  color: #00ff00;
  font-family: 'MS Sans Serif', 'Courier New', monospace;
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.header`
  text-align: center;
  padding: 20px;
  background: linear-gradient(180deg, #000033 0%, #000066 50%, #000033 100%);
  border-bottom: 3px solid #00ffff;
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000);
  background-size: 200% 100%;
  animation: ${fireFlicker} 3s ease infinite;
  padding: 4px;
  overflow: hidden;
  border: 2px solid #fff;
  margin-bottom: 20px;
`;

const MarqueeText = styled.div`
  color: #000;
  font-weight: bold;
  font-size: 12px;
  white-space: nowrap;
  animation: ${marquee} 20s linear infinite;
  text-shadow: 1px 1px 0 #fff;
`;

const TitleSection = styled.div`
  margin: 20px 0;
`;

const AnimatedFire = styled.div`
  font-size: 16px;
  animation: ${flicker} 0.2s ease-in-out infinite;
  letter-spacing: 2px;
`;

const MainTitle = styled.h1`
  margin: 10px 0;
  font-size: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RainbowText = styled.span`
  animation: ${rainbow} 3s linear infinite;
  font-size: 36px;
`;

const GlowText = styled.span`
  color: #00ffff;
  animation: ${glow} 2s ease-in-out infinite;
  font-size: clamp(22px, 7cqi, 48px);
  letter-spacing: clamp(2px, 1cqi, 8px);
`;

const Subtitle = styled.div`
  color: #ffff00;
  font-style: italic;
  font-size: 14px;
`;

const HitCounter = styled.div`
  flex-wrap: wrap;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const CounterLabel = styled.span`
  color: #ffffff;
  font-size: 12px;
`;

const CounterBox = styled.div`
  background: #000;
  border: 3px inset #333;
  padding: 4px 8px;
`;

const DigitDisplay = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #00ff00;
  letter-spacing: 4px;
  text-shadow: 0 0 10px #00ff00;
`;

const BadgeRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const NetscapeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #000;
  border: 2px outset #666;
  padding: 4px 8px;
`;

const IEBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #000;
  border: 2px outset #666;
  padding: 4px 8px;
`;

const BadgeIcon = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: #00ff00;
`;

const BadgeText = styled.span`
  font-size: 10px;
  color: #fff;
  line-height: 1.2;
`;

const ResolutionBadge = styled.div`
  background: linear-gradient(180deg, #666 0%, #333 100%);
  border: 2px outset #888;
  padding: 4px 12px;
  font-size: 12px;
  color: #fff;
`;

const Y2KBadge = styled.div`
  background: #ff0000;
  border: 2px outset #ff6666;
  padding: 4px 8px;
  font-size: 10px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  animation: ${blink} 1s step-end infinite;
`;

const SocialRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const buttonPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px #0ff, inset 0 0 5px rgba(0,255,255,0.3); }
  50% { box-shadow: 0 0 20px #0ff, 0 0 30px #0ff, inset 0 0 10px rgba(0,255,255,0.5); }
`;

const glowMove = keyframes`
  0% { left: -100%; }
  50%, 100% { left: 100%; }
`;

const Retro90sButton = styled.a<{ $gradient?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: ${props => props.$gradient
    ? 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)'
    : 'linear-gradient(180deg, #0077b5 0%, #005582 100%)'};
  border: 3px outset ${props => props.$gradient ? '#e1306c' : '#0099dd'};
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
  animation: ${buttonPulse} 2s ease-in-out infinite;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:hover {
    border-style: inset;
    filter: brightness(1.2);
  }

  &:active {
    border-style: inset;
  }
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: ${glowMove} 2s ease-in-out infinite;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
`;

const RetroIcon = styled.span`
  font-size: 18px;
`;

const StarDivider = styled.span`
  color: #ffff00;
  font-size: 14px;
  animation: ${blink} 0.5s step-end infinite;
  text-shadow: 0 0 10px #ffff00;
`;

const NavTable = styled.nav`
  background: linear-gradient(180deg, #000066 0%, #000033 100%);
  border: 3px double #00ffff;
  padding: 10px;
  margin: 20px auto;
  max-width: 700px;
`;

const NavTitle = styled.div`
  color: #ffff00;
  font-size: 12px;
  margin-bottom: 10px;
`;

const NavRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const NavLink = styled.a`
  color: #00ffff;
  text-decoration: none;
  font-size: 14px;
  padding: 2px 4px;

  &:hover {
    color: #ffff00;
    background: #000080;
  }
`;

const ContentArea = styled.main`
  @container (max-width: 480px) { padding: 8px; }
  max-width: 750px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.section`
  @container (max-width: 480px) { padding: 8px; }
  margin: 30px 0;
  padding: 15px;
  background: rgba(0, 0, 50, 0.5);
  border: 2px solid #00ff00;
`;

const SectionHeader = styled.div`
  flex-wrap: wrap;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  color: #ffff00;
  font-size: 20px;
  text-shadow: 2px 2px 0 #ff0000;
  margin: 0;
`;

const SectionDivider = styled.div`
  color: #00ffff;
  text-align: center;
  font-size: 10px;
  margin-bottom: 15px;
  overflow: hidden;
`;

const BlinkingNew = styled.span`
  color: #ff0000;
  animation: ${blink} 0.5s step-end infinite;
  font-size: 12px;
`;

// About Section
const AboutContent = styled.div`
  @container (max-width: 480px) { flex-direction: column; align-items: center; }
  display: flex;
  gap: 20px;
  align-items: flex-start;
  color: #ffffff;
`;

const AvatarBox = styled.div`
  text-align: center;
`;

const PixelAvatar = styled.pre`
  font-family: monospace;
  font-size: 10px;
  line-height: 1;
  color: #00ff00;
  margin: 0;
`;

const AvatarLabel = styled.div`
  color: #ffff00;
  font-size: 12px;
  margin-top: 5px;
`;

const AboutText = styled.div`
  flex: 1;
  font-size: 12px;
  line-height: 1.6;

  p {
    margin: 10px 0;
  }
`;

const WelcomeText = styled.div`
  color: #00ffff;
  font-size: 16px;
  margin-bottom: 10px;
`;

const EmailBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding: 8px;
  background: #000033;
  border: 1px solid #00ffff;
`;

const AnimatedEnvelope = styled.span`
  font-size: 20px;
  animation: ${envelopeBounce} 1s ease-in-out infinite;
`;

const EmailText = styled.span`
  color: #ff00ff;
`;

const EmailLink = styled.a`
  color: #ff00ff;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #ffff00;
  }
`;

// Flames Divider
const FlamesDivider = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const FlameBar = styled.div`
  height: 20px;
  background: linear-gradient(90deg,
    #ff0000, #ff4400, #ff8800, #ffcc00, #ff8800, #ff4400, #ff0000,
    #ff4400, #ff8800, #ffcc00, #ff8800, #ff4400, #ff0000
  );
  background-size: 200% 100%;
  animation: ${fireFlicker} 0.5s ease infinite;
  border-top: 2px solid #ffff00;
  border-bottom: 2px solid #ff0000;
`;

// 90s Web Nostalgia Section
const NostalgiaContent = styled.div`
  text-align: center;
`;

const NostalgiaIntro = styled.div`
  color: #ffff00;
  font-size: 16px;
  margin-bottom: 20px;
  font-style: italic;
`;

const NostalgiaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @container (max-width: 480px) { grid-template-columns: 1fr; }
  gap: 15px;
  margin-bottom: 20px;
`;

const NostalgiaItem = styled.div`
  background: linear-gradient(180deg, #000033 0%, #000066 100%);
  border: 2px solid #00ffff;
  padding: 15px;
  text-align: center;
`;

const NostalgiaIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const NostalgiaTitle = styled.div`
  color: #00ff00;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const NostalgiaDesc = styled.div`
  color: #808080;
  font-size: 11px;
`;

const CoolSitesBox = styled.div`
  background: #000033;
  border: 2px solid #ff00ff;
  padding: 15px;
  margin-top: 15px;
`;

const CoolSitesTitle = styled.div`
  color: #ffff00;
  font-size: 14px;
  margin-bottom: 10px;
`;

const CoolSitesList = styled.div`
  text-align: left;
`;

const CoolSitesSubtitle = styled.div`
  color: #aaaaaa;
  font-size: 10px;
  margin-bottom: 15px;
  font-style: italic;
`;

const CoolSiteLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
  padding: 8px;
  border-bottom: 1px dashed #333366;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: #00ffff;
  }
`;

const SiteIcon = styled.span`
  font-size: 20px;
`;

const SiteInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SiteName = styled.span`
  color: #00ffff;
  font-size: 13px;
  font-weight: bold;
`;

const SiteDesc = styled.span`
  color: #aaaaaa;
  font-size: 10px;
`;

const WebEmoji = styled.span`
  font-size: 20px;
`;

// BTTF Section
const BTTFContent = styled.div`
  text-align: center;
`;

const BTTFQuote = styled.div`
  color: #ffff00;
  font-size: 16px;
  font-style: italic;
  margin: 20px 0 5px;
`;

const QuoteAuthor = styled.div`
  color: #ffffff;
  font-size: 12px;
`;

const TimeCircuitsContainer = styled.div`
  margin: 20px auto;
  max-width: 350px;
`;

const TimeCircuitLabel = styled.div`
  color: #ffffff;
  font-size: 12px;
  margin-bottom: 5px;
`;

const TimeCircuit = styled.div`
  background: #111;
  border: 3px solid #333;
  padding: 10px;
`;

const CircuitRow = styled.div`
  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  padding: 3px;
  background: #000;
`;

const CircuitLabel = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 10px;
`;

const CircuitValue = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-shadow: 0 0 10px ${props => props.$color};
`;

const GigawattsBox = styled.div`
  margin: 20px 0;
`;

const GigawattsText = styled.div`
  color: #00ffff;
  font-size: 28px;
  font-weight: bold;
  animation: ${blink} 0.3s step-end infinite;
  text-shadow: 0 0 20px #00ffff;
`;

const FluxCapacitor = styled.div`
  margin: 20px auto;
  width: 80px;
  height: 80px;
`;

const FluxOuter = styled.div`
  width: 100%;
  height: 100%;
  background: #222;
  border: 3px solid #444;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FluxArm = styled.div`
  position: absolute;
  width: 4px;
  height: 30px;
  background: #ffff00;
  top: 5px;
  left: calc(50% - 2px);
  transform-origin: bottom center;
  animation: ${fluxPulse} 0.5s ease-in-out infinite;
`;

const FluxCenter = styled.div`
  color: #ffff00;
  font-size: 20px;
  font-weight: bold;
  animation: ${blink} 0.2s step-end infinite;
`;

const Lightning = styled.span`
  color: #ffff00;
  font-size: 20px;
`;

const BTTFImageRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const BTTFGif = styled.img`
  max-width: min(200px, 100%);
  height: auto;
  border: 3px solid #00ffff;
  box-shadow: 0 0 10px #00ffff;
`;

const LegoSection = styled.div`
  margin: 20px 0;
  padding: 15px;
  background: linear-gradient(180deg, #1a0000 0%, #330000 100%);
  border: 2px solid #ff6600;
`;

const LegoTitle = styled.div`
  color: #ff6600;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const LegoDesc = styled.div`
  color: #ffffff;
  font-size: 12px;
  margin-bottom: 15px;
`;

const BTTFLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
`;

const BTTFLinkTitle = styled.div`
  color: #ffff00;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const BTTFLinkAnchor = styled.a`
  display: block;
  color: #00ffff;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  padding: 5px 0;
  transition: all 0.2s;

  &:hover {
    color: #ffff00;
    text-shadow: 0 0 10px #ffff00;
    padding-left: 10px;
  }
`;

// Coding Section
const CodingContent = styled.div``;

const CodingIntro = styled.div`
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  margin-bottom: 15px;
`;

const LanguageButtons = styled.div`
  flex-wrap: wrap;
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const LangButton = styled.div<{ $bg: string; $border: string; $dark?: boolean }>`
  background: ${props => props.$bg};
  border: 3px outset ${props => props.$border};
  padding: 8px 20px;
  color: ${props => props.$dark ? '#000' : '#fff'};
  font-weight: bold;
  font-size: 14px;
`;

const CodeSymbol = styled.span`
  color: #00ff00;
  font-size: 16px;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @container (max-width: 480px) { grid-template-columns: 1fr; }
  gap: 15px;
  margin-bottom: 20px;
`;

const ProjectCard = styled.div`
  background: linear-gradient(180deg, #000033 0%, #000066 100%);
  border: 2px solid #00ffff;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ffff00;
    background: linear-gradient(180deg, #000044 0%, #000088 100%);
    transform: scale(1.02);
  }
`;

const ProjectIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const ProjectTitle = styled.div`
  color: #00ff00;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ProjectDesc = styled.div`
  color: #ffffff;
  font-size: 11px;
  line-height: 1.3;
  margin-bottom: 8px;
`;

const ProjectLink = styled.div`
  color: #00ffff;
  font-size: 10px;
`;

const GitHubButton = styled.button`
  background: linear-gradient(180deg, #333 0%, #111 100%);
  color: #ffffff;
  border: 3px outset #666;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px auto 0;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:hover {
    background: linear-gradient(180deg, #444 0%, #222 100%);
  }

  &:active {
    border-style: inset;
  }
`;

const GitHubLogo = styled.span`
  font-size: 24px;
  color: #ffffff;
`;

// Gaming Section
const GamingContent = styled.div``;

const GameCards = styled.div`
  flex-wrap: wrap;
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
`;

const GameCardLink = styled.a`
  background: #000;
  border: 2px solid #ffff00;
  padding: 15px;
  text-align: center;
  min-width: 150px;
  display: block;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #00ffff;
    background: #001111;
    transform: scale(1.05);
    box-shadow: 0 0 15px #ffff00;
  }
`;

const PacmanArt = styled.pre`
  color: #ffff00;
  font-family: monospace;
  font-size: 8px;
  line-height: 1;
  margin-bottom: 10px;
`;

const TetrisArt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 10px;
`;

const TetrisRow = styled.div`
  display: flex;
  gap: 2px;
`;

const TetrisBlock = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  background: ${props => props.$color};
  border: 2px outset ${props => props.$color};
`;

const GameTitle = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const HighScore = styled.div`
  color: #00ff00;
  font-size: 11px;
  margin-bottom: 10px;
`;

const GameLink = styled.div`
  color: #00ffff;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: #ffff00;
  }
`;

const DownloadBox = styled.div`
  background: #000033;
  border: 2px solid #00ffff;
  padding: 15px;
  margin-top: 15px;
`;

const DownloadTitle = styled.div`
  color: #ffff00;
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
`;

const DownloadList = styled.div``;

const DownloadLink = styled.a`
  display: block;
  color: #00ffff;
  font-size: 12px;
  margin: 8px 0;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    color: #ffff00;
    text-shadow: 0 0 10px #ffff00;
    padding-left: 10px;
  }
`;

const GameEmoji = styled.span`
  font-size: 16px;
`;

// Music Section
const MusicContent = styled.div`
  text-align: center;
`;

const StonesSection = styled.div`
  margin-bottom: 20px;
`;

const PixelTongue = styled.pre`
  color: #ff0000;
  font-family: monospace;
  font-size: 8px;
  line-height: 1;
  margin: 0 auto 10px;
`;

const BandName = styled.div`
  color: #ff0000;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 3px;
`;

const MusicNote = styled.span`
  color: #ff00ff;
  font-size: 16px;
`;

// Construction Section
const ConstructionContent = styled.div`
  flex-wrap: wrap;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
`;

const ConstructionWorker = styled.pre`
  color: #ffff00;
  font-family: monospace;
  font-size: 10px;
  line-height: 1;
`;

const ConstructionInfo = styled.div``;

const BlinkingConstruction = styled.div`
  color: #ff0000;
  font-size: 18px;
  font-weight: bold;
  animation: ${blink} 0.5s step-end infinite;
  margin-bottom: 15px;
`;

const ConstructionList = styled.ul`
  color: #00ffff;
  font-size: 12px;
  text-align: left;
  margin: 0;
  padding-left: 20px;

  li {
    margin: 5px 0;
  }
`;

const CheckBack = styled.div`
  color: #ffffff;
  font-size: 12px;
  margin-top: 15px;
`;

const ConstructionSign = styled.span`
  font-size: 20px;
`;

// Guestbook Section
const GuestbookContent = styled.div``;

const GuestbookIntro = styled.div`
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  margin-bottom: 15px;
`;

const GuestbookEntries = styled.div`
  margin-bottom: 15px;
`;

const GuestEntry = styled.div`
  background: #000033;
  border: 1px solid #00ffff;
  padding: 10px;
  margin-bottom: 10px;
`;

const GuestHeader = styled.div`
  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const GuestName = styled.span`
  color: #00ff00;
  font-weight: bold;
  font-size: 12px;
`;

const GuestDate = styled.span`
  color: #808080;
  font-size: 10px;
`;

const GuestMessage = styled.div`
  color: #ffffff;
  font-size: 12px;
`;

const SignButton = styled.button`
  background: #000080;
  color: #ffffff;
  border: 2px outset #0000ff;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  display: block;
  margin: 0 auto 15px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:hover {
    background: #0000aa;
  }

  &:active {
    border-style: inset;
  }
`;

const GuestbookForm = styled.form`
  background: #000033;
  border: 2px solid #00ffff;
  padding: 15px;
  margin-bottom: 15px;
`;

const FormTitle = styled.div`
  color: #ffff00;
  font-size: 14px;
  text-align: center;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
`;

const FormLabel = styled.label`
  display: block;
  color: #00ffff;
  font-size: 12px;
  margin-bottom: 5px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  background: #000;
  border: 2px inset #444;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  box-sizing: border-box;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    border-color: #00ffff;
  }

  &:disabled {
    background: #111;
    color: #666;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 6px 8px;
  background: #000;
  border: 2px inset #444;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    border-color: #00ffff;
  }

  &:disabled {
    background: #111;
    color: #666;
  }
`;

const FormButtons = styled.div`
  flex-wrap: wrap;
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
`;

const SubmitButton = styled.button`
  background: #008000;
  color: #ffffff;
  border: 2px outset #00aa00;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:hover {
    background: #00aa00;
  }

  &:active {
    border-style: inset;
  }

  &:disabled {
    background: #444;
    border-color: #666;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #800000;
  color: #ffffff;
  border: 2px outset #aa0000;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:hover {
    background: #aa0000;
  }

  &:active {
    border-style: inset;
  }

  &:disabled {
    background: #444;
    border-color: #666;
    cursor: not-allowed;
  }
`;

const LoadingText = styled.div`
  color: #ffff00;
  font-size: 12px;
  text-align: center;
  padding: 20px;
  animation: ${blink} 1s ease-in-out infinite;
`;

const EmptyMessage = styled.div`
  color: #808080;
  font-size: 12px;
  text-align: center;
  padding: 20px;
  font-style: italic;
`;

const SuccessMessage = styled.div`
  background: #004400;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 10px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  background: #440000;
  border: 2px solid #ff0000;
  color: #ff0000;
  padding: 10px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 12px;
`;

const BookEmoji = styled.span`
  font-size: 16px;
`;

// Footer
const Footer = styled.footer`
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  border-top: 3px double #00ff00;
`;

const FooterDivider = styled.div`
  color: #00ff00;
  font-size: 10px;
  margin-bottom: 15px;
  overflow: hidden;
`;

const FooterContent = styled.div`
  margin-bottom: 20px;
`;

const CopyrightText = styled.div`
  color: #808080;
  font-size: 11px;
`;

const LastUpdated = styled.div`
  color: #808080;
  font-size: 10px;
  margin-top: 5px;
`;

const MadeWith = styled.div`
  color: #ffff00;
  font-size: 11px;
  margin-top: 10px;
`;

const WebRing = styled.div`
  background: #000033;
  border: 2px solid #00ffff;
  padding: 10px;
  margin: 15px auto;
  max-width: 400px;
`;

const WebRingTitle = styled.div`
  color: #ffff00;
  font-size: 12px;
  margin-bottom: 10px;
`;

const WebRingNav = styled.div`
  flex-wrap: wrap;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const WebRingLink = styled.span`
  color: #00ffff;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    color: #ffff00;
  }
`;

const EmailFooter = styled.div`
  color: #ff00ff;
  font-size: 12px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export default HomePage;
