export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No due date';
    try {
        const date = new Date(dateString + 'T00:00:00Z'); // Treat date as UTC to avoid timezone shifts
        if (isNaN(date.getTime())) return 'Invalid date';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(date);
    } catch (e) {
        return 'Invalid date';
    }
};

export const isDueSoon = (dateString?: string): boolean => {
    if (!dateString) return false;

    try {
        // Treat input date as the start of the day in UTC to avoid timezone issues.
        const dueDate = new Date(dateString + 'T00:00:00Z');
        if (isNaN(dueDate.getTime())) return false;

        const now = new Date();

        // Get today's date at midnight UTC for a clean comparison.
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        // If due date was before today (UTC), it's not "nearing".
        if (dueDate < today) {
            return false;
        }

        // Calculate the difference in milliseconds and then in days.
        const diffInMs = dueDate.getTime() - today.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        // Nearing due date if it's due today or tomorrow (a 48-hour window from the start of today).
        return diffInDays >= 0 && diffInDays < 2;
    } catch (e) {
        return false;
    }
};
