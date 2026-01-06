"use client";

import { useState, useEffect, useRef } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select or type to search...",
  disabled = false,
  required = false,
  autoFocus = false,
  className = "",
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the label for the current value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label ?? "";

  // Filter options based on input
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset input to selected value when closing
        setInputValue(displayValue);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, displayValue]);

  // Reset input when value changes externally
  useEffect(() => {
    setInputValue(displayValue);
  }, [displayValue]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(0);

    // If input matches an option exactly, select it
    const exactMatch = options.find(
      (opt) => opt.label.toLowerCase() === newValue.toLowerCase(),
    );
    if (exactMatch) {
      onChange(exactMatch.value);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setInputValue(displayValue);
  };

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setInputValue(displayValue);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "combobox-options" : undefined}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] disabled:cursor-not-allowed disabled:opacity-50"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id="combobox-options"
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/20 bg-gradient-to-b from-[#2e026d] to-[#15162c] shadow-lg ring-1 ring-black/5"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`cursor-pointer px-3 py-2 text-white transition-colors ${
                option.value === value
                  ? "bg-[hsl(280,100%,70%)]/30"
                  : highlightedIndex === index
                    ? "bg-white/10"
                    : "hover:bg-white/5"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && inputValue && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-white/20 bg-gradient-to-b from-[#2e026d] to-[#15162c] shadow-lg ring-1 ring-black/5"
        >
          <li className="px-3 py-2 text-white/60">No options found</li>
        </ul>
      )}
    </div>
  );
}

