import React, { useState, useEffect } from 'react';
import { Text, FontIcon, Stack } from '@fluentui/react';

interface CountdownTimerProps {
    dueDate: Date;
    isCompleted?: boolean;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
}

const calculateTimeRemaining = (dueDate: Date): TimeRemaining => {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isOverdue: true
        };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds,
        isOverdue: false
    };
};

const formatTimeRemaining = (timeRemaining: TimeRemaining): string => {
    const { days, hours, minutes, seconds, isOverdue } = timeRemaining;
    
    if (isOverdue) {
        return 'Overdue';
    }
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

const getTimerColor = (timeRemaining: TimeRemaining): string => {
    if (timeRemaining.isOverdue) {
        return '#d13438'; // Red for overdue
    }
    
    const totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes;
    
    if (totalMinutes < 60) {
        return '#d13438'; // Red - less than 1 hour
    } else if (totalMinutes < 24 * 60) {
        return '#ff8c00'; // Orange - less than 1 day
    } else if (totalMinutes < 7 * 24 * 60) {
        return '#ffa500'; // Yellow - less than 1 week
    } else {
        return '#107c10'; // Green - more than 1 week
    }
};

const getTimerIcon = (timeRemaining: TimeRemaining): string => {
    if (timeRemaining.isOverdue) {
        return 'Warning';
    }
    
    const totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes;
    
    if (totalMinutes < 60) {
        return 'Clock';
    } else if (totalMinutes < 24 * 60) {
        return 'Clock';
    } else {
        return 'DateTime';
    }
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ dueDate, isCompleted = false }) => {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => calculateTimeRemaining(dueDate));

    useEffect(() => {
        if (isCompleted) {
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(dueDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [dueDate, isCompleted]);

    if (isCompleted) {
        return (
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
                <FontIcon 
                    iconName="CompletedSolid" 
                    style={{ color: '#107c10', fontSize: '12px' }} 
                />
                <Text variant="small" style={{ color: '#107c10' }}>
                    Completed
                </Text>
            </Stack>
        );
    }

    const color = getTimerColor(timeRemaining);
    const icon = getTimerIcon(timeRemaining);
    const formattedTime = formatTimeRemaining(timeRemaining);

    return (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
            <FontIcon 
                iconName={icon} 
                style={{ color, fontSize: '12px' }} 
            />
            <Text variant="small" style={{ color, fontWeight: timeRemaining.isOverdue ? 'bold' : 'normal' }}>
                {formattedTime}
            </Text>
        </Stack>
    );
};

export default CountdownTimer;
