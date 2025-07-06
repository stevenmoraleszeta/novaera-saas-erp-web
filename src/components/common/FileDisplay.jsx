import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  File 
} from 'lucide-react';
import { 
  formatFileSize, 
  getFileIcon,
  getDownloadUrl,
  getViewUrl 
} from '@/services/fileService';

export default function FileDisplay({ 
  value, 
  multiple = false,
  showActions = true,
  compact = false
}) {
  const handleDownload = (file) => {
    window.open(getDownloadUrl(file.file_id), '_blank');
  };

  const handleView = (file) => {
    window.open(getViewUrl(file.file_id), '_blank');
  };

  const renderFileItem = (file, index) => {
    if (compact) {
      return (
        <div key={file.file_id || index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
          <span className="text-sm">{getFileIcon(file.mime_type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.original_name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
          </div>
          {showActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleView(file)}
                className="p-1 h-6 w-6"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(file)}
                className="p-1 h-6 w-6"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <Card key={file.file_id || index} className="mb-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
              <div>
                <p className="font-medium text-sm">{file.original_name}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  {file.uploaded_at && (
                    <span>• {new Date(file.uploaded_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
            {showActions && (
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!value) {
    return (
      <div className="text-gray-500 text-sm py-2">
        No hay archivos
      </div>
    );
  }

  if (multiple) {
    if (!Array.isArray(value) || value.length === 0) {
      return (
        <div className="text-gray-500 text-sm py-2">
          No hay archivos
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((file, index) => renderFileItem(file, index))}
      </div>
    );
  }

  return renderFileItem(value, 0);
}

// Componente para mostrar archivos en una celda de tabla
export function FileTableCell({ value, multiple = false }) {
  if (!value) {
    return <span className="text-gray-400">-</span>;
  }

  if (multiple) {
    if (!Array.isArray(value) || value.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="flex items-center space-x-1">
        <File className="h-4 w-4" />
        <span className="text-sm">{value.length} archivo{value.length > 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span>{getFileIcon(value.mime_type)}</span>
      <span className="text-sm truncate max-w-32">{value.original_name}</span>
    </div>
  );
}
