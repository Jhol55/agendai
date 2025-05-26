// import { Typography } from "@/components/ui/typography";
// import { useChat } from "@/hooks/use-chat";
// import { cn } from "@/lib/utils";
// import { getChat, getChats } from "@/services/chat";
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
// import { splitTextIntoSentences } from "./utils";

interface ChatContextProps {
  currentSessionId: string;
  setCurrentSessionId: Dispatch<SetStateAction<string>>;
  chat: object[];
}

export const ChatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider = ({
  children,
  value,
}: {
  value: ChatContextProps;
  children?: React.ReactNode;
}) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const ChatWoot = () => {
  return (
    <>
      <iframe
        src="https://chat.cognic.tech/"
        width="100%"
        height="100%"
        title="ChatWoot"
      />
      <div className="absolute left-0 top-0 w-full h-screen bg-neutral-50 dark:bg-neutral-background">

      </div>
    </>
  );
}


// type Chat = {
//   session_id: string
//   message: {
//     content: string
//   }
// }

// type ChatSidebarProps = {
//   chats: Chat[]
// }

// const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats }) => {
//   const { currentSessionId, setCurrentSessionId } = useChat()

//   if (!chats?.length) return null

//   return (
//     <div className="flex flex-col h-full gap-1 w-1/2 p-2 truncate border-r bg-neutral-50">
//       {chats.map((chat, index) => (
//         <div
//           key={index}
//           className={cn(
//             "flex gap-4 border p-2 h-16 overflow-hidden w-full truncate rounded-md leading-relaxed shadow-sm cursor-pointer hover:bg-neutral-200/80",
//             currentSessionId === chat.session_id && "bg-neutral-300 hover:bg-neutral-300"
//           )}
//           onClick={() => setCurrentSessionId(chat.session_id)}
//         >
//           <div className="flex min-w-12 h-12 border rounded-full"></div>
//           <div className="flex flex-col truncate">
//             <Typography variant="span" className="h-fit whitespace-nowrap !text-neutral-700">
//               {chat.session_id.replace("@s.whatsapp.net", "")}
//             </Typography>
//             <Typography variant="span" className="h-full w-full truncate whitespace-nowrap !text-neutral-700">
//               {chat.message.content}
//             </Typography>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// const Message = ({ children, type }: { children: string, type: "ai" | "human" }) => {
//   const text = type === "ai" ? splitTextIntoSentences(children) : children;

//   const renderTextWithLineBreaks = (text: string) => {
//     return text?.split("\n").map((line, idx) => (
//       <span key={idx}>
//         {line}
//         <br />
//       </span>
//     ));
//   };

//   const messageClass = cn(
//     "max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
//     type === "human" ? "bg-white text-black" : "bg-neutral-300 text-white"
//   );

//   return (
//     <div className={cn("flex w-full flex-col gap-2 px-4 py-2", type === "human" ? "items-start" : "items-end")}>
//       {Array.isArray(text) ? (
//         text.map((splittedText, idx) => (
//           <div key={idx} className={messageClass}>
//             <Typography variant="span" className="!text-neutral-700">
//               {renderTextWithLineBreaks(splittedText)}
//             </Typography>
//             <p className="mt-2 text-xs text-gray-500 text-right">Apr 26, 10:35 AM</p>
//           </div>
//         ))
//       ) : (
//         <div className={messageClass}>
//           <Typography variant="span" className="!text-neutral-700">
//             {renderTextWithLineBreaks(text)}
//           </Typography>
//           <p className="mt-2 text-xs text-gray-500 text-right">Apr 26, 10:35 AM</p>
//         </div>
//       )}
//     </div>
//   );
// };


// type ChatMessage = {
//   message: {
//     type: "ai" | "human"
//     content: string
//   }
// }

// type ChatViewProps = {
//   chat: ChatMessage[]
// }

// const ChatView = ({ chat }:  ChatViewProps) => {
//   console.log(chat)
//   return (
//     <div className="bg-neutral-50 w-full h-full overflow-auto">
//       <>
//         {chat.map((history, index) => (
//           <Message key={index} type={history?.message?.type}>{history?.message?.content}</Message>
//         ))}
//       </>
//     </div>
//   )
// }



// export const Chat = () => {
//   const [chats, setChats] = useState([]);
//   const [chat, setChat] = useState([]);
//   const [currentSessionId, setCurrentSessionId] = useState("");

//   useEffect(() => {
//     getChats({}).then(setChats);
//   }, [])

//   useEffect(() => {
//     getChat({ id: currentSessionId }).then((data) => {
//       setChat(
//         data.map((history: ChatMessage) => {
//           const content = history?.message?.content;
//           return {
//             ...history,
//             message: {
//               ...history.message,
//               content: (() => {
//                 if (!content?.includes("|")) return content;
//                 const [beforePipe, afterPipe] = content.split("|");
//                 const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
//                 if (isoDateRegex.test(afterPipe)) {
//                   return beforePipe.trim();
//                 }
//                 return content;
//               })()
//             }
//           };
//         })
//       )
//     });
//   }, [currentSessionId])


//   return (
//     <ChatProvider value={{ currentSessionId, setCurrentSessionId, chat }}>
//       <div className="flex w-full h-screen overflow-hidden">
//         {/* <ChatSidebar chats={chats} />
//         <ChatView chat={chat} /> */}
//         <iframe
//           src="https://teste-chatwoot.awmygg.easypanel.host"
//           width="100%"
//           height="800"
//         ></iframe>
//       </div>
//     </ChatProvider>
//   )
// }

