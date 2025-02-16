

let clients: { id: number; sendData: (data: { ping: boolean } | string) => void, closed: boolean }[] = [];
let clientId = 0;

export async function GET() {
  const id = clientId++;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendData = (data: { ping: boolean } | string) => {
        const client = clients.find((c) => c.id === id);
        if (client && !client.closed) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (error) {
            client.closed = true; // Marca como fechado para remover depois
          }
        }
      };

      clients.push({ id, sendData, closed: false });

      const interval = setInterval(() => sendData({ ping: true }), 10000);

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

// 🔹 Função para enviar eventos SSE para todos os clientes
export function sendEventToClients(data: string) {
  clients = clients.filter((client) => !client.closed); // Remove clientes desconectados

  clients.forEach((client) => {
    try {
      client.sendData(data);
    } catch (error) {
      client.closed = true;
    }
  });

  // 🔹 Remove clientes fechados para evitar vazamento de memória
  clients = clients.filter((client) => !client.closed);
}


export async function POST(req: Request) {
  const body = await req.json();
  sendEventToClients(body); // Envia para todos os clientes conectados
  return new Response("OK", { status: 200 });
}

