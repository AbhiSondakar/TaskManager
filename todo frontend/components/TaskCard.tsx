import React, {useState} from 'react';
import {Task} from '../types';
import {formatDate, isDueSoon} from '../utils/helpers';
import {PRIORITY_CONFIG, STATUS_CONFIG} from '../constants';
import {CalendarIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, EditIcon, TrashIcon} from './icons';

interface TaskCardProps {
    task: Task;
    onDelete: () => void;
    onEdit: () => void;
    onUpdateTask: (taskId: string, updatedData: Partial<Task>) => void;
    showConfirmModal: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({task, onDelete, onEdit, onUpdateTask, showConfirmModal}) => {
    const [showSubtasks, setShowSubtasks] = useState(false);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', task.id);
    };

    const priority = PRIORITY_CONFIG[task.priority];
    const status = STATUS_CONFIG[task.status];

    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const totalSubtasks = subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const toggleSubtask = (subtaskId: string) => {
        const subtask = subtasks.find(st => st.id === subtaskId);
        if (!subtask) return;

        const action = subtask.completed ? 'mark as incomplete' : 'mark as complete';

        showConfirmModal(
            'Confirm Action',
            `Do you want to ${action} the subtask "${subtask.title}"?`,
            () => {
                const updatedSubtasks = subtasks.map(st =>
                    st.id === subtaskId ? {...st, completed: !st.completed} : st
                );
                onUpdateTask(task.id, {subtasks: updatedSubtasks});
            }
        );
    };

    const priorityBorder = {
        HIGH: 'border-red-500',
        MEDIUM: 'border-yellow-500',
        LOW: 'border-green-500',
    }[task.priority];

    const dueSoon = isDueSoon(task.dueDate) && task.status !== 'COMPLETED';

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 cursor-grab active:cursor-grabbing border-l-4 ${priorityBorder}`}
        >
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-slate-800 break-words pr-2">{task.title}</p>
                <span className={`${status.color} px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap`}>
          {status.label}
        </span>
            </div>
            <div className="flex items-center gap-2 mt-1 mb-3">
        <span className={`${priority.color} px-2 py-0.5 text-xs font-semibold rounded border`}>
          {priority.icon} {priority.label}
        </span>
            </div>
            <p className="text-sm text-slate-500 mb-3 min-h-[20px]">{task.description || ''}</p>

            {totalSubtasks > 0 && (
                <div className="mb-3">
                    <button onClick={() => setShowSubtasks(!showSubtasks)}
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-2 w-full">
                        {showSubtasks ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                        <span className="font-medium">Subtasks ({completedSubtasks}/{totalSubtasks})</span>
                    </button>
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 ml-1">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                             style={{width: `${progress}%`}}/>
                    </div>
                    {showSubtasks && (
                        <div className="space-y-1 pl-2 mt-2">
                            {subtasks.map(subtask => (
                                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={subtask.completed}
                                           onChange={() => toggleSubtask(subtask.id)}
                                           className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"/>
                                    <span
                                        className={`${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{subtask.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-center mt-4">
                <div
                    className={`text-sm flex items-center gap-2 transition-colors ${dueSoon ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                    {dueSoon ? <ClockIcon/> : <CalendarIcon/>}
                    <span>{formatDate(task.dueDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onEdit}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-all"
                            aria-label="Edit task"><EditIcon/></button>
                    <button onClick={onDelete}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 transition-all"
                            aria-label="Delete task"><TrashIcon/></button>
                </div>
            </div>
        </div>
    );
};