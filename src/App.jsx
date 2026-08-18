import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('vicweb_tasks')
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Design Glassmorphism Dashboard UI', status: 'todo', priority: 'High', dueDate: '' },
      { id: 2, title: 'Configure Vite & React environment', status: 'in-progress', priority: 'Medium', dueDate: '' },
      { id: 3, title: 'Deploy VicWeb project to Vercel', status: 'done', priority: 'Low', dueDate: '' },
    ]
  })

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('vicweb_theme') || 'dark')
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  useEffect(() => {
    localStorage.setItem('vicweb_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('vicweb_theme', theme)
    document.body.className = theme === 'light' ? 'light-theme' : ''
  }, [theme])

  // --- Sound Effect Helper ---
  const playCompletionChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()

      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, now)
      osc2.frequency.setValueAtTime(659.25, now + 0.1)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.1)
      osc1.stop(now + 0.4)
      osc2.stop(now + 0.4)
    } catch (err) {
      console.log('Audio error:', err)
    }
  }

  // --- Notification Helper ---
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.')
      return
    }
    const permission = await Notification.requestPermission()
    setNotifPermission(permission)
    if (permission === 'granted') {
      new Notification('VicWeb Workspace 🚀', {
        body: 'Notifications active! You will get updates when tasks are completed or added.',
      })
    }
  }

  const sendNotification = (title, message) => {
    if (notifPermission === 'granted') {
      new Notification(title, { body: message })
    }
  }

  // --- Task Operations ---
  const handleAddTask = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const newTask = {
      id: Date.now(),
      title,
      status: 'todo',
      priority,
      dueDate,
    }

    setTasks([newTask, ...tasks])
    setTitle('')
    setDueDate('')
    sendNotification('New Task Added 🎯', `"${title}" was added to your workspace.`)
  }

  const moveTask = (id, newStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        if (newStatus === 'done') {
          playCompletionChime()
          sendNotification('Task Completed! ✨', `Great job finishing "${task.title}"!`)
        }
        return { ...task, status: newStatus }
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const getPriorityClass = (p) => {
    if (p === 'High') return 'badge-high'
    if (p === 'Medium') return 'badge-medium'
    return 'badge-low'
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'todo', title: 'To Do', icon: '🎯' },
    { key: 'in-progress', title: 'In Progress', icon: '⚡' },
    { key: 'done', title: 'Completed', icon: '✨' },
  ]

  return (
    <div className="pb-5">
      {/* Header */}
      <nav className="navbar navbar-dark glass-card px-4 py-3 mb-4 rounded-0 border-top-0 border-start-0 border-end-0">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-3">🚀</span>
            <div>
              <h5 className="fw-bold text-white mb-0">VicWeb</h5>
              <small className="text-secondary">Project Workspace</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-sm glass-card text-white px-3 py-2 fw-semibold"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* Notification Toggle Button */}
            <button
              onClick={requestNotificationPermission}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${
                notifPermission === 'granted'
                  ? 'btn-outline-success border-0 bg-success bg-opacity-25 text-success'
                  : 'btn-outline-warning'
              }`}
            >
              {notifPermission === 'granted' ? '🔔 Reminders Active' : '🔔 Enable Reminders'}
            </button>

            <input
              type="text"
              className="form-control glass-input form-control-sm px-3 py-2"
              placeholder="🔍 Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Quick Add Form with Reminder Date */}
        <div className="glass-card p-3 mb-4">
          <form onSubmit={handleAddTask} className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control glass-input py-2"
                placeholder="What are we building next?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Date Reminder Picker */}
            <div className="col-md-3">
              <input
                type="date"
                className="form-control glass-input py-2"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Priority Pills */}
            <div className="col-md-2 d-flex gap-1 justify-content-center">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm px-2 rounded-pill fw-semibold border-0 ${
                    priority === p
                      ? p === 'High'
                        ? 'badge-high'
                        : p === 'Medium'
                        ? 'badge-medium'
                        : 'badge-low'
                      : 'glass-card text-secondary'
                  }`}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="col-md-2">
              <button
                type="submit"
                className="btn w-100 py-2 fw-bold text-white"
                style={{ background: '#6366f1' }}
              >
                + Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Board Columns */}
        <div className="row g-4">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.key)
            return (
              <div key={col.key} className="col-md-4">
                <div className="glass-column p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                    <h6 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                      <span>{col.icon}</span> {col.title}
                    </h6>
                    <span className="badge glass-card text-white px-2 py-1">
                      {columnTasks.length}
                    </span>
                  </div>

                  {columnTasks.map((task) => (
                    <div key={task.id} className="glass-item p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className={`badge rounded-pill px-2 py-1 fw-semibold ${getPriorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button
                          className="btn-close btn-close-white shadow-none"
                          style={{ fontSize: '0.65rem' }}
                          onClick={() => deleteTask(task.id)}
                        ></button>
                      </div>

                      <p className="fw-medium text-white mb-2 fs-6">{task.title}</p>

                      {/* Reminder Badge */}
                      {task.dueDate && (
                        <div className="mb-3">
                          <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 fw-normal">
                            📅 Due: {task.dueDate}
                          </span>
                        </div>
                      )}

                      <div className="d-flex justify-content-end gap-1 pt-2 border-top border-secondary border-opacity-25">
                        {task.status !== 'todo' && (
                          <button
                            className="btn btn-sm btn-outline-light py-1 px-2 opacity-75"
                            onClick={() =>
                              moveTask(
                                task.id,
                                task.status === 'done' ? 'in-progress' : 'todo'
                              )
                            }
                          >
                            ← Back
                          </button>
                        )}
                        {task.status !== 'done' && (
                          <button
                            className="btn btn-sm btn-primary py-1 px-2 fw-medium"
                            style={{ background: '#6366f1', borderColor: '#6366f1' }}
                            onClick={() =>
                              moveTask(
                                task.id,
                                task.status === 'todo' ? 'in-progress' : 'done'
                              )
                            }
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-5 text-secondary opacity-50">
                      <small>No tasks found</small>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App