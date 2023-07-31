// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";
// import shopify
// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").InputQuery} InputQuery
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 * @typedef {import("../generated/api").MoneyV2} MoneyV2
 */

/**
 * @type {FunctionResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: []
};

// The @shopify/shopify_function package will use the default export as your function entrypoint
export default /**
 * @param {InputQuery} input
 * @returns {FunctionResult}
 */
(input) => {
  const DISCOUNT_MESSAGE = "Test Promo";
  console.error(JSON.stringify(input, null, 2));
  const targets = input.cart.lines
    // Only include cart lines with a quantity of two or more
    // and a targetable product variant
    .filter(
      (line) =>
        line.attribute &&
        line.attribute.key === "_custom-price" &&
        parseFloat(line.attribute.value + "") > 0
    )
    .map((line) => {
      const discountAmount = parseFloat(
        line.attribute?.value ? line.attribute?.value + "" : "0"
      );
      // if()

      let newLinePrice = 0;
      if (line.cost.compareAtAmountPerQuantity?.amount > 0) {
        if (
          line.cost.compareAtAmountPerQuantity?.amount >
          line.cost.amountPerQuantity.amount
        ) {
          const saleDiscount =
            line.cost.compareAtAmountPerQuantity?.amount -
            line.cost.amountPerQuantity.amount;
          if (discountAmount > saleDiscount) {
            newLinePrice = Math.max(
              // line.cost.compareAtAmountPerQuantity?.amount -
              discountAmount * line.quantity - saleDiscount * line.quantity,
              0
            );
          } else {
            newLinePrice = -1;
          }
        } else {
          newLinePrice = Math.max(discountAmount * line.quantity, 0);
        }
      } else {
        newLinePrice = Math.max(discountAmount * line.quantity, 0);
      }
      const variant = /** @type {ProductVariant} */ (line.merchandise);
      return {
        targets: [
          {
            productVariant: {
              id: variant.id
            }
          }
        ],
        value:
          newLinePrice < 0
            ? null
            : {
                fixedAmount: {
                  amount: newLinePrice
                }
              },
        message: DISCOUNT_MESSAGE
      };
    });
  // const saleTargets = targets.filter(lie)
  // const saleTargets = {}
  // targets.forEach(line => {

  // })
  if (!targets.length) {
    // You can use STDERR for debug logs in your function
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }
  console.error(JSON.stringify(targets, null, 2));

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    discounts: targets.filter((item) => item.value),
    discountApplicationStrategy: DiscountApplicationStrategy.First
  };
};
