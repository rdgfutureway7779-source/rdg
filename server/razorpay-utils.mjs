import crypto from "node:crypto";

export function verifyRazorpayPaymentSignature(orderId, paymentId, signature, secret) {
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function isCapturedRazorpayPayment(order, payment, expectedAmount) {
  return Boolean(
    order &&
    payment &&
    Number(order.amount) === expectedAmount &&
    order.currency === "INR" &&
    payment.order_id === order.id &&
    Number(payment.amount) === expectedAmount &&
    payment.status === "captured",
  );
}
