"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { geocodeAction } from "@/lib/actions/geocode";
import type { GeocodingResult, Location } from "@/types/service-station";
import { MapPinIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface LocationInputProps {
  label: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function LocationInput({
  label,
  value,
  onChange,
  placeholder = "Enter address or postcode",
  icon = <MapPinIcon />,
}: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const previousValueRef = useRef<Location | null>(value);
  const isUserSelectingRef = useRef(false);
  const inputGroupRef = useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(
    undefined,
  );
  const skipNextSearchRef = useRef(false);

  // Debounced geocoding
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

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
      skipNextSearchRef.current = true;
      setQuery(result.display_name);
      setSuggestions([]);
      setShowSuggestions(false);
      onChange(location);
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

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowSuggestions(open);
  };

  // Update popover width based on input group
  const handleInputGroupRef = useCallback((node: HTMLDivElement | null) => {
    inputGroupRef.current = node;
    if (node) {
      setPopoverWidth(node.offsetWidth);
    }
  }, []);

  // Set up resize observer for width updates
  useEffect(() => {
    if (!inputGroupRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (inputGroupRef.current) {
        setPopoverWidth(inputGroupRef.current.offsetWidth);
      }
    });

    resizeObserver.observe(inputGroupRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Popover
        open={showSuggestions && suggestions.length > 0}
        onOpenChange={handleOpenChange}
      >
        <div ref={handleInputGroupRef}>
          <PopoverAnchor asChild>
            <InputGroup>
              <InputGroupInput
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                placeholder={placeholder}
              />
              <InputGroupAddon>
                {isLoading ? <Spinner /> : icon}
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
          </PopoverAnchor>
        </div>
        <PopoverContent
          className="p-0 max-h-60 overflow-y-auto"
          align="start"
          side="bottom"
          sideOffset={4}
          style={popoverWidth ? { width: `${popoverWidth}px` } : undefined}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {suggestions.map((result) => (
            <button
              key={result.place_id}
              type="button"
              className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSelect(result)}
            >
              {result.display_name}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </Field>
  );
}
