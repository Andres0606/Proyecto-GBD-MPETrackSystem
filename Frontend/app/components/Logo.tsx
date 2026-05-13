import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <div 
      className={className}
      style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      <Image 
        src="/logo.png" 
        alt="MPE SYSTEM Logo" 
        width={size} 
        height={size} 
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
