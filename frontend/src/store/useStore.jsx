import { create } from "zustand";

const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  chats: [],
  currentChat: [],
  history: [],
  isStreaming: false,
  isLoading: false,
  limitReached: false,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      chats: [],
      currentChat: [],
      history: [],
      limitReached: false,
    });
  },
  addMessage: (msg) => set((s) => ({ currentChat: [...s.currentChat, msg] })),
  setCurrentChat: (chatOrUpdater) =>
    set((s) => ({
      currentChat:
        typeof chatOrUpdater === "function"
          ? chatOrUpdater(s.currentChat)
          : chatOrUpdater,
    })),
  setHistory: (history) => set({ history }),
  setStreaming: (val) => set({ isStreaming: val }),
  setLoading: (val) => set({ isLoading: val }),
  setLimitReached: (val) => set({ limitReached: val }),
}));

export default useStore;
