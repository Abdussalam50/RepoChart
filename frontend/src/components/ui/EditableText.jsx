import React from 'react';
import { useInlineEdit } from '../../hooks/useInlineEdit';

export default function EditableText({
  text,
  onSave,
  onReset,
  readOnly = false,       // true di shareable dashboard
  className = '',
}) {
  const {
    text: currentText,
    setText,
    isEditing,
    isEdited,
    isSaving,
    textareaRef,
    handleClick,
    handleSave,
    handleReset,
    handleKeyDown,
    handleBlur,
  } = useInlineEdit({ initialText: text || '', onSave, onReset });

  // Mode read-only (shareable dashboard) — tidak bisa diedit
  if (readOnly) {
    return <p className={className}>{currentText}</p>;
  }

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`w-full resize-none border border-purple-300
                      rounded-md p-2 text-sm bg-purple-50/30
                      focus:outline-none focus:ring-2
                      focus:ring-purple-400 ${className}`}
          rows={3}
          style={{ minHeight: '80px' }}
        />
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={handleReset}
            className="text-xs text-zinc-400 hover:text-zinc-600
                       flex items-center gap-1"
          >
            <i className="ti ti-refresh text-xs" />
            Reset ke otomatis
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              Ctrl+Enter untuk simpan
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs px-3 py-1 bg-purple-600 text-white
                         rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : '✓ Simpan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode default — tampilkan teks dengan hover effect
  return (
    <div
      className="group relative cursor-text"
      onClick={handleClick}
    >
      <p className={`${className} group-hover:bg-purple-50/50
                     rounded transition-colors duration-150 px-1 -mx-1`}>
        {currentText}
      </p>

      {/* Icon pensil muncul saat hover */}
      <button
        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100
                   transition-opacity p-1 text-purple-400 hover:text-purple-600"
        onClick={handleClick}
        title="Edit teks ini"
      >
        <i className="ti ti-pencil text-xs" />
      </button>

      {/* Badge "edited" jika sudah diedit user */}
      {isEdited && (
        <span className="absolute -top-2 -right-1 text-xs px-1.5 py-0.5
                         bg-purple-100 text-purple-500 rounded-full
                         font-medium leading-none">
          edited
        </span>
      )}
    </div>
  );
}
