import { normalizeResponse } from '../support/utils/responseNormalizer';
import { assertAllInRangeYMD } from '../support/assertions/dateRangeAssertions';

describe('Applications - simple API tests', () => {
  before(() => {
    cy.login(); // uses your authHelper
  });

  beforeEach(() => {
    cy.appClearContext();
  });

  it('[APP-001] create an application (happy path)', () => {
    // Uses applicationFactory -> env-safe benefit -> POST to Endpoints.createApplication()
    cy.appCreate().then((ctx) => {
      expect(ctx.payload).to.exist;

      // If your API returns an id, this will be set
      // (If it doesn't, that's OK for now — we’ll align once you share response shape.)
      cy.log(`Created applicationId: ${ctx.applicationId ?? 'N/A'}`);
    });
  });

  it('[APP-002] close a case/application (status-only test)', () => {
    // Create first, then close using stored context id
    cy.appCreate().then((ctx) => {
      if (!ctx.applicationId) {
        cy.log('No applicationId returned by API -> cannot close yet (update extractId once contract is known).');
        return;
      }

      cy.appClose(ctx.applicationId).then((res) => {
        // many APIs return 204 No Content for close
        expect([200, 204]).to.include(res.status);
      });
    });
  });

  it('[APP-003] query by DOB range and validate all results are within range', () => {
    // Adjust these param names and response field name to match your real API:
    // - query params: dobFrom/dobTo OR dateOfBirthFrom/dateOfBirthTo OR birthDateFrom/birthDateTo
    // - item field: dateOfBirth OR dob OR birthDate

    cy.appRandomRange({ min: '1900-01-01', maxDays: 30 }).then(({ startDate, endDate }) => {
      // Example uses "dobFrom/dobTo" — CHANGE if needed
      cy.appQueryByDateRange({
        dobFrom: startDate,
        dobTo: endDate,
        // optional paging:
        // limit: 25,
        // skip: 0,
      }).then((res) => {
        expect(res.status).to.eq(200);

        const normalized = normalizeResponse(res);

        // If your API returns list under "applications" or "items" etc, normalization handles it.
        // Now validate date range for every returned record:
        // CHANGE 'dateOfBirth' if your field name differs.
        assertAllInRangeYMD(normalized.items, 'dateOfBirth', startDate, endDate);

        cy.log(`Validated ${normalized.items.length} records in DOB range ${startDate}..${endDate}`);
      });
    });
  });
});