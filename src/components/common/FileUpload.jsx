import React, { useState, useRef, useEffect  } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  File, 
  X, 
  Download, 
  Eye, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { 
  uploadFile, 
  validateFile, 
  formatFileSize, 
  getFileIcon,
  getDownloadUrl,
  getViewUrl 
} from '@/services/fileService';

export default function FileUpload({ 
  value, 
  onChange, 
  error, 
  multiple = false,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  placeholder = "Seleccionar archivo..."
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);  //Mensaje de error
  const [lastUploadedId, setLastUploadedId] = useState(null); //Manejo de ver el ultimo subido
  const itemRefs = useRef({});
  
  const fileInputRef = useRef(null);

  //Mensaje con tiempo
  useEffect(() => {
    if (statusMessage) {
        const timer = setTimeout(() => {
            setStatusMessage(null);
        }, 3000); 
        return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  useEffect(() => {
    if (lastUploadedId && itemRefs.current[lastUploadedId]) {
        const element = itemRefs.current[lastUploadedId];
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        element.classList.add('flash-effect');
        const timer = setTimeout(() => {
            element.classList.remove('flash-effect');
        }, 1500);
        return () => clearTimeout(timer);
    }
}, [lastUploadedId, value]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadError(null);
    setUploading(true);

    try {
      if (multiple) {
        // Manejar múltiples archivos
        const uploadedFiles = [];
        for (const file of files) {
          validateFile(file);
          const uploadedFile = await uploadFile(file);
          uploadedFiles.push({
            file_id: uploadedFile.id,
            original_name: uploadedFile.original_name,
            file_size: uploadedFile.file_size,
            mime_type: uploadedFile.mime_type,
            file_hash: uploadedFile.file_hash
          });
        }
        
        // Agregar a los archivos existentes
        const currentFiles = Array.isArray(value) ? value : [];
        onChange([...currentFiles, ...uploadedFiles]);
        if (uploadedFiles.length > 0) {
          setLastUploadedId(uploadedFiles[uploadedFiles.length - 1].file_id);
        }
      } else {
        // Manejar un solo archivo
        const file = files[0];
        validateFile(file);
        const uploadedFile = await uploadFile(file);
        
        onChange({
          file_id: uploadedFile.id,
          original_name: uploadedFile.original_name,
          file_size: uploadedFile.file_size,
          mime_type: uploadedFile.mime_type,
          file_hash: uploadedFile.file_hash
        });
        setLastUploadedId(uploadedFile.id);
      }
        setStatusMessage({ 
          text: `Se añadió correctamente '${files[0]?.name}'`, 
          type: 'success' 
        });
    } catch (error) {
        setStatusMessage({ 
            text: `Error al subir '${files[0]?.name || 'el archivo'}'.`, 
            type: 'error' 
        });
      setUploadError(error.message);
    } finally {
      setUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    if (multiple) {
      const updatedFiles = value.filter(file => file.file_id !== fileToRemove.file_id);
      onChange(updatedFiles);
    } else {
      onChange(null);
    }
  };

  const handleDownload = (file) => {
    window.open(getDownloadUrl(file.file_id), '_blank');
  };

  const handleView = (file) => {
    window.open(getViewUrl(file.file_id), '_blank');
  };

  const renderFileItem = (file) => (
    <Card key={file.file_id} 
     ref={el => (itemRefs.current[file.file_id] = el)} className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
            <div>
              <p className="font-medium text-sm">{file.original_name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(file)}
              className="p-1 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(file)}
              className="p-1 h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(file)}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const hasFiles = multiple ? (Array.isArray(value) && value.length > 0) : value;

  return (
    // <div className="space-y-3">
    <div className="flex flex-col h-full">
      {/* Input de archivo */}
      <div className="flex items-center space-x-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {placeholder}
            </>
          )}
        </Button>
      </div>
      {/* <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-2"> */}
      <div className="flex-1 overflow-y-scroll mt-4 pr-2 space-y-2">
        {/* Mostrar error de subida */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Mostrar error de validación */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Mostrar archivos */}
        {hasFiles && (
          <div className="space-y-2">
            {multiple ? (
              value.map(file => renderFileItem(file))
            ) : (
              renderFileItem(value)
            )}
          </div>
        )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500">
          <p>Tipos permitidos: Imágenes, PDF, Word, Excel, TXT</p>
          <p>Tamaño máximo: {formatFileSize(maxSize)}</p>
          <div className="h-6 mt-2">
            {statusMessage && (
              <p className={`font-semibold text-sm ${
                  statusMessage.type === 'success' ? 'text-green-600' : 'text-red-500'
              }`}>
                  {statusMessage.text}
              </p>
            )}
          </div>
      </div>
    </div>
  );
}
