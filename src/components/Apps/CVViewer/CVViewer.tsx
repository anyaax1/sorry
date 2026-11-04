import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { apiFetch } from '../../../services/api';
import { logCVAction } from '../../../services/analyticsService';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const CVViewer = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => setPageWidth(Math.max(1, entries[0].contentRect.width)));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  const hasLoggedOpen = useRef(false);

  // Fetch presigned URL for CV from API
  useEffect(() => {
    const controller = new AbortController();
    const fetchCvUrl = async () => {
      try {
        const response = await apiFetch('/api/cv', { signal: controller.signal });
        const data = await response.json();
        if (typeof data.url !== 'string' || !/^https?:\/\//.test(data.url)) throw new Error('Invalid CV URL');
        if (controller.signal.aborted) return;
        setCvUrl(data.url);
        // Log CV opened
        if (!hasLoggedOpen.current) {
          hasLoggedOpen.current = true;
          logCVAction('opened');
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error('Failed to fetch CV URL:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchCvUrl();
    return () => controller.abort();
  }, [attempt]);

  const retry = () => { setLoading(true); setCvUrl(null); setNumPages(0); setCurrentPage(1); setAttempt(a => a + 1); };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    logCVAction('loaded', 1);
  };

  const handlePrevPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    logCVAction('page-change', newPage);
  };
  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, numPages);
    setCurrentPage(newPage);
    logCVAction('page-change', newPage);
  };
  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.3));

  return (
    <ViewerContainer>
      {/* Acrobat Reader 3.0 Style Toolbar */}
      <Toolbar>
        <ToolbarSection>
          <ToolButton onClick={handlePrevPage} disabled={currentPage <= 1} title="Previous Page">
            ◀
          </ToolButton>
          <PageIndicator>
            <PageInput aria-label="Current page" type="text" value={currentPage} readOnly />
            <PageText>of {numPages}</PageText>
          </PageIndicator>
          <ToolButton onClick={handleNextPage} disabled={currentPage >= numPages} title="Next Page">
            ▶
          </ToolButton>
        </ToolbarSection>

        <ToolbarDivider />

        <ToolbarSection>
          <ToolButton onClick={handleZoomOut} title="Zoom Out">−</ToolButton>
          <ZoomIndicator>{Math.round(scale * 100)}%</ZoomIndicator>
          <ToolButton onClick={handleZoomIn} title="Zoom In">+</ToolButton>
        </ToolbarSection>

        <ToolbarDivider />

        <ToolbarSection>
          <ToolButton as="a" href={cvUrl || undefined} aria-disabled={!cvUrl} download="Alfonso_Pedro_Ridao_CV.pdf" title="Save">
            💾
          </ToolButton>
          <ToolButton as="a" href={cvUrl || undefined} aria-disabled={!cvUrl} target="_blank" rel="noopener noreferrer" title="Open">
            🔗
          </ToolButton>
        </ToolbarSection>
      </Toolbar>

      {/* PDF Display Area */}
      <PDFContainer ref={pdfContainerRef}>
        {loading ? (
          <LoadingMessage>Loading CV...</LoadingMessage>
        ) : cvUrl ? (
          <Document
            file={cvUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<LoadingMessage>Loading PDF...</LoadingMessage>}
            error={<ErrorMessage role="alert">Failed to load PDF. <ToolButton onClick={retry}>Retry</ToolButton></ErrorMessage>}
          >
            <Page
              pageNumber={currentPage}
              width={pageWidth || undefined}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        ) : (
          <ErrorMessage role="alert">Failed to load CV. <ToolButton onClick={retry}>Retry</ToolButton></ErrorMessage>
        )}
      </PDFContainer>

      {/* Status Bar */}
      <StatusBar>
        <StatusSection>
          <AcrobatLogo>📕</AcrobatLogo>
          <StatusText>Adobe Acrobat Reader 3.0</StatusText>
        </StatusSection>
        <StatusSection>
          <StatusText>alfonso_pedro_ridao.pdf</StatusText>
        </StatusSection>
      </StatusBar>
    </ViewerContainer>
  );
};

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #808080;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  flex-shrink: 0;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #808080;
  margin: 0 4px;
`;

const ToolButton = styled.button`
  min-width: 24px;
  height: 22px;
  padding: 2px 6px;
  font-size: 12px;
  background: #c0c0c0;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #404040;
  border-bottom-color: #404040;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #000;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:active:not(:disabled) {
    border-top-color: #404040;
    border-left-color: #404040;
    border-right-color: #fff;
    border-bottom-color: #fff;
  }

  &:disabled {
    color: #808080;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageInput = styled.input`
  width: 24px;
  height: 18px;
  text-align: center;
  font-size: 11px;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #fff;
  border-bottom-color: #fff;
  background: #fff;
`;

const PageText = styled.span`
  font-size: 11px;
  color: #000;
`;

const ZoomIndicator = styled.span`
  font-size: 11px;
  min-width: 36px;
  text-align: center;
`;

const PDFContainer = styled.div`
  flex: 1;
  min-height: 0;
  background: #666;
  overflow: auto;
  padding: 10px;
  .react-pdf__Document { width: max-content; margin: 0 auto; }
`;

const LoadingMessage = styled.div`
  color: #fff;
  font-size: 14px;
  padding: 40px;
`;

const ErrorMessage = styled.div`
  color: #ff6666;
  font-size: 14px;
  padding: 40px;
`;

const StatusBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 2px 6px;
  background: #c0c0c0;
  border-top: 1px solid #fff;
  min-height: 20px;
  flex-shrink: 0;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
  border: 1px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #fff;
  border-bottom-color: #fff;
`;

const AcrobatLogo = styled.span`
  font-size: 12px;
`;

const StatusText = styled.span`
  font-size: 10px;
  color: #000;
`;

export default CVViewer;
