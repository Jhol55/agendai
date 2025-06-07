"use client";

import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [receivedMessage, setReceivedMessage] = useState(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // **IMPORTANT: Verify the origin of the message!**
      // This is a critical security step to prevent cross-site scripting (XSS) attacks.
      // Replace 'https://your-calendar-app.com' with the actual origin of your iframe content.
      if (event.origin !== 'https://chat.cognic.tech') {
         console.warn('Message received from unknown origin:', event.origin);
         return; // Do not process messages from untrusted origins
      }

      // Process the message
      console.log('Message received from iframe:', event.data);
      setReceivedMessage(event.data); // Update state with the received message

      // You can also add logic based on the message type
      if (event.data && event.data.type === 'IFRAME_LOADED') {
        console.log('Iframe reported that it has finished loading!');
        // Perform actions when the iframe loads, e.g., show a success message
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('message', handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      {children}
    </>

  );
}
