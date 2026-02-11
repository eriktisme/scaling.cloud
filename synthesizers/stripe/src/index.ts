import Stripe from 'stripe'

const secretKey =
  process.env.STRIPE_SECRET_KEY ||
  (() => {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  })()

const stripe = new Stripe(secretKey)

interface Price {
  unit_amount: number
  currency: 'eur'
  interval: 'month' | 'year'
}

const createPrice = async (
  accountId: string,
  productId: string,
  price: Price
) => {
  const stripePrice = await stripe.prices.create(
    {
      product: productId,
      unit_amount: price.unit_amount,
      currency: price.currency,
      recurring: {
        interval: price.interval,
      },
    },
    {
      stripeAccount: accountId,
    }
  )

  return stripePrice.id
}

const createProduct = async (accountId: string, name: string) => {
  const product = await stripe.products.create(
    {
      name,
    },
    {
      stripeAccount: accountId,
    }
  )

  return product.id
}

const createPaymentSource = async (
  accountId: string,
  customerId: string,
  params: Stripe.CustomerCreateSourceParams
) => {
  const paymentMethod = await stripe.customers.createSource(
    customerId,
    params,
    {
      stripeAccount: accountId,
    }
  )

  return paymentMethod.id
}

const createCustomer = async (
  accountId: string,
  params: Stripe.CustomerCreateParams
) => {
  const customer = await stripe.customers.create(params, {
    stripeAccount: accountId,
  })

  return customer.id
}

const createSubscription = async (
  accountId: string,
  params: Stripe.SubscriptionCreateParams
) => {
  const subscription = await stripe.subscriptions.create(params, {
    stripeAccount: accountId,
  })

  return subscription.id
}

const createAccount = async () => {
  const account = await stripe.accounts.create({
    type: 'express',
  })

  return account.id
}

const createSyntheticData = async () => {
  const accountId = await createAccount()

  const productId = await createProduct(accountId, 'Pro Plan')

  const priceId = await createPrice(accountId, productId, {
    unit_amount: 2000,
    currency: 'eur',
    interval: 'month',
  })

  const customerId = await createCustomer(accountId, {
    email: 'john@example.org',
    name: 'John Doe',
  })

  await createPaymentSource(accountId, customerId, {
    source: 'tok_visa', // Use a test token provided by Stripe
  })

  await createSubscription(accountId, {
    customer: customerId,
    items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
  })

  console.log('Synthetic data created successfully')
}

;(() => {
  void createSyntheticData()
})()
