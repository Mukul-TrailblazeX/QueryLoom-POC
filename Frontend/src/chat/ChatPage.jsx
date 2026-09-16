import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import Particles from '../components/Particles';
import { useTheme as useSiteTheme } from '../context/use-theme';
import { clearAuthSession, getAuthSession } from '../auth/session';
import ChatPanel from './ChatPanel';
import ChatSearchModal from './ChatSearchModal';
import ChatsListPage from './ChatsListPage';
import { DeleteChatDialog, MoveChatDialog } from './ChatModals';
import ShareChatDialog from './ShareChatDialog';
import {
  createBackendChat,
  createBackendMessage,
  createEmptyChat,
  deleteBackendChat,
  loadChatHistory,
  queryRag,
  saveChatHistory,
  updateBackendChat,
  uploadRagDocuments,
} from './chat-history-service';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 48;
const MOBILE_SIDEBAR_WIDTH = 280;
const KNOWLEDGE_BASE_WIDTH = 320;

function createMessage(id, role, content) {
  return { id, role, content };
}

function normalizeChat(chat) {
  const now = new Date().toISOString();

  return {
    documents: [],
    messages: [],
    createdAt: chat.createdAt || chat.updatedAt || now,
    updatedAt: chat.updatedAt || chat.createdAt || now,
    isStarred: Boolean(chat.isStarred),
    share: chat.share || {
      chatId: chat.id,
      isShared: false,
      shareId: null,
      shareUrl: null,
      sharedAt: null,
    },
    ...chat,
  };
}

function inferFileType(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (file.type === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }
  if (file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(extension)) {
    return 'audio';
  }
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
    return 'image';
  }

  return 'txt';
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);

    audio.preload = 'metadata';
    audio.src = objectUrl;

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read audio metadata for ${file.name}.`));
    };
  });
}

export default function ChatPage(props) {
  const [chats, setChats] = React.useState([]);
  const [activeChatId, setActiveChatId] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [renamingChatId, setRenamingChatId] = React.useState(null);
  const [pendingDeleteChatId, setPendingDeleteChatId] = React.useState(null);
  const [moveChatId, setMoveChatId] = React.useState(null);
  const [feedback, setFeedback] = React.useState(null);
  const [speakingMessageId, setSpeakingMessageId] = React.useState(null);
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(true);
  const [historyError, setHistoryError] = React.useState('');
  const typingTimeoutRef = React.useRef(null);
  const { theme } = useSiteTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId: routeChatId } = useParams();
  const user = React.useMemo(() => getAuthSession(), []);
  const isMobile = useMediaQuery('(max-width:767px)');
  const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

  const particleColors =
    theme === 'dark'
      ? ['#f0f0f0', '#c7d3cc', '#8aa693']
      : ['#1a1a1a', '#6b7c72', '#2d6a4f'];

  React.useEffect(() => {
    if (isTablet) {
      setSidebarCollapsed(true);
    } else if (!isMobile) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  React.useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = 'unset';
      return undefined;
    }

    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, mobileSidebarOpen]);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? createEmptyChat();

  const hydrateChatHistory = React.useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError('');

    try {
      const history = await loadChatHistory(user.id);
      const nextChats = (history.length > 0 ? history : [await createBackendChat(createEmptyChat())]).map(normalizeChat);

      setChats(nextChats);
      setActiveChatId(nextChats[0].id);
      setDraft('');
      setSpeakingMessageId(null);
      setIsAssistantTyping(false);
    } catch (error) {
      console.error('Unable to load chat history', error);
      const fallbackChat = createEmptyChat();
      setChats([fallbackChat]);
      setActiveChatId(fallbackChat.id);
      setDraft('');
      setSpeakingMessageId(null);
      setIsAssistantTyping(false);
      setHistoryError('We could not load your previous chats right now.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    hydrateChatHistory();
  }, [hydrateChatHistory]);

  React.useEffect(() => {
    if (!user?.id || isHistoryLoading || chats.length === 0) {
      return;
    }

    saveChatHistory(user.id, chats);
  }, [chats, isHistoryLoading, user]);

  React.useEffect(() => {
    if (!routeChatId || chats.length === 0) {
      return;
    }

    if (chats.some((chat) => chat.id === routeChatId)) {
      setActiveChatId(routeChatId);
    }
  }, [chats, routeChatId]);

  const updateActiveChat = React.useCallback((updater) => {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === activeChatId ? { ...chat, ...updater(chat), updatedAt: new Date().toISOString() } : chat,
      ),
    );
  }, [activeChatId]);

  const createNewChat = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    try {
      const newChat = normalizeChat(await createBackendChat(createEmptyChat()));

      setChats((currentChats) => [newChat, ...currentChats]);
      setActiveChatId(newChat.id);
      setDraft('');
      setSpeakingMessageId(null);
      setIsAssistantTyping(false);
      setMobileSidebarOpen(false);
      setKnowledgeBaseOpen(false);
      setRenamingChatId(null);
      navigate(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Unable to create chat', error);
      setFeedback({
        severity: 'error',
        message: 'We could not create a new chat right now.',
      });
    }
  };

  const openChatHome = () => {
    createNewChat();
  };

  const handleDeleteChat = async (chatId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    try {
      await deleteBackendChat(chatId);
    } catch (error) {
      console.error('Unable to delete chat', error);
      setFeedback({
        severity: 'error',
        message: 'We could not delete this chat right now.',
      });
      return;
    }

    setChats((currentChats) => {
      const remainingChats = currentChats.filter((chat) => chat.id !== chatId);

      if (remainingChats.length === 0) {
        const fallbackChat = createEmptyChat();
        setActiveChatId(fallbackChat.id);
        setDraft('');
        setSpeakingMessageId(null);
        setIsAssistantTyping(false);
        setKnowledgeBaseOpen(false);
        return [fallbackChat];
      }

      setActiveChatId((currentActiveChatId) =>
        currentActiveChatId === chatId ? remainingChats[0].id : currentActiveChatId,
      );

      return remainingChats;
    });

    setMobileSidebarOpen(false);
    setPendingDeleteChatId(null);
    setRenamingChatId(null);
    if (chatId === activeChatId) {
      setDraft('');
      navigate('/chat');
    }
  };

  const selectChat = (chatId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setActiveChatId(chatId);
    navigate('/chat');
    setDraft('');
    setSpeakingMessageId(null);
    setIsAssistantTyping(false);
    setSearchOpen(false);
    setMobileSidebarOpen(false);
  };

  const showAllChats = () => {
    setSearchOpen(false);
    setMobileSidebarOpen(false);
    navigate('/chats');
  };

  const toggleChatStar = (chatId) => {
    const chatToUpdate = chats.find((chat) => chat.id === chatId);
    const nextChat = chatToUpdate
      ? { ...chatToUpdate, isStarred: !chatToUpdate.isStarred, updatedAt: new Date().toISOString() }
      : null;

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, isStarred: !chat.isStarred, updatedAt: new Date().toISOString() }
          : chat,
      ),
    );

    if (nextChat) {
      updateBackendChat(nextChat).catch((error) => {
        console.error('Unable to update chat star', error);
      });
    }
  };

  const startRenameChat = (chatId) => {
    setRenamingChatId(chatId);
  };

  const renameChat = (chatId, title) => {
    const chatToUpdate = chats.find((chat) => chat.id === chatId);
    const nextChat = chatToUpdate ? { ...chatToUpdate, title, updatedAt: new Date().toISOString() } : null;

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === chatId ? { ...chat, title, updatedAt: new Date().toISOString() } : chat,
      ),
    );
    setRenamingChatId(null);

    if (nextChat) {
      updateBackendChat(nextChat).catch((error) => {
        console.error('Unable to rename chat', error);
      });
    }
  };

  const requestDeleteChat = (chatId) => {
    setPendingDeleteChatId(chatId);
  };

  const requestMoveChat = (chatId) => {
    setMoveChatId(chatId);
  };

  const createShareLink = () => {
    const shareId = crypto.randomUUID();
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    const sharedAt = new Date().toISOString();
    let nextChat = null;

    setChats((currentChats) =>
      currentChats.map((chat) => {
        if (chat.id !== activeChatId) {
          return chat;
        }

        nextChat = {
              ...chat,
              updatedAt: sharedAt,
              share: {
                chatId: chat.id,
                isShared: true,
                shareId,
                shareUrl,
                sharedAt,
              },
            };

        return nextChat;
      }),
    );

    if (nextChat) {
      updateBackendChat(nextChat).catch((error) => {
        console.error('Unable to save share link', error);
      });
    }
  };

  const revokeShareLink = () => {
    const updatedAt = new Date().toISOString();
    let nextChat = null;

    setChats((currentChats) =>
      currentChats.map((chat) => {
        if (chat.id !== activeChatId) {
          return chat;
        }

        nextChat = {
              ...chat,
              updatedAt,
              share: {
                chatId: chat.id,
                isShared: false,
                shareId: null,
                shareUrl: null,
                sharedAt: null,
              },
            };

        return nextChat;
      }),
    );

    if (nextChat) {
      updateBackendChat(nextChat).catch((error) => {
        console.error('Unable to revoke share link', error);
      });
    }
  };

  const toggleDocument = (documentId) => {
    updateActiveChat((chat) => ({
      documents: chat.documents.map((document) =>
        document.id === documentId ? { ...document, selected: !document.selected } : document,
      ),
    }));
  };

  const removeDocument = (documentId) => {
    updateActiveChat((chat) => ({
      documents: chat.documents.filter((document) => document.id !== documentId),
    }));
  };

  const handleUploadFiles = async (files) => {
    try {
      const preparedFiles = [];

      for (const file of files) {
        const type = inferFileType(file);
        let meta = `${type.toUpperCase()} file`;

        if (type === 'audio') {
          const duration = await getAudioDuration(file);

          if (duration > 300) {
            throw new Error(`${file.name} is longer than 5 minutes. Please upload a shorter audio file.`);
          }

          meta = `Audio file | ${formatDuration(duration)}`;
        }

        if (type === 'pdf') {
          meta = 'PDF document';
        }

        if (type === 'txt') {
          meta = 'TXT notes';
        }

        if (type === 'image') {
          meta = 'Image file';
        }

        preparedFiles.push({ file, type, meta, sizeLabel: formatFileSize(file.size) });
      }

      const filesByType = preparedFiles.reduce((groups, item) => {
        const backendType = item.type === 'txt' ? 'text' : item.type;
        return {
          ...groups,
          [backendType]: [...(groups[backendType] || []), item],
        };
      }, {});

      const uploadedDocuments = [];

      for (const [backendType, items] of Object.entries(filesByType)) {
        const uploadResult = await uploadRagDocuments(
          backendType,
          items.map((item) => item.file),
        );
        const resultDocuments = uploadResult.documents || [];

        resultDocuments.forEach((document, index) => {
          const source = items[index];
          uploadedDocuments.push({
            id: document.document_id,
            name: document.filename || source.file.name,
            type: source.type,
            meta: `${source.meta} | ${document.status}`,
            sizeLabel: source.sizeLabel,
            selected: true,
          });
        });
      }

      updateActiveChat((chat) => ({
        documents: [...chat.documents, ...uploadedDocuments],
      }));

      setFeedback({
        severity: 'success',
        message: `${uploadedDocuments.length} file${uploadedDocuments.length === 1 ? '' : 's'} added to the knowledge base.`,
      });
      setKnowledgeBaseOpen(true);
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: error.message,
      });
    }
  };

  const handleSendMessage = async () => {
    const prompt = draft.trim();

    if (!prompt) {
      return;
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    const selectedDocuments = activeChat.documents.filter((document) => document.selected);
    const nextTitle =
      activeChat.title === 'New Chat'
        ? prompt.slice(0, 42) + (prompt.length > 42 ? '...' : '')
        : activeChat.title;

    const userMessage = createMessage(`user-${Date.now()}`, 'user', prompt);

    updateActiveChat((chat) => ({
      messages: [...chat.messages, userMessage],
      title: nextTitle,
    }));

    setDraft('');
    setIsAssistantTyping(true);

    try {
      await createBackendMessage(activeChat.id, userMessage);
      await updateBackendChat({ ...activeChat, title: nextTitle });
    } catch (error) {
      console.error('Unable to save user message', error);
      setFeedback({
        severity: 'error',
        message: 'Your message was not saved to the backend.',
      });
    }

    try {
      const ragResponse = await queryRag(
        prompt,
        selectedDocuments.map((document) => document.id),
      );
      const assistantMessage = createMessage(
        `assistant-${Date.now() + 1}`,
        'assistant',
        ragResponse.answer || 'I could not generate an answer from the selected documents.',
      );

      updateActiveChat((chat) => ({
        messages: [...chat.messages, assistantMessage],
      }));

      await createBackendMessage(activeChat.id, assistantMessage);
    } catch (error) {
      console.error('Unable to query RAG backend', error);
      const assistantMessage = createMessage(
        `assistant-${Date.now() + 1}`,
        'assistant',
        error.message || 'The RAG engine is not available right now. Please try again.',
      );

      updateActiveChat((chat) => ({
        messages: [...chat.messages, assistantMessage],
      }));
    } finally {
      setIsAssistantTyping(false);
      typingTimeoutRef.current = null;
    }
  };

  const handleSpeakMessage = (message) => {
    if (!('speechSynthesis' in window)) {
      setFeedback({
        severity: 'warning',
        message: 'Speech synthesis is not supported in this browser.',
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setFeedback({
        severity: 'error',
        message: 'Unable to play audio for this response.',
      });
    };

    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const handleCopyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setFeedback({
        severity: 'success',
        message: 'Response copied to clipboard.',
      });
    } catch {
      setFeedback({
        severity: 'error',
        message: 'Unable to copy this response.',
      });
    }
  };

  const handleLogout = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    clearAuthSession();
    navigate('/auth?mode=signin', { replace: true });
  };

  const handleAddAccount = () => {
    navigate('/add-account');
  };

  const desktopSidebar = (
    <LeftSidebar
      chats={chats}
      activeChatId={activeChatId}
      renamingChatId={renamingChatId}
      onNewChat={createNewChat}
      onSelectChat={selectChat}
      onSearch={() => setSearchOpen(true)}
      onChatHome={openChatHome}
      onAllChats={showAllChats}
      onToggleKnowledgeBase={() => setKnowledgeBaseOpen((current) => !current)}
      onToggleStar={toggleChatStar}
      onStartRename={startRenameChat}
      onRenameChat={renameChat}
      onCancelRename={() => setRenamingChatId(null)}
      onRequestMove={requestMoveChat}
      onRequestDelete={requestDeleteChat}
      user={user}
      collapsed={sidebarCollapsed}
      onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      onLogout={handleLogout}
      onAddAccount={handleAddAccount}
    />
  );

  const mobileSidebar = (
    <LeftSidebar
      chats={chats}
      activeChatId={activeChatId}
      renamingChatId={renamingChatId}
      onNewChat={createNewChat}
      onSelectChat={selectChat}
      onSearch={() => setSearchOpen(true)}
      onChatHome={openChatHome}
      onAllChats={showAllChats}
      onToggleKnowledgeBase={() => setKnowledgeBaseOpen((current) => !current)}
      onToggleStar={toggleChatStar}
      onStartRename={startRenameChat}
      onRenameChat={renameChat}
      onCancelRename={() => setRenamingChatId(null)}
      onRequestMove={requestMoveChat}
      onRequestDelete={requestDeleteChat}
      user={user}
      collapsed={false}
      onToggleCollapsed={() => setMobileSidebarOpen(false)}
      onLogout={handleLogout}
      onAddAccount={handleAddAccount}
      isMobile
      onCloseMobile={() => setMobileSidebarOpen(false)}
    />
  );

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          width: '100%',
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#efefea',
          color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{ position: 'absolute', inset: 0, opacity: theme === 'dark' ? 0.4 : 0.22, pointerEvents: 'none' }}
        >
          <Particles
            particleColors={particleColors}
            particleCount={320}
            particleSpread={14}
            speed={0.08}
            particleBaseSize={102}
            sizeRandomness={1.05}
            cameraDistance={18}
            moveParticlesOnHover={false}
            alphaParticles={true}
          />
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {!isMobile ? (
            <Box
              sx={{
                width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
                height: '100vh',
                transition: 'width 300ms ease',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {desktopSidebar}
            </Box>
          ) : null}

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {location.pathname === '/chats' ? (
              <ChatsListPage chats={chats} onNewChat={createNewChat} onSelectChat={selectChat} />
            ) : (
              <ChatPanel
                activeChat={activeChat}
                draft={draft}
                onDraftChange={setDraft}
                onSendMessage={handleSendMessage}
                onUploadFiles={handleUploadFiles}
                onSpeakMessage={handleSpeakMessage}
                onStopSpeaking={handleStopSpeaking}
                onCopyMessage={handleCopyMessage}
                speakingMessageId={speakingMessageId}
                isAssistantTyping={isAssistantTyping}
                onToggleStar={toggleChatStar}
                onStartRename={startRenameChat}
                onRequestMove={requestMoveChat}
                onRequestDelete={requestDeleteChat}
                onOpenShare={() => setShareOpen(true)}
                onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                user={user}
                isMobile={isMobile}
                isHistoryLoading={isHistoryLoading}
                historyError={historyError}
                onRetryHistory={hydrateChatHistory}
              />
            )}
          </Box>
          {!isMobile ? (
            <Box
              sx={{
                width: knowledgeBaseOpen ? KNOWLEDGE_BASE_WIDTH : 0,
                height: '100vh',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'width 300ms ease',
              }}
            >
              {knowledgeBaseOpen ? (
                <RightSidebar
                  documents={activeChat.documents}
                  onUploadFiles={handleUploadFiles}
                  onToggleDocument={toggleDocument}
                  onRemoveDocument={removeDocument}
                  onClose={() => setKnowledgeBaseOpen(false)}
                />
              ) : null}
            </Box>
          ) : null}
        </Box>

        {isMobile ? (
          <Drawer
            anchor="bottom"
            open={knowledgeBaseOpen}
            onClose={() => setKnowledgeBaseOpen(false)}
            PaperProps={{
              sx: {
                height: '70vh',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden',
              },
            }}
          >
            <RightSidebar
              documents={activeChat.documents}
              onUploadFiles={handleUploadFiles}
              onToggleDocument={toggleDocument}
              onRemoveDocument={removeDocument}
              onClose={() => setKnowledgeBaseOpen(false)}
              isMobile
            />
          </Drawer>
        ) : null}

        <Drawer
          anchor="left"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          PaperProps={{ sx: { width: MOBILE_SIDEBAR_WIDTH } }}
        >
          {mobileSidebar}
        </Drawer>

        <Snackbar
          open={Boolean(feedback)}
          autoHideDuration={4200}
          onClose={() => setFeedback(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {feedback ? (
            <Alert severity={feedback.severity} onClose={() => setFeedback(null)} variant="filled">
              {feedback.message}
            </Alert>
          ) : null}
        </Snackbar>
        <ChatSearchModal
          open={searchOpen}
          chats={chats}
          activeChatId={activeChatId}
          onClose={() => setSearchOpen(false)}
          onSelectChat={selectChat}
        />
        <DeleteChatDialog
          open={Boolean(pendingDeleteChatId)}
          onClose={() => setPendingDeleteChatId(null)}
          onConfirm={() => pendingDeleteChatId && handleDeleteChat(pendingDeleteChatId)}
        />
        <MoveChatDialog
          open={Boolean(moveChatId)}
          onClose={() => setMoveChatId(null)}
          projects={[]}
        />
        <ShareChatDialog
          open={shareOpen}
          share={activeChat.share}
          onClose={() => setShareOpen(false)}
          onCreateShareLink={createShareLink}
          onRevokeShareLink={revokeShareLink}
        />
      </Box>
    </AppTheme>
  );
}
