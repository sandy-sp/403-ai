import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - 403 AI',
  description:
    'Learn how 403 AI collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy - 403 AI',
    description:
      'Learn how 403 AI collects, uses, and protects your personal information.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-text-secondary">
              Last updated: October 31, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-invert max-w-none">
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-text-secondary leading-relaxed">
                At 403 AI ("we," "our," or "us"), we respect your privacy and
                are committed to protecting your personal information. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our website and use
                our services.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Information We Collect
              </h2>
              <h3 className="text-xl font-semibold mb-3 text-accent-cyan">
                Personal Information
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide
                to us when you:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Register for an account</li>
                <li>Subscribe to our newsletter</li>
                <li>Comment on blog posts</li>
                <li>Contact us via email</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Profile picture (optional)</li>
                <li>Bio (optional)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-accent-cyan">
                Automatically Collected Information
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                When you visit our website, we automatically collect certain
                information about your device, including:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                How We Use Your Information
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>Provide, operate, and maintain our services</li>
                <li>Improve and personalize your experience</li>
                <li>Send you newsletters and updates (with your consent)</li>
                <li>Respond to your comments and questions</li>
                <li>Send you administrative information and updates</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Analyze usage patterns and improve our content</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                How We Share Your Information
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information in the following
                circumstances:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>
                  <strong>Service Providers:</strong> We may share information
                  with third-party service providers who perform services on our
                  behalf (e.g., email delivery, hosting, analytics)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information if required by law or in response to valid legal
                  requests
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger,
                  acquisition, or sale of assets, your information may be
                  transferred
                </li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-text-secondary leading-relaxed">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
                These measures include:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track
                activity on our website and store certain information. Cookies
                are small data files stored on your device. You can instruct
                your browser to refuse all cookies or to indicate when a cookie
                is being sent.
              </p>
              <p className="text-text-secondary leading-relaxed">
                We use cookies for:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                <li>Authentication and session management</li>
                <li>Remembering your preferences</li>
                <li>Analytics and performance monitoring</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Depending on your location, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing
                  communications
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data
                  in a portable format
                </li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Third-Party Services
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Our website may contain links to third-party websites and
                services. We are not responsible for the privacy practices of
                these third parties. We encourage you to read their privacy
                policies.
              </p>
              <p className="text-text-secondary leading-relaxed">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                <li>Cloudinary (image hosting and optimization)</li>
                <li>Resend (email delivery)</li>
                <li>Vercel (hosting and analytics)</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-text-secondary leading-relaxed">
                Our services are not intended for children under the age of 13.
                We do not knowingly collect personal information from children
                under 13. If you believe we have collected information from a
                child under 13, please contact us immediately.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <p className="text-text-secondary">
                Email:{' '}
                <a
                  href="mailto:privacy@403-ai.com"
                  className="text-accent-cyan hover:underline"
                >
                  privacy@403-ai.com
                </a>
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-accent-cyan hover:text-accent-cyan/80"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
