import { AnimatePresence, motion } from "framer-motion";
import BasicInfoStep from "./BasicInfoStep";
import DetailsStep from "./DetailsStep";
import MediaStep from "./MediaStep";
import ReviewStep from "./ReviewStep";

export default function ProductForm({
  step,
  form,
  setForm,
  formErrors,
  setFormErrors,
  variants,
  setVariants,
  attributes,
  setAttributes,
  categories,
  loadingCategories,
  images,
  setImages,
  imagePreviews,
  setImagePreviews,
  uploadProgress,
  submitting,
  validateStep,
  hasMounted,
}) {
  const handleInput = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        {step === 1 && (
          <BasicInfoStep 
            form={form} 
            formErrors={formErrors} 
            onInputChange={handleInput} 
          />
        )}

        {step === 2 && (
          <DetailsStep
            form={form}
            formErrors={formErrors}
            onInputChange={handleInput}
            variants={variants}
            setVariants={setVariants}
            attributes={attributes}
            setAttributes={setAttributes}
            categories={categories}
            loadingCategories={loadingCategories}
            hasMounted={hasMounted}
          />
        )}

        {step === 3 && (
          <MediaStep
            form={form}
            formErrors={formErrors}
            onInputChange={handleInput}
            images={images}
            setImages={setImages}
            imagePreviews={imagePreviews}
            setImagePreviews={setImagePreviews}
            hasMounted={hasMounted}
          />
        )}

        {step === 4 && (
          <ReviewStep
            form={form}
            variants={variants}
            attributes={attributes}
            submitting={submitting}
            uploadProgress={uploadProgress}
          />
        )}
      </motion.form>
    </AnimatePresence>
  );
}