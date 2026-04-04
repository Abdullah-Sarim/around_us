import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getConversations, 
  getConversation, 
  getMessages, 
  sendMessage,
  startConversation,
  deleteConversation,
  markAsSold,
  markAsUnsold
} from "../lib/api";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
};

export const useConversation = (id) => {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getConversation(id),
    enabled: !!id,
  });
};

export const useMessages = (id) => {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessages(id),
    enabled: !!id,
    refetchInterval: 3000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, content }) => sendMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, sellerId, buyerId }) => startConversation({ productId, sellerId, buyerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useMarkAsSold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId }) => markAsSold(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useMarkAsUnsold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => markAsUnsold(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};
