import { useIsMobile } from '../../hooks/useIsMobile'
import MobileShell from './MobileShell'
import DesktopShell from './DesktopShell'

export default function AppShell({ basePath = '/sala' }) {
  const isMobile = useIsMobile()
  return isMobile ? <MobileShell basePath={basePath} /> : <DesktopShell basePath={basePath} />
}
