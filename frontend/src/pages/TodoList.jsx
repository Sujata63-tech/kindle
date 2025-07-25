import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  CheckSquare, 
  Square, 
  Edit3, 
  Trash2, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { api } from '../utils/api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTodos();
  }, [filter]);

  const fetchTodos = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.todos.getAll(params);
      setTodos(response.data.todos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await api.todos.update(editingTodo.id, formData);
      } else {
        await api.todos.create(formData);
      }
      
      setShowModal(false);
      setEditingTodo(null);
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchTodos();
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleToggleStatus = async (todo) => {
    try {
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      await api.todos.update(todo.id, { status: newStatus });
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await api.todos.delete(id);
        fetchTodos();
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-beige-100 text-beige-800 border-beige-200';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    return todo.status === filter;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-beige-900">Todo Lists</h1>
          <p className="text-beige-600">Manage and organize your tasks</p>
        </div>
        
        <button
          onClick={() => {
            setEditingTodo(null);
            setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
            setShowModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Todo
        </button>
      </div>

      {/* Filters */}
      <div className="card-dreamy p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-beige-500" />
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All Tasks' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-rosegold-500 text-white'
                    : 'bg-beige-100 text-beige-700 hover:bg-beige-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500 mx-auto"></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="card-dreamy p-8 text-center">
            <CheckSquare className="w-12 h-12 text-beige-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-beige-600 mb-2">
              {filter === 'all' ? 'No todos yet' : `No ${filter} todos`}
            </h3>
            <p className="text-beige-500">
              {filter === 'all' 
                ? 'Create your first todo to get started' 
                : `You don't have any ${filter} todos`
              }
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`card-dreamy p-4 transition-all duration-200 ${
                todo.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleStatus(todo)}
                  className="mt-1 flex-shrink-0"
                >
                  {todo.status === 'completed' ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5 text-beige-400 hover:text-beige-600" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        todo.status === 'completed' 
                          ? 'line-through text-beige-500' 
                          : 'text-beige-900'
                      }`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`text-sm mt-1 ${
                          todo.status === 'completed' 
                            ? 'text-beige-400' 
                            : 'text-beige-600'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-2 text-beige-400 hover:text-beige-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-2 text-beige-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center space-x-4 mt-3">
                    {/* Priority */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                      {todo.priority} priority
                    </span>

                    {/* Due date */}
                    {todo.dueDate && (
                      <div className={`flex items-center space-x-1 text-xs ${
                        isOverdue(todo.dueDate) && todo.status !== 'completed'
                          ? 'text-red-600'
                          : 'text-beige-500'
                      }`}>
                        {isOverdue(todo.dueDate) && todo.status !== 'completed' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        <span>
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Created date */}
                    <div className="flex items-center space-x-1 text-xs text-beige-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-dreamy w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-beige-900 mb-4">
              {editingTodo ? 'Edit Todo' : 'Create New Todo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-dreamy"
                  placeholder="Enter todo title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-dreamy h-20 resize-none"
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-dreamy"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-dreamy"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTodo(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTodo ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
