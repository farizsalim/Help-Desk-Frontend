import React from 'react'

const ChatModal = ({
  conversation,
  messages,
  user,
  newMessage,
  setNewMessage,
  onSendMessage,
  onClose,
  formatDate,
  messagesEndRef,
  typingUsers,
  socketRef,
  typingTimeoutRef,
  // Image upload
  selectedImage,
  imagePreview,
  uploadingImage,
  onImageSelect,
  clearSelectedImage,
  fileInputRef,
  previewImage,
  setPreviewImage
}) => {
  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (conversation) {
      socketRef.current?.emit('typing', { conversationId: conversation._id })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { conversationId: conversation._id })
      }, 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="hidden sm:block flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full sm:max-w-lg bg-slate-800 border-r border-white/10 shadow-2xl animate-slideInLeft">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">{conversation.subject}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                  conversation.status === 'open' ? 'bg-green-500/20 text-green-300' : 
                  conversation.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' : 
                  'bg-red-500/20 text-red-300'
                }`}>
                  {conversation.status === 'open' ? 'Open' : conversation.status === 'in_progress' ? 'In Progress' : 'Closed'}
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-white/40 mt-8 text-sm">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`flex flex-col ${msg.sender_id?._id === user?._id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base ${
                    msg.sender_id?._id === user?._id
                      ? 'bg-orange-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-white rounded-bl-none'
                  }`}>
                    <p className="text-xs opacity-75 mb-1">{msg.sender_id?.nama}</p>
                    
                    {/* Image Attachment */}
                    {msg.attachment?.url && (
                      <div className="mb-2">
                        <img 
                          src={msg.attachment.url} 
                          alt="Attachment" 
                          className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPreviewImage(msg.attachment.url)}
                        />
                      </div>
                    )}
                    
                    {/* Text Message */}
                    {msg.isi_pesan && <p>{msg.isi_pesan}</p>}
                  </div>
                  <span className="text-xs text-white/40 mt-1 px-1">{formatDate(msg.sent_at)}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-white/50 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </div>
              <span className="truncate">{typingUsers.map(u => u.nama).join(', ')} sedang mengetik...</span>
            </div>
          )}

          {/* Input Form */}
          {conversation.status !== 'closed' && (
            <form onSubmit={onSendMessage} className="p-4 border-t border-white/10">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-32 rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* Image Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-3 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  title="Tambah gambar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={onImageSelect}
                  className="hidden"
                />
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={selectedImage ? "Tambahkan caption (opsional)..." : "Type your message..."}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={uploadingImage || (!newMessage.trim() && !selectedImage)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-[95%] max-h-[95%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default ChatModal
