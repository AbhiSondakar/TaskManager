export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: Status;
    dueDate?: string;
    priority: Priority;
    subtasks: Subtask[];
}
