# Inventory Monitor (MVP)

A lightweight Shopify inventory monitoring tool built with Next.js (App Router) and TypeScript.

This project demonstrates:

- Shopify OAuth integration (Admin API)

- Secure token exchange on the backend

- Storing access tokens in Supabase

- Basic inventory threshold monitoring UI

- Deployment to Netlify

## Tech Stack

- Next.js (App Router)

- TypeScript

- Supabase (Postgres + server-side storage)

- Shopify Admin API

- Netlify deployment

## Features

- Connect a Shopify store via OAuth

- Securely exchange authorization code for an Admin API access token

- Store access tokens server-side in Supabase

- Mock product inventory dashboard

- Threshold-based stock alerts

- Dark / Light mode toggle

## How It Works

1. OAuth Flow

User enters their Shopify store domain.

/api/shopify/install redirects to Shopify’s OAuth authorization screen.

After approval, Shopify redirects to /api/shopify/callback.

The callback route:

Exchanges the authorization code for an access_token

Stores { shop, access_token } in Supabase

Redirects back to the dashboard with a connection banner

This uses Shopify’s Authorization Code Grant Flow.

2. Backend Architecture

Built using Next.js App Router:

app/api/shopify/install → Starts OAuth

app/api/shopify/callback → Exchanges token + stores in DB

Supabase → Stores connected shop tokens securely

Environment variables managed via Netlify

All sensitive logic runs server-side in API routes.

## Environment Variables

Required environment variables:

SHOPIFY_API_KEY
SHOPIFY_API_SECRET
APP_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

These are configured in Netlify.

## Current MVP Scope

This version focuses on:

- Working OAuth flow

- Secure backend token exchange

- Basic inventory UI with thresholds

- Foundation for polling Shopify inventory

## Future Improvements

**Planned enhancements:**

- Fetch real product inventory from Shopify API

- Poll inventory periodically

- Email notifications when stock falls below threshold

- Observability / logging layer

## Purpose of Project

This project was built to:

Practice full-stack integration with a real-world API

Demonstrate understanding of OAuth flows

Deploy a Next.js application
