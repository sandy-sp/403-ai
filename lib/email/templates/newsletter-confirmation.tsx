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

interface NewsletterConfirmationEmailProps {
  confirmLink: string;
}

export const NewsletterConfirmationEmail = ({
  confirmLink,
}: NewsletterConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirm your 403 AI newsletter subscription</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Confirm Your Subscription</Heading>
          <Text style={text}>
            Thank you for subscribing to the 403 AI newsletter!
          </Text>
          <Text style={text}>
            To complete your subscription and start receiving updates about AI
            research, discussions, and news, please confirm your email address
            by clicking the button below:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmLink}>
              Confirm Subscription
            </Button>
          </Section>
          <Text style={text}>
            Once confirmed, you'll receive our latest content directly in your
            inbox.
          </Text>
          <Text style={text}>
            If you didn't subscribe to this newsletter, you can safely ignore
            this email.
          </Text>
          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Link href={confirmLink} style={link}>
            {confirmLink}
          </Link>
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

export default NewsletterConfirmationEmail;

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

const link = {
  color: '#00FFD1',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#B0B3C1',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
  borderTop: '1px solid #2A2F4A',
  paddingTop: '24px',
};
