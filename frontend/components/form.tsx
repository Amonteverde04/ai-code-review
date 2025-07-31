'use client';

import { ExclamationTriangleIcon, FileIcon, SymbolIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Loading from "./loading";
import ButtonContainer from "./button-container";
import ErrorToast from "./error-toast";
import LanguageSelector from "./language-selector";

export default function Form() {
    const [files, setFiles] = useState<File[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [requestError, setRequestError] = useState(false);
    const [language, setLanguage] = useState("javascript");

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
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]); 
        }
        formData.append("payload", JSON.stringify({ language: language }));
        
        fetch("http://localhost:8080/review", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log("File upload response: ", data);
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

        handleClear();
    };

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
        </>
    );
}