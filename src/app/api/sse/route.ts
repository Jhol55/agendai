export const runtime = "edge"

export async function GET() {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("Conexão SSE iniciada\n"));

      const interval = setInterval(() => {
        controller.enqueue(encoder.encode("ping\n"));
      }, 25000); 

      controller.close = () => {
        clearInterval(interval);
        controller.close();
      };
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
