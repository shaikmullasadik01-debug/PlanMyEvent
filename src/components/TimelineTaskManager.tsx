import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Filter,
  Search,
  CheckSquare,
  Square,
  X,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FullEventData, EventTask, TaskPriority, TaskStatus } from '../types/index.ts';
import { formatDate, getDaysUntil } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface TimelineTaskManagerProps {
  eventData: FullEventData;
  onRefresh: () => void;
}

export const TimelineTaskManager: React.FC<TimelineTaskManagerProps> = ({ eventData, onRefresh }) => {
  const { event, tasks } = eventData;

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date(event.date || Date.now()));

  // New Task Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'General',
    dueDate: event.date || new Date().toISOString().split('T')[0],
    priority: 'medium' as TaskPriority,
    assignee: 'Host',
    notes: '',
  });

  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      return getDaysUntil(t.dueDate) < 0;
    });
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, selectedStatus, selectedPriority]);

  // Handlers
  const handleToggleTaskStatus = async (task: EventTask) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.updateTask(event.id, task.id, { status: nextStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;

    try {
      await api.addTask(event.id, {
        title: taskForm.title,
        description: taskForm.description,
        category: taskForm.category,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        status: 'todo',
        assignee: taskForm.assignee,
        notes: taskForm.notes,
      });
      setIsAddTaskOpen(false);
      setTaskForm({
        title: '',
        description: '',
        category: 'General',
        dueDate: event.date || new Date().toISOString().split('T')[0],
        priority: 'medium',
        assignee: 'Host',
        notes: '',
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(event.id, taskId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar calculations
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Milestone Chronology</span>
            <span>·</span>
            <span>Target: {formatDate(event.date)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            Timeline & Task Manager
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* List vs Calendar View Toggle */}
          <div className="flex items-center bg-[#F2EDE4] p-1 rounded-lg border border-[#DDD5C7]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#1B3B2B] shadow-sm font-semibold' : 'text-[#4A5750]'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-[#1B3B2B] shadow-sm font-semibold' : 'text-[#4A5750]'
              }`}
            >
              Calendar View
            </button>
          </div>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Overdue Task Alert */}
      {overdueTasks.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Require Attention
            </p>
            <p className="mt-0.5 text-amber-800">
              The following milestones have passed their target due dates: {overdueTasks.map(t => t.title).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {totalTasks}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Planned milestones</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {completedTasks}
          </p>
          <p className="text-[11px] text-[#6B7D73]">{progressPercent}% progress</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {inProgressTasks}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Active operations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Days Until Event
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {getDaysUntil(event.date)}
          </p>
          <p className="text-[11px] text-[#6B7D73]">{formatDate(event.date)}</p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1B3B2B]">Preparation Readiness</span>
          <span className="font-mono font-bold text-[#1B3B2B]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#EAE4D7] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#1B3B2B] h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm overflow-hidden p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
              Milestone Checklist ({filteredTasks.length})
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C9B92] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B] focus:outline-none focus:ring-1 focus:ring-[#1B3B2B] w-48 sm:w-56"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="divide-y divide-[#F0EBE3]">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C9B92]">
                No tasks match your selected criteria.
              </div>
            ) : (
              filteredTasks.map(task => {
                const days = getDaysUntil(task.dueDate);
                const isOverdue = days < 0 && task.status !== 'completed';
                const isComplete = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`py-3 px-2 flex items-start justify-between gap-3 transition-colors ${
                      isComplete ? 'opacity-60 bg-[#FAF8F5]/50' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className="mt-0.5 text-[#1B3B2B] hover:text-[#142B20] transition-colors shrink-0"
                      >
                        {isComplete ? (
                          <CheckSquare className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <Square className="w-5 h-5 text-[#8C9B92]" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-xs font-semibold ${
                              isComplete ? 'line-through text-[#6B7D73]' : 'text-[#1B3B2B]'
                            }`}
                          >
                            {task.title}
                          </p>
                          <span className="text-[10px] text-[#6B7D73] bg-[#F2EDE4] px-1.5 py-0.5 rounded">
                            {task.category}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase ${
                              task.priority === 'urgent'
                                ? 'text-red-700'
                                : task.priority === 'high'
                                ? 'text-amber-700'
                                : 'text-[#6B7D73]'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-[#52635A] line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-[11px] text-[#6B7D73] pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
                              Due: {formatDate(task.dueDate)} ({days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`})
                            </span>
                          </span>

                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-[#8C9B92] hover:text-red-600 transition-colors shrink-0"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
              {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-[#F2EDE4] rounded-lg text-[#1B3B2B]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-[#F2EDE4] rounded-lg text-[#1B3B2B]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#E8E2D8] rounded-xl overflow-hidden text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-[#FAF8F5] py-2 text-center font-semibold text-[#6B7D73]">
                {d}
              </div>
            ))}

            {blanksArray.map(b => (
              <div key={`blank-${b}`} className="bg-[#FAF8F5]/30 min-h-[90px] p-1.5" />
            ))}

            {daysArray.map(dayNum => {
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.dueDate === dayStr);
              const isEventDay = event.date === dayStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`bg-white min-h-[90px] p-1.5 space-y-1 transition-colors ${
                    isEventDay ? 'bg-amber-50/50 border-2 border-[#C5A859]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-medium ${isEventDay ? 'text-[#1B3B2B] font-bold' : 'text-[#6B7D73]'}`}>
                      {dayNum}
                    </span>
                    {isEventDay && (
                      <span className="text-[9px] font-bold uppercase text-[#C5A859]">Event Day</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTaskStatus(t)}
                        className={`p-1 rounded text-[10px] leading-tight cursor-pointer truncate ${
                          t.status === 'completed'
                            ? 'bg-[#F2EDE4] text-[#6B7D73] line-through'
                            : t.priority === 'urgent'
                            ? 'bg-red-100 text-red-900 font-semibold'
                            : 'bg-[#EAE4D7] text-[#1B3B2B] font-medium'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">Add New Task</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm floral arrangements and centerpieces"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, items to inspect, questions to ask..."
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Guests">Guests & RSVP</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Attire">Attire & Styling</option>
                    <option value="Coordination">Coordination</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g. Maya / Coordinator"
                    value={taskForm.assignee}
                    onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A5750] hover:bg-[#F2EDE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
