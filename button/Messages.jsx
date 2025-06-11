const renderMessage = (item) => {
  if (!item || typeof item !== 'object') {
    console.warn('Invalid message item:', item);
    return null;
  }

  const messageText = item.message?.toString() || '';
  const isCurrentUser = item.user?.user_id === user?.user_id;
  const messageDate = item.created_at ? new Date(item.created_at) : new Date();
  const formattedDate = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      key={item.message_id || Math.random()}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`flex flex-col max-w-[70%] ${
          isCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        {!isCurrentUser && item.user?.name && (
          <span className="text-xs text-gray-500 mb-1">{item.user.name}</span>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{messageText}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1">{formattedDate}</span>
      </div>
    </div>
  );
};

return (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto p-4" ref={messagesEndRef}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((item) => renderMessage(item))
      )}
    </div>
    {/* ... rest of the component ... */}
  </div>
); 