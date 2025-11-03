import React from 'react';
import {Calendar, Check, CheckSquare, ChevronDown, ChevronUp, Clock, Edit2, Plus, Trash2, X} from 'lucide-react';

// Re-exporting for easier use and potential swapping
export const CalendarIcon = (props: React.ComponentProps<typeof Calendar>) => <Calendar size={16} {...props} />;
export const CheckIcon = (props: React.ComponentProps<typeof Check>) => <Check size={20} {...props} />;
export const XIcon = (props: React.ComponentProps<typeof X>) => <X size={20} {...props} />;
export const EditIcon = (props: React.ComponentProps<typeof Edit2>) => <Edit2 size={18} {...props} />;
export const TrashIcon = (props: React.ComponentProps<typeof Trash2>) => <Trash2 size={18} {...props} />;
export const PlusIcon = (props: React.ComponentProps<typeof Plus>) => <Plus size={18} {...props} />;
export const CheckSquareIcon = (props: React.ComponentProps<typeof CheckSquare>) => <CheckSquare
    size={24} {...props} />;
export const ChevronDownIcon = (props: React.ComponentProps<typeof ChevronDown>) => <ChevronDown
    size={16} {...props} />;
export const ChevronUpIcon = (props: React.ComponentProps<typeof ChevronUp>) => <ChevronUp size={16} {...props} />;
export const ClockIcon = (props: React.ComponentProps<typeof Clock>) => <Clock size={16} {...props} />;
export const LoaderIcon = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"/>;
