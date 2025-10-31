import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - 403 AI',
  description:
    'Read the terms and conditions for using 403 AI platform and services.',
  openGraph: {
    title: 'Terms of Service - 403 AI',
    description:
      'Read the terms and conditions for using 403 AI platform and services.',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Terms of Service
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
              <h2 className="text-2xl font-bold mb-4">
                Agreement to Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                By accessing or using 403 AI ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you disagree with
                any part of these terms, you may not access the Service.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Use of Service</h2>
              <h3 className="text-xl font-semibold mb-3 text-accent-cyan">
                Eligibility
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                You must be at least 13 years old to use this Service. By using
                the Service, you represent and warrant that you meet this age
                requirement.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-accent-cyan">
                Account Registration
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                To access certain features, you may need to create an account.
                You agree to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">User Content</h2>
              <h3 className="text-xl font-semibold mb-3 text-accent-cyan">
                Your Responsibilities
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                You are responsible for any content you post, including
                comments, articles, and other materials ("User Content"). You
                agree that your User Content will not:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Contain malicious code or viruses</li>
                <li>Harass, threaten, or harm others</li>
                <li>Contain spam or unauthorized advertising</li>
                <li>Impersonate any person or entity</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-accent-cyan">
                License to User Content
              </h3>
              <p className="text-text-secondary leading-relaxed">
                By posting User Content, you grant us a worldwide,
                non-exclusive, royalty-free license to use, reproduce, modify,
                and display your content in connection with operating the
                Service.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Intellectual Property
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                The Service and its original content (excluding User Content),
                features, and functionality are owned by 403 AI and are
                protected by international copyright, trademark, and other
                intellectual property laws.
              </p>
              <p className="text-text-secondary leading-relaxed">
                You may not:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our trademarks or branding without authorization</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Remove or alter any copyright notices</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Prohibited Activities</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                You agree not to engage in any of the following activities:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>
                  Attempting to gain unauthorized access to the Service or
                  related systems
                </li>
                <li>
                  Using automated systems (bots, scrapers) without permission
                </li>
                <li>Interfering with or disrupting the Service</li>
                <li>Collecting user information without consent</li>
                <li>Transmitting viruses or malicious code</li>
                <li>Engaging in any illegal activities</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Content Moderation</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>
                  Monitor, review, and moderate User Content at our discretion
                </li>
                <li>
                  Remove or refuse to post any User Content that violates these
                  Terms
                </li>
                <li>
                  Suspend or terminate accounts that violate these Terms
                </li>
                <li>
                  Take legal action against users who violate these Terms
                </li>
              </ul>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-text-secondary leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT
                WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
                ERROR-FREE. WE DO NOT WARRANT THE ACCURACY OR COMPLETENESS OF
                ANY CONTENT ON THE SERVICE.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Limitation of Liability
              </h2>
              <p className="text-text-secondary leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, 403 AI SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, OR
                OTHER INTANGIBLE LOSSES.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
              <p className="text-text-secondary leading-relaxed">
                You agree to indemnify and hold harmless 403 AI and its
                affiliates, officers, agents, and employees from any claims,
                damages, losses, liabilities, and expenses (including legal
                fees) arising from your use of the Service or violation of these
                Terms.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice or liability, for any
                reason, including if you breach these Terms.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Upon termination, your right to use the Service will immediately
                cease. All provisions of these Terms that by their nature should
                survive termination shall survive, including ownership
                provisions, warranty disclaimers, and limitations of liability.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
              <p className="text-text-secondary leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of the jurisdiction in which 403 AI operates,
                without regard to its conflict of law provisions.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days' notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole
                discretion.
              </p>
            </div>

            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Severability</h2>
              <p className="text-text-secondary leading-relaxed">
                If any provision of these Terms is held to be unenforceable or
                invalid, such provision will be changed and interpreted to
                accomplish the objectives of such provision to the greatest
                extent possible under applicable law, and the remaining
                provisions will continue in full force and effect.
              </p>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p className="text-text-secondary">
                Email:{' '}
                <a
                  href="mailto:legal@403-ai.com"
                  className="text-accent-cyan hover:underline"
                >
                  legal@403-ai.com
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
