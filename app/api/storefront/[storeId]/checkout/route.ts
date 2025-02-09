import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();
    const storeId = params.storeId;
    const { 
      paymentMethod,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      emailDiscount,
      customerDiscount,
      couponDiscount
    } = await req.json();

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!paymentMethod || !phone || !address || !city || !state || !postalCode || !country) {
      return new NextResponse("All shipping details are required", { status: 400 });
    }

    // Start a transaction to ensure data consistency
    const order = await prismadb.$transaction(async (tx) => {
      // Get current cart
      const cart = await tx.order.findFirst({
        where: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          },
          customer: true
        }
      });

      if (!cart || cart.orderItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Check stock availability and reserve stock
      let orderTotal = 0;
      for (const item of cart.orderItems) {
        const stockItem = await tx.stockItem.findUnique({
          where: {
            variantId_storeId: {
              variantId: item.variantId,
              storeId
            }
          }
        });

        if (!stockItem) {
          throw new Error(`Stock item not found for variant ${item.variantId}`);
        }

        const availableStock = stockItem.count - stockItem.reserved;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }

        orderTotal += Number(item.price) * item.quantity;

        // Create reservation
        await tx.stockItem.update({
          where: {
            id: stockItem.id
          },
          data: {
            reserved: {
              increment: item.quantity
            }
          }
        });

        // Create stock movement for reservation
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            stockItemId: stockItem.id,
            quantity: item.quantity,
            type: "reserved",
            reason: `Order ${cart.id} - Initial reservation`,
            originatorType: "system"
          }
        });
      }

      // Get active customer promotions
      const customerPromotions = await tx.promotion.findMany({
        where: {
          customers: {
            some: {
              id: session.customerId
            }
          },
          storeId,
          isActive: true,
          startDate: {
            lte: new Date()
          },
          endDate: {
            gte: new Date()
          }
        }
      });

      // Calculate all discounts
      const emailDiscountAmount = (emailDiscount / 100) * orderTotal;
      const customerDiscountAmount = (customerDiscount / 100) * orderTotal;
      const couponDiscountAmount = (couponDiscount / 100) * orderTotal;
      const totalDiscounts = emailDiscountAmount + customerDiscountAmount + couponDiscountAmount;
      const finalTotal = orderTotal - totalDiscounts;

      // Update order status, payment details, and discounts
      const updatedOrder = await tx.order.update({
        where: { id: cart.id },
        data: {
          status: "processing",
          isPaid: true,
          phone,
          address: `${address}, ${city}, ${state} ${postalCode}, ${country}`,
          customerDiscount: customerDiscount || 0,
          couponDiscount: couponDiscount || 0,
          emailDiscount: emailDiscount || 0,
          totalAmount: orderTotal,
          finalAmount: finalTotal,
          promotions: {
            connect: customerPromotions.map(p => ({ id: p.id }))
          }
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      // Process shipment for each item
      for (const item of cart.orderItems) {
        const stockItem = await tx.stockItem.findUnique({
          where: {
            variantId_storeId: {
              variantId: item.variantId,
              storeId
            }
          }
        });

        if (!stockItem) {
          throw new Error(`Stock item not found for variant ${item.variantId}`);
        }

        // Update stock counts
        await tx.stockItem.update({
          where: {
            id: stockItem.id
          },
          data: {
            count: {
              decrement: item.quantity
            },
            reserved: {
              decrement: item.quantity
            }
          }
        });

        // Create stock movement for shipment
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            stockItemId: stockItem.id,
            quantity: item.quantity,
            type: "shipped",
            reason: `Order ${cart.id} - Items shipped`,
            originatorType: "system"
          }
        });
      }

      // Create a new cart for the customer
      await tx.order.create({
        data: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        }
      });

      return updatedOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "Cart is empty") {
      return new NextResponse("Cart is empty", { status: 400 });
    }
    console.log('[CHECKOUT_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get customer's orders except cart
    const orders = await prismadb.order.findMany({
      where: {
        storeId,
        customerId: session.customerId,
        status: {
          not: "cart"
        }
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
