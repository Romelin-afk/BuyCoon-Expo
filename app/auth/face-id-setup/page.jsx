'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FaceIDRegister from '@/components/FaceIDRegister';

export default function FaceIDSetupPage() {
  const router = useRouter();

  const markEnrolled = (enrolled) => {
    try {
      const raw = localStorage.getItem('buycoon_sim_user');
      if (raw) {
        const u = JSON.parse(raw);
        u.faceIdEnrolled = enrolled;
        u.loggedIn = true;
        localStorage.setItem('buycoon_sim_user', JSON.stringify(u));
        window.dispatchEvent(new Event('buycoon-sim-auth'));
      }
    } catch (e) {
      console.error('The user could not be saved.', e);
    }
  };

  const handleComplete = () => {
    markEnrolled(true);
    router.push('/');
  };

  const handleSkip = () => {
    markEnrolled(false);
    router.push('/');
  };

  return (
    <div className="auth-page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="bg-aura" />
      <div className="auth-card glass-strong anim-scale-in">
        <div className="auth-logo">
          <Image
            src="/logos/logo-white.png"
            alt="BuyCoon!"
            width={180}
            height={60}
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(113,107,201,0.4))' }}
          />
        </div>
        <FaceIDRegister onComplete={handleComplete} onSkip={handleSkip} />
      </div>
    </div>
  );
}