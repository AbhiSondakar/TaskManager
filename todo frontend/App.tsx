import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Priority, Status, Task} from './types';
import {createTask, deleteTask, getTasks, updateTask} from './api';
import {KanbanColumn} from './components/KanbanColumn';
import {TaskForm} from './components/TaskForm';
import {Modal} from './components/Modal';
import {Toast} from './components/Toast';
import {CheckSquareIcon, LoaderIcon, PlusIcon} from './components/icons';
import {Footer} from './components/Footer';
import {PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS, STATUSES} from './constants';

function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
        action?: { label: string; callback: () => void }
    } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText?: string
    } | null>(null);
    const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

    // Filters and sorting state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
    const [sortOption, setSortOption] = useState('dueDate,desc');

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const {items} = await getTasks();
            setTasks(items);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            // We don't show a toast on initial fetch failure, the main UI error is enough.
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleShowToast = (message: string, type: 'success' | 'error', action?: {
        label: string;
        callback: () => void
    }) => {
        setToast({message, type, action});
    };

    const handleSaveTask = async (formData: Omit<Task, 'id'>) => {
        try {
            if (editingTask) {
                const updatedTaskData = await updateTask(editingTask.id, formData);
                setTasks(tasks.map(t => t.id === editingTask.id ? updatedTaskData : t));
                handleShowToast('Task updated successfully!', 'success');
            } else {
                const newTask = await createTask(formData);
                setTasks([newTask, ...tasks]);
                handleShowToast('Task created successfully!', 'success');
            }
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            handleShowToast(`Failed to ${editingTask ? 'update' : 'create'} task.`, 'error');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (!taskToDelete) return;

        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
            setLastDeletedTask(taskToDelete); // Store for potential undo
            handleShowToast('Task deleted.', 'success', {
                label: 'Undo',
                callback: () => handleUndoDelete(taskToDelete),
            });
        } catch (err) {
            handleShowToast('Failed to delete task.', 'error');
        }
    };

    const handleUndoDelete = async (task: Task) => {
        if (!task) return;
        try {
            // Re-create the task. We can't reuse the ID from mock API, but for this case, it's fine.
            const {id, ...taskData} = task;
            const restoredTask = await createTask(taskData);
            setTasks(prevTasks => [restoredTask, ...prevTasks].sort((a, b) => (b.id > a.id ? 1 : -1))); // A basic sort to try and get it back in place
            handleShowToast('Task restored.', 'success');
            setLastDeletedTask(null);
        } catch (e) {
            handleShowToast('Failed to restore task.', 'error');
        }
    };

    const handleUpdateTask = async (taskId: string, updatedData: Partial<Task>) => {
        try {
            const taskToUpdate = tasks.find(t => t.id === taskId);
            if (!taskToUpdate) return;

            const finalUpdatedData = {...taskToUpdate, ...updatedData};

            // Auto-complete logic
            const allSubtasksCompleted = finalUpdatedData.subtasks && finalUpdatedData.subtasks.length > 0 && finalUpdatedData.subtasks.every(st => st.completed);
            if (allSubtasksCompleted && finalUpdatedData.status !== 'COMPLETED') {
                finalUpdatedData.status = 'COMPLETED';
                handleShowToast(`Task "${finalUpdatedData.title}" moved to Completed!`, 'success');
            }

            const updatedTask = await updateTask(taskId, finalUpdatedData);
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

        } catch (err) {
            handleShowToast('Failed to update task.', 'error');
        }
    };

    const handleDrop = (taskId: string, newStatus: Status) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            handleUpdateTask(taskId, {status: newStatus});
        }
    };

    const handleOpenModal = (task: Task | null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const showConfirmModal = (title: string, message: string, onConfirm: () => void, confirmText = 'Confirm') => {
        setConfirmModal({title, message, onConfirm, confirmText});
    };

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task =>
                (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .filter(task => statusFilter === 'ALL' || task.status === statusFilter)
            .filter(task => priorityFilter === 'ALL' || task.priority === priorityFilter);
    }, [tasks, searchTerm, statusFilter, priorityFilter]);

    const sortedTasks = useMemo(() => {
        const [sortBy, sortOrder] = sortOption.split(',');
        const sorted = [...filteredTasks].sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'priority') {
                const priorityOrder = {'HIGH': 3, 'MEDIUM': 2, 'LOW': 1};
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
        });

        if (sortOrder === 'desc') {
            return sorted.reverse();
        }
        return sorted;
    }, [filteredTasks, sortOption]);

    const tasksByStatus = useMemo(() => {
        return sortedTasks.reduce((acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        }, {} as Record<Status, Task[]>);
    }, [sortedTasks]);

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoaderIcon/></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CheckSquareIcon className="text-indigo-600"/>
                            <h1 className="text-2xl font-bold text-slate-800">Task Manager</h1>
                        </div>
                        <button onClick={() => handleOpenModal(null)}
                                className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors active:scale-95">
                            <PlusIcon/> Add Task
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2"
                        />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | 'ALL')}
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2">
                            {STATUS_OPTIONS.map(opt => <option key={opt.value}
                                                               value={opt.value}>{opt.icon} {opt.label}</option>)}
                        </select>
                        <select value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')}
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2">
                            {PRIORITY_OPTIONS.map(opt => <option key={opt.value}
                                                                 value={opt.value}>{opt.icon} {opt.label}</option>)}
                        </select>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2">
                            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                {error ? (
                    <div className="text-center text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
                        <p className="font-bold text-lg">Oops! Something went wrong.</p>
                        <p className="mt-1">{error}</p>
                        <button
                            onClick={fetchTasks}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {STATUSES.map(status => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                title={status.replace('_', ' ')}
                                tasks={tasksByStatus[status] || []}
                                onDrop={handleDrop}
                                onDelete={(taskId) => showConfirmModal('Confirm Deletion', 'Are you sure you want to delete this task?', () => handleDeleteTask(taskId), 'Delete')}
                                onEdit={(task) => handleOpenModal(task)}
                                onUpdateTask={handleUpdateTask}
                                showConfirmModal={showConfirmModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer/>

            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setEditingTask(null);
            }} title={editingTask ? 'Edit Task' : 'Create New Task'}>
                <TaskForm
                    task={editingTask}
                    onSave={handleSaveTask}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingTask(null);
                    }}
                />
            </Modal>

            <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)}
                   title={confirmModal?.title || 'Confirm'}>
                <div className="mt-2">
                    <p className="text-sm text-slate-500">{confirmModal?.message}</p>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setConfirmModal(null)}
                            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">Cancel
                    </button>
                    <button type="button" onClick={() => {
                        if (confirmModal) {
                            confirmModal.onConfirm();
                            setConfirmModal(null);
                        }
                    }}
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                        {confirmModal?.confirmText}
                    </button>
                </div>
            </Modal>

            {toast && (
                <div className="fixed bottom-5 right-5 w-full max-w-sm z-50">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                        action={toast.action}
                    />
                </div>
            )}
        </div>
    );
}

export default App;