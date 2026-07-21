"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Download, CheckCircle, Globe, ChevronRight } from "lucide-react";

type ContentData = {
  title: string;
  intro: string[];
  devTitle: string;
  devGoalTitle: string;
  devGoals: string[];
  devTableHeaders: string[];
  devTableRows: { category: string; features: string; description: string; fee: string }[];
  devTotalTitle: string;
  devTotal: string;
  devAnnualDomain: string;
  devAnnualServer: string;
  promoTitle: string;
  promoIntro: string;
  promoGoalTitle: string;
  promoGoals: string[];
  promoTableHeaders: string[];
  promoTableRows: { category: string; deliverables: string; oneTime: string; monthly: string }[];
  promoTotals: { label: string; value: string }[];
  disclaimerTitle: string;
  disclaimers: string[];
};

const enContent: ContentData = {
  title: "Proposal for Femaslux Kitchen Appliance Digital (Online) Marketing Services",
  intro: [
    "Femaslux Kitchen Appliance is a top choice for great kitchen appliances in Addis Ababa, Ethiopia. For ten years, we've been bringing together smart Turkish technology and high-quality making to serve the Ethiopian market. We offer strong, professional appliances made to make cooking at home a better experience.",
    "The Femaslux product range includes a diverse selection of: Freestanding dual-fuel and all-electric stoves, Energy-efficient compact round ovens, Premium custom-made kitchen cabinetry systems.",
    "This document shows our price offer and a list of jobs to build a modern, fast website and online store. Further, our offer includes digital and social media advertisement offers. Our goal is to create a simple digital space with an easy-to-use product list that highlights the Femaslux brand."
  ],
  devTitle: "1. Website & Online Store Development",
  devGoalTitle: "Goal of Website and Online Store:",
  devGoals: [
    "Make Femaslux the go-to kitchen appliance brand in Ethiopia, especially in Addis Ababa.",
    "Build an easy online shop where customers and sellers can look at products and buy things easily.",
    "Put all product info in one place so anyone can quickly find details, manuals, and setup guides. Further, this product list will be used by modern auto Instagram/Facebook and Google Ads.",
    "Start a help center to talk to customers right away through Telegram or phone calls."
  ],
  devTableHeaders: ["Category", "Features/Scope", "Description", "One-Time Fee Amount (Birr)"],
  devTableRows: [
    { category: "Main Website", features: "Home Page", description: "Modern home page with hero, category, top-performing products, why us, SEO blog, showcase fams", fee: "50,000.00" },
    { category: "Main Website", features: "Product Page", description: "Amazon and Shopify-style product lists with product detail pages. Advanced product list filtering and sorting", fee: "-" },
    { category: "Main Website", features: "About Page", description: "Company profile and experience", fee: "-" },
    { category: "Main Website", features: "Contact", description: "List branches (showrooms) and the headquarters with contact details.", fee: "-" },
    { category: "Admin / Control Center", features: "Dashboard", description: "Quickly actions and view the no. of products, categories, brands, and clients.", fee: "50,000.00" },
    { category: "Admin / Control Center", features: "Manage Products", description: "Add and edit products and categories and core specs.", fee: "-" },
    { category: "Admin / Control Center", features: "Marketing", description: "Add and edit hero content, customer testimonials, and brands.", fee: "-" },
    { category: "Admin / Control Center", features: "Company Data", description: "Add and edit company profile, branches, contact details, social media links, and brand assets", fee: "-" },
    { category: "Admin / Control Center", features: "User and role", description: "Add and edit user with their roles.", fee: "-" },
    { category: "Content Preparation", features: "Website Content", description: "Create search-friendly text and marketing content.", fee: "25,000.00" },
    { category: "Content Preparation", features: "Photos", description: "Take professional product photos and edit them for the website.", fee: "-" },
    { category: "Content Preparation", features: "Video", description: "Create short product videos for social media.", fee: "-" },
    { category: "Content Preparation", features: "Prepare product data", description: "Gather product info and manuals to create detailed listings.", fee: "-" },
    { category: "Content Preparation", features: "Branding", description: "Design a simple logo and brand style.", fee: "-" },
    { category: "Contact and Social Media Automation", features: "Telegram Integration", description: "Connect Telegram for easy customer orders and support.", fee: "25,000.00" },
    { category: "Contact and Social Media Automation", features: "Google My Business Profile", description: "Set up a Google Business profile to gather customer reviews.", fee: "-" },
    { category: "Contact and Social Media Automation", features: "Set up social media accounts", description: "Set up social media accounts (Instagram, Facebook, TikTok, and YouTube).", fee: "-" },
  ],
  devTotalTitle: "Total Development Net Pay(Birr)",
  devTotal: "150,000.00",
  devAnnualDomain: "Annual Domain (www.femaslux.com) Fee: USD 10",
  devAnnualServer: "Annual Server (Website Files, Images and Videos) Fee: USD 70",
  promoTitle: "2. Digital Promotion",
  promoIntro: "We provide comprehensive digital promotion services to elevate Femaslux's online presence across platforms like Instagram, Facebook, and Google. Our strategy also incorporates influencer marketing on TikTok (noting that influencer collaboration fees are covered separately by Femaslux).",
  promoGoalTitle: "Objectives:",
  promoGoals: [
    "Establish Femaslux as the premier kitchen appliance brand in Addis Ababa and the broader Ethiopian market.",
    "Acquire new customers through high-impact, targeted digital advertising campaigns.",
    "Cultivate a loyal customer base by building meaningful engagement and brand community.",
    "Maintain direct, real-time communication channels with customers to ensure excellent service and support."
  ],
  promoTableHeaders: ["Platform Category", "Service Deliverables", "One-Time Fee", "Monthly"],
  promoTableRows: [
    { category: "Meta Ads (Instagram & Facebook)", deliverables: "Comprehensive target audience profiling and segmentation. Professional ad account configuration and optimization. Main ad design (image and Video) Execution and real-time monitoring of conversion-focused campaigns. Post Photos and Videos (8 images/photos per month and 2 videos per months) Daily community engagement and audience response management. Remark: Meta Ads Fee will be covered by the client (Femaslux), which is USD 75-100 per month.", oneTime: "20,000.00", monthly: "10,000.00" },
    { category: "Google Ads Ecosystem", deliverables: "Search Engine Marketing (SEM) & AI-driven search placement. Local SEO optimization via Google Maps and Business Profile. YouTube video and display banner ad management. Performance tracking and detailed monthly analytics reporting. Remark: The Google Ads fee will be covered by the client (Femaslux), which is USD 75-100 per month.", oneTime: "20,000.00", monthly: "10,000.00" },
    { category: "TikTok Marketing", deliverables: "Creative direction for short-form product showcases (3 videos/month). Strategic influencer casting and partnership management. TikTok-specific ad strategy design and community building. Remark: Our service and price do not include direct video advertisement on TikTok, including TikTokers' videos.", oneTime: "10,000.00", monthly: "0" },
    { category: "Content Development", deliverables: "One Full-Day Photoshoot (iPhone)", oneTime: "25,000.00", monthly: "5000.00" },
    { category: "Content Development", deliverables: "One Full-Day Video Shoot (iPhone)", oneTime: "-", monthly: "-" },
    { category: "Content Development", deliverables: "Editing and designing photos and Videos (iPhone)", oneTime: "-", monthly: "-" },
  ],
  promoTotals: [
    { label: "Total Net Pay", value: "One-Time: 75,000.00 | Monthly: 25,000.00" },
    { label: "On-time Service Net Payment", value: "75,000.00" },
    { label: "Monthly Service Net Payment", value: "25,000.00" },
    { label: "Meta and Google Payment (Estimated)", value: "USD 150 - USD 200" },
  ],
  disclaimerTitle: "Important Exclusions",
  disclaimers: [
    "Domain and server fees are not included in the development price and will be paid by the client directly.",
    "Meta and Google Ads payments (advertising budget) are not included in our service fee and will be paid directly by the client."
  ]
};

const amContent: ContentData = {
  title: "የፌመስላክስ (Femaslux) ኪቼን እቃዎች ዲጂታል (ኦንላይን) ማርኬትንግ አገልግሎት",
  intro: [
    "ፌመስላክስ ኪቼን እቃዎች በአዲስ አበባ፣ ኢትዮጵያ ለጥራት ወጥ ኪቼን እቃዎች ቀዳሚ ምርጫ ነው። ለአስር አመታት የቱርክን ዘመናዊ ቴክኖሎጂ እና ከፍተኛ ጥራት ያለው ምርት በማጣመር ለኢትዮጵያ ገበያ እያቀረብን እንገኛለን። በቤት ውስጥ የምግብ ዝግጅትን የተሻለ ተሞክሮ ለማድረግ የተሰሩ ጠንካራ እና ሙያዊ ኪቼን እቃዎችን እናቀርባለን።",
    "የፌመስላክስ የምርት ክልል የሚከተሉትን ያጠቃልላል(ለአሁኑ)፦ ነፃ (Freestanding) የሆኑ የጋዝ እና የኤሌክትሪክ ምድጃዎች፣ ሃይል ቆጣቢ እና የታመቁ ክብ ምድጃዎች (ovens)፣ ከፍተኛ ጥራት ያላቸው እና በደንበኛ ፍላጎት መሰረት የሚሰሩ ኪቼን ካቢኔት።",
    "ይህ ሰነድ ዘመናዊ እና ፈጣን ድረ-ገጽ ከኦንላይን መደብር ጋር ለመገንባት እና ማህበራዊ ሚድያ ማስታወቅቂያ ለመስራት የሚያስፈልገውን የዋጋ ዝርዝር እና የስራ ዝርዝር ያሳያል። በተጨማሪም፣ የዲጂታል እና ማህበራዊ ሚዲያ ማስታወቂያ ጥያቄዎቻችንን ያካትታል። ግባችን የፌመስላክስ ብራንድን የሚያጎላ እና በቀላሉ ጥቅም ላይ ሊውል የሚችል የምርት ዝርዝር ያለው ቀላል ዲጂታል ቦታ መፍጠር ነው።"
  ],
  devTitle: "1. የድረ-ገጽ እና ኦንላይን መደብር ልማት",
  devGoalTitle: "የድረ-ገጽ እና ኦንላይን መደብር ግብ፡",
  devGoals: [
    "ፌመስላክስ በኢትዮጵያ፣ በተለይም በአዲስ አበባ ተመራጭ ኪቼን እቃ ብራንድ እንዲሆን ማድረግ።",
    "ደንበኞች እና ሻጮች ምርቶችን በቀላሉ እንዲመለከቱ እና እንዲገዙ የሚያስችል ቀላል ኦንላይን መደብር መገንባት።",
    "ሁሉንም የምርት መረጃ በአንድ ቦታ በማሰባሰብ ደንበኞች ዝርዝር መረጃዎችን፣ ማኑዋሎችን እና የማቀናበሪያ መመሪያዎችን በፍጥነት እንዲያገኙ ማድረግ። በተጨማሪም፣ ይህ የምርት ዝርዝር ለዘመናዊ የኢንስታግራም/ፌስቡክ እና ጎግል ማስታወቂያዎች ጥቅም ላይ ይውላል።",
    "በቴሌግራም ወይም በስልክ ጥሪ አማካኝነት ከደንበኞች ጋር በፍጥነት የሚገናኙበት የድጋፍ ማዕከል መክፈት።"
  ],
  devTableHeaders: ["ምድብ", "ባህሪያት/ወሰን", "መግለጫ", "የአንድ ጊዜ ክፍያ መጠን"],
  devTableRows: [
    { category: "ዋና ድረ-ገጽ", features: "መነሻ ገጽ (Home Page)", description: "ሂሮ (Hero) ምስል፣ የዕቃ ምድቦች፣ ምርጥ ምርቶች፣ ስለ እኛ ክፍል፣ የኤስኢኦ ብሎግ (SEO blog) እና የፌመስላክስ ማሳያ ያለው ዘመናዊ መነሻ ገጽ።", fee: "50,000.00" },
    { category: "ዋና ድረ-ገጽ", features: "የምርት(ዕቃ ማሳያ) ገጽ", description: "የኢ-ኮሜርስ አይነት የምርት ዝርዝሮች እና የምርት ዝርዝር ገጾች። የላቀ የምርት ማጣሪያ እና የመደርደር አማራጮች።", fee: "-" },
    { category: "ዋና ድረ-ገጽ", features: "ስለ እኛ ገጽ", description: "ፌመስላክስ መገለጫ እና ልምድ።", fee: "-" },
    { category: "ዋና ድረ-ገጽ", features: "ያግኙን ገጽ (Contact)", description: "የቅርንጫፍ (ሾውሩም) እና የዋና መስሪያ ቤት አድራሻ እና የእውቂያ ዝርዝሮች።", fee: "-" },
    { category: "አስተዳዳሪ / መቆጣጠሪያ ማዕከል", features: "ዳሽቦርድ", description: "የምርቶችን፣ ምድቦችን፣ ብራንዶችን እና ደንበኞችን ብዛት በፍጥነት ለማየት እና ለመቆጣጠር።", fee: "50,000.00" },
    { category: "አስተዳዳሪ / መቆጣጠሪያ ማዕከል", features: "ምርቶችን ማስተዳደር", description: "ምርቶችን እና ምድቦችን እንዲሁም መሰረታዊ መግለጫዎችን መጨመር እና ማረም፡፡", fee: "-" },
    { category: "አስተዳዳሪ / መቆጣጠሪያ ማዕከል", features: "ማርኬቲንግ ይዘቶች", description: "የሂሮ ይዘትን፣ የደንበኞች ምስክርነትን እና ብራንዶችን መጨመር እና ማረም፡፡", fee: "-" },
    { category: "አስተዳዳሪ / መቆጣጠሪያ ማዕከል", features: "የኩባንያ መረጃ", description: "የኩባንያውን መገለጫ፣ ቅርንጫፎች፣ የያግኙን ዝርዝሮች፣ የማህበራዊ ሚዲያ ሊንኮች እና የምርት ንብረቶችን መጨመር እና ማረም፡፡", fee: "-" },
    { category: "አስተዳዳሪ / መቆጣጠሪያ ማዕከል", features: "ተጠቃሚ እና ሚና (Uers and Role)", description: "ተጠቃሚዎችን እና የነሱን ሚናዎች መጨመር እና ማረም፡፡", fee: "-" },
    { category: "የይዘት ዝግጅት", features: "የድረ-ገጽ ይዘት", description: "ለፍለጋ ምቹ የሆኑ ጽሑፎች እና የግብይት ይዘቶች መፍጠር።", fee: "25,000.00" },
    { category: "የይዘት ዝግጅት", features: "ፎቶዎች", description: "ፕሮፌሽናል የምርት ፎቶዎችን ማንሳት እና ለድረ-ገጽ ማስተካከል።", fee: "-" },
    { category: "የይዘት ዝግጅት", features: "ቪዲዮ", description: "አጫጭር የምርት ቪዲዮዎችን መስራት።", fee: "-" },
    { category: "የይዘት ዝግጅት", features: "የምርት መረጃ ዝግጅት", description: "ዝርዝር መረጃዎችን ለመፍጠር የምርት መረጃን እና ማኑዋሎችን መሰብሰብ።", fee: "-" },
    { category: "የይዘት ዝግጅት", features: "ብራንዲንግ", description: "ቀላል አርማ (logo) እና የምርት ስታይል ዲዛይን ማድረግ።", fee: "-" },
    { category: "የእውቂያ እና ማህበራዊ ሚዲያ አውቶሜሽን", features: "የቴሌግራም ውህደት", description: "ለደንበኛ ትዕዛዝ እና ድጋፍ የቴሌግራም አገልግሎትን ማገናኘት።", fee: "25,000.00" },
    { category: "የእውቂያ እና ማህበራዊ ሚዲያ አውቶሜሽን", features: "ጎግል ቢዝነስ ፕሮፋይል", description: "የኦንላይይን ፌመስላክስ የደንበኞችን አስተያየት ለመሰብሰብ የጎግል ቢዝነስ ፕሮፋይል ማዋቀር።", fee: "-" },
    { category: "የእውቂያ እና ማህበራዊ ሚዲያ አውቶሜሽን", features: "የማህበራዊ ሚዲያ አካውንቶች ማዋቀር", description: "የማህበራዊ ሚዲያ አካውንቶችን (ኢንስታግራም፣ ፌስቡክ፣ ቲኬቶክ እና ዩቲዩብ) ማዋቀር።", fee: "-" },
  ],
  devTotalTitle: "ድምር",
  devTotal: "150,000.00",
  devAnnualDomain: "አመታዊ ዶሜን: USD 10",
  devAnnualServer: "አመታዊ ሰርቨር: USD 70",
  promoTitle: "2. ዲጂታል ማስታወቂያ (Digital Promotion)",
  promoIntro: "የፌመስላክስን ኦንላይን መገኘት እንደ ኢንስታግራም፣ ፌስቡክ እና ጎግል ባሉ መድረኮች ላይ ከፍ ለማድረግ አጠቃላይ የዲጂታል ማስታወቂያ አገልግሎቶችን እንሰጣለን። በተጨማሪም የእኛ ዲጂታል ማስታወቂያ ስትራቴጂ በቲኬቶክ ላይ በተጽዕኖ ፈጣሪዎችን (influencers) በመጠቀም ለሚደረጉ ማስታወቂያ የማስተዳደር ድጋፍ እንሰጣለን (ነገር ግን ለተጽዕኖ ፈጣሪዎች የሚከፈለው ክፍያ በቀጥታ በፌመስላክስ የሚሸፈን ይሆናል) ።",
  promoGoalTitle: "ዲጂታል ማስታወቂያ ግቦች፡",
  promoGoals: [
    "ፌመስላክስን በአዲስ አበባ እና በኢትዮጵያ ገበያ ቀዳሚ ኪቼን እቃ ብራንድ አድርጎ ማቋቋም።",
    "በከፍተኛ ተጽዕኖ ፈጣሪ እና የታለመ የዲጂታል ማስታወቂያ ዘመቻዎች አማካኝነት አዳዲስ ደንበኞችን ማግኘት።",
    "አሳታፊ እና ጠንካራ የምርት ስም ማህበረሰብ በመገንባት ታማኝ ደንበኞችን ማፍራት።",
    "ጥሩ አገልግሎት እና ድጋፍ ለመስጠት ከደንበኞች ጋር ቀጥተኛ እና ፈጣን የግንኙነት መስመሮችን መጠበቅ።"
  ],
  promoTableHeaders: ["የመድረክ ምድብ", "የአገልግሎት ዝርዝር", "የአንድ ጊዜ ክፍያ", "ወርሃዊ"],
  promoTableRows: [
    { category: "ሜታ ማስታወቂያዎች (ኢንስታግራም እና ፌስቡክ)", deliverables: "የታለመ ታዳሚ መለየት እና መተንተን። ፕሮፌሽናል የማስታወቂያ አካውንት ማዋቀር እና ማመቻቸት። ዋና ማስታወቂያ ዲዛይንና ትግበራ(ምስልና ቪድዮ) የዘመቻ አፈጻጸም እና የክትትል ስራዎች። መደባኛ አካውንት ላይ ፎቶዎችን እና ቪዲዮዎችን መለጠፍ (በወር 8 ምስሎች/ፎቶዎች እና 2 ቪዲዮዎች)። የዕለት ተዕለት የקהል ተሳትፎ እና የደንበኛ ምላሽ አስተዳደር። ማስታወሻ: የሜታ ማስታወቂያ ክፍያ በደንበኛው (ፌመስላክስ) የሚሸፈን ሲሆን ይህም በወር 75-100 ዶላር ነው።", oneTime: "20,000.00", monthly: "10,000.00" },
    { category: "የጎግል ማስታወቂያዎች", deliverables: "የፍለጋ ሞተር ግብይት (SEM) እና በአይ (AI) የሚመራ የፍለጋ ውጤቶች። በጎግል ካርታ እና ቢዝነስ ፕሮፋይል አማካኝነት የአካባቢ ፍለጋ (SEO) ማመቻቸት። የዩቲዩብ ቪዲዮ እና የባነር ማስታወቂያ አስተዳደር። የአፈጻጸም ክትትል እና ዝርዝር ወርሃዊ የትንታኔ ሪፖርት። ማስታወሻ: የጎግል ማስታወቂያ ክፍያ በደንበኛው (ፌመስላክስ`) የሚሸፈን ሲሆን ይህም በወር 75-100 ዶላር ነው።", oneTime: "20,000.00", monthly: "10,000.00" },
    { category: "ቲኬቶክ ግብይት", deliverables: "አጫጭር የምርት ማሳያ ቪዲዮዎች የፈጠራ ስራ (በወር 3 ቪዲዮዎች)። ተጽዕኖ ፈጣሪዎችን የመምረጥ፣መካታተል እና አስተዳደር ስትራቴጂ። ቲኬቶክ ላይ ያተኮረ የማስታወቂያ ስትራቴጂ እና ማህበረሰብ ግንባታ። ማስታወሻ: የእኛ አገልግሎት እና ዋጋ ቀጥተኛ የቪዲዮ ማስታወቂያዎችን (የቲኬቶክ ተጠቃሚዎች የሚሰሩትን) አያካትትም።", oneTime: "10,000.00", monthly: "0" },
    { category: "የይዘት ልማት", deliverables: "አንድ ሙሉ ቀን የፎቶ ቀረጻ (አይፎን)", oneTime: "25,000.00", monthly: "5000.00" },
    { category: "የይዘት ልማት", deliverables: "አንድ ሙሉ ቀን የቪዲዮ ቀረጻ (አይፎን)", oneTime: "-", monthly: "-" },
    { category: "የይዘት ልማት", deliverables: "ፎቶዎችን እና ቪዲዮዎችን ማስተካከል እና ዲዛይን ማድረግ (አይፎን)", oneTime: "-", monthly: "-" },
  ],
  promoTotals: [
    { label: "ጠቅላላ", value: "የአንድ ጊዜ: 75,000.00 | ወርሃዊ: 25,000.00" },
    { label: "የአንድ ጊዜ አገልግሎት የተጣራ ክፍያ", value: "75,000.00" },
    { label: "የወርሃዊ አገልግሎት የተጣራ ክፍያ", value: "25,000.00" },
    { label: "ወርሃዊ የሜታ እና ጎግል ክፍያ (ግምታዊ)", value: "150-200 ዶላር" },
  ],
  disclaimerTitle: "ጠቃሚ ማሳሰቢያ / ያልተካተቱ ክፍያዎች",
  disclaimers: [
    "የዶሜን እና ሰርቨር አመታዊ ክፍያዎች በድረ-ገጽ ልማት ዋጋ ውስጥ አልተካተቱም፤ እነዚህ ክፍያዎች በቀጥታ በደንበኛው የሚከፈሉ ይሆናሉ።",
    "የሜታ (ፌስቡክ/ኢንስታግራም) እና ጎግል ማስታወቂያ ክፍያዎች በአገልግሎት ክፍያችን ውስጥ አልተካተቱም፤ እነዚህ ክፍያዎች በቀጥታ በደንበኛው የሚከፈሉ ይሆናሉ።"
  ]
};

export default function OfferClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<"en" | "am">("en");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1234") {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Secure Proposal View
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Please enter the password to view the project proposal.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              {error && <p className="text-red-500 text-sm mt-2">Incorrect password. Please try again.</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Access Proposal
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const content = lang === "en" ? enContent : amContent;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setLang("en")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${lang === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-auto rounded-sm overflow-hidden border border-gray-200 dark:border-gray-600">
                  <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                  <clipPath id="t"><path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z"/></clipPath>
                  <g clipPath="url(#s)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                  </g>
                </svg>
                English
              </button>
              <button
                onClick={() => setLang("am")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${lang === 'am' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" className="w-5 h-auto rounded-sm overflow-hidden border border-gray-200 dark:border-gray-600">
                  <rect width="1200" height="600" fill="#DA121A"/>
                  <rect width="1200" height="400" fill="#FCDD09"/>
                  <rect width="1200" height="200" fill="#078930"/>
                  <circle cx="600" cy="300" r="120" fill="#0F47AF"/>
                  <g fill="#FCDD09" transform="translate(600,300) scale(40)">
                    <polygon points="0,-2.5 0.587,-0.691 2.377,-0.691 0.929,0.36 1.48,2.26 0,1.184 -1.48,2.26 -0.929,0.36 -2.377,-0.691 -0.587,-0.691"/>
                    <path stroke="#0F47AF" strokeWidth="0.15" d="M0,-2.5 L0,1.184 M0.587,-0.691 L-1.48,2.26 M2.377,-0.691 L-0.929,0.36 M0.929,0.36 L-2.377,-0.691 M1.48,2.26 L-0.587,-0.691" />
                  </g>
                </svg>
                አማርኛ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto px-4 mt-12 space-y-16 print:mt-0 print:space-y-8"
        >
          {/* Header Section */}
          <section className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {content.title}
            </h1>
            <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
              {content.intro.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </section>

          {/* Development Section */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700 print:shadow-none print:border-none print:p-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">1</span>
              {content.devTitle}
            </h2>
            
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-300 mb-4">{content.devGoalTitle}</h3>
              <ul className="space-y-3">
                {content.devGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    {content.devTableHeaders.map((h, idx) => (
                      <th key={idx} className="py-4 px-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {content.devTableRows.map((row, idx, arr) => {
                    const isFirst = idx === 0 || arr[idx - 1].category !== row.category;
                    const rowSpanCount = arr.filter(r => r.category === row.category).length;
                    return (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {isFirst && (
                          <td rowSpan={rowSpanCount} className="py-4 px-4 font-bold text-gray-900 dark:text-gray-200 align-top border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                            {row.category}
                          </td>
                        )}
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">{row.features}</td>
                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{row.description}</td>
                        {isFirst && (
                          <td rowSpan={rowSpanCount} className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap align-top border-l border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-right shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                            {row.fee !== "-" ? row.fee : ""}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{content.devAnnualDomain}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{content.devAnnualServer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.devTotalTitle}</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{content.devTotal}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Promotion Section */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700 print:shadow-none print:border-none print:p-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">2</span>
              {content.promoTitle}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">{content.promoIntro}</p>

            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-300 mb-4">{content.promoGoalTitle}</h3>
              <ul className="space-y-3">
                {content.promoGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    {content.promoTableHeaders.map((h, idx) => (
                      <th key={idx} className="py-4 px-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {content.promoTableRows.map((row, idx, arr) => {
                    const isFirst = idx === 0 || arr[idx - 1].category !== row.category;
                    const rowSpanCount = arr.filter(r => r.category === row.category).length;
                    return (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {isFirst && (
                          <td rowSpan={rowSpanCount} className="py-4 px-4 font-bold text-gray-900 dark:text-gray-200 align-top border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] w-48">
                            {row.category}
                          </td>
                        )}
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{row.deliverables}</td>
                        {isFirst && (
                          <>
                            <td rowSpan={rowSpanCount} className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap align-top border-l border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-right shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                              {row.oneTime !== "-" ? row.oneTime : ""}
                            </td>
                            <td rowSpan={rowSpanCount} className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap align-top border-l border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-right shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                              {row.monthly !== "-" ? row.monthly : ""}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.promoTotals.map((total, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{total.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{total.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Disclaimers Section */}
          <section className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 md:p-10 shadow-lg border border-red-100 dark:border-red-900/30 print:shadow-none print:border print:border-red-300 print:p-6 mb-10">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300">!</span>
              {content.disclaimerTitle}
            </h2>
            <ul className="space-y-3">
              {content.disclaimers.map((disclaimer, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-900 dark:text-red-200 font-medium">{disclaimer}</span>
                </li>
              ))}
            </ul>
          </section>
        </motion.div>
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
          }
          table { page-break-inside:auto }
          tr    { page-break-inside:avoid; page-break-after:auto }
          thead { display:table-header-group }
          tfoot { display:table-footer-group }
        }
      `}} />
    </div>
  );
}
