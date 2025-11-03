import {Task} from '../types';

// In-memory mock database. Starts empty as per user request.
let mockTasks: Task[] = [];
let nextId = 1;

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches all tasks from the mock store.
 * @returns A promise that resolves to the list of tasks.
 */
export const getTasks = async (): Promise<{ items: Task[], total: number }> => {
    await delay(300);
    return {items: [...mockTasks], total: mockTasks.length};
};

/**
 * Creates a new task in the mock store.
 * @param data The data for the new task.
 * @returns A promise that resolves to the newly created task.
 */
export const createTask = async (data: Omit<Task, 'id'>): Promise<Task> => {
    await delay(300);
    const newTask: Task = {
        ...data,
        id: String(nextId++),
        subtasks: data.subtasks || [],
    };
    mockTasks.unshift(newTask); // Add to the beginning of the array
    return {...newTask};
};

/**
 * Updates an existing task in the mock store.
 * @param id The ID of the task to update.
 * @param data The partial data to update the task with.
 * @returns A promise that resolves to the updated task.
 */
export const updateTask = async (id: string, data: Partial<Omit<Task, 'id'>>): Promise<Task> => {
    await delay(300);
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    // Make sure subtasks array exists before spreading
    const existingSubtasks = mockTasks[taskIndex].subtasks || [];
    const updatedSubtasks = data.subtasks || existingSubtasks;

    mockTasks[taskIndex] = {
        ...mockTasks[taskIndex],
        ...data,
        subtasks: updatedSubtasks,
    };
    return {...mockTasks[taskIndex]};
};

/**
 * Deletes a task from the mock store by its ID.
 * @param id The ID of the task to delete.
 * @returns A promise that resolves to an object indicating success.
 */
export const deleteTask = async (id: string): Promise<{ success: boolean }> => {
    await delay(300);
    const initialLength = mockTasks.length;
    mockTasks = mockTasks.filter(t => t.id !== id);
    if (mockTasks.length === initialLength) {
        // In a real app, we might throw, but for a mock, failing silently is okay.
    }
    return {success: true};
};
