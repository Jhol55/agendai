import { getPrompts, updatePrompt } from "@/services/prompts"
import { useEffect, useMemo, useState } from "react"
import Editor from '@/components/ui/editor';
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { IconCheck, IconCopy, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { Tab, TabContainer, Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Prompts = () => {
  const [prompts, setPrompts] = useState<{ id: string, prompt: string, agent: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("front-desk");

  const tabs = useMemo(() => [
    { title: "Recepcionista", agent: "front-desk" },
    { title: "Assistente de Agendamento", agent: "scheduling" },
    { title: "Assistente de Reagendamento", agent: "rescheduling" },
    { title: "Assistente de Cancelamento", agent: "unscheduling" },
  ], []
  );

  useEffect(() => {
    getPrompts({}).then(setPrompts);
  }, []);

  const handleOnValueChange = (content: string) => {
    setPrompts(prompts.map(prompt =>
      prompt.agent === activeTab ? { ...prompt, prompt: content } : prompt
    ));
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(
      prompts.find((prompt) => prompt.agent === activeTab)?.prompt || ""
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveContent = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    const formData = new FormData();
    formData.append("prompts", JSON.stringify(prompts));
    updatePrompt({ data: formData }).then(() => {
      toast.success("Prompt salvo com sucesso!", {
        description: "Prompts atualizados."
      });
      getPrompts({}).then(setPrompts);
    })
  };


  return (
    <section className="w-full flex-1 px-10 md:mt-8 mt-0">
      <div className="relative w-full h-full !max-h-[calc(100vh-180px)]">
        <div className="flex justify-between items-center py-2">
          <Typography variant="h1">Prompts</Typography>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="py-2 px-2 h-8"
            >
              {copied ? <IconCheck className="h-4" /> : <IconCopy className="h-4" />}
            </Button>
            <Button
              onClick={saveContent}
              variant="outline"
              className="py-2 px-2 h-8"
            >
              {saved ? <IconCheck className="h-4" /> : <IconDeviceFloppy className="h-4" />}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 h-full w-full">
          <TabContainer
            className="flex flex-col"
          >
            <Tabs
              className="flex !p-2 bg-transparent shadow-none dark:bg-transparent border border-neutral-200 dark:border-neutral-800"
              activeClassName="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.title}
                  value={tab.title}
                  onClick={() => setActiveTab(tab.agent)}
                  className="!py-2 !px-2.5"
                >
                  <Typography
                    variant="span"
                    className={cn(activeTab === tab.title ? "!text-neutral-900" : "text-neutral-200", "transition-colors duration-200")}
                  >
                    {tab.title}
                  </Typography>
                </Tab>
              ))}
            </Tabs>
          </TabContainer>
          {prompts.map(({ agent, prompt }) => (
            <Editor
              key={agent}
              value={prompt}
              onValueChange={content => handleOnValueChange(content)}
              containerClassName={cn(activeTab === agent ? "block dark:bg-[#171717]" : "hidden")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}