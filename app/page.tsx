import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: siteConfig.companyTagline
    ? `${siteConfig.companyName} | ${siteConfig.companyTagline}`
    : siteConfig.companyName,
  description: siteConfig.companyTagline,
};

export default function Home() {
  return <HomeContent />;
}
