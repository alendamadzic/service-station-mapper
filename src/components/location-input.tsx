"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { geocodeAction } from "@/lib/actions/geocode";
import type { GeocodingResult, Location } from "@/types/service-station";
import { Loader2, MapPinIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface LocationInputProps {
  label: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  placeholder?: string;
}

export function LocationInput({
  label,
  value,
  onChange,
  placeholder = "Enter address or postcode",
}: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const previousValueRef = useRef<Location | null>(value);
  const isUserSelectingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced geocoding
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await geocodeAction(query, {
          limit: 5,
          countrycodes: "gb",
        });
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      const location: Location = {
        longitude: Number.parseFloat(result.lon),
        latitude: Number.parseFloat(result.lat),
      };
      isUserSelectingRef.current = true;
      // Clear any pending blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setQuery(result.display_name);
      onChange(location);
      setShowSuggestions(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [onChange]);

  // Update query when value changes externally
  useEffect(() => {
    const previousValue = previousValueRef.current;

    // Skip if user just selected from suggestions (query already set)
    if (isUserSelectingRef.current) {
      isUserSelectingRef.current = false;
      previousValueRef.current = value;
      return;
    }

    previousValueRef.current = value;

    // Only update if value actually changed externally (not from user typing)
    if (value && value !== previousValue) {
      // Value was set externally
      setQuery(`${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`);
    } else if (!value && previousValue !== null) {
      // Value was cleared externally (e.g., from clear button)
      setQuery("");
    }
    // Don't update if user is typing (query changes but value hasn't changed externally)
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Clear any pending blur timeout since we're closing manually
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSuggestions]);

  const handleBlur = () => {
    // Use a small timeout to allow clicks on suggestions to register first
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      blurTimeoutRef.current = null;
    }, 200);
  };

  const handleFocus = () => {
    // Clear any pending blur timeout if refocusing quickly
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <InputGroup>
          <InputGroupInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-20 bg-popover border border-border rounded-sm shadow-md max-h-60 overflow-y-auto">
              {suggestions.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                  onClick={() => handleSelect(result)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
          <InputGroupAddon>
            {isLoading ? <Spinner /> : <MapPinIcon />}
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleClear}
              >
                <X className="size-4" />
              </Button>
            )}
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
