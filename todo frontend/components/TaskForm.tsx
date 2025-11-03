import React, {useState} from 'react';
import {Subtask, Task} from '../types';
import {XIcon} from './icons';

interface TaskFormProps {
    task?: Task | null;
    onSave: (formData: Omit<Task, 'id'>) => Promise<void>;
    onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({task, onSave, onCancel}) => {
    const [formData, setFormData] = useState<Omit<Task, 'id'>>({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'PENDING',
        dueDate: task?.dueDate || '',
        priority: task?.priority || 'MEDIUM',
        subtasks: task?.subtasks || [],
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    const addSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        const newSubtask: Subtask = {id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false};
        setFormData(prev => ({...prev, subtasks: [...prev.subtasks, newSubtask]}));
        setNewSubtaskTitle('');
    };

    const removeSubtask = (subtaskId: string) => {
        setFormData(prev => ({...prev, subtasks: prev.subtasks.filter(st => st.id !== subtaskId)}));
    };

    const toggleSubtask = (subtaskId: string) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.map(st => st.id === subtaskId ? {...st, completed: !st.completed} : st)
        }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (formData.dueDate && new Date(formData.dueDate) < new Date(today)) newErrors.dueDate = 'Due date cannot be in the past.';
        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange}
                       className="mt-1 block w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2"
                       required/>
                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description
                    (Optional)</label>
                <textarea name="description" id="description" rows={3} value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}
                            className="mt-1 block w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2">
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange}
                            className="mt-1 block w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2">
                        <option value="HIGH">🔴 High Priority</option>
                        <option value="MEDIUM">🟡 Medium Priority</option>
                        <option value="LOW">🟢 Low Priority</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">Due Date
                    (Optional)</label>
                <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange}
                       className="mt-1 block w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2"/>
                {errors.dueDate && <p className="mt-2 text-sm text-red-600">{errors.dueDate}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subtasks (Optional)</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {formData.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                            <input type="checkbox" checked={subtask.completed}
                                   onChange={() => toggleSubtask(subtask.id)}
                                   className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"/>
                            <span
                                className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{subtask.title}</span>
                            <button type="button" onClick={() => removeSubtask(subtask.id)}
                                    className="text-slate-400 hover:text-red-600"><XIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <input type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                           placeholder="Add a subtask..."
                           className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 text-sm"/>
                    <button type="button" onClick={addSubtask}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium">Add
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-transform">Cancel
                </button>
                <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                        className="inline-flex items-center justify-center w-32 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-transform disabled:opacity-50">
                    {isSubmitting ? <div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : (task ? 'Save Changes' : 'Create Task')}
                </button>
            </div>
        </div>
    );
};
