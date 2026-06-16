type IconProps = {
  name:
    | 'arrow-left'
    | 'arrow-right'
    | 'camera'
    | 'check'
    | 'copy'
    | 'filter'
    | 'gift'
    | 'heart'
    | 'info'
    | 'mail'
    | 'log-out'
    | 'moon'
    | 'plus'
    | 'search'
    | 'share'
    | 'sun'
    | 'trash'
    | 'user'
  className?: string
}

const paths: Record<IconProps['name'], string> = {
  'arrow-left': 'M19 12H5m0 0 6 6m-6-6 6-6',
  'arrow-right': 'M5 12h14m0 0-6-6m6 6-6 6',
  camera:
    'M4 8h3l1.5-2h7L17 8h3v10H4V8Zm8 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6-11v3',
  check: 'm5 12 4 4L19 6',
  copy: 'M8 8h10v12H8V8Zm-4 8V4h10',
  filter: 'M4 7h16M7 12h10M10 17h4',
  gift:
    'M20 12v8H4v-8m16 0H4m16 0V8H4v4m8-4v12m0-12H8.5A2.5 2.5 0 1 1 12 5.7m0 2.3h3.5A2.5 2.5 0 1 0 12 5.7',
  heart:
    'M20.5 8.5c0 5.4-8.5 10-8.5 10s-8.5-4.6-8.5-10A4.6 4.6 0 0 1 12 5a4.6 4.6 0 0 1 8.5 3.5Z',
  info: 'M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  mail:
    'M4 6h16v12H4V6Zm0 1 8 6 8-6',
  'log-out': 'M15 3h4v18h-4M10 17l5-5-5-5m5 5H3',
  moon:
    'M21 14.4A8.2 8.2 0 0 1 9.6 3 7 7 0 1 0 21 14.4Z',
  plus: 'M12 5v14m7-7H5',
  search: 'm21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z',
  share:
    'M18 8a3 3 0 1 0-2.8-4M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM8.7 8.7l6.6-3.4M8.7 15.3l6.6 3.4',
  sun:
    'M12 4V2m0 20v-2m8-8h2M2 12h2m14.4-6.4 1.4-1.4M4.2 19.8l1.4-1.4m0-12.8L4.2 4.2m15.6 15.6-1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  trash:
    'M5 7h14m-9 4v6m4-6v6M9 7V5h6v2m2 0-.8 13H7.8L7 7',
  user:
    'M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
}

function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? 'h-5 w-5'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d={paths[name]} />
    </svg>
  )
}

export default Icon
