
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskPriority, TaskStatus, User } from '../types';
import { mockStore } from '../services/mockStore';
import { Modal } from '../components/Modal';
import { 
  Plus, Search, Filter, Calendar, AlertCircle, CheckCircle2, 
  Clock, Trash2, ChevronDown, SortAsc, LayoutList, X, AlertTriangle, SortDesc
} from 'lucide-react';

export const Tasks: React.FC<{ user: User }> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO
  });

  useEffect(() => {
    setTasks(mockStore.getTasks(user.id));
    const unsub = mockStore.subscribe((ev) => {
      if (ev.type.startsWith('TASK_')) {
        setTasks(mockStore.getTasks(user.id));
      }
    });
    return () => unsub();
  }, [user.id]);

  const filteredTasks = tasks
    .filter(t => (filterStatus === 'ALL' || t.status === filterStatus))
    .filter(t => (filterPriority === 'ALL' || t.priority === filterPriority))
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
    });

  const handleAddTask = () => {
    if (!newTask.title) return;
    mockStore.addTask({ ...newTask, userId: user.id });
    setIsAddModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO
    });
  };

  const confirmDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const executeDelete = () => {
    if (taskToDelete) {
      mockStore.deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const toggleStatus = (task: Task) => {
    const nextStatus = task.status === TaskStatus.TODO 
      ? TaskStatus.IN_PROGRESS 
      : task.status === TaskStatus.IN_PROGRESS 
        ? TaskStatus.COMPLETED 
        : TaskStatus.TODO;
    mockStore.updateTask(task.id, { status: nextStatus });
  };

  return (
    <div className="p-6 pb-32 bg-[#0B0E11] min-h-screen text-white font-inter">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Operations</h2>
          <p className="text-[10px] font-black text-[#A3ACB9] uppercase tracking-widest mt-1">Node Task Management</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 bg-[#3DF2C4] text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(61,242,196,0.2)] active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Control Bar */}
      <section className="space-y-4 mb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           <div className="flex items-center gap-2 bg-[#141821] border border-white/5 p-3 rounded-xl">
             <Filter size={12} className="text-[#3DF2C4]" />
             <select 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value as any)}
               className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
             >
               <option value="ALL">All Status</option>
               <option value={TaskStatus.TODO}>Todo</option>
               <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
               <option value={TaskStatus.COMPLETED}>Completed</option>
             </select>
           </div>
           
           <div className="flex items-center gap-2 bg-[#141821] border border-white/5 p-3 rounded-xl">
             <AlertCircle size={12} className="text-[#3DF2C4]" />
             <select 
               value={filterPriority} 
               onChange={(e) => setFilterPriority(e.target.value as any)}
               className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
             >
               <option value="ALL">All Priority</option>
               <option value={TaskPriority.LOW}>Low</option>
               <option value={TaskPriority.MEDIUM}>Medium</option>
               <option value={TaskPriority.HIGH}>High</option>
             </select>
           </div>

           <div className="flex items-center gap-2 bg-[#3DF2C4]/10 border border-[#3DF2C4]/20 p-3 rounded-xl">
             {sortBy === 'dueDate' ? <Clock size={12} className="text-[#3DF2C4]" /> : <SortDesc size={12} className="text-[#3DF2C4]" />}
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-[#3DF2C4]"
             >
               <option value="dueDate">Sort: Date</option>
               <option value="priority">Sort: Weight</option>
             </select>
           </div>
        </div>
      </section>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 opacity-20">
            <LayoutList size={64} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No matching operations</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <motion.div 
              layout
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[2rem] bg-[#141821] border border-white/5 flex items-start gap-4 transition-all ${task.status === TaskStatus.COMPLETED ? 'opacity-40 grayscale' : ''}`}
            >
              <button 
                onClick={() => toggleStatus(task)}
                className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  task.status === TaskStatus.COMPLETED ? 'bg-[#3DF2C4] border-[#3DF2C4]' : 'border-white/10'
                }`}
              >
                {task.status === TaskStatus.COMPLETED && <CheckCircle2 size={14} className="text-black" />}
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h4 className={`font-black uppercase tracking-tight ${task.status === TaskStatus.COMPLETED ? 'line-through' : ''}`}>{task.title}</h4>
                   <button onClick={() => confirmDelete(task.id)} className="text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
                <p className="text-xs text-[#A3ACB9] mt-1 mb-4">{task.description}</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#A3ACB9]" />
                    <span className="text-[9px] font-bold text-[#A3ACB9] uppercase">{task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === TaskPriority.HIGH ? 'bg-red-500' : task.priority === TaskPriority.MEDIUM ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                    <span className="text-[9px] font-bold text-[#A3ACB9] uppercase">{task.priority}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Node Task">
        <div className="space-y-6 text-white p-2">
          <input 
            className="w-full bg-black/20 p-4 rounded-xl border border-white/5 outline-none focus:border-[#3DF2C4]" 
            placeholder="Operation Title" 
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
          />
          <textarea 
            className="w-full bg-black/20 p-4 rounded-xl border border-white/5 outline-none focus:border-[#3DF2C4] min-h-[100px]" 
            placeholder="Operational Details"
            value={newTask.description}
            onChange={e => setNewTask({...newTask, description: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-white/30 ml-2">Due Protocol Date</label>
              <input 
                type="date"
                className="w-full bg-black/20 p-4 rounded-xl border border-white/5 outline-none"
                value={newTask.dueDate}
                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-white/30 ml-2">Urgency Tier</label>
              <select 
                className="w-full bg-black/20 p-4 rounded-xl border border-white/5 outline-none font-black uppercase text-[10px]"
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleAddTask}
            className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            Deploy Task
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#141821] w-full max-w-xs rounded-[3rem] border border-white/10 p-10 text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Purge Operation?</h3>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-8 leading-relaxed">This node task will be permanently purged from the system kernel.</p>
              
              <div className="space-y-3">
                <button onClick={executeDelete} className="w-full bg-red-500 text-white p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">Confirm Purge</button>
                <button onClick={() => setTaskToDelete(null)} className="w-full bg-white/5 text-white/30 p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">Abort</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
