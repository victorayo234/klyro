"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface CustomFieldsRendererProps {
  fieldNames: string[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function CustomFieldsRenderer({
  fieldNames = [],
  values = {},
  onChange,
}: CustomFieldsRendererProps) {
  if (!fieldNames || fieldNames.length === 0) return null;

  const handleFieldChange = (name: string, val: string) => {
    onChange({ ...values, [name]: val });
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
        Custom Business Fields
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fieldNames.map((fieldName) => (
          <Input
            key={fieldName}
            label={fieldName}
            placeholder={`Enter ${fieldName.toLowerCase()}...`}
            value={values[fieldName] || ""}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}
