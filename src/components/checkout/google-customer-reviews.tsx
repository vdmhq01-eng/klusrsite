"use client";

import Script from "next/script";

/**
 * Google Customer Reviews — opt-in survey op de bedankpagina. Vraagt de klant
 * (na akkoord) om later een review te geven via Google. merchant_id is het
 * Google Merchant Center-id van KLUSR.
 *
 * We definiëren `renderOptIn` én injecteren daarna pas platform.js, zodat de
 * `onload`-callback de functie gegarandeerd kan vinden.
 */
const MERCHANT_ID = 5809145685;

export function GoogleCustomerReviews({
  orderId,
  email,
  country,
  deliveryDate,
}: {
  orderId: string;
  email: string;
  country: string;
  deliveryDate: string;
}) {
  const optIn = {
    merchant_id: MERCHANT_ID,
    order_id: orderId,
    email,
    delivery_country: country,
    estimated_delivery_date: deliveryDate,
  };

  return (
    <Script
      id="google-customer-reviews"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.renderOptIn = function () {
            window.gapi.load('surveyoptin', function () {
              window.gapi.surveyoptin.render(${JSON.stringify(optIn)});
            });
          };
          (function () {
            var s = document.createElement('script');
            s.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
            s.async = true;
            s.defer = true;
            document.head.appendChild(s);
          })();
        `,
      }}
    />
  );
}
