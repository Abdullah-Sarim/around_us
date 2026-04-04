import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useConversations, useConversation, useMessages, useSendMessage, useDeleteConversation } from "../hooks/useMessages";
import useAuthReq from "../hooks/useAuthReq";
import LoadingSpinner from "../components/LoadingSpinner";
import { MessageCircleIcon, SendIcon, ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { confirmDialog } from "../components/ConfirmDialog";

function ChatPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { isSignedIn } = useAuthReq();
  const navigate = useNavigate();
  
  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { data: conversation, isLoading: loadingConversation } = useConversation(id);
  const { data: messages = [], isLoading: loadingMessages } = useMessages(id);
  const sendMessageMutation = useSendMessage();
  const deleteConversation = useDeleteConversation();
  
  const [newMessage, setNewMessage] = useState("");

  const isSeller = conversation?.sellerId === user?.id;

  const handleDeleteConversation = async () => {
    const confirmed = await confirmDialog({
      title: "Delete Conversation",
      message: "Delete this conversation? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger"
    });
    if (confirmed) {
      await deleteConversation.mutateAsync(id);
      navigate("/chat");
    }
  };
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isSignedIn) {
    return (
      <div className="card bg-base-300">
        <div className="card-body items-center text-center py-16">
          <MessageCircleIcon className="size-16 text-base-content/20" />
          <h3 className="card-title">Sign in to view messages</h3>
          <p className="text-base-content/50 text-sm">
            You need to be signed in to view your conversations
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    
    await sendMessageMutation.mutateAsync({ conversationId: id, content: newMessage });
    setNewMessage("");
  };

  if (loadingConversations) return <LoadingSpinner />;

  if (!id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        
        {conversations.length === 0 ? (
          <div className="card bg-base-300">
            <div className="card-body items-center text-center py-16">
              <MessageCircleIcon className="size-16 text-base-content/20" />
              <h3 className="card-title text-base-content/50">No conversations yet</h3>
              <p className="text-base-content/40 text-sm">
                Start a conversation by contacting a seller on their product
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherUser = conv.buyerId === user?.id ? conv.seller : conv.buyer;
              const lastMessage = conv.messages?.[0];
              
              return (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className="card bg-base-300 card-side hover:bg-base-200 transition-colors"
                >
                  <figure className="w-16 h-16 shrink-0">
                    <img
                      src={conv.product?.imageUrl || "/placeholder.png"}
                      alt={conv.product?.title}
                      className="h-full w-full object-cover"
                    />
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="font-semibold capitalize">{conv.product?.title}</h3>
                    <p className="text-sm text-base-content/60">
                      {otherUser?.name || "Unknown User"}
                    </p>
                    {lastMessage && (
                      <p className="text-sm text-base-content/50 truncate">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (loadingConversation || loadingMessages) return <LoadingSpinner />;

  const otherUser = conversation?.buyerId === user?.id ? conversation.seller : conversation.buyer;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/chat")} className="btn btn-ghost btn-sm">
            <ArrowLeftIcon className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold capitalize">{conversation?.product?.title}</h1>
            <p className="text-sm text-base-content/60">with {otherUser?.name || "Unknown User"}</p>
          </div>
        </div>
        {isSeller && (
          <button
            onClick={handleDeleteConversation}
            className="btn btn-error btn-sm gap-1"
            disabled={deleteConversation.isPending}
          >
            <Trash2Icon className="size-4" />
            Delete
          </button>
        )}
      </div>

      <div className="card bg-base-300 flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              
              return (
                <div
                  key={msg.id}
                  className={`chat ${isMe ? "chat-end" : "chat-start"}`}
                >
                  <div className={`chat-bubble ${isMe ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                    {msg.content}
                  </div>
                  <div className="chat-footer text-xs opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-base-content/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input input-bordered flex-1"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
              >
                <SendIcon className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
