let clients: { id: number; sendData: (data: { ping: boolean } | { message: string }) => void; closed: boolean }[] = [];
let clientId = 0;

export async function GET() {
  const id = clientId++;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendData = (data: { ping: boolean } | { message: string }) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          const client = clients.find((c) => c.id === id);
          if (client) client.closed = true;
        }
      };

      // Registra o cliente na lista de clientes conectados
      const newClient = { id, sendData, closed: false };
      clients.push(newClient);

      // Envia a mensagem de conexão apenas uma vez para este cliente
      sendData({ message: "Conexão SSE iniciada" });

      // Envia pings periódicos
      const interval = setInterval(() => sendData({ ping: true }), 5000);

      return () => {
        clearInterval(interval);
        clients = clients.filter((client) => client.id !== id);
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

function sendEventToClients(data: { message: string }) {
  clients = clients.filter((client) => !client.closed);

  clients.forEach((client) => {
    try {
      client.sendData(data);
    } catch (error) {
      client.closed = true;
    }
  });

  clients = clients.filter((client) => !client.closed);
}

export async function POST(req: Request) {
  const body = await req.json();
  sendEventToClients(body); // Envia para todos os clientes conectados
  return new Response("OK", { status: 200 });
}
