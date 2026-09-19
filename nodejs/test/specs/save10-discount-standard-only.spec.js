// SAVE10 discount code — Standard-tier seats only (PRD footnote [^1])
//
// Rule under test: SAVE10 applies a flat 10% discount to Standard-tier seats
// and does NOT discount VIP-tier seats in the same order.
//
// Why this booking breaks the rule if it isn't enforced:
//   A booking with one VIP seat ($120) and one Standard seat ($65) is the
//   minimal case that distinguishes "discount all seats" from "discount
//   Standard only". Any implementation that applies SAVE10 to every seat
//   will produce a wrong VIP price ($108 instead of $120) and a wrong total
//   ($166.50 instead of $178.50), making both assertions fail.
//
// Expected values (per PRD):
//   VIP   A1  : $120.00  (full price — SAVE10 must not touch VIP)
//   Std   C1  : $58.50   ($65.00 × 0.90)
//   Subtotal  : $185.00  (unchanged — pre-discount sum)
//   Discount  : -$6.50   (10% of $65.00 Standard seat only)
//   Total     : $178.50  ($185.00 − $6.50)

const EVENT_RESOURCE_ID = "event-card-evt-01"; // Neon Skyline — Rows A/B VIP, Rows C/D/E Standard
const VIP_SEAT_ID       = "seat-A1";           // VIP, $120
const STD_SEAT_ID       = "seat-C1";           // Standard, $65

const DISCOUNT_CODE     = "SAVE10";

// Expected prices per PRD rule
const EXPECTED_VIP_PRICE      = "$120.00";
const EXPECTED_STD_PRICE      = "$58.50";
const EXPECTED_SUBTOTAL       = "$185.00";
const EXPECTED_DISCOUNT       = "-$6.50";
const EXPECTED_TOTAL          = "USD 178.50";

const byId = (id) => `android=new UiSelector().resourceId("${id}")`;

describe("SAVE10 discount — Standard seats only", () => {
  it("discounts Standard seats by 10% and leaves VIP seats at full price", async () => {

    // ── 1. Enter the app ──────────────────────────────────────────────────
    const guestBtn = await $(byId("continue-as-guest-button"));
    await guestBtn.waitForDisplayed({ timeout: 15000 });
    await guestBtn.click();

    // ── 2. Navigate to Neon Skyline (evt-01) ─────────────────────────────
    const eventListScreen = await $(byId("event-list-screen"));
    await eventListScreen.waitForExist({ timeout: 20000 });

    const eventCard = await $(`android=new UiScrollable(new UiSelector().resourceId("event-list").scrollable(true)).scrollIntoView(new UiSelector().resourceId("${EVENT_RESOURCE_ID}"))`);
    await eventCard.waitForExist({ timeout: 20000 });
    await eventCard.click();

    // ── 3. Open seat selection ────────────────────────────────────────────
    const selectSeatBtn = await $(byId("select-seat-button"));
    await selectSeatBtn.waitForDisplayed({ timeout: 15000 });
    await selectSeatBtn.click();

    // ── 4. Select one VIP seat (A1) and one Standard seat (C1) ───────────
    const vipSeat = await $(byId(VIP_SEAT_ID));
    await vipSeat.waitForDisplayed({ timeout: 10000 });
    await vipSeat.click();

    const stdSeat = await $(byId(STD_SEAT_ID));
    await stdSeat.waitForDisplayed({ timeout: 10000 });
    await stdSeat.click();

    // ── 5. Proceed to discount code screen ───────────────────────────────
    const continueToDiscount = await $(byId("seat-selection-continue-button"));
    await continueToDiscount.waitForDisplayed({ timeout: 10000 });
    await continueToDiscount.click();

    // ── 6. Apply SAVE10 ───────────────────────────────────────────────────
    const discountInput = await $(byId("discount-input"));
    await discountInput.waitForDisplayed({ timeout: 10000 });
    await discountInput.setValue(DISCOUNT_CODE);

    const applyBtn = await $(byId("discount-apply-button"));
    await applyBtn.waitForDisplayed({ timeout: 5000 });
    await applyBtn.click();

    // Confirm the code was accepted (input replaced by applied-label)
    const appliedLabel = await $(byId("discount-applied-label"));
    await appliedLabel.waitForDisplayed({ timeout: 10000 });

    // ── 7. Proceed to payment ─────────────────────────────────────────────
    const continueToPayment = await $(byId("discount-continue-button"));
    await continueToPayment.waitForDisplayed({ timeout: 10000 });
    await continueToPayment.click();

    // ── 8. Assert per-seat prices on the payment screen ──────────────────
    const paymentScreen = await $(byId("payment-screen"));
    await paymentScreen.waitForDisplayed({ timeout: 15000 });

    // VIP seat must remain at full price — SAVE10 must NOT discount it
    const vipPrice = await $(byId("payment-line-price-A1"));
    await vipPrice.waitForDisplayed({ timeout: 10000 });
    expect(await vipPrice.getText()).toBe(EXPECTED_VIP_PRICE);

    // Standard seat must be discounted by 10%
    const stdPrice = await $(byId("payment-line-price-C1"));
    await stdPrice.waitForDisplayed({ timeout: 10000 });
    expect(await stdPrice.getText()).toBe(EXPECTED_STD_PRICE);

    // ── 9. Assert order totals ────────────────────────────────────────────
    const subtotal = await $(byId("payment-subtotal"));
    await subtotal.waitForDisplayed({ timeout: 5000 });
    expect(await subtotal.getText()).toBe(EXPECTED_SUBTOTAL);

    const discountAmount = await $(byId("payment-discount-amount"));
    await discountAmount.waitForDisplayed({ timeout: 5000 });
    expect(await discountAmount.getText()).toBe(EXPECTED_DISCOUNT);

    const total = await $(byId("payment-total"));
    await total.waitForDisplayed({ timeout: 5000 });
    expect(await total.getText()).toBe(EXPECTED_TOTAL);

    // ── 10. Complete payment and verify confirmation screen ───────────────
    const payBtn = await $(byId("payment-pay-button"));
    await payBtn.waitForDisplayed({ timeout: 10000 });
    await payBtn.click();

    // Wait for processing spinner to disappear
    const processingIndicator = await $(byId("payment-processing-indicator"));
    await processingIndicator.waitForExist({ timeout: 5000 });
    await processingIndicator.waitForExist({ timeout: 30000, reverse: true });

    const confirmationScreen = await $(byId("confirmation-screen"));
    await confirmationScreen.waitForDisplayed({ timeout: 30000 });
  });
});