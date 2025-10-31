import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CommentNotificationEmailProps {
  postTitle: string;
  postUrl: string;
  commentAuthor: string;
  commentContent: string;
  moderationUrl: string;
}

export const CommentNotificationEmail = ({
  postTitle,
  postUrl,
  commentAuthor,
  commentContent,
  moderationUrl,
}: CommentNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New comment on "{postTitle}"</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Comment Awaiting Moderation</Heading>
          <Text style={text}>
            A new comment has been posted on your blog post:
          </Text>
          <Section style={postSection}>
            <Text style={postTitle}>"{postTitle}"</Text>
            <Link href={postUrl} style={link}>
              View Post
            </Link>
          </Section>
          <Section style={commentSection}>
            <Text style={commentAuthor}>From: {commentAuthor}</Text>
            <Text style={commentContent}>{commentContent}</Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={moderationUrl}>
              Moderate Comment
            </Button>
          </Section>
          <Text style={text}>
            You can approve, mark as spam, or delete this comment from your
            admin dashboard.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The 403 AI Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CommentNotificationEmail;

const main = {
  backgroundColor: '#0A0E27',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#1A1F3A',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#00FFD1',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#B0B3C1',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const postSection = {
  backgroundColor: '#0A0E27',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
};

const postTitle = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const commentSection = {
  backgroundColor: '#0A0E27',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
  borderLeft: '4px solid #B14AED',
};

const commentAuthor = {
  color: '#B14AED',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const commentContent = {
  color: '#B0B3C1',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#B14AED',
  borderRadius: '6px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#00FFD1',
  fontSize: '14px',
  textDecoration: 'underline',
};

const footer = {
  color: '#B0B3C1',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
  borderTop: '1px solid #2A2F4A',
  paddingTop: '24px',
};
