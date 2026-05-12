import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros | MPE SYSTEM',
  description: 'Conoce más sobre MPE SYSTEM, nuestra misión, visión y el equipo humano detrás de la mejor gestión de trámites vehiculares en el Meta.',
};

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
