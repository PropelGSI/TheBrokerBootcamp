export const PAYMENT = {
  gcash: {
    enabled: true,

    label: 'GCash',

    accountName: '',
    accountNumber: '',

    qrImageUrl:
      'https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/brokerbootcamp-gcash-qr.jpg.jpg',
  },

  bank: {
    enabled: true,

    label: 'GoTyme Bank',

    bankName: 'GoTyme Bank',

    accountName: '',
    accountNumber: '',

    qrImageUrl:
      'https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/brokerbootcamp-gotyme-qr.jpg.jpg',
  },
} as const


export const PAYMENT_READY =
  PAYMENT.gcash.enabled ||
  PAYMENT.bank.enabled


export const PAYMENT_PROOF_BUCKET =
  'payment-proofs'