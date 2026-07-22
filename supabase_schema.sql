-- =========================================================
-- SENDIA DATABASE SCHEMA FOR SUPABASE
-- Script SQL de création des tables et d'insertion des données initiales
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'France',
    country_code VARCHAR(10) NOT NULL DEFAULT 'FR',
    flag VARCHAR(10) NOT NULL DEFAULT '🇫🇷',
    avatar_url TEXT,
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    kyc_tier VARCHAR(50) NOT NULL DEFAULT 'TIER_1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    balance_eur NUMERIC(15, 2) NOT NULL DEFAULT 250.00,
    balance_xof NUMERIC(15, 0) NOT NULL DEFAULT 163790,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE BENEFICIARIES
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    flag VARCHAR(10) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    avatar_bg VARCHAR(50) DEFAULT 'bg-indigo-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'SEND', 'RECEIVE', 'WITHDRAW'
    title VARCHAR(255) NOT NULL,
    sender_or_recipient_name VARCHAR(255),
    sender_or_recipient_phone VARCHAR(50),
    amount_eur NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_xof NUMERIC(15, 0) NOT NULL DEFAULT 0,
    fee_eur NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    fee_xof NUMERIC(15, 0) NOT NULL DEFAULT 0,
    exchange_rate NUMERIC(10, 2) NOT NULL DEFAULT 655.00,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    genius_pay_ref VARCHAR(100),
    payment_method VARCHAR(100),
    formatted_date VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE PAYMENT_METHODS
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'card', 'bank', 'mobile_money'
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLE KYC_DOCUMENTS
CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_recto_url TEXT,
    selfie_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE ROW LEVEL SECURITY FOR INITIAL DEMO ACCESS (OR GRANT ALL)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents DISABLE ROW LEVEL SECURITY;

-- =========================================================
-- INSERTION DES DONNÉES DE DÉPART (VRAIS UTILISATEURS ET WALLETS)
-- =========================================================

-- Utilisateur Principal : Joakim Azomedon
INSERT INTO public.users (id, name, phone, email, country, country_code, flag, kyc_status, kyc_tier)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Joakim Azomedon',
    '+33 6 12 34 56 78',
    'joakim.azomedon@example.com',
    'France',
    'FR',
    '🇫🇷',
    'VERIFIED',
    'TIER_1'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Wallet de Joakim (Solde initial 250,00 € = 163 790 XOF)
INSERT INTO public.wallets (id, user_id, balance_eur, balance_xof)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    250.00,
    163790
) ON CONFLICT (id) DO NOTHING;

-- Bénéficiaires enregistrés pour Joakim
INSERT INTO public.beneficiaries (id, user_id, name, phone, country, country_code, flag, operator, avatar_bg)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Papa', '+228 90 12 34 56', 'Togo', 'TG', '🇹🇬', 'Flooz', 'bg-blue-500'),
    ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mama', '+228 91 23 45 67', 'Togo', 'TG', '🇹🇬', 'T-Money', 'bg-emerald-500'),
    ('c3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Aïcha', '+225 07 89 01 23', 'Côte d''Ivoire', 'CI', '🇨🇮', 'Orange Money', 'bg-amber-500'),
    ('c4444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'David', '+228 98 76 54 32', 'Togo', 'TG', '🇹🇬', 'Flooz', 'bg-purple-500')
ON CONFLICT (id) DO NOTHING;

-- Historique Réel des Transactions
INSERT INTO public.transactions (id, user_id, type, title, sender_or_recipient_name, sender_or_recipient_phone, amount_eur, amount_xof, fee_eur, fee_xof, exchange_rate, status, genius_pay_ref, payment_method, formatted_date)
VALUES 
    ('SDN-124578965', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'RECEIVE', 'Reçu de Mama', 'Mama', '+228 91 23 45 67', 150.00, 98250, 0.00, 0, 655.00, 'COMPLETED', 'GPAY-8849302', 'Wallet Sendia', 'Aujourd''hui, 10:30'),
    ('WD-45879632', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'WITHDRAW', 'Retrait Flooz', 'Mon compte Flooz', '+228 90 12 34 56', 76.34, 50000, 0.76, 500, 655.00, 'COMPLETED', 'GPAY-WD-99120', 'Flooz (+228 90 12 34 56)', 'Hier, 15:20'),
    ('SDN-99881234', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SEND', 'Envoyé à Papa', 'Papa', '+228 90 12 34 56', 100.00, 65500, 1.00, 655, 655.00, 'COMPLETED', 'GPAY-7729103', 'Carte bancaire', '11 mai 2024'),
    ('SDN-77319201', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SEND', 'Frais de service', 'Sendia Platform', NULL, 2.00, 1310, 0.00, 0, 655.00, 'COMPLETED', 'GPAY-SYS-112', 'System', '8 mai 2024'),
    ('SDN-55410928', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'RECEIVE', 'Reçu de David', 'David', '+228 98 76 54 32', 80.00, 52400, 0.00, 0, 655.00, 'COMPLETED', 'GPAY-5519283', 'Wallet Sendia', '8 mai 2024'),
    ('SDN-33109281', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SEND', 'Envoyé à Aïcha', 'Aïcha', '+225 07 89 01 23', 60.00, 39300, 1.00, 655, 655.00, 'COMPLETED', 'GPAY-3310928', 'Carte bancaire', '7 mai 2024')
ON CONFLICT (id) DO NOTHING;
