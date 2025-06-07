"use client"

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scheduler } from "../../components/sections/scheduler/scheduler";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";


export default function Admin() {
  const searchParams = useSearchParams();

  const { setTheme } = useTheme();

  useEffect(() => {
    const theme = searchParams.get("theme");
    if (theme) {
      setTheme(theme);
    }
  }, [searchParams, setTheme]);

  const [receivedMessage, setReceivedMessage] = useState(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // **IMPORTANT: Verify the origin of the message!**
      // This is a critical security step to prevent cross-site scripting (XSS) attacks.
      // Replace 'https://your-calendar-app.com' with the actual origin of your iframe content.
      // if (event.origin !== 'https://your-calendar-app.com') {
      //    console.warn('Message received from unknown origin:', event.origin);
      //    return; // Do not process messages from untrusted origins
      // }

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
    <div className="flex flex-col md:flex-row bg-neutral-50 dark:bg-background w-full relative min-h-screen"
    >
      {/* <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="" initialActiveLabel={links[activeTab].label}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo open={open} />
            <div className="mt-14 flex gap-2 w-full">
              <div>
                <ThemeSwitcherToggle vertical={true} />
              </div>
              <Typography variant="span" className="!text-neutral-200">{theme === "dark" ? "Dark" : "Light"}</Typography>
            </div>
            <div className={"mt-4 flex flex-col gap-2"}>
              {links.map(({ icon, label }, idx) => (
                <SidebarButton
                  key={idx}
                  icon={icon}
                  label={label}
                  onClick={() => setActiveTab(idx)}
                />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar> */}
      <AnimatePresence mode="wait">
        <motion.div
          // initial={{ x: "-100%", opacity: 0 }}
          // animate={{ x: 0, opacity: 1 }}
          // exit={{ x: "100%", opacity: 0 }}
          // transition={{ duration: 0.17, ease: "easeIn" }}
          className="relative -z-0 flex w-full md:min-h-screen min-h-[86vh] flex-1 basis-0 light-scrollbar dark:dark-scrollbar overflow-x-hidden overflow-y-auto !bg-[rgb(253,253,253)] dark:!bg-dark-chatwoot-primary"
        >
          <Scheduler />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
