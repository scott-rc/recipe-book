import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface ImageItem {
  id: string;
  file: { url: string; mimeType?: string | null };
  alt: string | null;
  width: number | null;
  height: number | null;
  index: number | null;
  uploadFile?: File;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useImageManager(initialImages: ImageItem[]) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const imagesRef = useRef(images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep ref in sync
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup blob URLs on unmount
  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => {
        if (image.uploadFile && image.file.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.file.url);
        }
      });
    },
    [],
  );

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }

    const newImages: ImageItem[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`, { dismissible: true });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`, { dismissible: true });
        continue;
      }

      const objectUrl = URL.createObjectURL(file);

      try {
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            resolve({ height: img.height, width: img.width });
          };
          img.onerror = () => {
            reject(new Error("Failed to load image"));
          };
          img.src = objectUrl;
        });

        const tempId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        newImages.push({
          alt: file.name,
          file: {
            mimeType: file.type,
            url: objectUrl,
          },
          height: dimensions.height,
          id: tempId,
          index: null,
          uploadFile: file,
          width: dimensions.width,
        });
      } catch (error) {
        console.error(error);
        URL.revokeObjectURL(objectUrl);
        toast.error(`Failed to load ${file.name}`, { dismissible: true });
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => {
        const updated = [...prev, ...newImages];
        return updated.map((item, index) => ({
          ...item,
          index,
        }));
      });
      toast.success(`Added ${newImages.length} image${newImages.length > 1 ? "s" : ""}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    setImages((items) => {
      const itemToDelete = items.find((item) => item.id === id);
      if (itemToDelete?.uploadFile && itemToDelete.file.url.startsWith("blob:")) {
        URL.revokeObjectURL(itemToDelete.file.url);
      }
      const newItems = items.filter((item) => item.id !== id);
      return newItems.map((item, index) => ({
        ...item,
        index,
      }));
    });
  };

  const reorderImages = (activeId: string, overId: string) => {
    setImages((items) => {
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return items;
      }

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1) as [ImageItem];
      newItems.splice(newIndex, 0, removed);

      return newItems.map((item, index) => ({
        ...item,
        index,
      }));
    });
  };

  return {
    fileInputRef,
    handleDelete,
    handleFileSelect,
    images,
    reorderImages,
    setImages,
  };
}
