import {
  LayoutDashboard,
  Bot,
  ListTodo,
  Activity,
  BarChart3,
  Puzzle,
  Settings,
  Radio,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import type { NavItem } from './AppShell'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  bridge: LayoutDashboard,
  agents: Bot,
  tasks: ListTodo,
  activity: Activity,
  usage: BarChart3,
  skills: Puzzle,
  settings: Settings,
}

function getIcon(label: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[label.toLowerCase()] ?? LayoutDashboard
}

interface MainNavProps {
  items: NavItem[]
  onNavigate?: (href: string) => void
}

function NavButton({
  item,
  onNavigate,
  collapsed,
}: {
  item: NavItem
  onNavigate?: (href: string) => void
  collapsed: boolean
}) {
  const Icon = getIcon(item.label)
  const active = item.isActive

  return (
    <button
      onClick={() => onNavigate?.(item.href)}
      title={collapsed ? item.label : undefined}
      className={[
        'w-full flex items-center gap-3 rounded-md text-sm transition-colors',
        collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
        active
          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-medium'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
      ].join(' ')}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <span style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
          {item.label}
        </span>
      )}
    </button>
  )
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mainItems = items.filter((i) => i.label.toLowerCase() !== 'settings')
  const settingsItem = items.find((i) => i.label.toLowerCase() === 'settings')

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div
        className={[
          'flex items-center border-b border-slate-200 dark:border-slate-800',
          collapsed ? 'justify-center px-0 py-4' : 'gap-2.5 px-5 py-4',
        ].join(' ')}
      >
        <Radio className="w-5 h-5 text-sky-500 shrink-0" />
        {!collapsed && (
          <span
            className="text-lg font-semibold tracking-wide text-slate-900 dark:text-white"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            USS
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className={['flex-1 py-4 space-y-0.5 overflow-y-auto', collapsed ? 'px-2' : 'px-3'].join(' ')}>
        {mainItems.map((item) => (
          <NavButton
            key={item.href}
            item={item}
            onNavigate={(href) => {
              onNavigate?.(href)
              setMobileOpen(false)
            }}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Settings */}
      {settingsItem && (
        <div
          className={[
            'border-t border-slate-200 dark:border-slate-800 py-4',
            collapsed ? 'px-2' : 'px-3',
          ].join(' ')}
        >
          <NavButton
            item={settingsItem}
            onNavigate={(href) => {
              onNavigate?.(href)
              setMobileOpen(false)
            }}
            collapsed={collapsed}
          />
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar — full width */}
      <aside className="hidden lg:flex flex-col w-56 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Tablet sidebar — icon only */}
      <aside className="hidden md:flex lg:hidden flex-col w-14 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <SidebarContent collapsed />
      </aside>

      {/* Mobile — fixed top header + dropdown menu */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-sky-500" />
            <span
              className="text-lg font-semibold tracking-wide text-slate-900 dark:text-white"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              USS
            </span>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 -mr-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 top-14 z-30 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="fixed top-14 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-3 space-y-0.5">
              {mainItems.map((item) => (
                <NavButton
                  key={item.href}
                  item={item}
                  onNavigate={(href) => {
                    onNavigate?.(href)
                    setMobileOpen(false)
                  }}
                  collapsed={false}
                />
              ))}
              {settingsItem && (
                <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-800">
                  <NavButton
                    item={settingsItem}
                    onNavigate={(href) => {
                      onNavigate?.(href)
                      setMobileOpen(false)
                    }}
                    collapsed={false}
                  />
                </div>
              )}
            </nav>
          </>
        )}
      </div>
    </>
  )
}
