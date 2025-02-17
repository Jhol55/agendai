export const dynamic = "force-dynamic";
export const runtime = "edge";

type SSEMessage = { ping: boolean } | { message: string };

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: SSEMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const interval = setInterval(() => {
        send({ ping: true });
      }, 10000);

      controller.close = () => {
        clearInterval(interval);
      };
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

async function POST(req: Request) {
  console.log(req.body)
  return new Response("Webhook recebido e dados enviados para SSE", { status: 200 });
}
