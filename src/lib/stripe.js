// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TDzPYELocpZYQGEJPqDbaJVB4d73W3w6DlEhNXFtHH9Ft5qCtDs6jwxeqz3ch3BPEgIw4GM80ygqBejvd0A7NSu00AnArCQEA'
export const STRIPE_PRICE_ID = 'price_1TDzZIELocpZYQGEbNwBhp4d'

/**
 * Call the create-checkout-session edge function to get a Stripe checkout URL
 * @param {string} userId - The user's ID
 * @param {string} token - The Supabase auth token
 * @returns {Promise<string>} - The Stripe checkout URL
 */
export async function createCheckoutSession(userId, token) {
  try {
    const response = await fetch(
      'https://zxhgviraiiytpdjbuhpy.functions.supabase.co/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          price_id: STRIPE_PRICE_ID,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create checkout session')
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}
