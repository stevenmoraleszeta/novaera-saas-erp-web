import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Edit2, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  createComment,
  getCommentsByRecord,
  updateComment,
  deleteComment
} from '@/services/recordCommentsService';
import useCurrentUser from '@/hooks/useCurrentUser';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RecordComments({ recordId, tableId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const currentUser = useCurrentUser();

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && recordId) {
      loadComments();
    }
  }, [isOpen, recordId]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await getCommentsByRecord(recordId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    try {
      setLoading(true);
      const result = await createComment(recordId, tableId, newComment.trim());

      if (result.success) {
        toast.success('Comentario creado exitosamente');
        setNewComment('');
        await loadComments(); // Recargar comentarios
      } else {
        toast.error(result.error || 'Error al crear comentario');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Error al crear comentario');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    try {
      await updateComment(commentId, editText.trim());
      toast.success('Comentario actualizado exitosamente');
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      toast.success('Comentario eliminado exitosamente');
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment_text);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-start justify-center px-4 pt-20">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="w-[800px] max-h-[75vh] p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col max-h-[75vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comentarios del Registro
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Formulario para nuevo comentario */}
              <div className="border-b border-gray-200 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center border">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{currentUser?.name}</span>
                  </div>
                  <div className="ml-11">
                    <Textarea
                      placeholder="Escribe tu comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleCreateComment}
                        disabled={loading || !newComment.trim()}
                        size="sm"
                        className="h-8 text-xs flex items-center gap-2"
                      >
                        <Send className="w-3 h-3" />
                        {loading ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de comentarios */}
              {loadingComments ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <p className="mt-2 text-sm text-gray-600">Cargando comentarios...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h4 className="font-medium mb-2">No hay comentarios</h4>
                  <p className="text-sm">Sé el primero en comentar este registro.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center border">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{comment.user_name}</p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                              {comment.updated_at !== comment.created_at && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-400">editado</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {currentUser?.id === comment.user_id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(comment)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingComment === comment.id ? (
                        <div className="ml-11 space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-8 text-xs"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={!editText.trim()}
                              className="h-8 text-xs"
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="ml-11 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {comment.comment_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
