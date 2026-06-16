'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, type ProductFormState } from '@/app/actions/admin/products';

export default function NewProductPage() {
  const [state, action, pending] = useActionState<ProductFormState | undefined, FormData>(
    createProductAction,
    undefined,
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const newUrls = [...imageUrls];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      }
      setImageUrls(newUrls);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = async (url: string) => {
    await fetch('/api/upload', { method: 'DELETE', body: JSON.stringify({ url }) }).catch(() => {});
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl font-medium text-text">New Product</h1>

      {state?.message && !state?.errors && (
        <p className="mb-4 rounded-sm bg-[#fef2f2] px-3 py-2 text-xs text-danger">
          {state.message}
        </p>
      )}

      <form
        action={action}
        className="flex max-w-[600px] flex-col gap-4 rounded-lg border border-border bg-white p-6"
      >
        <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" name="name" error={state?.errors?.name?.[0]} />
          <Field label="Brand" name="brand" error={state?.errors?.brand?.[0]} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Category"
            name="category"
            options={['Lips', 'Skincare', 'Perfume', 'Eyes', 'Face']}
            error={state?.errors?.category?.[0]}
          />
          <Field
            label="Price ($)"
            name="price"
            type="number"
            step="0.01"
            error={state?.errors?.price?.[0]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Original Price ($)" name="originalPrice" type="number" step="0.01" />
          <Field
            label="Emoji (fallback)"
            name="emoji"
            placeholder="e.g. 💄"
            error={state?.errors?.emoji?.[0]}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-text">Product Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full text-[13px] text-text file:mr-3 file:cursor-pointer file:rounded-sm file:border file:border-border-md file:bg-bg file:px-3 file:py-[6px] file:text-[13px] file:text-text"
          />
          {uploading && <p className="mt-1 text-[10px] text-muted">Uploading...</p>}
          {imageUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imageUrls.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-20 rounded-sm border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-danger text-[11px] text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-text">Description</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-sm border border-border-md px-3.5 py-[10px] text-[13px] text-text outline-none resize-y box-border"
          />
          {state?.errors?.description?.[0] && (
            <p className="mt-1 text-[10px] text-danger">{state.errors.description[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Badge"
            name="badge"
            options={['', 'NEW', 'SALE', 'HOT']}
            labels={['None', 'NEW', 'SALE', 'HOT']}
          />
          <div />
        </div>

        <div className="flex gap-6">
          <Checkbox label="New arrival" name="isNew" />
          <Checkbox label="Subscription eligible" name="isSubscriptionEligible" />
        </div>

        <div className="mt-2 flex gap-2.5">
          <button
            type="submit"
            disabled={pending}
            className={`rounded-full px-6 py-[10px] text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer rounded-full border border-border bg-white px-6 py-[10px] text-[13px] text-text"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  step,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[11px] font-medium text-text">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        className={`w-full rounded-sm border px-3.5 py-[10px] text-[13px] text-text outline-none box-border ${
          error ? 'border-danger' : 'border-border-md'
        }`}
      />
      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  labels,
  error,
}: {
  label: string;
  name: string;
  options: string[];
  labels?: string[];
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[11px] font-medium text-text">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`w-full rounded-sm border px-3.5 py-[10px] text-[13px] text-text outline-none box-border ${
          error ? 'border-danger' : 'border-border-md'
        }`}
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {labels?.[i] ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}

function Checkbox({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-text">
      <input type="checkbox" name={name} className="accent-pink" />
      {label}
    </label>
  );
}
