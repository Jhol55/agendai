"use client";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://chat.cognic.tech') {
        console.warn('Mensagem rejeitada de origem não confiável:', event.origin)
        return
      }

      console.log('Mensagem recebida do app Vue:', event.data)

      if (event.data?.type === 'THEME_UPDATE') {
        console.log('Atualizar tema para:', event.data.theme)
        // Aqui você pode atualizar o estado, o tema, etc.
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return <>{children}</>
}
