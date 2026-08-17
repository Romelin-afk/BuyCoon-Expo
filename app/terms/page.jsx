'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => router.back()}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <h1 style={{ fontFamily: 'var(--f-dis)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Terms & Conditions
        </h1>
        <p style={{ fontSize: 13, color: 'var(--tx-3)', marginBottom: 28 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 14, lineHeight: 1.7, color: 'var(--tx-2)' }}>
          <Section title="1. Eligibility">
            You must be at least 18 years old to create an account and use BuyCoon!. By registering,
            you confirm that the age you provided is accurate.
          </Section>

          <Section title="2. Account Responsibility">
            You are responsible for maintaining the confidentiality of your password and for all
            activity that occurs under your account. Notify us immediately of any unauthorized use.
          </Section>

          <Section title="3. Listings & Transactions">
            Sellers are responsible for the accuracy of their listings (title, price, condition,
            photos). BuyCoon! acts only as a platform connecting buyers and sellers — it does not
            own, inspect, or guarantee any item listed.
          </Section>

          <Section title="4. Payments">
            Digital payments (Yappy, card, PayPal), cash-in-person, and trade transactions are
            coordinated directly between buyer and seller. BuyCoon! provides confirmation tools
            (QR codes) but is not a party to the payment itself.
          </Section>

          <Section title="5. Prohibited Items & Conduct">
            You may not list illegal, stolen, counterfeit, or dangerous items. Harassment, fraud,
            and misrepresentation of products are strictly prohibited and may result in account
            suspension.
          </Section>

          <Section title="6. Privacy">
            We collect the minimum data necessary to operate the marketplace (name, email, age,
            location for listings). We do not sell your personal data to third parties.
          </Section>

          <Section title="7. Changes to These Terms">
            We may update these terms from time to time. Continued use of BuyCoon! after changes
            means you accept the updated terms.
          </Section>

          <Section title="8. Contact">
            Questions about these terms? Reach out through the Help & Support section in your
            profile.
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--f-dis)', fontSize: 16, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>
        {title}
      </h2>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}