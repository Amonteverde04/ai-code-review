'use client';

import { ExclamationTriangleIcon, FileIcon, SymbolIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import Loading from "./loading";
import ButtonContainer from "./button-container";
import ErrorToast from "./error-toast";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex justify-center items-center loading-container"><Loading text="Loading editor" justify="justify-center" /></div>
});

export default function Form() {
    const [files, setFiles] = useState<File[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [fileContent, setFileContent] = useState("");
    const [requestError, setRequestError] = useState(false);
    const [language, setLanguage] = useState("");
    const editorRef = useRef<any>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setFiles(Array.from(files));
        }
    };

    const handleClear = () => {
        setFiles([]);
        const input = document.querySelector("input[type='file']") as HTMLInputElement;
        if (input) {
            input.value = "";
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setIsGenerating(true);
        e.preventDefault();
    
        const input = document.getElementById('file_input') as HTMLInputElement;
        const files = input?.files;
        if (!files || files.length === 0)
        {
            setIsGenerating(false);
            return;
        }

        // Make a request to the backend
        let filename = "";
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]); 
          filename = files[i].name;
          setFileContent(await files[i].text());
        }
        formData.append("payload", JSON.stringify({ language: language }));
        
        fetch("http://localhost:8080/review", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            const inlineFeedback = data.ai_response?.[filename] || "No inline feedback found.";
            setAiResponse(inlineFeedback);
            setIsGenerating(false);
        })
        .catch(error => {
            setRequestError(true);
            setTimeout(() => {
                setRequestError(false);
            }, 5000);
            setIsGenerating(false);
        });

        handleClear();
    };

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        editor.layout(); // initial layout
      };

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
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 drop-card" aria-label="File upload form">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row gap-2 items-center section-title" id="upload-files" aria-label="Upload files title">
                        <FileIcon className="w-5 h-5" aria-label="File icon" />
                        <h1>Upload your file</h1>
                    </div>
                </div>
                <div className="drop-zone" aria-label="File drop zone">
                    {isGenerating && (
                        <Loading text="Submitting files" justify="justify-start" />
                    )}
                    {!isGenerating && 
                        <>
                            <input type="file" onChange={handleFileChange} id="file_input" aria-label="File input" />
                            {files.length > 0 && (
                                <div className="flex flex-col gap-2" aria-label="Files container">
                                    {files.map((file, index) => (
                                        <div key={file.name} aria-label={`File ${index + 1} name`}>
                                            {index + 1}. {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}  
                        </>
                    }
                </div>
                <div className={`flex sm:flex-row flex-col gap-4 ${requestError ? "justify-between" : "justify-end"}`}>
                    {requestError && (
                      <ErrorToast title="Failed to submit - ensure the file is a valid and supported programming language" icon={<ExclamationTriangleIcon className="w-5 h-5" aria-label="Warning icon" />} />
                    )}
                    <ButtonContainer handleClear={handleClear} buttonText="Review uploaded file" buttonType="submit" disabled={isGenerating || files.length === 0} />
                </div>
            </form>
            {!isGenerating && aiResponse && (
                <div className="w-full h-full flex flex-col xl:flex-row editor-container h-[100vh] xl:h-[60vh]">
                    <div className="w-full h-full relative flex-1">
                        <MonacoEditor language={language}
                            theme="vs-dark"
                            value={fileContent}
                            onChange={setFileContent}
                            editorDidMount={handleEditorDidMount}
                        />
                    </div>
                    <div className="ai-response p-4 flex flex-col gap-4 flex-1" aria-label="AI response container">
                      <h1 className="section-title ai-response-title" aria-label="AI response title">AI Response</h1>
                      {isGenerating && (
                        <Loading text="Generating response" justify="justify-start" />
                      )}
                      {!isGenerating && aiResponse && (
                        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeHighlight]}>
                            {aiResponse}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                </div>
            )}
        </>
    );
}