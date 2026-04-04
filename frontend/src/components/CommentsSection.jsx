import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { useCreateComment, useDeleteComment } from "../hooks/useComments";
import { useStartConversation } from "../hooks/useMessages";
import { SendIcon, Trash2Icon, MessageSquareIcon, LogInIcon, MessageCircleIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { confirmDialog } from "./ConfirmDialog";

function CommentsSection({ productId, comments = [], currentUserId, productOwnerId }) {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment(productId);
  const startConversation = useStartConversation();

  const isSeller = currentUserId === productOwnerId;

  const handleMessageBuyer = async (buyerId) => {
    if (!buyerId || !productOwnerId) {
      console.error("Missing buyerId or sellerId");
      return;
    }
    try {
      console.log("Starting conversation:", { productId, sellerId: productOwnerId, buyerId });
      const conv = await startConversation.mutateAsync({ 
        productId, 
        sellerId: productOwnerId,
        buyerId 
      });
      console.log("Conversation started:", conv);
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert("Failed to start conversation. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate({ productId, content }, { onSuccess: () => setContent("") });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquareIcon className="size-5 text-primary" />
        <h3 className="font-bold">Comments</h3>
        <span className="badge badge-neutral badge-sm">{comments.length}</span>
      </div>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            className="input input-bordered input-sm flex-1 bg-base-200"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={createComment.isPending}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm btn-square"
            disabled={createComment.isPending || !content.trim()}
          >
            {createComment.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between bg-base-200 rounded-lg p-3">
          <span className="text-sm text-base-content/60">Sign in to join the conversation</span>
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-sm gap-1">
              <LogInIcon className="size-4" />
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <MessageSquareIcon className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No comments yet. Be first!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-8 rounded-full">
                  <img src={comment.user?.imageUrl} alt={comment.user?.name} />
                </div>
              </div>

              <div className="chat-header text-xs opacity-70 mb-2">
                {comment.user?.name}
                <time className="ml-2 text-xs opacity-50">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>

              <div className="chat-bubble chat-bubble-neutral text-sm">{comment.content}</div>

              {isSeller && currentUserId !== comment.userId && (
                <div className="chat-footer">
                  <button
                    onClick={() => handleMessageBuyer(comment.userId)}
                    className="btn btn-ghost btn-xs text-primary gap-1"
                    disabled={startConversation.isPending}
                  >
                    <MessageCircleIcon className="size-3" />
                    Message
                  </button>
                </div>
              )}

              {currentUserId === comment.userId && (
                <div className="chat-footer">
                  <button
                    onClick={async () =>
                      (await confirmDialog({ title: "Delete Comment", message: "Are you sure you want to delete this comment?", confirmText: "Delete", type: "danger" })) &&
                      deleteComment.mutate({ commentId: comment.id })
                    }
                    className="btn btn-ghost btn-xs text-error"
                    disabled={deleteComment.isPending}
                  >
                    {deleteComment.isPending ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Trash2Icon className="size-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentsSection;
