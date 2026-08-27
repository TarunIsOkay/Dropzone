"use client";

import { useEffect, useState, useRef } from "react";
import { Hash, Bell, Users, Send, AtSign, Smile, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, getChannels, getMessages } from "@/app/actions/chat";
import { cn } from "@/lib/utils";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Channel { id: string; name: string; type: string; unread: number }
interface Msg { id: string; content: string; created_at: string; profiles: { username: string; display_name: string; avatar_url: string } | null }

export default function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const data = await getChannels();
        const ch = data.map((c) => ({ id: c.id, name: c.name, type: c.type, unread: 0 }));
        setChannels(ch);
        if (ch.length > 0) setSelectedChannel(ch[0].id);
      } catch {
        const fallback: Channel[] = [
          { id: "general", name: "general", type: "text", unread: 3 },
          { id: "announcements", name: "announcements", type: "announcement", unread: 0 },
          { id: "match-discussion", name: "match-discussion", type: "text", unread: 1 },
          { id: "results", name: "results", type: "text", unread: 0 },
          { id: "support", name: "support", type: "text", unread: 0 },
        ];
        setChannels(fallback);
        setSelectedChannel("general");
      }
      setLoading(false);
    };
    loadChannels();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedChannel);
        setMessages(data as Msg[]);
      } catch {
        setMessages([]);
      }
    };
    loadMessages();

    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`chat:${selectedChannel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${selectedChannel}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Msg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChannel]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedChannel || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedChannel, message);
      setMessages((prev) => [...prev, msg as Msg]);
      setMessage("");
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const selectedName = channels.find((c) => c.id === selectedChannel)?.name || "general";

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-dz-border overflow-hidden bg-dz-surface">
      <div className="w-60 border-r border-dz-border flex flex-col bg-dz-surface shrink-0">
        <div className="p-3 border-b border-dz-border">
          <h2 className="text-sm font-semibold px-2">Channels</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 mb-1">
            <span className="text-[10px] font-semibold text-dz-text-dim uppercase tracking-wider px-2">General</span>
          </div>
          {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-3 py-1.5"><Skeleton className="h-6 w-full" /></div>) :
            channels.map((ch) => (
              <button key={ch.id} onClick={() => setSelectedChannel(ch.id)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg mx-1 transition-colors", selectedChannel === ch.id ? "bg-dz-elevated text-dz-text" : "text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated/50")}>
                {ch.type === "announcement" ? <Bell className="w-4 h-4 shrink-0" /> : <Hash className="w-4 h-4 shrink-0" />}
                <span className="truncate">{ch.name}</span>
                {ch.unread > 0 ? <Badge variant="crimson" size="sm" className="ml-auto">{ch.unread}</Badge> : null}
              </button>
            ))
          }
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-dz-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-dz-text-dim" />
            <span className="text-sm font-semibold">{selectedName}</span>
          </div>
          <button className="p-1.5 rounded text-dz-text-dim hover:text-dz-text hover:bg-dz-elevated transition-colors"><Users className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="flex gap-3"><Skeleton className="w-8 h-8 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-full" /></div></div>)) :
            messages.length === 0 ? (
              <div className="text-center py-12"><Hash className="w-12 h-12 text-dz-text-dim mx-auto mb-3" /><p className="text-sm text-dz-text-muted">No messages yet</p></div>
            ) : messages.map((msg) => (
              <div key={msg.id} className="flex gap-3 group">
                <Avatar name={msg.profiles?.display_name || msg.profiles?.username || "User"} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{msg.profiles?.display_name || msg.profiles?.username || "User"}</span>
                    <span className="text-[10px] text-dz-text-dim">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ""}</span>
                  </div>
                  <p className="text-sm text-dz-text-muted mt-0.5">{msg.content}</p>
                </div>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-dz-border">
          <div className="flex items-center gap-2 bg-dz-elevated border border-dz-border rounded-lg px-3 py-2">
            <input type="text" placeholder={`Message #${selectedName}`} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1 bg-transparent text-sm text-dz-text placeholder:text-dz-text-dim outline-none" disabled={sending} />
            <button className="p-1 text-dz-text-dim hover:text-dz-text transition-colors"><AtSign className="w-4 h-4" /></button>
            <button className="p-1 text-dz-text-dim hover:text-dz-text transition-colors"><Smile className="w-4 h-4" /></button>
            <button onClick={handleSend} disabled={!message.trim() || sending} className="p-1.5 rounded bg-dz-crimson text-white hover:bg-dz-crimson-600 transition-colors disabled:opacity-50">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
