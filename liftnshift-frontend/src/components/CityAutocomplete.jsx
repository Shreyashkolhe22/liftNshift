import { useState, useRef, useEffect, useCallback } from "react";
import { searchCities } from "../utils/indianCities";

/**
 * CityAutocomplete — a drop-in replacement for a text input that shows
 * city suggestions as the user types.
 *
 * Props:
 *  - value, onChange   — controlled input (string)
 *  - placeholder       — input placeholder
 *  - dotColor          — color of the left dot indicator
 *  - className         — extra class on wrapper
 *  - inputClassName    — extra class on <input>
 *  - autoFocus         — auto-focus the input
 */
export default function CityAutocomplete({
  value,
  onChange,
  placeholder,
  dotColor,
  className = "",
  inputClassName = "",
  autoFocus = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Search cities on value change
  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      onChange(val);
      const results = searchCities(val);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setActiveIdx(-1);
    },
    [onChange]
  );

  // Select a suggestion
  const handleSelect = useCallback(
    (city) => {
      onChange(`${city.name}, ${city.state}`);
      setSuggestions([]);
      setShowDropdown(false);
      setActiveIdx(-1);
    },
    [onChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!showDropdown || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIdx]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
        setActiveIdx(-1);
      }
    },
    [showDropdown, suggestions, activeIdx, handleSelect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDropdown(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Re-open on focus if there are suggestions
  const handleFocus = () => {
    if (value && value.trim().length >= 2) {
      const results = searchCities(value);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    }
  };

  return (
    <div className={`city-ac-wrap ${className}`} ref={wrapRef}>
      <div className="cb-input-wrap">
        {dotColor && (
          <div className="cb-input-dot" style={{ background: dotColor }} />
        )}
        <input
          ref={inputRef}
          className={`cb-input ${inputClassName}`}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoFocus={autoFocus}
          autoComplete="off"
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="city-ac-dropdown">
          {suggestions.map((city, i) => (
            <div
              key={`${city.name}-${city.state}-${i}`}
              className={`city-ac-item ${i === activeIdx ? "city-ac-active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(city);
              }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <svg
                className="city-ac-pin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="city-ac-text">
                <span className="city-ac-name">{city.name}</span>
                <span className="city-ac-state">{city.state}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{AUTOCOMPLETE_CSS}</style>
    </div>
  );
}

const AUTOCOMPLETE_CSS = `
.city-ac-wrap {
  position: relative;
}

.city-ac-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 999;
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
  max-height: 320px;
  overflow-y: auto;
  animation: cityDropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(12px);
}

@keyframes cityDropIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.city-ac-dropdown::-webkit-scrollbar {
  width: 4px;
}
.city-ac-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}
.city-ac-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.city-ac-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.city-ac-item:hover,
.city-ac-active {
  background: rgba(244, 123, 32, 0.1);
}

.city-ac-active {
  background: rgba(244, 123, 32, 0.15) !important;
}

.city-ac-pin {
  color: #F47B20;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.city-ac-item:hover .city-ac-pin,
.city-ac-active .city-ac-pin {
  opacity: 1;
}

.city-ac-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.city-ac-name {
  font-size: 0.88rem;
  font-weight: 500;
  color: #f0ede8;
  line-height: 1.2;
}

.city-ac-state {
  font-size: 0.72rem;
  color: #606060;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.city-ac-item:hover .city-ac-name,
.city-ac-active .city-ac-name {
  color: #F47B20;
}

.city-ac-item:hover .city-ac-state,
.city-ac-active .city-ac-state {
  color: #888;
}
`;
