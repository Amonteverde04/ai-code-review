"use client";

import { LANGUAGES } from "@/lib/constants";
import { CodeIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Loading from "./loading";
import ButtonContainer from "./button-container";
import ErrorToast from "./error-toast";
import LanguageSelector from "./language-selector";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), {
    ssr: false,
  });

export default function InlineEditor() {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [aiResponse, setAiResponse] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [requestError, setRequestError] = useState(false);
    const editorRef = useRef<any>(null);

    const handleClear = () => {
        setCode("");
        setAiResponse("");
    };

    const handleSubmit = () => {
        setIsGenerating(true);
        const formData = new FormData();
        formData.append("payload", JSON.stringify({ editorCode: code, language: language }));

        fetch("http://localhost:8080/review", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setAiResponse(data.response);
            setIsGenerating(false);
        })
        .catch(error => {
            setRequestError(true);
            setTimeout(() => {
                setRequestError(false);
            }, 5000);
            setIsGenerating(false);
        });
    };

    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor;
      editor.layout(); // initial layout
    };

    // Optional: handle resize events
    useEffect(() => {
      const resize = () => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      };
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    return (
      <div className="w-full flex flex-col gap-4 h-[100vh] xl:h-[80vh]" aria-label="Editor container">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2 items-center section-title" id="inline-editor" aria-label="Inline editor title">
            <CodeIcon className="w-5 h-5" aria-label="Code icon" />
            <h1>Inline Editor</h1>
          </div>
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>
        <div className="w-full h-full flex flex-col xl:flex-row editor-container">
          <div className="w-full h-full relative flex-1">
              <MonacoEditor language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={setCode}
                  editorDidMount={handleEditorDidMount}
              />
          </div>
          <div className="ai-response p-4 flex flex-col gap-4 flex-1" aria-label="AI response container">
            <h1 className="section-title ai-response-title" aria-label="AI response title">AI Response</h1>
            {isGenerating && (
              <Loading text="Generating response" justify="justify-start" />
            )}
            {!isGenerating && aiResponse && (
              <p className="ai-response-text break-words overflow-auto" aria-label="AI response text">
                {aiResponse}
              </p>  
            )}
          </div>
        </div>
        <div className={`flex sm:flex-row flex-col gap-4 ${requestError ? "justify-between" : "justify-end"}`}>
          {requestError && (
            <ErrorToast title="Failed to submit" icon={<ExclamationTriangleIcon className="w-5 h-5" aria-label="Warning icon" />} />
          )}
          <ButtonContainer handleClick={handleSubmit} handleClear={handleClear} disabled={isGenerating || !code} buttonText="Review inline editor code" buttonType="button" />
        </div>
      </div>
    );
}