'use client';

import { outputFileTypes } from "../lib/constants";
import { CheckIcon, ExclamationTriangleIcon, FileIcon, SymbolIcon } from "@radix-ui/react-icons";
import JSZip from "jszip";
import { useState } from "react";

export default function Form() {
    const [files, setFiles] = useState<File[]>([]);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [outputFileType, setOutputFileType] = useState("png");

    const handleSuccess = () => {
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
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
        setIsLoading(true);
        e.preventDefault();
    
        const rejected: string[] = [];
        const input = document.getElementById('heicInput') as HTMLInputElement;
        const files = input?.files;
        if (!files || files.length === 0)
        {
            setIsLoading(false);
            return;
        }
    
        // ✅ Import heic2any only on the client
        const heic2any = (await import('heic2any')).default;
        const zip = new JSZip();
    
        for (const file of files) {
            const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif';

            if (!isHeic) {
                rejected.push(file.name);
                continue;
            }

            try {
              const blob = await heic2any({
                blob: file,
                toType: `image/${outputFileType}`,
                quality: 0.9
              });

              const outputFileName = file.name.replace(/\.heic$/i, `.${outputFileType}`);
              zip.file(outputFileName, blob as Blob);
            } catch (error) {
                rejected.push(file.name);
            }
        }

        if (files.length === rejected.length) {
            setRejectedFiles(rejected);
            setIsLoading(false);
            return;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-images.zip';
        a.click();
        URL.revokeObjectURL(url);

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
        handleSuccess();
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 card-holo-container drop-card" aria-label="File upload form">
                <div className="flex flex-row gap-2 items-center" id="upload-files" aria-label="Upload files title">
                    <FileIcon className="w-5 h-5" aria-label="File icon" />
                    <h1>Upload your files</h1>
                </div>
                <div className="drop-zone" aria-label="File drop zone">
                    {isLoading && 
                    <div className="flex flex-row gap-2 items-center justify-center" aria-label="Loading container">
                        <SymbolIcon className="w-5 h-5 animate-spin" aria-label="Loading icon" />
                        <p className="dots">Converting files<span className="dot-container"><span className="dot-animation"></span></span></p>
                    </div>}
                    {!isLoading && 
                        <>
                            <input type="file" multiple accept="image/heic" onChange={handleFileChange} id="heicInput" aria-label="File input" />
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
                <div className="flex flex-col gap-2" aria-label="Output file type container">
                    <div className="flex flex-col gap-2">
                        <label aria-label="Select output file type">Select output file type:</label>
                        <div className="flex flex-row gap-4">
                            {outputFileTypes.map((fileType, index) => (
                            <label key={index} className="flex items-center gap-1" aria-label={`Select ${fileType.name} file type`}>
                                <input className="radio-input"
                                    type="radio"
                                    name="filetype"
                                    value={fileType.name}
                                    checked={fileType.name === outputFileType}
                                    onChange={() => setOutputFileType(fileType.name)}
                                    readOnly
                                />
                                {fileType.name}
                            </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-2" aria-label="Buttons container">
                    <button className="hero-button form-button" type="submit" aria-label="Convert button">Convert</button>
                    <button className="form-button-clear" onClick={handleClear} aria-label="Clear button">Clear</button>
                </div>
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
            {success && (
                <div className="flex flex-col gap-2 success-container glow-container" aria-label="Success container">
                    <div className="flex flex-row gap-2 items-center" aria-label="Success message">
                        <CheckIcon className="w-5 h-5" aria-label="Success icon" />
                        <h1>Success</h1>
                        -
                        <p>Your files have been converted successfully.</p>
                    </div>
                </div>
            )}
        </>
    );
}