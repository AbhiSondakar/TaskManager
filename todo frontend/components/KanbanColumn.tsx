import React, {useState} from 'react';
import {Status, Task} from '../types';
import {TaskCard} from './TaskCard';

interface KanbanColumnProps {
    status: Status;
    title: string;
    tasks: Task[];
    onDrop: (taskId: string, newStatus: Status) => void;
    onDelete: (taskId: string) => void;
    onEdit: (task: Task) => void;
    onUpdateTask: (taskId: string, updatedData: Partial<Task>) => void;
    showConfirmModal: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
                                                              status,
                                                              title,
                                                              tasks,
                                                              onDrop,
                                                              onDelete,
                                                              onEdit,
                                                              onUpdateTask,
                                                              showConfirmModal
                                                          }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');
        onDrop(taskId, status);
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-slate-700 px-1 py-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{
                    backgroundColor: {
                        PENDING: '#0ea5e9',
                        IN_PROGRESS: '#3b82f6',
                        COMPLETED: '#22c55e'
                    }[status]
                }}></span>
                {title} <span
                className="text-sm text-slate-500 bg-slate-200 rounded-full px-2 py-0.5">{tasks.length}</span>
            </h2>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-grow bg-slate-200/50 rounded-lg p-3 space-y-3 transition-colors duration-300 ${isDragOver ? 'bg-slate-300/80' : ''} ${tasks.length > 0 ? 'min-h-[300px]' : ''}`}
            >
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={() => onDelete(task.id)}
                            onEdit={() => onEdit(task)}
                            onUpdateTask={onUpdateTask}
                            showConfirmModal={showConfirmModal}
                        />
                    ))
                ) : (
                    null
                )}
            </div>
        </div>
    );
};