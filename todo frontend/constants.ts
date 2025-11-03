import {Priority, Status} from './types';

export const STATUSES: Status[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export const STATUS_OPTIONS = [
    {value: 'ALL', label: 'All Tasks', icon: '📋'},
    {value: 'PENDING', label: 'Pending', icon: '⏳'},
    {value: 'IN_PROGRESS', label: 'In Progress', icon: '🚀'},
    {value: 'COMPLETED', label: 'Completed', icon: '✅'}
];

export const PRIORITY_OPTIONS = [
    {value: 'ALL', label: 'All Priorities', icon: '🎯'},
    {value: 'HIGH', label: 'High Priority', icon: '🔴'},
    {value: 'MEDIUM', label: 'Medium Priority', icon: '🟡'},
    {value: 'LOW', label: 'Low Priority', icon: '🟢'}
];

export const SORT_OPTIONS = [
    {value: 'dueDate,desc', label: 'Due Date (Newest)'},
    {value: 'dueDate,asc', label: 'Due Date (Oldest)'},
    {value: 'priority,desc', label: 'Priority (High to Low)'},
    {value: 'priority,asc', label: 'Priority (Low to High)'}
];

export const PRIORITY_CONFIG: Record<Priority, { color: string; icon: string; label: string }> = {
    HIGH: {color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴', label: 'High'},
    MEDIUM: {color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡', label: 'Medium'},
    LOW: {color: 'bg-green-100 text-green-700 border-green-300', icon: '🟢', label: 'Low'},
};

export const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
    PENDING: {color: 'bg-sky-100 text-sky-800', label: 'Pending'},
    IN_PROGRESS: {color: 'bg-blue-100 text-blue-800', label: 'In Progress'},
    COMPLETED: {color: 'bg-green-100 text-green-800', label: 'Completed'},
};
