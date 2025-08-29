import { useDropzone } from "react-dropzone";
import { UploadCloud, XCircle } from "lucide-react";
import Image from "next/image";

export default function MediaStep({
  form,
  formErrors,
  setFormErrors,
  onInputChange,
  images,
  setImages,
  imagePreviews,
  setImagePreviews,
  hasMounted,
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setImages(acceptedFiles);
      setImagePreviews(acceptedFiles.map((f) => URL.createObjectURL(f)));
      setFormErrors((prev) => ({ ...prev, images: null }));
    },
  });

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <h2 className="text-xl font-semibold">Description & Images</h2>
      <textarea
        value={form.description}
        onChange={(e) => onInputChange("description", e.target.value)}
        className={`w-full border ${formErrors.description ? "border-red-500" : "border-gray-300"} rounded px-3 py-2`}
        rows={4}
      />
      {formErrors.description && (
        <p className="text-red-500 text-sm">{formErrors.description}</p>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-2 text-blue-500" />
        <p>{isDragActive ? "Drop images here..." : "Drag or click to select"}</p>
      </div>
      {formErrors.images && (
        <p className="text-red-500 text-sm">{formErrors.images}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {hasMounted &&
          imagePreviews.map((src, idx) => (
            <div key={idx} className="relative group">
              <Image
                src={src}
                width={200}
                height={200}
                className="rounded"
                alt=""
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
              >
                <XCircle size={18} />
              </button>
            </div>
          ))}
      </div>
    </>
  );
}