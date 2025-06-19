import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuickAddInputProps {
  placeholder: string;
  onAdd: (value: string) => void;
}

export function QuickAddInput({ placeholder, onAdd }: QuickAddInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <Button onClick={handleSubmit} size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}