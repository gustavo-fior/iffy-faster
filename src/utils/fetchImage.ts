import { fileTypeFromBuffer } from "file-type";

export async function fetchImage(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = await fileTypeFromBuffer(buffer);
      const base64 = buffer.toString("base64");
      return { base64, mimeType: fileType?.mime ?? "application/octet-stream" };
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }