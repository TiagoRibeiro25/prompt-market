# Prompt Market

## Description

This project was built primarily as a learning exercise to deeply understand and integrate **Clerk** (for authentication and user management) and **Stripe** (for payments, checkout, and webhook handling) within a modern **Next.js** application. 

It serves as a fully functional marketplace where users can browse, buy, and sell AI prompts (for ChatGPT, Midjourney, Claude, etc.), demonstrating how to handle secure user sessions, protected routes, database synchronization via webhooks, and complex payment flows.

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) (React, App Router, Server Actions)
- **Authentication:** [Clerk](https://clerk.com/) (OAuth, Webhooks, Protected Routes)
- **Payments:** [Stripe](https://stripe.com/) (Checkout Sessions, Webhooks)
- **Database:** PostgreSQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript

## Features

- **Robust Authentication:** Seamless sign-up and sign-in experiences managed by Clerk, with user data synced to the local database via Clerk webhooks.
- **Secure Checkout:** Purchasing prompts uses Stripe Checkout Sessions, handling both free and paid digital products.
- **Instant Access:** Purchased prompts are immediately unlocked and available in the user's dashboard, with order fulfillment handled securely via Stripe webhooks and success page verifications.
- **Seller Dashboard:** Users can create, edit, and manage their own prompts to sell on the marketplace.
- **Admin Management:** Dedicated admin roles and dashboards for managing users, prompts, and reviews.

## Screenshots

<img src="images/screenshot%201.png" alt="Screenshot 1" width="800">
<img src="images/screenshot%202.png" alt="Screenshot 2" width="800">
<img src="images/screenshot%203.png" alt="Screenshot 3" width="800">
