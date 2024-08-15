import fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const formDataEntryValues = Array.from(formData.values());

  const encoder = new TextEncoder();
  // Create a streaming response
  let stream: ReadableStreamDefaultController;
  const customReadable = new ReadableStream({
    start(controller) {
      const message = "Started Readable Stream";
      controller.enqueue(encoder.encode(`data: ${message}\n\n;`));
      stream = controller;
    },
  });
  // Return the stream response and keep the connection alive

  // Function to send a message asynchronously
  function sendMessage(message: string) {
    if (stream) {
      stream.enqueue(encoder.encode(`${message};`));
    }
  }

  // Function to close the stream
  function closeStream() {
    if (stream) {
      stream.close();
    }
  }

  for (const formDataEntryValue of formDataEntryValues) {
    if (
      typeof formDataEntryValue === "object" &&
      "arrayBuffer" in formDataEntryValue
    ) {
      const file = formDataEntryValue;
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(`public/upload/${file.name}`, buffer);
      sendMessage(file.name);
    }
  }

  closeStream();

  return new Response(customReadable, {
    // Set the headers for Server-Sent Events (SSE)
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
