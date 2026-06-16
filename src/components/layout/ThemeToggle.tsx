import { useThemeMode } from '../../hooks/useThemeMode'
import Icon from '../ui/Icon'

function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode()

  return (
    <button
      type="button"
      className="ui-icon-button border border-[var(--color-line)] bg-[var(--color-card-soft)]"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      onClick={toggleTheme}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  )
}

export default ThemeToggle
