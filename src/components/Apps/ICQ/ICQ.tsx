import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { sendChatMessage } from '../../../services/chatService';
import type { ChatMessage } from '../../../services/chatService';
import { logChat } from '../../../services/analyticsService';

interface ICQProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  unreadCount: number;
}

const ICQ = ({ messages, setMessages, unreadCount }: ICQProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial welcome message from Alfonso (only once)
  useEffect(() => {
    if (messages.length > 0) return;

    const welcomeMessage = "Hey! Welcome to my Windows 95 site! I'm Alfonso's digital twin. Feel free to ask me anything about Alfonso, his projects, or just chat! 🌸";

    // Simulate Alfonso sending the first message
    const timer = setTimeout(() => {
      setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: welcomeMessage }]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [messages.length, setMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Filter history to only include messages after the first user message
      // (Gemini requires history to start with 'user' role)
      const firstUserIdx = messages.findIndex(m => m.role === 'user');
      const historyForApi = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : [];

      const response = await sendChatMessage(userMessage, historyForApi);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      // Log chat interaction for analytics
      logChat(userMessage, response);
    } catch {
      const errorResponse = "Oops! Connection lost. Try again in a moment! 📡";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorResponse
      }]);
      logChat(userMessage, errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContactClick = () => {
    setShowChat(true);
  };

  if (!showChat) {
    // Contact List View
    return (
      <ICQContainer>
        <ICQHeader>
          <FlowerIcon>🌸</FlowerIcon>
          <HeaderTitle>ICQ</HeaderTitle>
        </ICQHeader>

        <ContactListArea>
          <GroupHeader>
            <GroupArrow>▼</GroupArrow>
            <GroupName>Online</GroupName>
          </GroupHeader>

          <ContactItem role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleContactClick(); } }} onClick={handleContactClick} $online>
            <ContactFlower $online>🌸</ContactFlower>
            <ContactInfo>
              <ContactName>Alfonso</ContactName>
              <ContactICQ>33809676</ContactICQ>
            </ContactInfo>
            {unreadCount > 0 && <NewMessageBadge>{unreadCount}</NewMessageBadge>}
          </ContactItem>
        </ContactListArea>

        <ICQFooter>
          <StatusIndicator $online />
          <StatusText>Online</StatusText>
        </ICQFooter>
      </ICQContainer>
    );
  }

  // Chat View
  return (
    <ICQContainer>
      <ChatHeader>
        <BackButton aria-label="Back to contacts" onClick={() => setShowChat(false)}>←</BackButton>
        <ChatHeaderInfo>
          <ContactFlower $online style={{ fontSize: '16px' }}>🌸</ContactFlower>
          <ChatHeaderText>
            <ChatHeaderName>Alfonso</ChatHeaderName>
            <ChatHeaderStatus>Online - 33809676</ChatHeaderStatus>
          </ChatHeaderText>
        </ChatHeaderInfo>
      </ChatHeader>

      <MessagesArea>
        {messages.map((msg, index) => (
          <MessageBubble key={index} $isUser={msg.role === 'user'}>
            <MessageSender>{msg.role === 'user' ? 'You' : 'Alfonso'}</MessageSender>
            <MessageText>{msg.content}</MessageText>
          </MessageBubble>
        ))}
        {isTyping && (
          <TypingIndicator>
            <TypingDot style={{ animationDelay: '0ms' }} />
            <TypingDot style={{ animationDelay: '150ms' }} />
            <TypingDot style={{ animationDelay: '300ms' }} />
            <TypingText>Alfonso is typing...</TypingText>
          </TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>

      <InputArea>
        <MessageInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={1000}
          aria-label="Message Alfonso"
          placeholder="Type a message..."
          disabled={isTyping}
        />
        <SendButton onClick={handleSendMessage} disabled={isTyping || !inputValue.trim()}>
          Send
        </SendButton>
      </InputArea>
    </ICQContainer>
  );
};

// Animations
const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const ICQContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #f0f0f0 0%, #d4d4d4 100%);
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
`;

const ICQHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(180deg, #89c489 0%, #5a9a5a 100%);
  border-bottom: 2px solid #3d6b3d;
`;

const FlowerIcon = styled.span`
  font-size: 24px;
`;

const HeaderTitle = styled.span`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
`;

const ContactListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #fff;
  border: 2px inset #808080;
  margin: 8px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #e8e8e8;
  border-bottom: 1px solid #c0c0c0;
  font-size: 11px;
  font-weight: bold;
`;

const GroupArrow = styled.span`
  font-size: 8px;
`;

const GroupName = styled.span`
  color: #006400;
`;

const ContactItem = styled.div<{ $online?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background: #e8f4e8;
  }
`;

const ContactFlower = styled.span<{ $online?: boolean }>`
  font-size: 20px;
  filter: ${props => props.$online ? 'none' : 'grayscale(100%)'};
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #000;
`;

const ContactICQ = styled.div`
  font-size: 10px;
  color: #666;
`;

const NewMessageBadge = styled.div`
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ff0000;
  color: #fff;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  animation: ${pulse} 1s infinite;
`;

const ICQFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #d4d4d4;
  border-top: 1px solid #fff;
`;

const StatusIndicator = styled.div<{ $online?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$online ? '#00ff00' : '#808080'};
  border: 1px solid ${props => props.$online ? '#006400' : '#404040'};
`;

const StatusText = styled.span`
  font-size: 11px;
  color: #333;
`;

// Chat View Styles
const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(180deg, #89c489 0%, #5a9a5a 100%);
  border-bottom: 2px solid #3d6b3d;
`;

const BackButton = styled.button`
  width: 24px;
  height: 24px;
  background: #c0c0c0;
  border: 2px outset #fff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    border-style: inset;
  }
`;

const ChatHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChatHeaderText = styled.div``;

const ChatHeaderName = styled.div`
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
`;

const ChatHeaderStatus = styled.div`
  color: #e0ffe0;
  font-size: 10px;
`;

const MessagesArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  background: #fff;
  border: 2px inset #808080;
  margin: 8px;
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${props => props.$isUser ? '#dcf8c6' : '#e8e8e8'};
  margin-left: ${props => props.$isUser ? 'auto' : '0'};
  margin-right: ${props => props.$isUser ? '0' : 'auto'};
  border: 1px solid ${props => props.$isUser ? '#a8d88a' : '#c0c0c0'};
`;

const MessageSender = styled.div`
  font-size: 10px;
  font-weight: bold;
  color: #006400;
  margin-bottom: 4px;
`;

const MessageText = styled.div`
  font-size: 12px;
  color: #000;
  line-height: 1.4;
  word-wrap: break-word;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  color: #666;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  animation: ${bounce} 0.6s infinite;
`;

const TypingText = styled.span`
  font-size: 11px;
  margin-left: 4px;
  font-style: italic;
`;

const InputArea = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 8px;
  background: #d4d4d4;
  border-top: 1px solid #fff;
`;

const MessageInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  font-size: 12px;
  border: 2px inset #808080;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:focus {
    outline: none;
  }

  &:disabled {
    background: #e0e0e0;
  }
`;

const SendButton = styled.button`
  padding: 6px 16px;
  font-size: 11px;
  background: #c0c0c0;
  border: 2px outset #fff;
  cursor: pointer;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:active:not(:disabled) {
    border-style: inset;
  }

  &:disabled {
    color: #808080;
    cursor: not-allowed;
  }
`;

export default ICQ;
