import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';
import WhoWeAreContent from './WhoWeAreContent';

export const metadata: Metadata = {
  title: `Who We Are | ${siteConfig.companyName}`,
  description: `Learn about ${siteConfig.companyName}, our mission, vision, and engineering capabilities.`,
};

export default function AboutPage() {
  return <WhoWeAreContent />;
}
