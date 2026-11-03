"use client";

import { useState } from "react";

const MAX_LENGTH = 200;

type Message = { id: number; text: string };

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) {
      setNotice("메시지를 입력해 주세요. / Please type a message.");
      return;
    }
    if (text.length > MAX_LENGTH) {
      setNotice(`${MAX_LENGTH}자 이하로 써 주세요. / Max ${MAX_LENGTH} characters.`);
      return;
    }
    setMessages((prev) => [...prev, { id: prev.length, text }]);
    setInput("");
    setNotice("");
  }

  return (
    <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-3xl bg-white/95 text-gray-900 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
      <header className="flex items-center gap-3 border-b border-gray-100 p-4">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-amber-400 text-2xl shadow-md">
          🙂
        </div>
        <div>
          <p className="font-semibold">한국어 친구</p>
          <p className="text-xs text-emerald-600">● 온라인 / Online</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-gradient-to-b from-amber-50/60 to-white p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-gray-400">
            대화가 여기에 나와요
            <br />
            <span className="text-xs">Your chat will appear here</span>
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="max-w-[80%] self-end break-words rounded-2xl rounded-br-sm bg-amber-400 px-3 py-2 text-sm text-white shadow"
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setNotice("");
            }}
            maxLength={MAX_LENGTH}
            placeholder="메시지를 입력하세요 / Type a message"
            className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-500"
          >
            보내기
            <span className="block text-[10px] font-normal">Send</span>
          </button>
        </div>
        <div className="mt-1 flex justify-between px-2 text-xs">
          <span className="text-red-500">{notice}</span>
          <span className="text-gray-400">
            {input.length}/{MAX_LENGTH}
          </span>
        </div>
      </form>
    </div>
  );
}
