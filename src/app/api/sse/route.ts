export const dynamic = "force-dynamic";

type SSEMessage = { ping: boolean } | { message: string };

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: SSEMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const interval = setInterval(() => send({ ping: true }), 25000);

      controller.close = () => {
        clearInterval(interval);
      };

      send({ message: "Conexão SSE iniciada" });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
