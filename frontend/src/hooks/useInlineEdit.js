import { useState, useRef, useEffect } from 'react';

export function useInlineEdit({ initialText, onSave, onReset }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText]           = useState(initialText);
  const [isEdited, setIsEdited]   = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const textareaRef               = useRef(null);

  // Auto-focus textarea saat masuk mode edit
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Taruh cursor di akhir teks
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleClick = () => setIsEditing(true);

  const handleSave = async () => {
    if (text.trim() === initialText) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(text);
      setIsEdited(true);
    } catch (err) {
      console.error('Failed to save text', err);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleReset = async () => {
    try {
      const original = await onReset();
      setText(original);
      setIsEdited(false);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to reset text', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setText(initialText);
      setIsEditing(false);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  // Auto-save saat klik di luar
  const handleBlur = () => {
    handleSave();
  };

  return {
    text, setText,
    isEditing, isEdited, isSaving,
    textareaRef,
    handleClick, handleSave,
    handleReset, handleKeyDown, handleBlur,
  };
}
