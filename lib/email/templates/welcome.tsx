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

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export const WelcomeEmail = ({ userName, loginUrl }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to 403 AI - Forbidden AI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to 403 AI!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Thank you for joining 403 AI - your gateway to exploring forbidden
            knowledge in artificial intelligence and machine learning.
          </Text>
          <Text style={text}>
            We're excited to have you as part of our community. Here's what you
            can do:
          </Text>
          <Section style={featureList}>
            <Text style={featureItem}>
              📚 Read cutting-edge AI research and articles
            </Text>
            <Text style={featureItem}>
              💬 Engage in discussions about controversial AI topics
            </Text>
            <Text style={featureItem}>
              📰 Stay updated with the latest AI news
            </Text>
            <Text style={featureItem}>
              ✍️ Comment on posts and share your insights
            </Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions or feedback, feel free to reach out to
            us.
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

export default WelcomeEmail;

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

const featureList = {
  backgroundColor: '#0A0E27',
  padding: '20px',
  borderRadius: '6px',
  margin: '24px 0',
};

const featureItem = {
  color: '#B0B3C1',
  fontSize: '16px',
  lineHeight: '32px',
  margin: '8px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#00FFD1',
  borderRadius: '6px',
  color: '#0A0E27',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#B0B3C1',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
  borderTop: '1px solid #2A2F4A',
  paddingTop: '24px',
};
