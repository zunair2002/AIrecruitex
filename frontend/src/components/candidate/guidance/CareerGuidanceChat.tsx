"use client";

import { useEffect, useRef, useState } from "react";
import { defaultWelcome, getMockReply, quickPrompts, type ChatMessage } from "./guidanceData";

let messageId = 0;
const nextId = () => `msg-${++messageId}`;

export function CareerGuidanceChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: "assistant", content: defaultWelcome },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { id: nextId(), role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: getMockReply(trimmed) },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="p-8 h-screen flex flex-col max-h-screen">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Career Guidance</h1>
        <p className="text-gray-500 mt-1">Chat with your AI career mentor for personalized advice.</p>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-md"
                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 mb-1">
                    AI Career Guide
                  </p>
                )}
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-4 shrink-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={isTyping}
                className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about career paths, skills, interviews..."
              disabled={isTyping}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Send
            </button>
          </form>
          <p className="text-[10px] text-gray-400 mt-2">
            Mock chatbot — real Gemini AI will connect when the backend is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
