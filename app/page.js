"use client";

import React, { useState } from "react";
import { version, GlobalWorkerOptions, getDocument } from "pdfjs-dist";

const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
GlobalWorkerOptions.workerSrc = workerSrc;

const PDFToImage = () => {
  const [images, setImages] = useState([]);
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePDFUpload = async (event) => {
    const file = event.target.files?.[0]; //
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async (fileAsArrayBuffer) => {
      const pdf = await getDocument(fileAsArrayBuffer.target.result).promise;
      const imagesArray = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        imagesArray.push(canvas.toDataURL("image/png"));
      }
      setImages(imagesArray);
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/parse_pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images }),
      });

      const data = await response.json();
      setResume(data.resume);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1>Loading..</h1>;
  }

  return (
    <>
      <h1>Upload Your PDF</h1>
      <pre>{resume}</pre>
      <div>
        <input type="file" accept=".pdf" onChange={handlePDFUpload} />

        <button onClick={handleSubmit}>Submit</button>

        {images.map((i, key) => (
          <div key={key}>
            <img width={400} src={i} />
          </div>
        ))}
      </div>
    </>
  );
};

export default PDFToImage;
