'use client';

import { ExclamationTriangleIcon, FileIcon, SymbolIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Loading from "./loading";
import ButtonContainer from "./button-container";

export default function Form() {
    const [files, setFiles] = useState<File[]>([]);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestError, setRequestError] = useState(false);

    const handleRequestError = () => {
        setRequestError(true);
        setTimeout(() => {
            setRequestError(false);
        }, 3000);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setFiles(Array.from(files));
        }
    };

    const handleClear = () => {
        setRejectedFiles([]);
        handleClearInputOnly();
    };

    const handleClearInputOnly = () => {
        setFiles([]);
        const input = document.querySelector("input[type='file']") as HTMLInputElement;
        if (input) {
            input.value = "";
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        console.log("file upload submitted");
        setIsLoading(true);
        e.preventDefault();
    
        const rejected: string[] = [];
        const input = document.getElementById('file_input') as HTMLInputElement;
        const files = input?.files;
        if (!files || files.length === 0)
        {
            setIsLoading(false);
            return;
        }

        // Make a request to the backend
        // Get code review responses
        
        if (rejected.length > 0)
        {
            setRejectedFiles(rejected);
            handleClearInputOnly();
        }
        else
        {
            handleClear();
        }

        setIsLoading(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 drop-card" aria-label="File upload form">
                <div className="flex flex-row gap-2 items-center section-title" id="upload-files" aria-label="Upload files title">
                    <FileIcon className="w-5 h-5" aria-label="File icon" />
                    <h1>Upload your file</h1>
                </div>
                <div className="drop-zone" aria-label="File drop zone">
                    {isLoading && (
                        <Loading text="Submitting files" justify="justify-center" />
                    )}
                    {!isLoading && 
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
                <ButtonContainer handleClear={handleClear} buttonText="Review uploaded file" />
            </form>
            {rejectedFiles.length > 0 && (
                <div className="flex flex-col gap-2 card-holo-container" aria-label="Rejected files container">
                    <div className="flex flex-row gap-2 items-center" id="upload-files">
                        <ExclamationTriangleIcon className="w-5 h-5" color="#ffe34b" aria-label="Rejected files icon" />
                        <h1>Rejected files</h1>
                    </div>
                    {rejectedFiles.map((file, index) => (
                        <div key={file} aria-label={`Rejected file ${index + 1} name`}>
                            {index + 1}. {file}
                        </div>
                    ))}
                </div>
            )}
            {requestError && (
                <div className="flex flex-col gap-2 warning-container glow-container" aria-label="Warning container">
                    <div className="flex flex-row gap-2 items-center" aria-label="Warning message">
                        <ExclamationTriangleIcon className="w-5 h-5" aria-label="Warning icon" />
                        <h1>Failed to submit</h1>
                        -
                        <p>Your files failed to submit.</p>
                    </div>
                </div>
            )}
        </>
    );
}