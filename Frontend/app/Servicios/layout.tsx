import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servicios | MPE SYSTEM',
  description: 'Explora nuestros 18 trámites vehiculares disponibles en el Meta: matrículas, traspasos, traslados, duplicados y más. Gestión rápida y profesional.',
};

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
