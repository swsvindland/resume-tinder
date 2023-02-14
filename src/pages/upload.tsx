import type { NextPage } from 'next';
import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NotAuthorized } from '../components/NotAuthorized';
import { api } from '../utils/api';
import { v4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes,
} from '@firebase/storage';
import { FileStatus } from '../types/FileStatus';

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
                    <Link
                        className="my-2 rounded-full bg-white/10 px-10 py-3 text-center font-semibold text-white no-underline transition hover:bg-white/20"
                        href="/workflows"
                    >
                        Workflows
                    </Link>
                </div>
            </main>
        </>
    );
};

export default Upload;

function Dropzone() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const allFilesQuery = api.file.getAll.useQuery();
    const uploadMutation = api.file.upload.useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries(api.file.getQueryKey());
        },
    });

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (!session) return;

            const storage = getStorage();

            for (const file of acceptedFiles) {
                setLoading(true);
                const id = v4();
                const storageRef = ref(storage, `${session.user.id}/${id}.pdf`);
                uploadBytes(storageRef, file)
                    .then((snapshot) => {
                        getDownloadURL(snapshot.ref)
                            .then((url) => {
                                uploadMutation.mutate({
                                    id: id,
                                    userId: session.user.id,
                                    name: file.name,
                                    size: file.size,
                                    url,
                                    status: FileStatus.NotSorted,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                });
                            })
                            .catch((error) => {
                                console.error('error', error);
                            });
                    })
                    .catch((error) => {
                        console.error('error', error);
                    })
                    .finally(() => setLoading(false));
            }
        },
        [session, uploadMutation]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
    });

    if (allFilesQuery.isLoading || loading) {
        return <span className="text-lg text-white">Loading...</span>;
    }

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
                {allFilesQuery.data?.map((file) => (
                    <li key={file.id} className="text-md text-white">
                        {file.name}
                    </li>
                ))}
            </ul>
            {!uploadMutation.isLoading ? (
                <>
                    <Link
                        className="my-2 rounded-full bg-white/10 px-10 py-3 text-center font-semibold text-white no-underline transition hover:bg-white/20"
                        href="/sort"
                    >
                        Sort Resumes
                    </Link>
                </>
            ) : (
                <span className="text-white">Uploading...</span>
            )}
        </div>
    );
}
