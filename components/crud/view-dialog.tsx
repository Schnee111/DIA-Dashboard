import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JSX } from "react";

interface Field {
  key: string;
  label: string;
  className?: string;
  render?: (value: any) => JSX.Element | string;
}

interface ViewDialogProps<T> {
  title: string;
  fields: Field[];
  data: T | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDialog<T>({ title, fields, data, open, onOpenChange }: ViewDialogProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {data && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.key} className={field.className}>
                  <h3 className="text-sm font-medium text-gray-500">{field.label}</h3>
                  <p className="mt-1">
                    {field.render
                      ? field.render((data as any)[field.key])
                      : (data as any)[field.key] || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}