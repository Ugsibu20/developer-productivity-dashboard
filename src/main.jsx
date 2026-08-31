import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell, CalendarDays, CheckCircle2, ChevronDown, CircleDot, Clock3,
  FolderKanban, LayoutDashboard, Menu, MoreHorizontal, Moon, Plus,
  Search, Settings, Sparkles, Sun, Target, Trash2, Users, X, Pencil,
  GripVertical, BarChart3
} from "lucide-react";
import "./styles.css";

const seedProjects = [
  { id: 1, name: "Portfolio Website", description: "Personal portfolio and case studies", color: "purple" },
  { id: 2, name: "E-commerce API", description: "REST API for products and orders", color: "blue" },
  { id: 3, name: "Mobile App UI", description: "Design system and mobile screens", color: "orange" }
];

const seedTasks = [
  { id: 1, title: "Finish responsive navbar", project: "Portfolio Website", status: "In Progress", priority: "High", due: "2026-08-28", assignee: "CS" },
  { id: 2, title: "Create product endpoints", project: "E-commerce API", status: "Todo", priority: "Medium", due: "2026-08-29", assignee: "AK" },
  { id: 3, title: "Review mobile wireframes", project: "Mobile App UI", status: "Done", priority: "Low", due: "2026-08-29", assignee: "SR" },
  { id: 4, title: "Write API documentation", project: "E-commerce API", status: "In Progress", priority: "Medium", due: "2026-08-30", assignee: "CS" },
  { id: 5, title: "Optimize image assets", project: "Portfolio Website", status: "Todo", priority: "Low", due: "2026-09-01", assignee: "RM" },
  { id: 6, title: "Team review meeting", project: "Mobile App UI", status: "Todo", priority: "Medium", due: "2026-08-31", assignee: "SR" }
];

const team = [
  { n: "Chandra Sekhar", r: "Developer", a: "CS" },
  { n: "Ananya Kumar", r: "Backend Developer", a: "AK" },
  { n: "Swagatika Rout", r: "UI Designer", a: "SR" },
  { n: "Ravindra Mohanty", r: "Full Stack Developer", a: "RM" }
];

const navItems = [
  ["Dashboard", LayoutDashboard], ["Projects", FolderKanban], ["My Tasks", CircleDot],
  ["Calendar", CalendarDays], ["Team", Users], ["Goals", Target], ["Settings", Settings]
];

function load(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [tasks, setTasks] = useState(() => load("devflow_tasks", seedTasks));
  const [projects] = useState(seedProjects);
  const [theme, setTheme] = useState(() => load("devflow_theme", "light"));
  const [modal, setModal] = useState(null);
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => localStorage.setItem("devflow_tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("devflow_theme", JSON.stringify(theme)), [theme]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    const text = `${t.title} ${t.project} ${t.assignee}`.toLowerCase();
    return text.includes(search.toLowerCase()) &&
      (filter === "All" || t.status === filter) &&
      (priorityFilter === "All" || t.priority === priorityFilter);
  }), [tasks, search, filter, priorityFilter]);

  const completed = tasks.filter(t => t.status === "Done").length;
  const active = tasks.filter(t => t.status !== "Done").length;
  const projectProgress = projects.map(p => {
    const pt = tasks.filter(t => t.project === p.name);
    return { ...p, total: pt.length, done: pt.filter(t => t.status === "Done").length, progress: pt.length ? Math.round(pt.filter(t => t.status === "Done").length / pt.length * 100) : 0 };
  });

  const go = (name) => { setPage(name); setSidebarOpen(false); };

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "Done" ? "Todo" : "Done" } : t));
  }
  function saveTask(form) {
    if (!form.title.trim()) return;
    const payload = { ...form, title: form.title.trim(), id: form.id || Date.now() };
    setTasks(prev => form.id ? prev.map(t => t.id === form.id ? payload : t) : [payload, ...prev]);
    setModal(null);
  }
  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }
  function moveTask(id, status) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  return (
    <div className={`app ${theme === "dark" ? "dark-theme" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={18}/></div><span>DevFlow</span><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={20}/></button></div>
        <div className="workspace"><div className="avatar avatar-purple">CS</div><div><strong>Chandra's Workspace</strong><span>Personal workspace</span></div><ChevronDown size={16}/></div>
        <nav>{navItems.slice(0,5).map(([label, Icon]) => <NavItem key={label} label={label} icon={<Icon size={18}/>} active={page === label} onClick={() => go(label)}/>)}</nav>
        <div className="nav-section">Workspace</div>
        <nav>{navItems.slice(5).map(([label, Icon]) => <NavItem key={label} label={label} icon={<Icon size={18}/>} active={page === label} onClick={() => go(label)}/>)}</nav>
        <div className="sidebar-bottom"><div className="upgrade"><div className="upgrade-icon"><Sparkles size={16}/></div><strong>Keep shipping</strong><p>You're making great progress this week.</p><div className="mini-progress"><span style={{width: `${Math.min(100, Math.round(completed / Math.max(tasks.length,1) * 100))}%`}}/></div><small>{completed}/{tasks.length} tasks completed</small></div></div>
      </aside>
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}/>} 
      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22}/></button>
          <div className="top-search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, tasks and people..."/><kbd>⌘ K</kbd></div>
          <div className="top-actions"><button className="icon-btn" title="Notifications"><Bell size={19}/><span className="notification-dot"/></button><button className="icon-btn" title="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={19}/> : <Moon size={19}/>}</button><div className="user-chip"><div className="avatar avatar-purple">CS</div><div className="user-text"><strong>Chandra Sekhar</strong><span>Developer</span></div><ChevronDown size={16}/></div></div>
        </header>
        <div className="content">
          {page === "Dashboard" && <Dashboard tasks={tasks} projects={projectProgress} completed={completed} active={active} onNew={() => setModal({mode:"create"})} onGo={go} search={search} filter={filter} setFilter={setFilter} onToggle={toggleTask}/>} 
          {page === "Projects" && <Projects projects={projectProgress} onNew={() => setModal({mode:"create"})} tasks={tasks}/>} 
          {page === "My Tasks" && <TaskManager tasks={filteredTasks} allTasks={tasks} filter={filter} setFilter={setFilter} priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter} onNew={() => setModal({mode:"create"})} onEdit={t => setModal({mode:"edit", task:t})} onDelete={removeTask} onToggle={toggleTask} onMove={moveTask} draggedId={draggedId} setDraggedId={setDraggedId}/>} 
          {page === "Calendar" && <Calendar tasks={tasks}/>} 
          {page === "Team" && <TeamPage tasks={tasks}/>} 
          {page === "Goals" && <Goals tasks={tasks}/>} 
          {page === "Settings" && <SettingsPage theme={theme} setTheme={setTheme}/>} 
        </div>
      </main>
      {modal && <TaskModal mode={modal.mode} task={modal.task} projects={projects} onClose={() => setModal(null)} onSave={saveTask}/>} 
    </div>
  );
}

function NavItem({icon,label,active,onClick}) { return <button onClick={onClick} className={`nav-item ${active ? "active" : ""}`}>{icon}<span>{label}</span></button>; }

function Dashboard({tasks,projects,completed,active,onNew,onGo,search,filter,setFilter,onToggle}) {
  const productivity = Math.round(completed / Math.max(tasks.length,1) * 100);
  return <>
    <section className="hero"><div><div className="eyebrow">Friday, August 28, 2026</div><h1>Good morning, Chandra <span>👋</span></h1><p>Here's what's happening across your projects today.</p></div><button className="primary-btn" onClick={onNew}><Plus size={18}/> New task</button></section>
    <section className="stats-grid"><StatCard icon={<FolderKanban size={19}/>} label="Total projects" value={projects.length} change="+2" note="this month"/><StatCard icon={<CircleDot size={19}/>} label="Active tasks" value={active} change="+6" note="this week"/><StatCard icon={<CheckCircle2 size={19}/>} label="Completed" value={completed} change="+14" note="this month"/><StatCard icon={<Clock3 size={19}/>} label="Productivity" value={`${productivity}%`} change="+8%" note="completion rate"/></section>
    <section className="analytics-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h2>Weekly productivity</h2><p>Completed tasks by day</p></div><BarChart3 size={19}/></div><div className="bar-chart">{[42,65,48,78,92,61,36].map((v,i)=><div className="bar-col" key={i}><div className="bar"><span style={{height:`${v}%`}}/></div><small>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</small></div>)}</div></div><div className="panel focus-panel"><div className="panel-heading"><div><h2>Today's focus</h2><p>Your daily productivity target.</p></div><Sparkles size={18}/></div><div className="focus-circle"><div className="circle-inner"><strong>{Math.min(6, 1 + completed * .6).toFixed(1)}h</strong><span>of 6h</span></div></div><div className="focus-progress"><span style={{width:`${Math.min(100, 25 + completed * 9)}%`}}/></div><div className="focus-labels"><span>Focus progress</span><span>Keep going</span></div></div></section>
    <div className="section-heading"><div><h2>Your projects</h2><p>Track progress across your active work.</p></div><button className="text-btn" onClick={() => onGo("Projects")}>View all →</button></div>
    <section className="projects-grid">{projects.map(p => <ProjectCard key={p.id} project={p}/>)}</section>
    <section className="lower-grid"><div className="panel"><div className="panel-heading"><div><h2>My tasks</h2><p>{search ? `Results for “${search}”` : "Stay on top of your most important work."}</p></div><div className="filters">{["All","Todo","In Progress","Done"].map(f=><button key={f} className={`filter ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>)}</div></div><div className="task-list">{tasks.filter(t=>filter==="All"||t.status===filter).slice(0,6).map(t=><TaskRow key={t.id} task={t} onToggle={onToggle}/>)}</div></div><div className="panel tip-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Jump into your workflow.</p></div></div><button className="quick-action" onClick={onNew}><Plus size={17}/><span><strong>Create a task</strong><small>Add work to your board</small></span></button><button className="quick-action" onClick={() => onGo("My Tasks")}><CircleDot size={17}/><span><strong>Open Kanban board</strong><small>Move tasks between stages</small></span></button><button className="quick-action" onClick={() => onGo("Calendar")}><CalendarDays size={17}/><span><strong>View calendar</strong><small>Check upcoming deadlines</small></span></button></div></section>
  </>;
}

function Projects({projects,onNew,tasks}) { return <section className="page-section"><div className="page-hero"><div><div className="eyebrow">Workspace</div><h1>Projects</h1><p>Manage active projects and track completion progress.</p></div><button className="primary-btn" onClick={onNew}><Plus size={18}/> New task</button></div><div className="projects-grid">{projects.map(p=><ProjectCard key={p.id} project={p} detailed tasks={tasks}/>)}</div></section>; }

function ProjectCard({project,detailed}) { return <article className="project-card"><div className="project-top"><div className={`project-icon ${project.color}`}><FolderKanban size={20}/></div><button className="more-btn"><MoreHorizontal size={19}/></button></div><h3>{project.name}</h3><p>{project.description}</p><div className="progress-row"><span>Progress</span><strong>{project.progress}%</strong></div><div className="progress"><span className={project.color} style={{width:`${project.progress}%`}}/></div><div className="project-footer"><span>{project.done}/{project.total} tasks</span><div className="member-stack"><span>CS</span><span>AK</span><span>+2</span></div></div>{detailed && <div className="project-meta"><span>{project.progress >= 70 ? "On track" : "Needs attention"}</span><span>{project.total} total tasks</span></div>}</article>; }

function TaskManager({tasks,allTasks,filter,setFilter,priorityFilter,setPriorityFilter,onNew,onEdit,onDelete,onToggle,onMove,draggedId,setDraggedId}) {
  const statuses = ["Todo","In Progress","Done"];
  return <section className="page-section"><div className="page-hero"><div><div className="eyebrow">Workspace</div><h1>My Tasks</h1><p>Search, filter and organize your work with the Kanban board.</p></div><button className="primary-btn" onClick={onNew}><Plus size={18}/> New task</button></div>
    <div className="task-toolbar"><div className="toolbar-search"><Search size={17}/><span>{tasks.length} of {allTasks.length} tasks shown</span></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Todo</option><option>In Progress</option><option>Done</option></select><select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div>
    <div className="kanban">{statuses.map(status => <div className="kanban-column" key={status} onDragOver={e=>e.preventDefault()} onDrop={()=>draggedId && onMove(draggedId,status)}><div className="kanban-head"><div><h3>{status}</h3><span>{tasks.filter(t=>t.status===status).length} tasks</span></div><span className="column-count">{tasks.filter(t=>t.status===status).length}</span></div><div className="kanban-list">{tasks.filter(t=>t.status===status).map(task=><div className="kanban-card" key={task.id} draggable onDragStart={()=>setDraggedId(task.id)} onDragEnd={()=>setDraggedId(null)}><div className="drag-handle"><GripVertical size={15}/></div><div className="kanban-main"><strong>{task.title}</strong><small>{task.project}</small><div className="kanban-tags"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><span className="due">{formatDate(task.due)}</span></div></div><div className="task-actions"><button title="Complete/reopen" onClick={()=>onToggle(task.id)}><CheckCircle2 size={16}/></button><button title="Edit" onClick={()=>onEdit(task)}><Pencil size={15}/></button><button title="Delete" onClick={()=>onDelete(task.id)}><Trash2 size={15}/></button></div></div>)}{tasks.filter(t=>t.status===status).length===0&&<div className="column-empty">Drop tasks here</div>}</div></div>)}</div>
  </section>;
}

function TaskRow({task,onToggle}) { return <div className="task-row"><button className={`check ${task.status === "Done" ? "done" : ""}`} onClick={()=>onToggle(task.id)}>{task.status === "Done" ? <CheckCircle2 size={18}/> : <span/>}</button><div className="task-main"><strong>{task.title}</strong><span>{task.project}</span></div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><span className={`status ${task.status.toLowerCase().replace(" ","-")}`}>{task.status}</span><span className="due">{formatDate(task.due)}</span><div className="avatar avatar-small">{task.assignee}</div><button className="more-btn"><MoreHorizontal size={18}/></button></div>; }

function Calendar({tasks}) { const groups = [...tasks].sort((a,b)=>a.due.localeCompare(b.due)); return <section className="page-section"><div className="page-hero"><div><div className="eyebrow">Schedule</div><h1>Calendar</h1><p>Upcoming deadlines and planned work.</p></div></div><div className="calendar-header"><CalendarDays size={18}/><strong>August – September 2026</strong><span>{groups.filter(t=>t.status!=="Done").length} upcoming tasks</span></div><div className="calendar-grid">{groups.map(t=><div className={`calendar-card ${t.status === "Done" ? "calendar-done" : ""}`} key={t.id}><div className="calendar-day">{formatDate(t.due)}</div><h3>{t.title}</h3><span>{t.project}</span><div className="calendar-bottom"><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span><span>{t.status}</span></div></div>)}</div></section>; }

function TeamPage({tasks}) { return <section className="page-section"><div className="page-hero"><div><div className="eyebrow">Workspace</div><h1>Team</h1><p>See who's working on what across your projects.</p></div></div><div className="team-grid">{team.map(m=><div className="team-card" key={m.a}><div className="avatar avatar-purple">{m.a}</div><div><h3>{m.n}</h3><p>{m.r}</p><span>{tasks.filter(t=>t.assignee===m.a&&t.status!=="Done").length} active tasks</span></div></div>)}</div></section>; }

function Goals({tasks}) { const done=tasks.filter(t=>t.status==="Done").length; return <section className="page-section"><div className="page-hero"><div><div className="eyebrow">Workspace</div><h1>Goals</h1><p>Track measurable productivity targets.</p></div></div><div className="goal-grid"><Goal icon={<Target size={22}/>} title="Weekly productivity" text="Complete 10 tasks this week." percent={Math.min(100,done*10)}/><Goal icon={<Clock3 size={22}/>} title="Focused work" text="Reach 40 focused hours this month." percent={81}/><Goal icon={<BarChart3 size={22}/>} title="Project delivery" text="Keep active projects on track." percent={Math.round(tasks.filter(t=>t.status!=="Todo").length/Math.max(tasks.length,1)*100)}/></div></section>; }
function Goal({icon,title,text,percent}) { return <div className="goal-card">{icon}<h3>{title}</h3><p>{text}</p><div className="progress"><span style={{width:`${percent}%`}}/></div><strong>{percent}% complete</strong></div>; }

function SettingsPage({theme,setTheme}) { return <section className="page-section"><div className="page-hero"><div><div className="eyebrow">Workspace</div><h1>Settings</h1><p>Customize your dashboard experience.</p></div></div><div className="settings-card"><label>Workspace name<input defaultValue="Chandra's Workspace"/></label><label>Email notifications<select defaultValue="Daily summary"><option>Daily summary</option><option>Important only</option><option>Off</option></select></label><label>Theme<select value={theme === "dark" ? "Dark" : "Light"} onChange={e=>setTheme(e.target.value.toLowerCase())}><option>Light</option><option>Dark</option></select></label><div className="settings-theme-buttons"><button className={theme!=="dark"?"selected":""} onClick={()=>setTheme("light")}><Sun size={17}/> Light mode</button><button className={theme==="dark"?"selected":""} onClick={()=>setTheme("dark")}><Moon size={17}/> Dark mode</button></div><button className="primary-btn save-btn" onClick={()=>alert("Settings saved successfully!")}>Save changes</button></div></section>; }

function TaskModal({mode,task,projects,onClose,onSave}) { const initial=task||{title:"",project:projects[0].name,status:"Todo",priority:"Medium",due:"2026-09-01",assignee:"CS"}; const [form,setForm]=useState(initial); const update=(k,v)=>setForm(f=>({...f,[k]:v})); return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{mode==="edit"?"Edit task":"Create a task"}</h2><p>{mode==="edit"?"Update task details.":"Add a task to your workspace."}</p></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><label>Task title<input autoFocus value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Build authentication flow"/></label><div className="form-grid"><label>Project<select value={form.project} onChange={e=>update("project",e.target.value)}>{projects.map(p=><option key={p.id}>{p.name}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e=>update("priority",e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></label><label>Status<select value={form.status} onChange={e=>update("status",e.target.value)}><option>Todo</option><option>In Progress</option><option>Done</option></select></label><label>Due date<input type="date" value={form.due} onChange={e=>update("due",e.target.value)}/></label></div><label>Assignee<select value={form.assignee} onChange={e=>update("assignee",e.target.value)}>{team.map(m=><option key={m.a} value={m.a}>{m.n} ({m.a})</option>)}</select></label><div className="modal-actions"><button className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" onClick={()=>onSave(form)}>{mode==="edit"?"Save changes":"Create task"}</button></div></div></div>; }

function StatCard({icon,label,value,change,note}) { return <div className="stat-card"><div className="stat-top"><div className="stat-icon">{icon}</div><span className="stat-change">{change}</span></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-note">{note}</div></div>; }
function formatDate(value) { if (!value) return "No date"; return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {month:"short", day:"numeric"}); }

createRoot(document.getElementById("root")).render(<App/>);
