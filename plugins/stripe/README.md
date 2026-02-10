# Stripe Application

This plugin allows you to create a Stripe application that is used in the Stripe Marketplace.

## Pre-requisites

1. You need to have a Stripe account. If you don't have one, you can create it [here](https://dashboard.stripe.com/register).

## Installation 

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) using the following command:

```bash
brew install stripe/stripe-cli/stripe
```

1. Authenticate the Stripe CLI with your Stripe account using the following command:

```bash
stripe login
```

1. Install [Stripe Apps](https://docs.stripe.com/stripe-apps) using the following command:

```bash
stripe plugin install apps
```

## Publish your Stripe Application

1. To publish your Stripe application, run the following command:

```bash
stripe apps upload
```
