export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send("Conexão SSE iniciada");

      const interval = setInterval(() => {
        send("ping");
      }, 25000);

      const closeStream = () => {
        clearInterval(interval);
        controller.close();
      };

      self.addEventListener("beforeunload", closeStream);
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
