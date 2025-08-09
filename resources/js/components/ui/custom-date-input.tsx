import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from './input';

interface CustomDateInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    style?: React.CSSProperties;
    required?: boolean;
}

export const CustomDateInput: React.FC<CustomDateInputProps> = ({
    id,
    value,
    onChange,
    className,
    placeholder = "dd/mm/yyyy",
    style,
    required = false,
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const hiddenDateRef = useRef<HTMLInputElement>(null);

    // Convert YYYY-MM-DD or datetime to DD/MM/YYYY for display
    const formatDateForDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        console.log('Formatting date for display:', dateStr);

        // Handle datetime format (e.g., "2025-08-09T00:00:00.000000Z" or "2025-08-09")
        let datePart = dateStr;
        if (dateStr.includes('T')) {
            datePart = dateStr.split('T')[0]; // Extract just the date part
        }

        const [year, month, day] = datePart.split('-');
        if (!year || !month || !day) {
            console.error('Invalid date format:', dateStr);
            return '';
        }

        const formatted = `${day}/${month}/${year}`;
        console.log('Formatted date:', formatted);
        return formatted;
    };

    // Update display value when value prop changes
    useEffect(() => {
        setDisplayValue(formatDateForDisplay(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Remove any non-digit characters except /
        inputValue = inputValue.replace(/[^\d\/]/g, '');

        // Auto-format as DD/MM/YYYY
        if (inputValue.length === 2 && !inputValue.includes('/')) {
            inputValue += '/';
        } else if (inputValue.length === 5 && inputValue.split('/').length === 2) {
            inputValue += '/';
        }

        // Limit to DD/MM/YYYY format (10 characters)
        if (inputValue.length <= 10) {
            setDisplayValue(inputValue);

            // If we have a complete date (DD/MM/YYYY), convert and call onChange
            if (inputValue.length === 10) {
                const parts = inputValue.split('/');
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
                        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        onChange(isoDate);
                    }
                }
            } else if (inputValue === '') {
                onChange('');
            }
        }
    };

    const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        // Hide the date picker after selection
        if (hiddenDateRef.current) {
            hiddenDateRef.current.blur();
        }
    };

    const handleCalendarClick = () => {
        if (hiddenDateRef.current) {
            hiddenDateRef.current.focus();
            hiddenDateRef.current.showPicker?.();
        }
    };

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                id={id}
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                className={cn('pr-10', className)}
                placeholder={placeholder}
                style={style}
                required={required}
                maxLength={10}
            />

            {/* Calendar Icon */}
            <button
                type="button"
                onClick={handleCalendarClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
            >
                <CalendarIcon className="h-4 w-4" />
            </button>

            {/* Hidden date input for native date picker */}
            <input
                ref={hiddenDateRef}
                type="date"
                value={value}
                onChange={handleDatePickerChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
                tabIndex={-1}
            />
        </div>
    );
};
