"use client";

import * as React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../input";
import Image from "next/image";
import { Button } from "../button";

interface FormImageUploaderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  containerClassName?: string;
}

function FormImageUploader<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  containerClassName,
  className,
  ...inputProps
}: FormImageUploaderProps<TFieldValues, TName>) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isHoveringButton, setIsHoveringButton] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleSetPreview = React.useCallback((value: string | null) => {
    setPreview(value);
  }, []);

  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(containerClassName)}>
          <FormImageUploaderHook
            field={field}
            setPreview={handleSetPreview}
          />
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ms-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div
              className={cn(
                "border-muted dark:bg-input/30 hover:border-primary relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-transparent p-6 transition",
                { "py-0": preview },
                { "border-primary": isDragging },
                { "hover:border-muted": isHoveringButton && preview },
                className,
              )}
              tabIndex={0}
              onClick={e => {
                if (!(e.target instanceof HTMLButtonElement)) {
                  document.getElementById(field.name)?.click();
                }
              }}
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  field.onChange(file);
                }
                setIsDragging(false);
              }}
            >
              {preview ? (
                <React.Fragment>
                  <Button
                    variant="destructive"
                    size={null}
                    className="dark:bg-destructive absolute -top-3 -right-3 z-20 size-6 rounded-full"
                    onClick={() => {
                      field.onChange(null);
                      setIsHoveringButton(false);
                    }}
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                  >
                    <span className="sr-only">Remove image</span>
                    <XIcon className="size-4" />
                  </Button>
                  <Image
                    src={preview}
                    alt="Image preview"
                    height={100}
                    width={200}
                    className="mb-2 h-full max-h-52 w-auto"
                  />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <UploadCloudIcon className="text-primary mb-2 size-8" />
                  <div className="text-muted-foreground mb-1 text-sm">
                    <span className="text-primary">Click here</span>
                    &nbsp;or&nbsp;
                    <span className="text-primary">drag & drop</span> an image
                  </div>
                  <span className="text-muted-foreground text-xs">(PNG, JPG, JPEG, WEBP)</span>
                </React.Fragment>
              )}
              <Input
                id={field.name}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                  }
                }}
                {...inputProps}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormImageUploaderHook<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  setPreview,
}: {
  field: ControllerRenderProps<TFieldValues, TName>;
  setPreview: (preview: string | null) => void;
}) {
  React.useEffect(() => {
    if (field.value) {
      setPreview(URL.createObjectURL(field.value));
    } else {
      setPreview(null);
    }
  }, [field.value, setPreview]);

  return null;
}

export { FormImageUploader, type FormImageUploaderProps };
