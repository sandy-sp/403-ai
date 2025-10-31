'use client';

import { Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  slug: string;
}

export function SocialShare({ title, slug }: SocialShareProps) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.403-ai.com'}/blog/${slug}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-secondary mb-3">Share this post:</h3>
      <div className="flex items-center gap-3">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-secondary-light rounded-lg hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors"
          title="Share on Twitter"
        >
          <Twitter size={20} />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-secondary-light rounded-lg hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors"
          title="Share on LinkedIn"
        >
          <Linkedin size={20} />
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-secondary-light rounded-lg hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors"
          title="Share on Facebook"
        >
          <Facebook size={20} />
        </a>
        <button
          onClick={copyLink}
          className="p-3 bg-secondary-light rounded-lg hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors"
          title="Copy link"
        >
          <LinkIcon size={20} />
        </button>
      </div>
    </div>
  );
}
