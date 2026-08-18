import React from "react";
import { SearchIcon } from "./icons";

interface SearchFieldProps {
    className: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    iconSize?: number;
}

/** Text filter input with a leading magnifier icon. */
export function SearchField({ className, placeholder, value, onChange, iconSize }: SearchFieldProps) {
    return (
        <div className={className}>
            <SearchIcon size={iconSize} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
