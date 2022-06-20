import { IdMap } from "medusa-test-utils";
import MercadoPagoProviderService from "../stripe-provider";
import { CustomerServiceMock } from "../../__mocks__/customer";
import { carts } from "../../__mocks__/cart";
import { TotalsServiceMock } from "../../__mocks__/totals";

const RegionServiceMock = {
  retrieve: jest.fn().mockReturnValue(Promise.resolve({})),
};

describe("MercadoPagoProviderService", () => {
  describe("createCustomer", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.createCustomer({
        _id: IdMap.getId("vvd"),
        first_name: "Virgil",
        last_name: "Van Dijk",
        email: "virg@vvd.com",
        password_hash: "1234",
        metadata: {},
      });
    });

    it("returns created stripe customer", () => {
      expect(result).toEqual({
        id: "cus_vvd",
        email: "virg@vvd.com",
      });
    });
  });

  describe("createPayment", () => {
    let result;
    const mercadoPagoProviderService = new MercadoPagoProviderService(
      {
        customerService: CustomerServiceMock,
        regionService: RegionServiceMock,
        totalsService: TotalsServiceMock,
      },
      {
        api_key: "test",
      }
    );

    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("returns created stripe payment intent for cart with existing customer", async () => {
      result = await mercadoPagoProviderService.createPayment(carts.frCart);
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_123456789_new",
        amount: 100,
      });
    });

    it("returns created stripe payment intent for cart with no customer", async () => {
      carts.frCart.customer_id = "";
      result = await mercadoPagoProviderService.createPayment(carts.frCart);
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        amount: 100,
      });
    });
  });

  describe("retrievePayment", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.retrievePayment({
        payment_method: {
          data: {
            id: "pi_lebron",
          },
        },
      });
    });

    it("returns stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
      });
    });
  });

  describe("updatePayment", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.updatePayment(
        {
          id: "pi_lebron",
          amount: 800,
        },
        {
          total: 1000,
        }
      );
    });

    it("returns updated stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        amount: 1000,
      });
    });
  });

  describe("updatePaymentIntentCustomer", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.updatePaymentIntentCustomer(
        "pi_lebron",
        "cus_lebron_2"
      );
    });

    it("returns update stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron_2",
        amount: 1000,
      });
    });
  });

  describe("capturePayment", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {},
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.capturePayment({
        data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          amount: 1000,
        },
      });
    });

    it("returns captured stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        amount: 1000,
        status: "succeeded",
      });
    });
  });

  describe("refundPayment", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {},
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.refundPayment(
        {
          data: {
            id: "re_123",
            payment_intent: "pi_lebron",
            amount: 1000,
            status: "succeeded",
          },
        },
        1000
      );
    });

    it("returns refunded stripe payment intent", () => {
      expect(result).toEqual({
        id: "re_123",
        payment_intent: "pi_lebron",
        amount: 1000,
        status: "succeeded",
      });
    });
  });

  describe("cancelPayment", () => {
    let result;
    beforeAll(async () => {
      jest.clearAllMocks();
      const mercadoPagoProviderService = new MercadoPagoProviderService(
        {},
        {
          api_key: "test",
        }
      );

      result = await mercadoPagoProviderService.cancelPayment({
        data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          status: "cancelled",
        },
      });
    });

    it("returns cancelled stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        status: "cancelled",
      });
    });
  });
});
