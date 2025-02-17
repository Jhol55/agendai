

export const dynamic = "force-dynamic";
export const runtime = "edge";

type MessageType = { ping: boolean } | { message: string };
type ClientType = { id: string, send: (data: MessageType) => void }[]

let clients: ClientType = [];

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      const id = crypto.randomUUID();

      const send = (data: MessageType) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true
          clients = clients.filter((client) => client.id !== id);
        }
      };

      clients.push({ id, send });

      const interval = setInterval(() => {
        if (!closed) {
          send({ ping: true });
        }
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

export async function POST(req: Request) {
  const body = await req.json();
  console.log(123)
  clients.forEach((client) => {
    client.send(body);
  });

  return new Response("OK", { status: 200 });

}
