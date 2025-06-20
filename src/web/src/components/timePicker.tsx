import React from 'react';
import { Dropdown, IDropdownOption } from '@fluentui/react';

interface TimePickerProps {
    label?: string;
    value?: Date;
    onTimeChange: (time: Date | null) => void;
    disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
    label = "Time", 
    value, 
    onTimeChange, 
    disabled = false 
}) => {
    // Generate time options in 15-minute intervals
    const generateTimeOptions = (): IDropdownOption[] => {
        const options: IDropdownOption[] = [];
        
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = formatTime(hour, minute);
                
                options.push({
                    key: timeValue,
                    text: displayTime
                });
            }
        }
        
        return options;
    };

    const formatTime = (hour: number, minute: number): string => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    };

    const getCurrentTimeKey = (): string | undefined => {
        if (!value) return undefined;
        
        const hours = value.getHours().toString().padStart(2, '0');
        const minutes = Math.floor(value.getMinutes() / 15) * 15; // Round to nearest 15-minute interval
        const roundedMinutes = minutes.toString().padStart(2, '0');
        
        return `${hours}:${roundedMinutes}`;
    };

    const handleTimeChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (!option) {
            onTimeChange(null);
            return;
        }

        const timeKey = option.key as string;
        const [hours, minutes] = timeKey.split(':').map(Number);
        
        // If we have an existing date, preserve the date part and update the time
        const newDate = value ? new Date(value) : new Date();
        newDate.setHours(hours, minutes, 0, 0);
        
        onTimeChange(newDate);
    };

    const timeOptions = generateTimeOptions();
    const selectedKey = getCurrentTimeKey();

    return (
        <Dropdown
            label={label}
            options={timeOptions}
            selectedKey={selectedKey}
            onChange={handleTimeChange}
            disabled={disabled}
            placeholder="Select time"
        />
    );
};

export default TimePicker;
