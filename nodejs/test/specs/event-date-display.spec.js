// Opens a fixed event's Event Details screen and captures the rendered
// date/time text so it can be compared across devices.

const EVENT_RESOURCE_ID = "event-card-evt-01"; // "Neon Skyline" — fixed, known event

const byResourceId = (id) => `android=new UiSelector().resourceId("${id}")`;

describe("Event date/time display", () => {
  it("captures the rendered date/time text on Event Details", async () => {
    const continueButton = await $(byResourceId("continue-as-guest-button"));
    await continueButton.waitForDisplayed({ timeout: 40000 });
    await continueButton.click();

    // Wait for the event list screen to confirm navigation succeeded
    const eventListScreen = await $(byResourceId("event-list-screen"));
    await eventListScreen.waitForExist({ timeout: 20000 });

    // Use UiScrollable to scroll the event list until evt-01 is visible
    const eventCard = await $(`android=new UiScrollable(new UiSelector().resourceId("event-list").scrollable(true)).scrollIntoView(new UiSelector().resourceId("${EVENT_RESOURCE_ID}"))`);
    await eventCard.waitForExist({ timeout: 20000 });
    await eventCard.click();

    const dateElement = await $(byResourceId("event-details-date"));
    await dateElement.waitForDisplayed({ timeout: 15000 });

    const renderedDate = await dateElement.getText();
    expect(renderedDate).not.toBe("");
    console.log(`[event-date-display] rendered date/time: "${renderedDate}"`);
  });
});
