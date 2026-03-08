-- ══════════════════════════════════════════════════════════
-- IntelAfrica — Supabase Schema (clean, no errors)
-- HOW TO USE:
--   1. Go to supabase.com → your project → SQL Editor
--   2. Clear everything in the editor
--   3. Paste this entire file
--   4. Click Run
-- ══════════════════════════════════════════════════════════

-- Drop table if it exists so we start fresh
drop table if exists companies cascade;

-- Create the companies table
create table companies (
  id                    bigserial primary key,
  slug                  text unique not null,
  name                  text not null,
  domain                text,
  linkedin_url          text,
  crunchbase_permalink  text,
  meta_page_id          text,
  industry              text,
  location              text,
  founded               int,
  employees             int,
  revenue               text,
  revenue_num           numeric,
  growth                int,
  score                 int default 70,
  website               text,
  company_desc          text,
  parent                text,

  -- LinkedIn data (filled by backend via Proxycurl)
  employee_count        int,
  follower_count        int,
  headquarters          text,
  founded_year          int,

  -- Traffic data (filled by backend via DataForSEO)
  monthly_visits        bigint,
  global_rank           int,
  country_rank          int,

  -- Funding data (filled by backend via Crunchbase)
  total_funding_usd     bigint,
  last_funding_type     text,
  last_funding_date     date,
  num_funding_rounds    int,
  revenue_range         text,

  -- Meta Ads data (filled by backend via Meta API)
  active_ad_count       int default 0,
  meta_ads              jsonb,

  -- Timestamps for each data source
  linkedin_updated_at   timestamptz,
  traffic_updated_at    timestamptz,
  crunchbase_updated_at timestamptz,
  meta_ads_updated_at   timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Auto-update updated_at whenever a row changes
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at
  before update on companies
  for each row execute procedure update_updated_at();

-- Allow anyone to read (your frontend needs this)
alter table companies enable row level security;

create policy "Public read"
  on companies for select
  using (true);

create policy "Service write"
  on companies for all
  using (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════
-- Seed data — 12 Nigerian companies to start
-- ══════════════════════════════════════════════════════════
insert into companies (
  slug, name, domain, linkedin_url, crunchbase_permalink,
  industry, location, founded, employees,
  revenue, revenue_num, growth, score, website, company_desc
) values
  (
    'flutterwave', 'Flutterwave', 'flutterwave.com',
    'https://www.linkedin.com/company/flutterwave', 'flutterwave',
    'Fintech', 'Lagos', 2016, 900,
    '₦18.7B', 18.7, 31, 92, 'flutterwave.com',
    'Pan-African payment infrastructure powering commerce across 34+ African countries.'
  ),
  (
    'paystack', 'Paystack', 'paystack.com',
    'https://www.linkedin.com/company/paystack', 'paystack',
    'Fintech', 'Lagos', 2015, 600,
    '₦11.2B', 11.2, 22, 89, 'paystack.com',
    'Online payment processing platform acquired by Stripe. Trusted by 60,000+ businesses.'
  ),
  (
    'moniepoint', 'Moniepoint', 'moniepoint.com',
    'https://www.linkedin.com/company/moniepoint', 'moniepoint',
    'Fintech', 'Lagos', 2019, 1600,
    '₦14.8B', 14.8, 52, 91, 'moniepoint.com',
    'Business banking platform serving SMEs with POS terminals and working capital loans.'
  ),
  (
    'opay', 'OPay', 'opayweb.com',
    'https://www.linkedin.com/company/opay', 'opay',
    'Fintech', 'Lagos', 2018, 1400,
    '₦22.3B', 22.3, 45, 95, 'opayweb.com',
    'Super-app combining mobile money, payments and financial services.'
  ),
  (
    'kuda-bank', 'Kuda Bank', 'kuda.com',
    'https://www.linkedin.com/company/kuda-bank', 'kuda-bank',
    'Fintech', 'Lagos', 2019, 480,
    '₦7.2B', 7.2, 29, 82, 'kuda.com',
    'Nigeria first full-service digital bank with zero COT fees.'
  ),
  (
    'palmpay', 'PalmPay', 'palmpay.com',
    'https://www.linkedin.com/company/palmpay', 'palmpay',
    'Fintech', 'Lagos', 2019, 820,
    '₦9.4B', 9.4, 38, 84, 'palmpay.com',
    'Digital wallet and neobank with 35M+ registered users across Nigeria.'
  ),
  (
    'jumia', 'Jumia Nigeria', 'jumia.com.ng',
    'https://www.linkedin.com/company/jumia', 'jumia',
    'E-Commerce', 'Lagos', 2012, 4200,
    '₦12.4B', 12.4, 14, 87, 'jumia.com.ng',
    'Africa leading e-commerce platform listing millions of products. Listed on NYSE.'
  ),
  (
    'konga', 'Konga', 'konga.com',
    'https://www.linkedin.com/company/konga', 'konga',
    'E-Commerce', 'Lagos', 2012, 2100,
    '₦8.1B', 8.1, 9, 74, 'konga.com',
    'Nigeria largest online and offline retail marketplace for electronics and fashion.'
  ),
  (
    'gig-logistics', 'GIG Logistics', 'giglogistics.com',
    'https://www.linkedin.com/company/giglogistics', 'gig-logistics',
    'Logistics & Delivery', 'Lagos', 2012, 3400,
    '₦22B', 22, 17, 81, 'giglogistics.com',
    'Tech-enabled logistics and haulage with coverage across all 36 Nigerian states.'
  ),
  (
    'helium-health', 'Helium Health', 'heliumhealth.com',
    'https://www.linkedin.com/company/helium-health', 'helium-health',
    'Healthtech', 'Lagos', 2016, 280,
    '₦5.8B', 5.8, 41, 82, 'heliumhealth.com',
    'Hospital management software built for African healthcare providers.'
  ),
  (
    'andela', 'Andela', 'andela.com',
    'https://www.linkedin.com/company/andela', 'andela',
    'Edtech', 'Lagos', 2014, 1800,
    '₦14.2B', 14.2, 22, 86, 'andela.com',
    'Tech talent training and placement connecting African engineers to global companies.'
  ),
  (
    'bolt-nigeria', 'Bolt Nigeria', 'bolt.eu',
    'https://www.linkedin.com/company/bolt-eu', 'bolt',
    'Transportation & Mobility', 'Lagos', 2016, 320,
    '₦9.6B', 9.6, 19, 81, 'bolt.eu',
    'Ride-hailing and mobility platform operating across major Nigerian cities.'
  );
