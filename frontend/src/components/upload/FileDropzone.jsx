import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FileDropzone({ onFileDrop, isUploading, acceptedFile = null }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileDrop(acceptedFiles[0]);
    }
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200',
        isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50',
        isDragReject ? 'border-red-500 bg-red-50' : '',
        isUploading ? 'pointer-events-none opacity-60' : '',
        acceptedFile ? 'border-green-500 bg-green-50' : ''
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center gap-4">
        {acceptedFile ? (
          <>
            <div className="rounded-full bg-green-100 p-4 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{acceptedFile.name}</p>
              <p className="text-sm text-slate-500">{(acceptedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              "rounded-full p-4 transition-colors",
              isDragActive ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">
                {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                CSV or Excel (max. 10MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
