import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.companyName}`,
  description: `Get in touch with ${siteConfig.companyName} for expert solutions and support.`,
};

export default function ContactPage() {
  return <ContactContent />;
}
