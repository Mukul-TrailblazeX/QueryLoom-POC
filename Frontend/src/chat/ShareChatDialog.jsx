import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, Globe2, Lock, X } from 'lucide-react';

function ShareOption({ icon, title, subtitle, selected, onClick, divided }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: 0,
        borderTop: divided ? '1px solid rgba(0,0,0,0.08)' : 0,
        background: 'transparent',
        color: '#1f1f1f',
        cursor: 'pointer',
        padding: '14px 16px',
        textAlign: 'left',
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = 'rgba(0,0,0,0.03)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ color: '#5f6368', display: 'grid', placeItems: 'center' }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, lineHeight: '20px' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 14, color: '#6b7280', lineHeight: '20px' }}>{subtitle}</span>
      </span>
      {selected ? <Check size={18} color="#1a73e8" /> : null}
    </button>
  );
}

export default function ShareChatDialog({
  open,
  share,
  onClose,
  onCreateShareLink,
  onRevokeShareLink,
}) {
  const [selectedMode, setSelectedMode] = React.useState('private');
  const [copied, setCopied] = React.useState(false);
  const isShared = Boolean(share?.isShared);
  const publicSelected = selectedMode === 'public';

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  React.useEffect(() => {
    if (open) {
      setSelectedMode(isShared ? 'public' : 'private');
      setCopied(false);
    }
  }, [isShared, open]);

  if (!open) {
    return null;
  }

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setCopied(false);

    if (mode === 'private' && isShared) {
      onRevokeShareLink();
    }
  };

  const handleCreate = () => {
    onCreateShareLink();
    setSelectedMode('public');
  };

  const handleCopy = async () => {
    if (!share?.shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(share.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-chat-title"
        style={{
          position: 'relative',
          zIndex: 1000,
          width: 'min(480px, 90vw)',
          background: 'white',
          color: '#1f1f1f',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div id="share-chat-title" style={{ fontSize: 18, fontWeight: 700, lineHeight: '24px' }}>
              {isShared ? 'Chat shared' : 'Share chat'}
            </div>
            <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280', lineHeight: '20px' }}>
              {isShared ? "Future messages aren't included" : 'Only messages up to this point will be shared.'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            style={{ border: 0, background: 'transparent', color: '#4b5563', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: 20, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, overflow: 'hidden' }}>
          <ShareOption
            icon={<Lock size={18} />}
            title="Keep private"
            subtitle="Only you have access"
            selected={!publicSelected}
            onClick={() => handleModeChange('private')}
          />
          <ShareOption
            icon={<Globe2 size={18} />}
            title="Create public link"
            subtitle="Anyone with the link can view"
            selected={publicSelected}
            onClick={() => handleModeChange('public')}
            divided
          />
        </div>

        {isShared && publicSelected ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <div
              title={share.shareUrl}
              style={{
                flex: '1 1 240px',
                minWidth: 0,
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 14,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#374151',
              }}
            >
              {share.shareUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                border: 0,
                borderRadius: 8,
                background: '#111',
                color: '#fff',
                padding: '9px 16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, fontSize: 13, color: '#6b7280', lineHeight: '19px' }}>
            Don&apos;t share personal information or third-party content without permission, and see our{' '}
            <a href="/usage-policy" style={{ color: 'inherit', textDecoration: 'underline' }}>
              Usage Policy
            </a>
            .
          </div>
        )}

        {!isShared || !publicSelected ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              onClick={publicSelected ? handleCreate : undefined}
              disabled={!publicSelected}
              style={{
                border: 0,
                borderRadius: 8,
                background: publicSelected ? '#111' : 'rgba(0,0,0,0.08)',
                color: publicSelected ? '#fff' : 'rgba(0,0,0,0.38)',
                padding: '9px 16px',
                fontWeight: 600,
                cursor: publicSelected ? 'pointer' : 'default',
              }}
            >
              {publicSelected ? 'Create share link' : 'Save'}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
