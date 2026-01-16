#!/bin/bash
# Script to deploy Wix Payments Edge Function
# Usage: ./deploy-function.sh YOUR_ACCESS_TOKEN YOUR_PROJECT_REF

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./deploy-function.sh YOUR_ACCESS_TOKEN YOUR_PROJECT_REF"
  echo ""
  echo "Get your access token from: https://supabase.com/dashboard/account/tokens"
  echo "Get your project ref from: Settings → General → Reference ID"
  exit 1
fi

export SUPABASE_ACCESS_TOKEN=$1
PROJECT_REF=$2

echo "Linking project..."
supabase link --project-ref $PROJECT_REF

echo "Deploying function..."
supabase functions deploy wix-payments

echo "Done! Your function should now be deployed."
