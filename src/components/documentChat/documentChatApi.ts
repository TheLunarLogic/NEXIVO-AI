export type DocumentMeta = {
  id: string;
  filename: string;
  chunk_count?: number;
  upload_date?: string;
};

export type ThreadMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export type StartThreadResponse = {
  thread_id: string;
};

type FetchThreadMessagesResponse = {
  messages?: ThreadMessage[];
};

const START_THREAD_DEFAULT_PAYLOAD = { user_id: "default", context: "start" } as const;
const START_THREAD_MAX_ATTEMPTS = 2;
const START_THREAD_TIMEOUT_MS = 10000;

function getTextFromStreamData(data: unknown): string {
  // Backend streaming formats can vary; we try to support common shapes.
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const token =
      obj.token ??
      obj.delta ??
      obj.content ??
      obj.text ??
      obj.message ??
      obj.data ??
      null;
    if (typeof token === "string") return token;
    return JSON.stringify(obj);
  }
  return String(data ?? "");
}

export function createDocumentChatApi(API_URL: string) {
  async function fetchDocuments(): Promise<DocumentMeta[]> {
    const res = await fetch(`${API_URL}/teacher/documents`);
    if (!res.ok) throw new Error(`documents fetch failed: HTTP ${res.status}`);
    const data = (await res.json()) as { documents?: DocumentMeta[] } | DocumentMeta[];
    return (Array.isArray(data) ? data : data.documents) ?? [];
  }

  async function uploadDocument(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/teacher/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed - backend response:", errorText);
      let detail = "";
      try {
        const parsed: unknown = JSON.parse(errorText);
        if (parsed && typeof parsed === "object") {
          const payload = parsed as Record<string, unknown>;
          if (typeof payload.detail === "string" && payload.detail.trim()) {
            detail = payload.detail;
          } else if (typeof payload.message === "string" && payload.message.trim()) {
            detail = payload.message;
          }
        }
      } catch {
        // Ignore non-JSON error payloads for user-facing error text.
      }
      throw new Error(`upload failed: HTTP ${res.status}${detail ? ` (${detail})` : ""}`);
    }
  }

  async function deleteDocument(docId: string): Promise<void> {
    const res = await fetch(`${API_URL}/teacher/documents/${encodeURIComponent(docId)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`delete failed: HTTP ${res.status}`);
  }

  async function startThread(): Promise<StartThreadResponse> {
    for (let attempt = 1; attempt <= START_THREAD_MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), START_THREAD_TIMEOUT_MS);

      try {
        const res = await fetch(`${API_URL}/teacher/chat/start-thread`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(START_THREAD_DEFAULT_PAYLOAD),
          signal: controller.signal,
        });

        if (!res.ok) {
          let errBody: unknown = null;
          try {
            errBody = await res.json();
          } catch {
            errBody = await res.text().catch(() => "");
          }
          console.error("API Error:", errBody);

          if (res.status >= 500 && attempt < START_THREAD_MAX_ATTEMPTS) continue;

          const detail = errBody ? ` - ${JSON.stringify(errBody)}` : "";
          throw new Error(`start-thread failed: HTTP ${res.status}${detail}`);
        }

        return (await res.json()) as StartThreadResponse;
      } catch (error) {
        const isTimeout = error instanceof DOMException && error.name === "AbortError";
        const isNetwork = error instanceof TypeError;
        const shouldRetry = (isTimeout || isNetwork) && attempt < START_THREAD_MAX_ATTEMPTS;
        if (shouldRetry) continue;
        if (isTimeout) throw new Error("start-thread failed: request timed out");
        throw error instanceof Error ? error : new Error("start-thread failed");
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error("start-thread failed after retries");
  }

  async function fetchThreadMessages(threadId: string): Promise<ThreadMessage[]> {
    const res = await fetch(`${API_URL}/teacher/chat/threads/${encodeURIComponent(threadId)}/messages`);
    if (!res.ok) throw new Error(`get_thread_messages failed: HTTP ${res.status}`);
    const data = (await res.json()) as FetchThreadMessagesResponse & {
      messages?: ThreadMessage[];
    };
    return data.messages ?? [];
  }

  async function streamAssistantReply({
    threadId,
    message,
    onDelta,
  }: {
    threadId: string;
    message: string;
    onDelta: (delta: string) => void;
  }): Promise<void> {
    const res = await fetch(`${API_URL}/teacher/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: threadId, message }),
    });

    if (!res.ok) throw new Error(`chat/message failed: HTTP ${res.status}`);
    if (!res.body) {
      const full = await res.text();
      onDelta(full);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    // Stream format from standalone frontend is SSE-ish: lines starting with `data: `
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process full lines; keep remainder in buffer.
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const rawLine of parts) {
        const line = rawLine.trimEnd();
        if (!line.startsWith("data:")) continue;

        const rawData = line.replace(/^data:\s?/, "");
        if (!rawData || rawData === "[DONE]") continue;

        // If backend emits JSON per chunk, extract known fields.
        let delta = rawData;
        if (rawData.startsWith("{") || rawData.startsWith("[")) {
          try {
            const parsed = JSON.parse(rawData) as unknown;
            delta = getTextFromStreamData(parsed);
          } catch {
            // keep raw string
          }
        }

        onDelta(delta);
      }
    }
  }

  async function fetchToken(userName?: string): Promise<{ token: string }> {
    const url = userName 
      ? `${API_URL}/teacher/token?user=${encodeURIComponent(userName)}`
      : `${API_URL}/teacher/token`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`token fetch failed: HTTP ${res.status}`);
    return (await res.json()) as { token: string };
  }

  async function searchKnowledgeBase(query: string): Promise<any> {
    const res = await fetch(`${API_URL}/teacher/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`search failed: HTTP ${res.status}`);
    return await res.json();
  }

  async function generateQuiz(topic: string, count: number, difficulty: string): Promise<any> {
    const formData = new FormData();
    formData.append("topic", topic);
    formData.append("num_questions", String(count));
    formData.append("difficulty", difficulty);

    const res = await fetch(`${API_URL}/quiz/generate-quiz`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`quiz generation failed: HTTP ${res.status}`);
    return await res.json();
  }

  async function generateRoadmap(goal: string): Promise<any> {
    const res = await fetch(`${API_URL}/roadmap/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        learning_goal: goal,
        use_cache: true,
      }),
    });
    if (!res.ok) throw new Error(`roadmap generation failed: HTTP ${res.status}`);
    return await res.json();
  }

  return {
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    startThread,
    fetchThreadMessages,
    streamAssistantReply,
    fetchToken,
    searchKnowledgeBase,
    generateQuiz,
    generateRoadmap,
  };
}
