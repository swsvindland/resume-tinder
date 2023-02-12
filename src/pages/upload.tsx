import { NextPage } from 'next';
import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NotAuthorized } from '../components/NotAuthorized';

const Upload: NextPage = () => {
    const { data: sessionData } = useSession();

    if (!sessionData) {
        return <NotAuthorized />;
    }

    return (
        <>
            <Head>
                <title>Upload Resumes</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                        Upload Resumes
                    </h1>
                    <Dropzone />
                </div>
            </main>
        </>
    );
};

export default Upload;

function Dropzone() {
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    return (
        <div className="grid grid-cols-1">
            <div
                {...getRootProps()}
                className="rounded-lg border border-white p-2"
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="text-lg text-white">
                        Drop the files here ...
                    </p>
                ) : (
                    <p className="text-lg text-white">
                        Drag and drop some files here, or click to select files
                    </p>
                )}
            </div>
            <ul>
                {files.map((file: File) => (
                    <li key={file.name} className="text-md text-white">
                        {file.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
