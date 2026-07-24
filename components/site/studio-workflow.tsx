"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  MessageComposer,
  type ComposerUploads,
} from "@/components/site/message-composer";
import { Uploader } from "@/components/site/uploader";

/**
 * The publish flow: upload a recording (and optional MP3) straight to Appwrite,
 * then publish the message record to the database in one place.
 */
export function StudioWorkflow({
  speakerOptions,
  seriesOptions,
}: {
  speakerOptions: string[];
  seriesOptions: string[];
}) {
  const router = useRouter();
  const [uploads, setUploads] = useState<ComposerUploads>({});

  function handleUploaded(fileId: string, file: File, kind: "video" | "audio") {
    setUploads((prev) =>
      kind === "audio"
        ? { ...prev, audioFileId: fileId, audioSize: file.size }
        : { ...prev, videoFileId: fileId, videoSize: file.size },
    );
  }

  return (
    <div className="space-y-12">
      <Uploader onUploaded={handleUploaded} />
      <MessageComposer
        uploads={uploads}
        speakerOptions={speakerOptions}
        seriesOptions={seriesOptions}
        onPublished={() => router.refresh()}
      />
    </div>
  );
}
