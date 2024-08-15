"use client";

import { useState } from "react";

function UploadComponent() {
  const [messages, setMessages] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      //convert `FileList` to `File[]`
      const _files = Array.from(e.target.files);
      setImages(_files);
    }
  };

  const uploadFiles = async () => {

    setIsLoading(true)

    const formData = new FormData()
    images.forEach((image, i ) => formData.append(image.name, image))

    // Initiate the first call to connect to SSE API
    const apiResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!apiResponse.body) return;

    // To decode incoming data as a string
    const reader = apiResponse.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        setIsLoading(false)
        break;
      }
      if (value) {
        setMessages(value);
      }
    }
  };

  const msgArray = messages.split(";")

  return (
    <div className="flex flex-col w-screen h-screen gap-4">
      <input type="file" multiple onChange={handleFileSelected} className="w-full" />
      <button className="p-3 bg-slate-400 text-white disabled:bg-rose-400 disabled:text-gray-300 disabled:cursor-not-allowed" onClick={uploadFiles} disabled={isLoading || images.length === 0}>
        Upload
      </button>
      <div className="flex flex-wrap justify-between">
      {images.map((img, i) => <small key={`${img.name}-${img.size}-${i}`} className="w-1/3 md:w-auto text-center">
        {img.name} {msgArray.includes(img.name) && <span className="text-green-400">Ok</span>}
        </small>)}
      </div>
    </div>
  );
}

export default UploadComponent;
