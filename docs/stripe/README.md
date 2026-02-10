# Stripe

## Pre-requisites

1. You need to have a Stripe account. If you don't have one, you can create it [here](https://dashboard.stripe.com/register).

## Overview

This documentation section provides an overview of the Stripe integration in our application.

## Installation

1. Create a [webhook endpoint](https://docs.stripe.com/webhooks#webhooks-summary) in your Stripe dashboard to receive events from Stripe,
   and select `Listen to events on Connected accounts`.

1. Select the events you are interested in.

1. Enter the URL of your webhook endpoint.

1. Copy the webhook signing secret and set it as the value of `STRIPE_WEBHOOK_SECRET` in your `.env.local` file.
